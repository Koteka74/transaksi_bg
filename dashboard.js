// dashboard.js

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwx88Y5tmOekoD5iD3cMQpMBWX0CotzGIgDm7aSEWMcJmg_OyqhKGuGXBIFeFjATGQ/exec';

function formatTanggalIndo(tgl) {
  const d = new Date(tgl);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseTanggalIndo(str) {
  const [dd, mm, yyyy] = str.split('/');
  return new Date(`${yyyy}-${mm}-${dd}`);
}

async function fetchData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    console.log("Contoh data satu baris:", json.data?.[0]);
    console.log('DATA DARI GOOGLE SHEETS:', json);
    // tampilkan data mentah langsung di elemen <pre id="debug">
    const debug = document.getElementById('debug');
    if (debug) {
      debug.textContent = JSON.stringify(json.data, null, 2);
    }
    
    // tambahkan console log juga
    console.log("Data mentah:", json.data);
    
    return json.data || [];
  } catch (err) {
    console.error('GAGAL FETCH DATA:', err);
    return [];
  }
}

function isDalamPeriodeSekarang(tanggal) {
  if (!tanggal) return false;

  const today = new Date();
  const periodeStart = new Date(today.getFullYear(), today.getMonth(), 17);
  const periodeEnd = new Date(today.getFullYear(), today.getMonth() + 1, 16);

  const tgl = new Date(tanggal); // langsung parse ISO date
  return tgl >= periodeStart && tgl <= periodeEnd;
}


function tampilkanTotalPengeluaran(data) {
  const total = data.reduce((sum, row) => sum + Number(row.Debet || 0), 0);
  const el = document.getElementById('totalPengeluaran');
  if (el) el.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function tampilkanTopPengeluaran(data) {
  const list = document.getElementById('topPengeluaran');
  const sorted = [...data].sort((a, b) => Number(b.Debet || 0) - Number(a.Debet || 0)).slice(0, 5);
  list.innerHTML = '';
  sorted.forEach(row => {
    const li = document.createElement('li');
    li.textContent = `${row.Uraian} - Rp ${Number(row.Debet || 0).toLocaleString('id-ID')}`;
    list.appendChild(li);
  });
}

async function tampilkanDataPeriodeBerjalan() {
  console.log("Menjalankan tampilkanDataPeriodeBerjalan()");
  const semuaData = await fetchData();

  // untuk test: tampilkan semua data
  const dataPeriode = semuaData;

  tampilkanTotalPengeluaran(dataPeriode);
  tampilkanTopPengeluaran(dataPeriode);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Dashboard loaded");
  tampilkanDataPeriodeBerjalan();
});
