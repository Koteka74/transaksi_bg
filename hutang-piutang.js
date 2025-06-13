// hutang-piutang.js

const SHEET_API_URL = '/api/kirim-hutangpiutang';

// Submit form hutang/piutang
document.getElementById("formHutangPiutang").addEventListener("submit", async function (e) {
  e.preventDefault();

  const jenis = document.getElementById("jenisHP").value;
  const tanggal = document.getElementById("tanggalHP").value;
  const uraian = document.getElementById("uraianHP").value;
  const jumlahFormatted = document.getElementById("jumlahHP").value;
  const jumlah = jumlahFormatted.replace(/\./g, "").replace(/,/g, "");

  if (!tanggal || !uraian || !jumlah) {
    alert("Tanggal, Uraian, dan Jumlah wajib diisi.");
    return;
  }

  if (!Number.isInteger(Number(jumlah))) {
    alert("Jumlah harus berupa angka bulat.");
    return;
  }

  const data = {
    sheet: "HutangPiutang",
    Tanggal: tanggal,
    Uraian: uraian,
    Hutang: jenis === "hutang" ? jumlah : "",
    Piutang: jenis === "piutang" ? jumlah : "",
    Jumlah: jumlah
  };

  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const hasil = await res.json();
    console.log("✅ Respons:", hasil);

    if (hasil.result === "success" || hasil.result === "SUKSES") {
      document.getElementById("formHutangPiutang").reset();
      const notif = document.getElementById("notifHP");
      notif.classList.remove("hidden");
      setTimeout(() => notif.classList.add("hidden"), 3000);
      loadDataHutangPiutang();
    } else {
      alert("Gagal simpan: " + JSON.stringify(hasil));
    }
  } catch (err) {
    console.error("❌ Error simpan:", err);
    alert("Gagal mengirim data.");
  }
});

// Menampilkan data dari sheet
async function loadDataHutangPiutang() {
  try {
    const res = await fetch("/api/proxy?sheet=HutangPiutang");
    const json = await res.json();
    const data = json.data || [];

    const tbody = document.getElementById("tabelHutangPiutang");
    tbody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${row.Tanggal || ""}</td>
        <td class="border p-2">${row.Uraian || ""}</td>
        <td class="border p-2 text-right">${row.Hutang ? formatRupiah(row.Hutang) : "-"}</td>
        <td class="border p-2 text-right">${row.Piutang ? formatRupiah(row.Piutang) : "-"}</td>
        <td class="border p-2 text-right">${row.Jumlah ? formatRupiah(row.Jumlah) : "-"}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ Gagal ambil data Hutang Piutang:", err);
  }
}

// Format angka ke rupiah
function formatRupiah(nilai) {
  const n = Number(nilai || 0);
  return n > 0 ? "Rp " + n.toLocaleString("id-ID") : "";
}

// Format input saat diketik
document.getElementById("jumlahHP").addEventListener("input", function () {
  const raw = this.value.replace(/\D/g, "");
  if (raw) {
    try {
      this.value = parseInt(raw).toLocaleString("id-ID");
    } catch (e) {
      this.value = "";
    }
  } else {
    this.value = "";
  }
});

// Sidebar toggle (hamburger)
document.addEventListener("DOMContentLoaded", function () {
  loadDataHutangPiutang();

  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
      overlay.classList.toggle("hidden");
    });

    document.querySelectorAll("#sidebar a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
      });
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
      overlay.classList.add("hidden");
    });
  }
});
