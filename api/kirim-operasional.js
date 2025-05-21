// api/kirim-operasional.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbz6igaTn2Rv6V4WraLPcMy7FyI_HSXLicENmgB6cbMULi4ghSvplU9S7tPxw-0z1bg/exec";

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

    const json = await googleRes.json();
    return res.status(200).json(json);

  } catch (error) {
    return res.status(500).json({ error: "Gagal kirim ke Google Apps Script", detail: error.message });
  }
}
