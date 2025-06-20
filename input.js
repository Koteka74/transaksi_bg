// input.js – Final versi dengan toggle hamburger + input transaksi

const SHEET_API_URL = '/api/proxy';

// Fungsi untuk ambil data saran dari sheet NamaBahan
async function loadAutocompleteUraian() {
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbxo7859kAtaphc9ddgacR4aCZRk-dOeYWi-NYJx6nksBtnRLq_g5_5J0_7R3jthQk8/exec?sheet=NamaBahan");
    const json = await res.json();
    const list = json.data || [];
    const datalist = document.getElementById("listUraian");
    list.forEach(item => {
      const option = document.createElement("option");
      option.value = item.Nama || item.nama || item;
      datalist.appendChild(option);
    });
  } catch (err) {
    console.error("❌ Gagal load NamaBahan:", err);
  }
}

document.getElementById("formTransaksi").addEventListener("submit", async function (e) {
  e.preventDefault();

  const jenis = document.getElementById("jenisTransaksi").value;
  const tanggal = document.getElementById("tanggal").value;
  const uraian = document.getElementById("uraian").value;
  const jumlahFormatted = document.getElementById("jumlah").value;
  const jumlah = jumlahFormatted.replace(/\./g, "").replace(/,/g, "");
  const keterangan = document.getElementById("keterangan").value;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.classList.add('loading');

  if (!tanggal || !uraian || !jumlah) {
    alert("Tanggal, Uraian, dan Jumlah wajib diisi.");
    return;
  }

  if (!Number.isInteger(Number(jumlah))) {
    alert("Jumlah harus berupa angka bulat.");
    return;
  }

  const data = {
    Tanggal: tanggal,
    Uraian: uraian,
    Debet: jenis === "pengeluaran" ? jumlah : "",
    Kredit: jenis === "penerimaan" ? jumlah : "",
    Keterangan: keterangan
  };

  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const hasil = await res.json();
    console.log("✅ Respons:", hasil);

    if (hasil.result === "success" || hasil.result === "SUKSES") {
      document.getElementById("formTransaksi").reset();
      const notif = document.getElementById("notif");
      notif.classList.remove("hidden");

      // Kirim notifikasi otomatis
      await kirimNotifikasi("Transaksi Baru", `${uraian} - data berhasil disimpan.`);

      // Tampilkan notifikasi jika tab aktif
      if (firebase?.messaging) {
        const messaging = firebase.messaging();

        messaging.onMessage((payload) => {
          console.log("📥 Pesan masuk di foreground:", payload);

          if (Notification.permission === 'granted') {
            const { title, body } = payload.notification;
            new Notification(title, {
              body,
              icon: "/icons/icon-192.png"
            });
          }
        });
      }
      
      setTimeout(() => notif.classList.add("hidden"), 3000);

    } else {
      alert("Gagal simpan: " + JSON.stringify(hasil));
    }
  } catch (err) {
    console.error("❌ Error simpan:", err);
    alert("Gagal mengirim data.");
  } finally {
    submitBtn.classList.remove('loading');
  }
});

// Format angka saat diketik di input jumlah
const jumlahInput = document.getElementById("jumlah");
jumlahInput.addEventListener("input", function () {
  const raw = this.value.replace(/\D/g, "");
  if (raw) {
    try {
      this.value = parseInt(raw).toLocaleString("id-ID");
    } catch (e) {
      console.error("Format error:", e);
      this.value = "";
    }
  } else {
    this.value = "";
  }
});

// Toggle sidebar hamburger menu
document.addEventListener("DOMContentLoaded", function () {
  loadAutocompleteUraian();
  
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });

    document.querySelectorAll("#sidebar a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
      });
    });
  }
});

async function kirimNotifikasi(judul, pesan) {
  try {
    const res = await fetch("/api/kirim-notifikasi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: judul,
        body: pesan 
      })
    });
    const hasil = await res.json();
    console.log("📬 Notifikasi dikirim:", hasil);
  } catch (err) {
    console.error("❌ Gagal kirim notifikasi:", err);
  }
}

