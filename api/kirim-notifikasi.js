// api/kirim-notifikasi.js
import admin from "firebase-admin";

//Inisialisasi Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
};

if (!admin.apps.length) {
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

  // 🔹 Ambil token dari Apps Script
  const sheetUrl = "https://script.google.com/macros/s/AKfycby5u7UHOArYJ6St1oxrZ5eRx2ZFLU9F35XnPksIFTCB9gcUe693Idg967cmvXYav0E/exec";
  let token = [];

  try {
    const fetchRes = await fetch(SHEET_API);
    const json = await fetchRes.json();
    tokens = json.tokens || [];

    // Hilangkan duplikat
    tokens = [...new Set(tokens)];

    if (tokens.length === 0) {
      return res.status(400).json({ result: "error", message: "No FCM tokens found." });
    }
  } catch (err) {
    return res.status(500).json({
      result: "error",
      message: "Failed to fetch tokens",
      detail: error.message,
    });
  }
  
  // 🔹 Kirim notifikasi ke semua token (Multicast)
  const message = {
    tokens,
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: "/icons/icon-192.png",
      }
    }
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    
    // 🔹 Hapus token yang gagal permanen (mis. unregistered)
    const failedTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        const code = error?.errorInfo?.code || error?.code || "";
        if (code.includes("registration-token-not-registered") || code.includes("invalid-argument")) {
          failedTokens.push(tokens[idx]);
        }
      }
    });
    
    // Hapus token invalid dari Google Sheets
    if (failedTokens.length > 0) {
      // Kirim token yang ingin dihapus ke Apps Script
      await fetch(SHEET_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hapus: failedTokens })
      });
    }

    return res.status(200).json({
      result: "success",
      successCount: response.successCount,
      failureCount: response.failureCount,
      removed: failedTokens.length,
      detail: response.responses
    });
  } catch (err) {
    return res.status(500).json({
      result: "error",
      message: "Failed to send multicast",
      detail: error.message
    });
  }
}
