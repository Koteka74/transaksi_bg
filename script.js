// Ganti dengan URL Web App Anda
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbwbterqrFS_0xFZEZA2tG99IJR8MwtbxQxAq13N6gtisF14kPrwm4g1CgTxdNEXZL4/exec';

// Format tanggal ke dd/mm/yyyy
function formatTanggalIndo(tgl) {
  const d = new Date(tgl);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Ambil dan tampilkan data pembelian
async function fetchDataPembelian() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    const data = json.data || [];

    tampilkanData(data);
  } catch (err) {
    console.error('Gagal mengambil data:', err);
  }
}

// Tampilkan data ke tabel
function tampilkanData(data) {
  const tbody = document.getElementById('dataTable');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center">Tidak ada data.</td></tr>';
    return;
  }

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="p-2">${row.Tanggal}</td>
      <td class="p-2">${row.Uraian}</td>
      <td class="p-2 text-right">Rp ${Number(row.Debet || 0).toLocaleString('id-ID')}</td>
      <td class="p-2 text-right">Rp ${Number(row.Kredit || 0).toLocaleString('id-ID')}</td>
      <td class="p-2 text-right">Rp ${Number(row.Saldo || 0).toLocaleString('id-ID')}</td>
      <td class="p-2">${row.Keterangan || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Tombol filter
document.getElementById('filterBtn')?.addEventListener('click', async () => {
  const tanggal = document.getElementById('filterTanggal').value;
  const start = document.getElementById('startDate').value;
  const end = document.getElementById('endDate').value;

  const res = await fetch(SHEET_API_URL);
  const json = await res.json();
  let data = json.data || [];

  // Filter tanggal
  if (tanggal) {
    data = data.filter(row => row.Tanggal === formatTanggalIndo(tanggal));
  }

  // Filter rentang tanggal
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    data = data.filter(row => {
      const d = row.Tanggal.split('/'); // dd/mm/yyyy
      const tgl = new Date(`${d[2]}-${d[1]}-${d[0]}`);
      return tgl >= startDate && tgl <= endDate;
    });
  }

  tampilkanData(data);
});

// Load awal
if (location.pathname.includes('data.html')) {
  fetchDataPembelian();
}
