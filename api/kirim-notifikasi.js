import admin from "firebase-admin";

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

async function hapusTokenDiSheet(token) {
  try {
    const url = `https://script.google.com/macros/s/AKfycbz4HRSg3-CaCq19mC-cUTFJU2YVBXR_vVWm5Z-P4Upyr5_riwtu6D4mHRE_w3gVGaI/exec?mode=delete&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log("🗑️ Token dihapus dari sheet:", token, json);
  } catch (err) {
    console.error("❌ Gagal hapus token:", err);
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method not allowed" });
  }

  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ result: "error", message: "Missing title or body" });
  }

  // Ambil daftar token dari Google Sheets
  const sheetUrl = "https://script.google.com/macros/s/AKfycbz4HRSg3-CaCq19mC-cUTFJU2YVBXR_vVWm5Z-P4Upyr5_riwtu6D4mHRE_w3gVGaI/exec";
  let tokenList = [];
  try {
    const response = await fetch(sheetUrl);
    const data = await response.json();
    tokenList = data.tokens || [];
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Failed to fetch tokens" });
  }

  const message = {
    notification: { title, body },
    webpush: { notification: { icon: "/icons/icon-192.png" } }
  };

  const results = await Promise.all(tokenList.map(async (token) => {
    try {
      const res = await admin.messaging().send({ ...message, token });
      return { token, status: "success", res };
    } catch (err) {
      console.warn("❌ Token gagal:", token, err.message);

      if (err.errorInfo && err.errorInfo.code === "messaging/registration-token-not-registered") {
        // Token tidak valid → hapus dari Sheet
        await fetch(`${sheetUrl}?mode=delete&token=${token}`);
      }
      if (
        error.code === 'messaging/registration-token-not-registered' ||
        error.message?.includes('registration-token-not-registered')
      ) {
        await hapusTokenDiSheet(token); // hapus token tidak valid
      }
      return { token, status: "failed", error: err.message };
    }
  }));

  return res.status(200).json({ result: "success", reports: results });
}
