// dashboard.js FINAL

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwx88Y5tmOekoD5iD3cMQpMBWX0CotzGIgDm7aSEWMcJmg_OyqhKGuGXBIFeFjATGQ/exec';

async function fetchData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    console.log("✅ Data berhasil diambil:", json.data);

    const debug = document.getElementById("debug");
    if (debug) debug.textContent = JSON.stringify(json.data, null, 2);

    return json.data || [];
  } catch (err) {
    console.error("❌ Gagal fetch:", err);
    return [];
  }
}

function tampilkanTotalPengeluaran(data) {
  const total = data.reduce((sum, row) => sum + Number(row.Debet || 0), 0);
  const el = document.getElementById("totalPengeluaran");
  if (el) el.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

function tampilkanTopPengeluaran(data) {
  const list = document.getElementById("topPengeluaran");
  const sorted = [...data].sort((a, b) => Number(b.Debet || 0) - Number(a.Debet || 0)).slice(0, 5);
  list.innerHTML = '';
  sorted.forEach(row => {
    const li = document.createElement("li");
    li.textContent = `${row.Uraian} - Rp ${Number(row.Debet || 0).toLocaleString("id-ID")}`;
    list.appendChild(li);
  });
}

function isDalamPeriodeSekarang(tanggal) {
  const today = new Date();
  const periodeStart = new Date(today.getFullYear(), today.getMonth(), 17);
  const periodeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 16);

  const tgl = new Date(tanggal);
  return tgl >= periodeStart && tgl <= periodeEnd;
}

async function tampilkanDataPeriodeBerjalan() {
  const semuaData = await fetchData();
  const dataPeriode = semuaData.filter(row => isDalamPeriodeSekarang(row.Tanggal));
  tampilkanTotalPengeluaran(dataPeriode);
  tampilkanTopPengeluaran(dataPeriode);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Dashboard dimuat...");
  tampilkanDataPeriodeBerjalan();
});
