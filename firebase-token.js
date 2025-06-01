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

//simpan token
async function simpanToken(token) {
  if (!token) return;

  const sudahAda = await cekTokenDiSheet(token);
  if (sudahAda) {
    console.log("⚠️ Token sudah ada, tidak disimpan ulang.");
    return;
  }

  try {
    const res = await fetch("/api/simpan-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const json = await res.json();
    console.log("✅ Token berhasil disimpan:", json);
  } catch (err) {
    console.error("❌ Gagal simpan token:", err);
  }
}


async function cekTokenDiSheet(token) {
  try {
    const url = `https://script.google.com/macros/s/AKfycbxeJAJSrxvaUf-IAQrfv0d0alOnOwKm-r0MOpaIRegmjxEEG2YAlBOa9Ylr1-EZmdI/exec?mode=cek&token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json.exists === true;
  } catch (err) {
    console.error("❌ Gagal cek token:", err);
    return false;
  }
}
