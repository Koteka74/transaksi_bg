// api/proxy.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbzGmHEdMVkuBERtWNorwo33ylLJrnHjfh29_MhFHEMSmu1BL9HnEcRdRBU_N8AugL4/exec";

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

    const text = await googleRes.text();
    return res.status(200).json({ result: text });
  } catch (error) {
    return res.status(500).json({ error: "Gagal kirim ke Google Apps Script", detail: error.message });
  }
}
