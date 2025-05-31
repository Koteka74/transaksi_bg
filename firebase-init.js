// firebase-init.js (versi final yang tidak pakai import)

// Muat Firebase compat dari CDN
const firebaseConfig = {
  apiKey: "AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA",
  authDomain: "transaksi-bakso-garasi.firebaseapp.com",
  projectId: "transaksi-bakso-garasi",
  messagingSenderId: "273103643750",
  appId: "1:273103643750:web:bcba66f7fdb425d8ebf9a7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Tampilkan notifikasi saat browser aktif (foreground)
messaging.onMessage((payload) => {
  console.log("📥 Pesan diterima di foreground:", payload);
  const { title, body } = payload.notification;
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png"
    });
  }
});
