// /api/kirim-hutangpiutang.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method not allowed" });
  }

  const url = "https://script.google.com/macros/s/AKfycbz-SgW2ujs7ZbnJrKsYV91g7-VDZpAG73kWMiFKXitO9tyzSHatOdLqn4UQwTcgOEA/exec"; // Ganti dengan URL Anda

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ result: "error", message: "Server error", detail: err.message });
  }
}
