export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method not allowed" });
  }

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ result: "error", message: "Missing title or body" });
  }

  // 1. Fetch tokens dari Google Sheet
  const sheetUrl = "https://script.google.com/macros/s/AKfycbyu9vXrNsUDYAhaopZstgzsS_7COurqIWxttGKYW6fO7dgFB0xsk482NhqyWz59Zg/exec"; // ganti dengan URL Apps Script Anda
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

  const fcmUrl = "https://fcm.googleapis.com/fcm/send";
  const serverKey = process.env.FCM_SERVER_KEY;

  // 2. Kirim notifikasi ke setiap token
  const results = await Promise.all(tokenList.map(async token => {
    const payload = {
      to: token,
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await fetch(fcmUrl, {
        method: "POST",
        headers: {
          "Authorization": `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return { token, status: "success", result };
    } catch (err) {
      return { token, status: "failed", error: err.message };
    }
  }));

  return res.status(200).json({ result: "success", reports: results });
}
