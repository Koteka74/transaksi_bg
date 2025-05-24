// firebase-token.js

// Minta izin notifikasi dari pengguna
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    console.log("🔔 Izin notifikasi diberikan.");
    ambilToken();
  } else {
    console.warn("🚫 Izin notifikasi ditolak.");
  }
});

// Fungsi untuk ambil token FCM
function ambilToken() {
  const messaging = firebase.messaging();

  messaging
    .getToken({
      vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw"
    })
    .then((currentToken) => {
      if (currentToken) {
        console.log("✅ Token FCM:", currentToken);

        // Simpan token ke localStorage (atau kirim ke server jika perlu)
        localStorage.setItem("fcm_token", currentToken);

        // Atau kirim ke server:
        /*
        fetch("/api/simpan-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken })
        });
        */
      } else {
        console.warn("⚠️ Token kosong.");
      }
    })
    .catch((err) => {
      console.error("❌ Gagal ambil token:", err);
    });
}
