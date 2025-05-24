export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { token, title, body } = req.body;
  console.log("📥 Payload diterima:", { token, title, body });
  
  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: "key=AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA", // Ganti dengan API Key kamu
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title || "Notifikasi Baru",
          body: body || "Ada data baru ditambahkan"
        }
      })
    });

    const contentType = response.headers.get("content-type");

    // Periksa apakah JSON
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      return res.status(200).json({ result: "success", fcm: result });
    } else {
      const text = await response.text(); // kemungkinan HTML error
      return res.status(500).json({ result: "error", message: "Invalid response from FCM", body: text });
    }
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi:", error);
    return res.status(500).json({ result: "error", message: error.message });
  }
}
