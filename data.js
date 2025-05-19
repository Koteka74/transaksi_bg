// data.js – Tambahan: Filter Tanggal, Periode 17–18, dan Pencarian Uraian

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyqujIBHIkPfXMdqvwwzwufWyf42wvJfldLdGz2kb8k1ggfWqIyghCBVNvKT-smTmw/exec';
let semuaData = [];

async function ambilData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    console.log("✅ Data diterima:", json.data);
    semuaData = json.data || [];
    tampilkanTabel(semuaData);
  } catch (err) {
    console.error("❌ Gagal ambil data:", err);
    semuaData = [];
  }
}

function formatTanggalIndo(tanggalISO) {
  const d = new Date(tanggalISO);
  return isNaN(d) ? "-" : d.toLocaleDateString('id-ID');
}

function tampilkanTabel(data) {
  const tbody = document.querySelector("#tabelData tbody");
  tbody.innerHTML = "";

  let total = 0;

  data.forEach(row => {
    const tr = document.createElement("tr");

    const tanggalFormatted = row.Tanggal
      ? new Date(row.Tanggal).toLocaleDateString("id-ID")
      : "";
    
    tr.innerHTML = `
      <td class="border px-2 py-1 text-sm">${tanggalFormatted}</td>
      <td class="border px-2 py-1 text-sm">${row.Uraian || ""}</td>
      <td class="border px-2 py-1 text-sm text-right">${formatRupiah(row.Debet)}</td>
      <td class="border px-2 py-1 text-sm text-right">${formatRupiah(row.Kredit)}</td>
      <td class="border px-2 py-1 text-sm text-right">${formatRupiah(row.Saldo)}</td>
      <td class="border px-2 py-1 text-sm">${row.Keterangan || ""}</td>
    `;
    tbody.appendChild(tr);

    const debet = parseInt((row.Debet || "0").toString().replace(/\D/g, "")) || 0;
    total += debet;
  });

  // Tambahkan baris jumlah
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="2" class="bg-blue-200 text-white font-bold px-2 py-2 text-right">Jumlah</td>
    <td class="bg-blue-200 text-white font-bold px-2 py-2 text-right">${formatRupiah(total)}</td>
    <td colspan="3" class="bg-blue-200"></td>
  `;
  tbody.appendChild(totalRow);
}


function filterData() {
  const tglAwal = document.getElementById("filterTanggalAwal").value;
  const tglAkhir = document.getElementById("filterTanggalAkhir").value;
  const periode = document.getElementById("filterPeriode").value;
  const kata = document.getElementById("filterUraian").value.toLowerCase();

  let hasil = semuaData.filter(row => {
    if (!row.Tanggal) return false;
    const tgl = new Date(row.Tanggal);
    if (isNaN(tgl)) return false;

    // Filter berdasarkan rentang tanggal
    if (tglAwal && tglAkhir) {
      const start = new Date(tglAwal);
      const end = new Date(tglAkhir);
      if (tgl < start || tgl > end) return false;
    }

    // Filter berdasarkan periode tanggal 17
    if (periode && periode !== "semua") {
      const [year, month] = periode.split("-").map(Number);
      const start = new Date(year, month - 1, 18);
      const end = new Date(year, month, 17, 23, 59, 59);
      if (tgl < start || tgl > end) return false;
    }

    // Filter berdasarkan kata uraian
    if (kata && !row.Uraian?.toLowerCase().includes(kata)) return false;

    return true;
  });

  tampilkanTabel(hasil);
}

function formatRupiah(angka) {
  const n = parseInt(angka?.toString().replace(/\D/g, "")) || 0;
  return n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  });
}


// Jalankan saat halaman siap
window.addEventListener("DOMContentLoaded", async () => {
  await ambilData();
  tampilkanTabel(semuaData);

  document.getElementById("filterTanggalAwal").addEventListener("change", filterData);
  document.getElementById("filterTanggalAkhir").addEventListener("change", filterData);
  document.getElementById("filterPeriode").addEventListener("change", filterData);
  document.getElementById("filterUraian").addEventListener("input", filterData);
  document.getElementById("resetFilter").addEventListener("click", () => {
  document.getElementById("filterTanggalAwal").value = "";
  document.getElementById("filterTanggalAkhir").value = "";
  document.getElementById("filterPeriode").value = "semua";
  document.getElementById("filterUraian").value = "";
  tampilkanTabel(semuaData);
});
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
    });

    // Tutup sidebar otomatis setelah klik link menu (mobile)
    document.querySelectorAll("#sidebar a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
      });
    });
  }
});
