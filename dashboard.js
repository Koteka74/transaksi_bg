const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxo7859kAtaphc9ddgacR4aCZRk-dOeYWi-NYJx6nksBtnRLq_g5_5J0_7R3jthQk8/exec';

let semuaData = [];
let opsData = [];
let urutAbjad = false;

async function fetchData() {
  try {
    const [res1, res2] = await Promise.all([
      fetch(SHEET_API_URL + '?sheet=BahanBaku(HPP)'),
      fetch(SHEET_API_URL + '?sheet=Ops')
    ]);
    const json1 = await res1.json();
    const json2 = await res2.json();

    console.log("✅ Data bahan berhasil:", json1.data);
    console.log("✅ Data operasional berhasil:", json2.data);
    semuaData = json1.data || [];
    opsData = json2.data || [];

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
  let data = [], start, end;

  if (filter === "semua") {
    data = semuaData;
    if (data.length > 0) {
      start = new Date(data[0].Tanggal);
      end = new Date(data[data.length - 1].Tanggal);
      tampilkanPeriode(start, end);
    } else {
      start = end = new Date();
      tampilkanPeriode(start, end);
    }
  } else {
    start = new Date(filter + "-18T00:00:00");
    end = new Date(start.getFullYear(), start.getMonth() + 1, 17, 23, 59, 59);
    data = semuaData.filter(row => {
      if (!row.Tanggal) return false;
      const d = new Date(row.Tanggal);
      if (isNaN(d)) return false;
      return d >= start && d <= end;
    });
    tampilkanPeriode(start, end);
  }

  tampilkanTotalPengeluaran(data);
  tampilkanRekapTotalPerItem(data);
  tampilkanOperasional(opsData, start, end);
}

function tampilkanTotalPengeluaran(data) {
  const total = data.reduce((sum, row) => sum + Number(row.Debet || 0), 0);
  const el = document.getElementById("totalPengeluaran");
  if (el) el.textContent = `Rp ${total.toLocaleString("id-ID")}`;
}

function tampilkanSaldoKas(data) {
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

function tampilkanOperasional(data, awal, akhir) {
  const dataPeriode = data.filter(item => {
    const tgl = new Date(item.Tanggal);
    return tgl >= awal && tgl <= akhir;
  });

  let totalOperasional = 0;
  let totalGaji = 0;
  let totalPrive = 0;
  let totalCicilanKredit = 0;

  dataPeriode.forEach(row => {
    const kategori = (row.Kategori || "").toLowerCase().replace(/[^a-z]/g, "");
    const nilai = parseFloat(row.Debet || 0);
    if (kategori.includes("biayaoperasional")) totalOperasional += nilai;
    else if (kategori.includes("biayagaji")) totalGaji += nilai;
    else if (kategori.includes("prive")) totalPrive += nilai;
    else if (kategori.includes("cicilankredit")) totalCicilanKredit += nilai;
  });

  const saldoAkhir = (() => {
    const angkaValid = dataPeriode.map(d => parseFloat(d.Saldo || 0)).filter(s => !isNaN(s));
    return angkaValid.length ? angkaValid[angkaValid.length - 1] : 0;
  })();

  document.getElementById("totalOperasional").textContent = `Rp ${totalOperasional.toLocaleString("id-ID")}`;
  document.getElementById("totalGaji").textContent = `Rp ${totalGaji.toLocaleString("id-ID")}`;
  document.getElementById("totalPrive").textContent = `Rp ${totalPrive.toLocaleString("id-ID")}`;
  document.getElementById("totalCicilanKredit").textContent = `Rp ${totalCicilanKredit.toLocaleString("id-ID")}`;
  document.getElementById("sisaKas").textContent = `Rp ${saldoAkhir.toLocaleString("id-ID")}`;
}


function toggleUrutan() {
  urutAbjad = !urutAbjad;
  filterDanTampilkan();
}

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  document.getElementById("pilihPeriode").addEventListener("change", filterDanTampilkan);
  document.getElementById("tombolUrut").addEventListener("click", toggleUrutan);

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
