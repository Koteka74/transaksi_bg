console.log("📦 dashboard.js dimuat");

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwbterqrFS_0xFZEZA2tG99IJR8MwtbxQxAq13N6gtisF14kPrwm4g1CgTxdNEXZL4/exec';

async function fetchData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();

    // Tampilkan data mentah
    console.log("✅ DATA MENTAH:", json.data);

    const debug = document.getElementById('debug');
    if (debug) {
      debug.textContent = JSON.stringify(json.data, null, 2);
    }

    return json.data || [];
  } catch (err) {
    console.error("❌ Gagal fetch data:", err);
    return [];
  }
}

function tampilkanTotalPengeluaran(data) {
  let total = 0;
  data.forEach(row => {
    const nilai = Number(row.Debet || 0);
    if (!isNaN(nilai)) total += nilai;
  });

  console.log("💰 Total dihitung:", total);

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
  console.log("🚀 Menjalankan tampilkanDataPeriodeBerjalan()");
  const semuaData = await fetchData();

  // Nonaktifkan filter tanggal sementara agar semua data masuk
  tampilkanTotalPengeluaran(semuaData);
  tampilkanTopPengeluaran(semuaData);
}

document.addEventListener("DOMContentLoaded", tampilkanDataPeriodeBerjalan);
