// firebase-token.js

// Ambil token dari Firebase Cloud Messaging
async function ambilToken() {
  try {
    const currentToken = await messaging.getToken({
      vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw"
    });

    if (currentToken) {
      console.log("📱 Token FCM:", currentToken);
      simpanTokenJikaBaru(currentToken);
    } else {
      console.warn("⚠️ Token tidak tersedia. Izin belum diberikan.");
    }
  } catch (err) {
    console.error("❌ Gagal ambil token:", err);
  }
}

// Simpan token jika belum pernah dikirim sebelumnya
function simpanTokenJikaBaru(token) {
  const lastToken = localStorage.getItem("savedFCMToken");

  if (lastToken === token) {
    console.log("🔁 Token FCM sudah pernah disimpan.");
    return;
  }

  fetch("/api/simpan-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  })
    .then(res => res.json())
    .then(json => {
      if (json.result === "success") {
        console.log("✅ Token berhasil disimpan.");
        localStorage.setItem("savedFCMToken", token);
      } else {
        console.warn("⚠️ Token tidak disimpan:", json.message);
      }
    })
    .catch(err => {
      console.error("❌ Gagal simpan token:", err);
    });
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  ambilToken();
});
