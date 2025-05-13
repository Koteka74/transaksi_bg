// data.js

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbznoZQwrC2j2OwjtGD5vophK88Ceeb9yUS_ud8drZFxd62Na1-sIzCgRGaczq-7ntA/exec?token=RAHASIA123'; // ganti dengan URL Web App Anda

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

function tampilkanData(data) {
  const tbody = document.getElementById('tabelData');
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="px-4 py-2">${row.Tanggal}</td>
      <td class="px-4 py-2">${row.Uraian}</td>
      <td class="px-4 py-2 text-right">Rp ${Number(row.Debet || 0).toLocaleString('id-ID')}</td>
      <td class="px-4 py-2 text-right">Rp ${Number(row.Kredit || 0).toLocaleString('id-ID')}</td>
      <td class="px-4 py-2 text-right">Rp ${Number(row.Saldo || 0).toLocaleString('id-ID')}</td>
      <td class="px-4 py-2">${row.Keterangan || ''}</td>
    `;
    tbody.appendChild(tr);
  });
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
  tampilkanData(dataPeriode);
  tampilkanTopPengeluaran(dataPeriode);
}

document.addEventListener('DOMContentLoaded', tampilkanDataPeriodeBerjalan);

async function filterData() {
  const tanggal = document.getElementById('filterTanggal').value;
  const awal = document.getElementById('filterAwal').value;
  const akhir = document.getElementById('filterAkhir').value;

  const semuaData = await fetchData();
  let hasil = semuaData;

  if (tanggal) {
    const tglIndo = formatTanggalIndo(tanggal);
    hasil = hasil.filter(row => row.Tanggal === tglIndo);
  }

  if (awal && akhir) {
    const awalDate = new Date(awal);
    const akhirDate = new Date(akhir);
    hasil = hasil.filter(row => {
      const tgl = parseTanggalIndo(row.Tanggal);
      return tgl >= awalDate && tgl <= akhirDate;
    });
  }

  tampilkanData(hasil);
  tampilkanTopPengeluaran(hasil);
}
