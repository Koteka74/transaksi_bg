// firebase-token.js

document.addEventListener("DOMContentLoaded", ambilToken);

async function ambilToken() {
  try {
    const messaging = firebase.messaging();

    const currentToken = await messaging.getToken({
      vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw" // ganti dengan VAPID key milikmu
    });

    if (currentToken) {
      console.log("📱 Token FCM:", currentToken);
      await simpanToken(currentToken);

      // ✅ Notifikasi saat foreground (halaman terbuka)
      messaging.onMessage((payload) => {
        console.log("📥 Notifikasi diterima (foreground):", payload);

        const { title, body } = payload.notification;
        if (Notification.permission === "granted") {
          new Notification(title, {
            body,
            icon: "/icons/icon-192.png"
          });
        }
      });
    } else {
      console.warn("⚠️ Token tidak tersedia. Mungkin belum diberikan izin notifikasi.");
    }
  } catch (err) {
    console.error("❌ Gagal ambil token:", err);
  }
}

async function simpanToken(token) {
  try {
    const res = await fetch("/api/simpan-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const hasil = await res.json();

    if (hasil.result === "duplicate") {
      console.log("ℹ️ Token sudah ada, tidak disimpan ulang.");
    } else {
      console.log("✅ Token berhasil disimpan:", hasil);
    }
  } catch (err) {
    console.error("❌ Gagal simpan token:", err);
  }
}
