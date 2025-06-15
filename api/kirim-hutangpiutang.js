export default async function handler(req, res) {
  const sheetUrl = "https://script.google.com/macros/s/AKfycby9RJg2Xk8gHjl84OhL-V1W2jS9J4qaGtscr9AGH1XWhmI8klT9KwDFXp2e5jFjKUU/exec";

  if (req.method === "POST") {
    try {
      const response = await fetch(sheetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ result: "error", message: "Gagal kirim data", detail: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const url = `${sheetUrl}?sheet=HutangPiutang`;
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ result: "error", message: "Gagal ambil data", detail: err.message });
    }
  }

  // Jika bukan GET atau POST
  return res.status(405).json({ error: "Method not allowed" });
}
