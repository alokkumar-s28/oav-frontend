const nodemailer = require("nodemailer");

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "alokkumar413q@gmail.com, oavmantra@gmail.com";
const SMTP_USER = process.env.SMTP_USER || "oavmantra@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "gsyggklkutelrugq";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const event = body.event || "alert";
    const student = body.student || {};
    const payment = body.payment || {};
    const nowIst = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " (IST)";

    // Optional Google Drive Webhook upload directly from serverless function
    let driveFileUrl = payment.driveFileUrl || student.drivePhotoUrl || null;
    const driveWebhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    if (driveWebhookUrl && !driveFileUrl) {
      try {
        const screenshotData = payment.paymentScreenshot || payment.screenshot;
        const photoData = student.photo || student.highResPhoto;
        const secretKey = process.env.OAV_DRIVE_SECRET_KEY || "oav_mantra_vault_secure_2026_9971";
        if (screenshotData && typeof screenshotData === "string" && screenshotData.startsWith("data:image/")) {
          const driveRes = await fetch(driveWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secretKey,
              action: "upload_payment",
              screenshotData,
              studentName: payment.studentName || student.name || "Student",
              enrollmentId: payment.enrollmentId || student.enrollmentId || "N/A",
              transactionId: payment.transactionId || "PROOF",
              studentClass: student.class || student.student_class || "VI",
              amount: 500,
              paymentDate: payment.paymentDate || new Date().toISOString().slice(0, 10)
            })
          });
          const driveJson = await driveRes.json().catch(() => ({}));
          if (driveJson && (driveJson.webViewLink || driveJson.fileUrl)) {
            driveFileUrl = driveJson.webViewLink || driveJson.fileUrl;
            payment.driveFileUrl = driveFileUrl;
          }
        } else if (photoData && typeof photoData === "string" && photoData.startsWith("data:image/")) {
          const driveRes = await fetch(driveWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              secretKey,
              action: "upload_photo",
              photoData,
              studentName: student.name || "Student",
              enrollmentId: student.enrollmentId || "N/A",
              studentClass: student.class || student.student_class || "VI"
            })
          });
          const driveJson = await driveRes.json().catch(() => ({}));
          if (driveJson && (driveJson.webViewLink || driveJson.fileUrl)) {
            driveFileUrl = driveJson.webViewLink || driveJson.fileUrl;
            student.drivePhotoUrl = driveFileUrl;
          }
        }
      } catch (driveErr) {
        console.warn("[Vercel Google Drive Webhook] Upload error:", driveErr.message);
      }
    }

    let subject = "";
    let badgeText = "";
    let badgeColor = "#2563eb";
    let title = "";
    let rowsHtml = "";

    if (event === "payment") {
      const hasScreenshot = Boolean(payment.hasScreenshot || payment.paymentScreenshot || payment.has_screenshot);
      const hasTx = payment.transactionId && payment.transactionId !== "N/A" && !payment.transactionId.includes("Screenshot");
      const proofSummary = hasScreenshot ? (hasTx ? `UTR: ${payment.transactionId} + 📸 Screenshot` : `📸 Screenshot Attached`) : `UTR: ${payment.transactionId || "N/A"}`;

      badgeText = "💰 PAYMENT CLAIM SUBMITTED (₹500)";
      badgeColor = "#f59e0b";
      title = "Student Submitted ₹500 Payment Claim";
      subject = `[OAV Mantra] 💰 Payment Claim: ${payment.studentName || student.name || "Student"} (${payment.enrollmentId || student.enrollmentId || "N/A"}) - ${proofSummary}`;
      rowsHtml = `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; width: 150px;">Student Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${payment.studentName || student.name || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Enrollment ID:</td>
          <td style="padding: 10px 0; color: #2563eb; font-weight: bold; font-family: monospace; font-size: 15px;">${payment.enrollmentId || student.enrollmentId || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Transaction / UTR:</td>
          <td style="padding: 10px 0; color: #b45309; font-weight: bold; font-family: monospace; font-size: 16px; background: #fef3c7; padding: 6px 10px; border-radius: 6px;">${payment.transactionId || (hasScreenshot ? "Not provided (Screenshot attached)" : "N/A")}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Payment Proof:</td>
          <td style="padding: 10px 0; font-weight: bold; color: ${hasScreenshot ? '#059669' : '#64748b'};">
            ${hasScreenshot ? (payment.driveFileUrl ? `✅ Screenshot Saved in Google Drive (<a href="${payment.driveFileUrl}" target="_blank" rel="noopener" style="color:#2563eb; text-decoration:underline;">Open in Google Drive</a>)` : '✅ Payment Screenshot Uploaded (View in Admin Panel)') : 'UTR Reference Number'}
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Amount:</td>
          <td style="padding: 10px 0; color: #16a34a; font-weight: bold; font-size: 16px;">₹500.00</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Payment Method:</td>
          <td style="padding: 10px 0; color: #0f172a;">${(payment.paymentMethod || "UPI").toUpperCase()}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Payment Date:</td>
          <td style="padding: 10px 0; color: #0f172a;">${payment.paymentDate || nowIst}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Action Required:</td>
          <td style="padding: 10px 0; color: #dc2626; font-weight: bold;">Check bank / screenshot proof in Admin Panel and approve account.</td>
        </tr>
      `;
    } else if (event === "login") {
      badgeText = "🔑 STUDENT DASHBOARD LOGIN";
      badgeColor = "#10b981";
      title = "Student Logged Into Study Room";
      subject = `[OAV Mantra] 🔑 Student Login: ${student.name || student.full_name || "Student"} (${student.enrollmentId || student.enrollment_id || "N/A"})`;
      rowsHtml = `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; width: 150px;">Student Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${student.name || student.full_name || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Enrollment ID:</td>
          <td style="padding: 10px 0; color: #2563eb; font-weight: bold; font-family: monospace; font-size: 15px;">${student.enrollmentId || student.enrollment_id || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Mobile:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.mobile || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Class:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">Class ${student.class || student.student_class || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">City / District:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.city || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Login Time:</td>
          <td style="padding: 10px 0; color: #0f172a;">${nowIst}</td>
        </tr>
      `;
    } else {
      // New enrollment
      badgeText = "🎓 NEW STUDENT ENROLLMENT";
      badgeColor = "#2563eb";
      title = "A New Student Has Enrolled!";
      subject = `[OAV Mantra] 🎓 New Enrollment: ${student.name || "Student"} (${student.enrollmentId || "N/A"}) - Class ${student.class || "N/A"}`;
      rowsHtml = `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b; width: 150px;">Student Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${student.name || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Enrollment ID:</td>
          <td style="padding: 10px 0; color: #2563eb; font-weight: bold; font-family: monospace; font-size: 15px;">${student.enrollmentId || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Mobile:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.mobile || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Email:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.email || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">Class:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">Class ${student.class || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">School Board:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.schoolType || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">City / District:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.city || "N/A"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #64748b;">School Name:</td>
          <td style="padding: 10px 0; color: #0f172a;">${student.school || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Registered At:</td>
          <td style="padding: 10px 0; color: #0f172a;">${nowIst}</td>
        </tr>
      `;
    }

    const html = `
      <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">OAV MANTRA</h1>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">Real-time Automated Admin Alert</p>
        </div>
        <div style="padding: 24px;">
          <div style="display: inline-block; padding: 6px 14px; background: ${badgeColor}; color: #ffffff; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
            ${badgeText}
          </div>
          <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 18px;">${title}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            ${rowsHtml}
          </table>
          <div style="background: #f8fafc; border-radius: 8px; padding: 14px; font-size: 12px; color: #64748b; text-align: center;">
            Sent automatically to <strong>${ADMIN_NOTIFICATION_EMAIL}</strong>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"OAV Mantra Alerts" <${SMTP_USER}>`,
      to: ADMIN_NOTIFICATION_EMAIL,
      subject,
      html
    });

    console.log(`[Vercel Serverless Email] Sent: ${info.messageId}`);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error("[Vercel Serverless Email] Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
