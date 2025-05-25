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
        simpanToken(currentToken); // kirim ke Google Sheet
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

function simpanToken(token) {
  fetch("https://script.google.com/macros/s/AKfycbzEmuQwEYw5NBeq3va03WnegvIy0Ef2ZQbONaZI_M8Uxuqkakw_fbsD2T0QkLltP_Y/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  })
    .then((res) => res.json())
    .then((res) => {
      console.log("📥 Respon simpan token:", res);
    })
    .catch((err) => {
      console.error("❌ Gagal simpan token:", err);
    });
}
// Ekspor fungsi agar bisa dipanggil dari console
window.simpanToken = simpanToken;
