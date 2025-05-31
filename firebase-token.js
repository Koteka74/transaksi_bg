// firebase-token.js

document.addEventListener("DOMContentLoaded", ambilToken);

async function ambilToken() {
  try {
    const currentToken = await messaging.getToken({ vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw" });
    if (currentToken) {
      await simpanToken(currentToken);

      // Listen untuk foreground notification
      messaging.onMessage((payload) => {
        console.log("📥 Notifikasi masuk:", payload);
        const { title, body } = payload.notification;
        new Notification(title, {
          body,
          icon: "/icons/icon-192.png"
        });
      });
    } else {
      console.warn("Token tidak ditemukan.");
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
      console.log("ℹ️ Token sudah tersimpan.");
    } else {
      console.log("✅ Token berhasil disimpan:", hasil);
    }
  } catch (err) {
    console.error("❌ Gagal simpan token:", err);
  }
}
