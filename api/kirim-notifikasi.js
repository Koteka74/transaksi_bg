// api/kirim-notifikasi.js
import admin from "firebase-admin";

// Inisialisasi Firebase Admin SDK jika belum
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
  };
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method not allowed" });
  }

  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ result: "error", message: "Missing title or body" });
  }

  // URL Google Apps Script Anda (untuk ambil dan hapus token)
  const sheetUrl = "https://script.google.com/macros/s/AKfycbz4HRSg3-CaCq19mC-cUTFJU2YVBXR_vVWm5Z-P4Upyr5_riwtu6D4mHRE_w3gVGaI/exec";

  let tokenList = [];
  try {
    const response = await fetch(sheetUrl);
    const json = await response.json();
    tokenList = json.tokens || [];
  } catch (err) {
    return res.status(500).json({
      result: "error",
      message: "Failed to fetch tokens",
      detail: err.message,
    });
  }

  if (!Array.isArray(tokenList) || tokenList.length === 0) {
    return res.status(400).json({ result: "error", message: "No FCM tokens found." });
  }

  const message = {
    notification: { title, body },
    tokens: tokenList,
    webpush: {
      notification: {
        icon: "/icons/icon-192.png",
        vibrate: [200, 100, 200],
      },
    },
  };

  try {
    const response = await admin.messaging().sendMulticast(message);

    const invalidTokens = [];
    response.responses.forEach((r, i) => {
      if (!r.success) invalidTokens.push(tokenList[i]);
    });

    // Hapus token tidak valid dari sheet
    if (invalidTokens.length > 0) {
      await fetch(sheetUrl + "?hapus=" + encodeURIComponent(JSON.stringify(invalidTokens)));
    }

    return res.status(200).json({
      result: "success",
      sent: response.successCount,
      failed: response.failureCount,
      detail: response.responses,
    });
  } catch (error) {
    return res.status(500).json({
      result: "error",
      message: "Failed to send multicast",
      detail: error.message,
    });
  }
}
