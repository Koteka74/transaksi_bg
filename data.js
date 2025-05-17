// data.js – Tambahan: Filter Tanggal, Periode 17–18, dan Pencarian Uraian

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzGmHEdMVkuBERtWNorwo33ylLJrnHjfh29_MhFHEMSmu1BL9HnEcRdRBU_N8AugL4/exec';
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
  const container = document.getElementById("dataContainer");
  if (!data || data.length === 0) {
    container.innerHTML = "<p class='text-gray-500'>Tidak ada data tersedia.</p>";
    return;
  }

  const tabel = document.createElement("table");
  tabel.className = "w-full text-sm text-left text-gray-700 border border-gray-200";

  const thead = document.createElement("thead");
  thead.className = "bg-gray-200 text-xs uppercase text-gray-600";
  thead.innerHTML = `
    <tr>
      <th class='px-2 py-1'>Tanggal</th>
      <th class='px-2 py-1'>Uraian</th>
      <th class='px-2 py-1'>Debet</th>
      <th class='px-2 py-1'>Kredit</th>
      <th class='px-2 py-1'>Saldo</th>
      <th class='px-2 py-1'>Keterangan</th>
    </tr>
  `;

  const tbody = document.createElement("tbody");
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.className = "border-t";
    tr.innerHTML = `
      <td class='px-2 py-1'>${formatTanggalIndo(row.Tanggal)}</td>
      <td class='px-2 py-1'>${row.Uraian || ""}</td>
      <td class='px-2 py-1'>${Number(row.Debet || 0).toLocaleString('id-ID')}</td>
      <td class='px-2 py-1'>${Number(row.Kredit || 0).toLocaleString('id-ID')}</td>
      <td class='px-2 py-1'>${Number((row.Saldo || "0").toString().replace(/\./g, "")).toLocaleString('id-ID')}</td>
      <td class='px-2 py-1'>${row.Keterangan || ""}</td>
    `;
    tbody.appendChild(tr);
  });

  tabel.appendChild(thead);
  tabel.appendChild(tbody);

  container.innerHTML = "";
  container.appendChild(tabel);
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
});
