// api/kirim-hutangpiutang.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ result: "error", message: "Method Not Allowed" });
  }

  const { Tanggal, Uraian, Jenis, Jumlah } = req.body;

  if (!Tanggal || !Uraian || !Jenis || !Jumlah) {
    return res.status(400).json({ result: "error", message: "Data tidak lengkap" });
  }

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbz-SgW2ujs7ZbnJrKsYV91g7-VDZpAG73kWMiFKXitO9tyzSHatOdLqn4UQwTcgOEA/exec";

  try {
    const response = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sheet: "HutangPiutang",
        Tanggal,
        Uraian,
        Hutang: Jenis === "Hutang" ? Jumlah : "",
        Piutang: Jenis === "Piutang" ? Jumlah : "",
      }),
    });

    const result = await response.json();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ result: "error", message: err.message });
  }
}
