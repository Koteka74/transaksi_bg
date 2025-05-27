import { google } from 'googleapis';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method not allowed" });
  }

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ result: "error", message: "Missing title or body" });
  }

  // Load credentials dari environment variable
  const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT);
  const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

  // 1. Autentikasi OAuth2
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: SCOPES
  });

  const accessToken = await auth.getAccessToken();

  // 2. Ambil token dari Google Sheet
  const sheetURL = "https://script.google.com/macros/s/AKfycbyu9vXrNsUDYAhaopZstgzsS_7COurqIWxttGKYW6fO7dgFB0xsk482NhqyWz59Zg/exec";
  let tokenList = [];

  try {
    const response = await fetch(sheetURL);
    const json = await response.json();
    tokenList = json.tokens || [];
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Gagal ambil token dari sheet" });
  }

  if (tokenList.length === 0) {
    return res.status(400).json({ result: "error", message: "No FCM tokens found." });
  }

  const responses = [];

  // 3. Kirim ke setiap token
  for (const token of tokenList) {
    const message = {
      message: {
        token: token,
        notification: {
          title,
          body
        }
      }
    };

    const fcmURL = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;

    try {
      const response = await fetch(fcmURL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token || accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      });

      const result = await response.json();
      responses.push({ token, result });
    } catch (err) {
      responses.push({ token, error: err.message });
    }
  }

  return res.status(200).json({ result: "success", reports: responses });
}
