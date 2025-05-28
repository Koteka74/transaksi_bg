import admin from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
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

  try {
    // Ambil token dari Google Sheet kamu (gunakan URL Google Apps Script)
    const sheetUrl = "https://script.google.com/macros/s/AKfycbxPDtLvX7OAMwObKluHEZQJxGnKy5YDfV8w4Ot9JVj6c7JiN49fPaAy6wXLpScNRW4/exec";
    const response = await fetch(sheetUrl);
    const data = await response.json();
    const tokens = data.tokens || [];

    if (!Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ result: "error", message: "No FCM tokens found." });
    }

    // Kirim notifikasi ke semua token
    const payload = {
      notification: {
        title,
        body,
      },
    };

    const responseFCM = await admin.messaging().sendEach(
      tokens.map(token => ({
        token,
        ...payload,
      }))
    );

    return res.status(200).json({ result: "success", reports: responseFCM.responses });
  } catch (err) {
    return res.status(500).json({ result: "error", message: err.message });
  }
}
