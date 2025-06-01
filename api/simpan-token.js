// api/simpan-token.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token kosong" });
  }

  // Cek apakah token sudah ada
  const cekUrl = `https://script.google.com/macros/s/AKfycbwgLAQ0xca0OFlAdXPOZTotFXSvEg7M0yoKej2mcu8ULFzid57ngCis4uHiqnZxo4U/exec?mode=cek&token=${token}`;
  const resCek = await fetch(cekUrl);
  const cek = await resCek.json();

  if (cek.exists) {
    return res.status(200).json({ result: "duplicate" });
  }

  //simpan token
  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbwgLAQ0xca0OFlAdXPOZTotFXSvEg7M0yoKej2mcu8ULFzid57ngCis4uHiqnZxo4U/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token })
    });

    const result = await response.json();
    return res.status(200).json({ result: "success", data: result });
  } catch (err) {
    return res.status(500).json({ result: "error", message: err.message });
  }
}
