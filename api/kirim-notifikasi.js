export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { token, title, body } = req.body;

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: "key=AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA", // Ganti ini
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

    const result = await response.json();
    res.status(200).json({ result: "success", response: result });
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi:", error);
    res.status(500).json({ result: "error", message: error.message });
  }
}
