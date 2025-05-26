// firebase-token.js

document.addEventListener("DOMContentLoaded", () => {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("🔔 Izin notifikasi diberikan.");
      ambilToken();
    } else {
      console.warn("🚫 Izin notifikasi ditolak.");
    }
  });
});

function ambilToken() {
  navigator.serviceWorker.ready.then((registration) => {
    const messaging = firebase.messaging();

    messaging
      .getToken({
        vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw",
        serviceWorkerRegistration: registration
      })
      .then((currentToken) => {
        if (currentToken) {
          console.log("✅ Token FCM:", currentToken);
          simpanToken(currentToken);
          localStorage.setItem("fcm_token", currentToken);
        } else {
          console.warn("⚠️ Token kosong.");
        }
      })
      .catch((err) => {
        console.error("❌ Gagal ambil token:", err);
      });
  });
}


function simpanToken(token) {
  fetch("/api/simpan-token", {
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

window.simpanToken = simpanToken;
