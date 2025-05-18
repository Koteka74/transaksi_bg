// api/proxy.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbwm6wkKAOK5hjYAXt6l7tUjAq9CPk7_jncr-k6WitTiNHxcLCDamR1fkIjjZQzKyhM/exec";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const googleRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const json = await googleRes.json(); // ubah jadi JSON langsung
    return res.status(200).json(json);   // jangan bungkus ulang

  } catch (error) {
    return res.status(500).json({ error: "Gagal kirim ke Google Apps Script", detail: error.message });
  }
}
