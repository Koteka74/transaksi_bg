export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Metode tidak diizinkan" });
  }

  const { token, title, body } = req.body;
  console.log("📥 Kirim notifikasi ke token:", token);
  console.log("📨 Judul:", title);
  console.log("📨 Pesan:", body);

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization: "key=AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: title || "Judul Default",
          body: body || "Isi pesan default"
        }
      })
    });

    console.log("📡 Status code:", response.status);
    console.log("📡 Headers:", [...response.headers]);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const result = await response.json();
      console.log("✅ Respon JSON:", result);
      return res.status(200).json({ result: "success", response: result });
    } else {
      const rawText = await response.text();
      console.error("⚠️ FCM bukan JSON:", rawText);
      return res.status(500).json({ result: "error", message: "FCM bukan JSON", raw: rawText });
    }
  } catch (error) {
    console.error("❌ ERROR GAGAL:", error);
    return res.status(500).json({ result: "error", message: error.message });
  }
}
