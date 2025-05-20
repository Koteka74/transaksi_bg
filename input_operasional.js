// input_operasional.js
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbztF1I4r-Ti59X-QfrxwNTElYeNqm16hqprbLuujY1ua7EI5hMia0aeHHyH0IIXYM8/exec"; // Ganti dengan URL Web App Anda

// Toggle sidebar
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

// Simpan data operasional
const form = document.getElementById("formOperasional");
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const tanggal = document.getElementById("tanggal").value;
  const uraian = document.getElementById("uraian").value;
  const nilaiFormatted = document.getElementById("nilai").value;
  const nilai = nilaiFormatted.replace(/\./g, "").replace(/,/g, "");
  const keterangan = document.getElementById("keterangan").value;

  if (!tanggal || !uraian || !nilai) {
    alert("Tanggal, Uraian, dan Nilai wajib diisi.");
    return;
  }

  const data = {
    sheet: "Ops",
    Tanggal: tanggal,
    Uraian: uraian,
    Nilai: nilai,
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
      setTimeout(() => notif.classList.add("hidden"), 3000);
    } else {
      alert("Gagal simpan: " + JSON.stringify(hasil));
    }
  } catch (err) {
    console.error("❌ Gagal kirim:", err);
    alert("Gagal menyimpan data operasional.");
  }
});

// Format nilai saat diketik
const nilaiInput = document.getElementById("nilai");
nilaiInput.addEventListener("input", function () {
  const raw = this.value.replace(/\D/g, "");
  if (raw) {
    this.value = parseInt(raw).toLocaleString("id-ID");
  } else {
    this.value = "";
  }
});
