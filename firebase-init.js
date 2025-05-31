// firebase-init.js
import "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmvG_P7ekN3Vn2lrM6xp7fE2F0NC_y0MA",
  authDomain: "transaksi-bakso-garasi.firebaseapp.com",
  projectId: "transaksi-bakso-garasi",
  messagingSenderId: "273103643750",
  appId: "1:273103643750:web:bcba66f7fdb425d8ebf9a7"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onMessage((payload) => {
  console.log("📥 Pesan diterima di foreground:", payload);

  if (Notification.permission === 'granted') {
    const { title, body } = payload.notification;
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png"
    });
  }
});
