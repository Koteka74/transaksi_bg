import admin from "firebase-admin";

if (!admin.apps.length) {
  const projectId = process.env.PROJECT_ID;
  const clientEmail = process.env.CLIENT_EMAIL;
  const privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
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

  // 1. Fetch tokens dari Google Sheet
  const sheetUrl = "https://script.google.com/macros/s/AKfycbxPDtLvX7OAMwObKluHEZQJxGnKy5YDfV8w4Ot9JVj6c7JiN49fPaAy6wXLpScNRW4/exec";
  let tokenList = [];

  try {
    const response = await fetch(sheetUrl);
    const data = await response.json();
    tokenList = data.tokens || [];
    if (!Array.isArray(tokenList) || tokenList.length === 0) {
      return res.status(400).json({ result: "error", message: "No FCM tokens found." });
    }
  } catch (error) {
    return res.status(500).json({ result: "error", message: "Failed to fetch tokens" });
  }

  // 2. Kirim notifikasi
  const messaging = admin.messaging();
  const results = await Promise.all(tokenList.map(async (token) => {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    try {
      const result = await messaging.send(message);
      return { token, status: "success", result };
    } catch (error) {
      return { token, status: "failed", error: error.message };
    }
  }));

  return res.status(200).json({ result: "success", reports: results });
}
