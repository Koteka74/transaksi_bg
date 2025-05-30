// api/kirim-notifikasi.js
import admin from "firebase-admin";

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

  // Ambil token dari Google Sheet
  const sheetUrl = "https://script.google.com/macros/s/AKfycbyu9vXrNsUDYAhaopZstgzsS_7COurqIWxttGKYW6fO7dgFB0xsk482NhqyWz59Zg/exec";
  let tokenList = [];

  try {
    const response = await fetch(sheetUrl);
    const json = await response.json();
    tokenList = json.tokens || [];
    if (!Array.isArray(tokenList) || tokenList.length === 0) {
      return res.status(400).json({ result: "error", message: "No FCM tokens found." });
    }
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Failed to fetch tokens" });
  }

  // Kirim notifikasi ke setiap token
  const reports = await Promise.all(tokenList.map(async (token) => {
    try {
      const message = {
        token = token,
        notification: {
          title: title,
          body: body,
        },
        webpush: {
          notification: {
            icon: "/icons/icon-192.png",
          }
        }
      };
      const response = await admin.messaging().send(message);
      return { token, status: "success", response };
    } catch (error) {
      return { token, status: "failed", error: error.message };
    }
  }));

  return res.status(200).json({ result: "success", reports });
}
