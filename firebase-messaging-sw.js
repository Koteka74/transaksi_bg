// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA",
  authDomain: "transaksi-bakso-garasi.firebaseapp.com",
  projectId: "transaksi-bakso-garasi",
  messagingSenderId: "273103643750",
  appId: "1:273103643750:web:bcba66f7fdb425d8ebf9a7"
});

const messaging = firebase.messaging();

// Tampilkan notifikasi saat pesan diterima di background
messaging.onBackgroundMessage(function (payload) {
  console.log("📩 [firebase-messaging-sw.js] Pesan diterima:", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192.png", // opsional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Saat notifikasi diklik
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/") // arahkan ke halaman utama
  );
});
