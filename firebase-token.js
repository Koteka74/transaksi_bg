document.addEventListener("DOMContentLoaded", async () => {
  if (!firebase || !firebase.messaging) {
    console.warn("Firebase tidak tersedia.");
    return;
  }

  const messaging = firebase.messaging();

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("🔔 Izin notifikasi diberikan.");
      const token = await messaging.getToken({ vapidKey: "BKEmOESDGJWvHc5qSlctfHN_b5Z56eIOkUJCMXw70h0BV5Og0xWs6OkSv_rfnSIeLCMDntWjKI6HrMs6-pSD4gw" });

      if (token) {
        console.log("📱 Token FCM:", token);

        // Simpan token ke Google Sheet
        const simpan = await fetch("https://script.google.com/macros/s/AKfycbz4HRSg3-CaCq19mC-cUTFJU2YVBXR_vVWm5Z-P4Upyr5_riwtu6D4mHRE_w3gVGaI/exec", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });

        const hasil = await simpan.json();
        console.log("✅ Token berhasil disimpan:", hasil);
      } else {
        console.warn("❌ Gagal mendapatkan token.");
      }
    } else {
      console.warn("❌ Izin notifikasi ditolak.");
    }
  } catch (err) {
    console.error("❌ Gagal ambil token:", err);
  }

  // Terima notifikasi saat tab aktif
  messaging.onMessage((payload) => {
    console.log("📥 Pesan masuk:", payload);
    const { title, body } = payload.notification;
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png"
    });
  });
});
