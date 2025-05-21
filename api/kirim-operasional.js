export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbyqujIBHIkPfXMdqvwwzwufWyf42wvJfldLdGz2kb8k1ggfWqIyghCBVNvKT-smTmw/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      const result = await response.json();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ result: "error", message: error.message });
    }
  } else {
    res.status(405).json({ result: "error", message: "Method not allowed" });
  }
}
