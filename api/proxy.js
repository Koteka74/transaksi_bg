// api/proxy.js

const url = "https://script.google.com/macros/s/AKfycbyqujIBHIkPfXMdqvwwzwufWyf42wvJfldLdGz2kb8k1ggfWqIyghCBVNvKT-smTmw/exec";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });

      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ result: 'error', message: error.message });
    }
  }

  else if (req.method === 'GET') {
    const sheet = req.query.sheet || ''; // ?sheet=HutangPiutang
    const url = `${SHEET_URL}?sheet=${sheet}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ result: 'error', message: error.message });
    }
  }

  else {
    return res.status(405).json({ result: 'error', message: 'Method not allowed' });
  }
}
