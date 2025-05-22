// data_operasional.js – Responsif dan urut rapi di mobile
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxo7859kAtaphc9ddgacR4aCZRk-dOeYWi-NYJx6nksBtnRLq_g5_5J0_7R3jthQk8/exec?sheet=Ops';
let semuaData = [];

async function ambilData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
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
  if (!tbody) return;
  tbody.innerHTML = "";

  let totalDebet = 0;
  let totalKredit = 0;

  data.forEach(row => {
    const tr = document.createElement("tr");

    const tanggalFormatted = row.Tanggal
      ? new Date(row.Tanggal).toLocaleDateString("id-ID")
      : "";

    tr.innerHTML = `
      <td class="border px-2 py-1 text-xs md:text-sm">${tanggalFormatted}</td>
      <td class="border px-2 py-1 text-xs md:text-sm">${row.Uraian || ""}</td>
      <td class="border px-2 py-1 text-xs md:text-sm text-right">${formatRupiah(row.Debet)}</td>
      <td class="border px-2 py-1 text-xs md:text-sm text-right">${formatRupiah(row.Kredit)}</td>
      <td class="border px-2 py-1 text-xs md:text-sm text-right">${formatRupiah(row.Saldo)}</td>
      <td class="border px-2 py-1 text-xs md:text-sm">${row.Kategori || ""}</td>
      <td class="border px-2 py-1 text-xs md:text-sm">${row.Keterangan || ""}</td>
    `;
    tbody.appendChild(tr);

    const debet = parseInt((row.Debet || "0").toString().replace(/\D/g, "")) || 0;
    const kredit = parseInt((row.Kredit || "0").toString().replace(/\D/g, "")) || 0;
    totalDebet += debet;
    totalKredit += kredit;
  });

  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="2" class="bg-blue-700 text-white font-bold px-2 py-2 text-right text-xs md:text-sm">Jumlah</td>
    <td class="bg-blue-700 text-white font-bold px-2 py-2 text-right text-xs md:text-sm">${formatRupiah(totalDebet)}</td>
    <td class="bg-blue-700 text-white font-bold px-2 py-2 text-right text-xs md:text-sm">${formatRupiah(totalKredit)}</td>
    <td colspan="3" class="bg-blue-700"></td>
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

    if (tglAwal && tglAkhir) {
      const start = new Date(tglAwal);
      const end = new Date(tglAkhir);
      if (tgl < start || tgl > end) return false;
    }

    if (periode && periode !== "semua") {
      const [year, month] = periode.split("-").map(Number);
      const start = new Date(year, month - 1, 18);
      const end = new Date(year, month, 17, 23, 59, 59);
      if (tgl < start || tgl > end) return false;
    }

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
    document.querySelectorAll("#sidebar a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
      });
    });
  }
});
