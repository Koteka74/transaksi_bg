// api/kirim-hutangpiutang.js

const SHEET_URL = "https://script.google.com/macros/s/AKfycby6PdnOBYLzrPdkib8obsYMWGNjDHaDXcLSBjZI_IT6_4Epy1sg_suhtXantZ__rvg/exec";

export default async function handler(req, res) {
  // Handle POST request
  if (req.method === 'POST') {
    try {
      // Validasi minimal
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ 
          result: 'error', 
          message: 'Invalid request body' 
        });
      }

      const response = await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(req.body)
      });

      if (!response.ok) {
        throw new Error(`Google Script returned ${response.status}`);
      }

      const result = await response.json();
      
      // Pastikan response dari Google Script valid
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from Google Script');
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Proxy POST Error:', error);
      return res.status(500).json({ 
        result: 'error', 
        message: error.message || 'Failed to process request'
      });
    }
  }

  // Handle GET request
  else if (req.method === 'GET') {
    try {
      const sheet = encodeURIComponent(req.query.sheet || '');
      const url = `${SHEET_URL}?sheet=${sheet}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Script returned ${response.status}`);
      }

      const result = await response.json();
      
      // Validasi response
      if (!Array.isArray(result.data)) {
        throw new Error('Invalid data format from Google Script');
      }

      return res.status(200).json(result);

    } catch (error) {
      console.error('Proxy GET Error:', error);
      return res.status(500).json({ 
        result: 'error', 
        message: error.message || 'Failed to fetch data'
      });
    }
  }

  // Handle other methods
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ 
      result: 'error', 
      message: `Method ${req.method} not allowed` 
    });
  }
}