// api/simpan-token.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token kosong" });
  }

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbxPDtLvX7OAMwObKluHEZQJxGnKy5YDfV8w4Ot9JVj6c7JiN49fPaAy6wXLpScNRW4/exec", {
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
