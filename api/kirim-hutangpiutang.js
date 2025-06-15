export default async function handler(req, res) {
  const sheetName = "HutangPiutang";
  const sheetAPI = "https://script.google.com/macros/s/AKfycby9RJg2Xk8gHjl84OhL-V1W2jS9J4qaGtscr9AGH1XWhmI8klT9KwDFXp2e5jFjKUU/exec";

  if (req.method === "POST") {
    try {
      const response = await fetch(sheetAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(req.body)
      });
      const json = await response.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).json({
        result: "error",
        message: "Gagal mengirim data",
        detail: err.message
      });
    }
  }

  if (req.method === "GET") {
    try {
      const response = await fetch(`${sheetAPI}?sheet=${sheetName}`);
      const json = await response.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).json({
        result: "error",
        message: "Gagal mengambil data",
        detail: err.message
      });
    }
  }

  // Jika bukan POST/GET
  return res.status(405).json({
    result: "error",
    message: "Method not allowed"
  });
}
