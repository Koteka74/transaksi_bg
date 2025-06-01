// input_operasional.js
const SHEET_API_URL = "/api/kirim-operasional";

// Sidebar toggle
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

// Format input angka
["debet", "kredit"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input", function () {
    const raw = this.value.replace(/\D/g, "");
    this.value = raw ? parseInt(raw).toLocaleString("id-ID") : "";
  });
});

// Simpan data
const form = document.getElementById("formOperasional");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const tanggal = document.getElementById("tanggal").value;
  const uraian = document.getElementById("uraian").value;
  const debetFormatted = document.getElementById("debet").value;
  const kreditFormatted = document.getElementById("kredit").value;
  const kategori = document.getElementById("kategori").value;
  const keterangan = document.getElementById("keterangan").value;

  const debet = debetFormatted.replace(/\./g, "").replace(/,/g, "");
  const kredit = kreditFormatted.replace(/\./g, "").replace(/,/g, "");

  if (!tanggal || !uraian || (!debet && !kredit)) {
    alert("Tanggal, Uraian, dan minimal Debet atau Kredit wajib diisi.");
    return;
  }

  const data = {
    sheet: "Ops",
    Tanggal: tanggal,
    Uraian: uraian,
    Debet: debet,
    Kredit: kredit,
    Kategori: kategori,
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
    if (hasil.result === "success" || hasil.result === "SUKSES") {
      form.reset();
      const notif = document.getElementById("notif");
      notif.classList.remove("hidden");

      // Kirim notifikasi otomatis
      await kirimNotifikasi("Transaksi Baru", `Uraian: ${uraian} - data berhasil disimpan.`);

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
    console.error("❌ Gagal kirim:", err);
    alert("Gagal menyimpan data operasional.");
  }
});

//kirim notifikasi
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
