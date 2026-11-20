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
    const targetUrl = body.webhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    if (!targetUrl || !targetUrl.startsWith("https://script.google.com/")) {
      return res.status(400).json({ error: "Invalid or missing Google Apps Script Web App URL." });
    }

    const payload = {
      secretKey: body.secretKey || process.env.OAV_DRIVE_SECRET_KEY || "oav_mantra_vault_secure_2026_9971",
      action: body.action || "upload_photo",
      folderType: body.folderType || "photos",
      base64Data: body.base64Data || body.photoData || body.screenshotData,
      fileName: body.fileName,
      studentName: body.studentName,
      enrollmentId: body.enrollmentId,
      studentClass: body.studentClass,
      transactionId: body.transactionId,
      amount: body.amount,
      paymentDate: body.paymentDate,
      description: body.description
    };

    const gRes = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await gRes.json().catch(() => ({}));
    if (!gRes.ok || !data.success) {
      return res.status(gRes.status >= 200 && gRes.status < 500 ? 400 : 500).json(
        data.error ? data : { error: `Google Drive upload failed with status ${gRes.status}` }
      );
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to relay upload to Google Drive" });
  }
};
