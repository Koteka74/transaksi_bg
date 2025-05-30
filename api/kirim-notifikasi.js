// api/kirim-notifikasi.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.PROJECT_ID,
      private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.CLIENT_EMAIL,
    }),
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

  const sheetUrl = "https://script.google.com/macros/s/AKfycbx3WC-TktJ6b_CVHN1Jtd1G2xoExfavevKUJCC-TV051IPjgQP_CKD8J7LONxAWDbs/exec";
  let tokenList = [];

  try {
    const response = await fetch(sheetUrl);
    const data = await response.json();
    tokenList = data.tokens || [];

    if (!Array.isArray(tokenList) || tokenList.length === 0) {
      return res.status(400).json({ result: "error", message: "No FCM tokens found." });
    }
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Failed to fetch tokens", detail: err.message });
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokenList,
    webpush: {
      notification: {
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-72.png"
      }
    }
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    
    // Deteksi token gagal
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error.code;
        const isBadToken =
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered";
        if (isBadToken) {
          failedTokens.push(tokenList[idx]);
        }
      }
    });

    // Hapus token invalid dari Google Sheets
    if (failedTokens.length > 0) {
      try {
        await fetch(sheetUrl + "?hapusTokens=" + encodeURIComponent(JSON.stringify(failedTokens)));
      } catch (err) {
        console.warn("⚠️ Gagal hapus token:", err.message);
      }
    }

    return res.status(200).json({
      result: "success",
      successCount: response.responses.filter(r => r.success).length,
      failureCount: response.responses.filter(r => !r.success).length,
      removed: failedTokens.length,
      detail: response.responses,
    });
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Failed to send multicast", detail: err.message });
  }
}
