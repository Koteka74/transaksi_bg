// api/kirim-notifikasi.js
import admin from "firebase-admin";

// Inisialisasi Firebase Admin
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

  const sheetUrl = "https://script.google.com/macros/s/AKfycbz4HRSg3-CaCq19mC-cUTFJU2YVBXR_vVWm5Z-P4Upyr5_riwtu6D4mHRE_w3gVGaI/exec";
  let tokenList = [];

  try {
    const resp = await fetch(sheetUrl);
    const data = await resp.json();
    tokenList = data.tokens || [];
  } catch (err) {
    return res.status(500).json({
      result: "error",
      message: "Failed to fetch tokens",
      detail: err.message,
    });
  }

  if (!Array.isArray(tokenList) || tokenList.length === 0) {
    return res.status(400).json({ result: "error", message: "No tokens found" });
  }

  const invalidTokens = [];
  const responses = [];

  for (const token of tokenList) {
    try {
      const response = await admin.messaging().send({
        token,
        notification: { title, body },
        webpush: {
          notification: {
            icon: "/icons/icon-192.png",
          },
        },
      });
      responses.push({ token, status: "success", messageId: response });
    } catch (error) {
      responses.push({ token, status: "failed", error: error.message });
      if (
        error.code === "messaging/invalid-argument" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(token);
      }
    }
  }

  // Hapus token tidak valid
  if (invalidTokens.length > 0) {
    await fetch(
      sheetUrl + "?hapus=" + encodeURIComponent(JSON.stringify(invalidTokens))
    );
  }

  return res.status(200).json({
    result: "success",
    successCount: responses.filter(r => r.status === "success").length,
    failureCount: responses.filter(r => r.status === "failed").length,
    detail: responses,
  });
}
