// dashboard.js

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwbterqrFS_0xFZEZA2tG99IJR8MwtbxQxAq13N6gtisF14kPrwm4g1CgTxdNEXZL4/exec';

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
    console.log('DATA DARI GOOGLE SHEETS:', json);
    const debug = document.getElementById('debug');
    if (debug) debug.textContent = JSON.stringify(json.data, null, 2);
    return json.data || [];
  } catch (err) {
    console.error('GAGAL FETCH DATA:', err);
    return [];
  }
}

function isDalamPeriodeSekarang(tanggal) {
  const today = new Date();
  const periodeStart = new Date(today.getFullYear(), today.getMonth(), 17);
  const periodeEnd = new Date(periodeStart);
  periodeEnd.setMonth(periodeStart.getMonth() + 1);
  periodeEnd.setDate(16);
  const tgl = parseTanggalIndo(tanggal);
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
  const semuaData = await fetchData();
  const dataPeriode = semuaData.filter(row => isDalamPeriodeSekarang(row.Tanggal));
  tampilkanTotalPengeluaran(dataPeriode);
  tampilkanTopPengeluaran(dataPeriode);
}

document.addEventListener('DOMContentLoaded', tampilkanDataPeriodeBerjalan);
