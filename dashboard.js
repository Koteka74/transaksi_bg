// dashboard.js FINAL – PERIODE 18 - 17 BULAN BERIKUTNYA + FILTER PERIODE & REKAP TOTAL PER ITEM

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwx88Y5tmOekoD5iD3cMQpMBWX0CotzGIgDm7aSEWMcJmg_OyqhKGuGXBIFeFjATGQ/exec';

let semuaData = [];
let urutAbjad = false;

async function fetchData() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    console.log("✅ Data berhasil diambil:", json.data);
    semuaData = json.data || [];
    
    filterDanTampilkan();
    tampilkanSaldoKas(semuaData);
  } catch (err) {
    console.error("❌ Gagal fetch:", err);
  }
}

function tampilkanPeriode(start, end) {
  const label = `Periode: ${start.toLocaleDateString('id-ID')} s/d ${end.toLocaleDateString('id-ID')}`;
  const el = document.getElementById("labelPeriode");
  if (el) el.textContent = label;

  const judul = document.getElementById("labelJudulPengeluaran");
  if (judul) judul.textContent = `Total Pengeluaran Periode`;
}


function filterDanTampilkan() {
  const filter = document.getElementById("pilihPeriode").value;
  let data = [];
  let start, end;

  if (filter === "semua") {
    data = semuaData;
    if (data.length > 0) {
      const awal = new Date(data[0].Tanggal);
      const akhir = new Date(data[data.length - 1].Tanggal);
      tampilkanPeriode(awal, akhir);
    } else {
      tampilkanPeriode(new Date(), new Date());
    }
  } else {
    start = new Date(filter + "-18T00:00:00");
    end = new Date(start.getFullYear(), start.getMonth() + 1, 17, 23, 59, 59);

    console.log("📆 Periode filter:", start.toISOString(), "s.d.", end.toISOString());

    data = semuaData.filter(row => {
      if (!row.Tanggal) return false;

      const d = new Date(row.Tanggal);
      if (isNaN(d)) return false;

      console.log("✅ Cek row valid:", row.Tanggal, "→", d.toISOString());
      return d >= start && d <= end;
    });


    tampilkanPeriode(start, end);
  }

  console.log("✅ Jumlah data hasil filter:", data.length);

  tampilkanTotalPengeluaran(data);
  tampilkanRekapTotalPerItem(data);
}



function tampilkanTotalPengeluaran(data) {
  const total = data.reduce((sum, row) => sum + Number(row.Debet || 0), 0);
  const el = document.getElementById("totalPengeluaran");
  if (el) el.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

function tampilkanSaldoKas(data) {
  if (!data || data.length === 0) return;
  const lastValid = [...data].reverse().find(row => {
    const val = row.Saldo;
    return val !== undefined && val !== null && val.toString().trim() !== "";
  });
  if (!lastValid) return;
  const cleaned = lastValid.Saldo.toString().replace(/\./g, "");
  const saldo = Number(cleaned);
  const el = document.getElementById("saldoKas");
  if (el) el.textContent = `Rp ${saldo.toLocaleString("id-ID")}`;
}

function tampilkanRekapTotalPerItem(data) {
  const list = document.getElementById("rekapPembelian");
  const rekap = {};

  data.forEach(row => {
    const nama = row.Uraian || "(Tanpa nama)";
    const debet = Number(row.Debet || 0);
    rekap[nama] = (rekap[nama] || 0) + debet;
  });

  let hasil = Object.entries(rekap);
  if (urutAbjad) {
    hasil.sort((a, b) => a[0].localeCompare(b[0]));
  } else {
    hasil.sort((a, b) => b[1] - a[1]);
  }

  list.innerHTML = '';
  hasil.slice(0, 10).forEach(([nama, total]) => {
    const li = document.createElement("li");
    li.textContent = `${nama} - Rp ${total.toLocaleString("id-ID")}`;
    list.appendChild(li);
  });
}

function toggleUrutan() {
  urutAbjad = !urutAbjad;
  filterDanTampilkan();
}

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  document.getElementById("pilihPeriode").addEventListener("change", filterDanTampilkan);
  document.getElementById("tombolUrut").addEventListener("click", toggleUrutan);
});
