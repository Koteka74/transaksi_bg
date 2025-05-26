// firebase-token.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA",
  authDomain: "transaksi-bakso-garasi.firebaseapp.com",
  projectId: "transaksi-bakso-garasi",
  storageBucket: "transaksi-bakso-garasi.appspot.com",
  messagingSenderId: "273103643750",
  appId: "1:273103643750:web:bcba66f7fdb425d8ebf9a7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔔 Minta izin dan ambil token
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    console.log("🔔 Izin notifikasi diberikan.");
    ambilToken();
  } else {
    console.warn("🚫 Izin notifikasi ditolak.");
  }
});

async function ambilToken() {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_PUBLIC_VAPID_KEY" // jika tidak pakai, bisa hapus opsi ini
    });
    if (token) {
      console.log("✅ Token FCM:", token);
      simpanToken(token);
    } else {
      console.warn("⚠️ Token tidak tersedia.");
    }
  } catch (err) {
    console.error("❌ Gagal ambil token:", err);
  }
}

// 💾 Simpan token ke Google Sheet via API (gunakan endpoint Vercel)
async function simpanToken(token) {
  try {
    const res = await fetch("/api/simpan-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });
    const hasil = await res.json();
    console.log("✅ Token berhasil disimpan:", hasil);
  } catch (err) {
    console.error("❌ Gagal simpan token:", err);
  }
}

// ✅ Tampilkan notifikasi jika pesan diterima saat halaman aktif (foreground)
onMessage(messaging, (payload) => {
  console.log("🔔 Notifikasi foreground:", payload);
  const { title, body } = payload.notification;
  new Notification(title, {
    body: body,
    icon: "/icon-192.png"
  });
});
