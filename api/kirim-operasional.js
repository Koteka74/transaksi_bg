// api/kirim-operasional.js

export default async function handler(req, res) {
  const url = "https://script.google.com/macros/s/AKfycbxaBNIMLNDzcgNZLN6NkM6P_XRbx10z0D5BOjobT5N1oAqImEfjP4Rpx8plsqfTsfQ/exec";

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
