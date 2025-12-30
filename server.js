const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static site files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Ensure data directory
const DATA_FILE_ENROLL = path.join(__dirname, 'enrollments.json');
const DATA_FILE_PAYMENTS = path.join(__dirname, 'payments.json');

function safeRead(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    return [];
  }
}

function safeWrite(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Enrollment endpoint
app.post('/enroll', (req, res) => {
  const payload = req.body;
  const enrollments = safeRead(DATA_FILE_ENROLL);
  enrollments.push({ ...payload, receivedAt: new Date().toISOString() });
  safeWrite(DATA_FILE_ENROLL, enrollments);
  res.json({ success: true, message: 'Enrollment saved on server', enrollmentId: payload.enrollmentId });
});

// Payment success endpoint
app.post('/payment-success', (req, res) => {
  const payload = req.body;

  // Save to payments.json
  const payments = safeRead(DATA_FILE_PAYMENTS);
  payments.push({ ...payload, receivedAt: new Date().toISOString() });
  safeWrite(DATA_FILE_PAYMENTS, payments);

  // Also update enrollments.json if enrollmentId provided
  if (payload.enrollmentId) {
    const enrollments = safeRead(DATA_FILE_ENROLL);
    const updated = enrollments.map(e => {
      if (e.enrollmentId === payload.enrollmentId) {
        return { ...e, ...payload, status: 'completed', paymentReceivedAt: new Date().toISOString() };
      }
      return e;
    });
    safeWrite(DATA_FILE_ENROLL, updated);
  }
  // Compute 1-year expiry from payment date (if provided) or now
  let expiresAt = new Date();
  try {
    if (payload.paymentDate) {
      const pd = new Date(payload.paymentDate);
      if (!isNaN(pd)) expiresAt = pd;
    }
  } catch (e) { /* ignore */ }
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  // Update stored payment record with expiry
  try {
    const paymentsAll = safeRead(DATA_FILE_PAYMENTS);
    const last = paymentsAll[paymentsAll.length - 1];
    if (last && last.enrollmentId === payload.enrollmentId) {
      last.expiresAt = expiresAt.toISOString();
      safeWrite(DATA_FILE_PAYMENTS, paymentsAll);
    }
  } catch (e) {
    console.error('Could not annotate payment with expiry:', e);
  }

  // Also update the enrollment record with expiry if present
  if (payload.enrollmentId) {
    try {
      const enrollments2 = safeRead(DATA_FILE_ENROLL);
      const updated2 = enrollments2.map(e => {
        if (e.enrollmentId === payload.enrollmentId) {
          return { ...e, expiresAt: expiresAt.toISOString(), status: 'completed' };
        }
        return e;
      });
      safeWrite(DATA_FILE_ENROLL, updated2);
    } catch (e) {
      console.error('Could not save expiry on enrollment:', e);
    }
  }

  // Determine class-specific redirect (if class info available)
  try {
    const cls = (payload.class || payload.studentClass || payload.student_class || payload['className'] || '').toString().toUpperCase();
    const classMap = {
      'VI': '/study-VI.html',
      'VII': '/study-VII.html',
      'VIII': '/study-VIII.html',
      'IX': '/study-IX.html',
      'X': '/study-X.html'
    };

    const redirectBase = classMap[cls] || null;
    if (redirectBase) {
      const redirectUrl = payload.enrollmentId ? `${redirectBase}?enrollmentId=${encodeURIComponent(payload.enrollmentId)}` : redirectBase;
      res.json({ success: true, message: 'Payment recorded', redirect: redirectUrl, expiresAt: expiresAt.toISOString() });
      return;
    }
  } catch (e) {
    console.error('Error computing redirect:', e);
  }

  // Generic success response when no redirect is applicable
  res.json({ success: true, message: 'Payment recorded', expiresAt: expiresAt.toISOString() });
});

// Access check endpoint: returns whether enrollment has valid access
app.get('/access-check', (req, res) => {
  const enrollmentId = req.query.enrollmentId;
  if (!enrollmentId) return res.status(400).json({ success: false, message: 'enrollmentId required' });

  const enrollments = safeRead(DATA_FILE_ENROLL);
  const found = enrollments.find(e => e.enrollmentId === enrollmentId);
  if (!found) return res.json({ success: true, access: false, message: 'Enrollment not found' });

  const expiresAt = found.expiresAt ? new Date(found.expiresAt) : null;
  const now = new Date();
  if (!expiresAt) return res.json({ success: true, access: false, message: 'No expiry set' });

  if (expiresAt > now && found.status === 'completed') {
    return res.json({ success: true, access: true, expiresAt: expiresAt.toISOString() });
  }

  return res.json({ success: true, access: false, expiresAt: expiresAt.toISOString() });
});

app.listen(PORT, () => {
  console.log(`OAV Mantra backend running at http://localhost:${PORT}`);
});
