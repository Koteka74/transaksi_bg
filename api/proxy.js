// api/proxy.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbztF1I4r-Ti59X-QfrxwNTElYeNqm16hqprbLuujY1ua7EI5hMia0aeHHyH0IIXYM8/exec";

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
