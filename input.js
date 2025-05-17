// input.js – Versi tanpa CORS error (pakai FormData + no-cors)

const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbzGmHEdMVkuBERtWNorwo33ylLJrnHjfh29_MhFHEMSmu1BL9HnEcRdRBU_N8AugL4/exec';

document.getElementById("formTransaksi").addEventListener("submit", async function (e) {
  e.preventDefault();

  const jenis = document.getElementById("jenisTransaksi").value;
  const tanggal = document.getElementById("tanggal").value;
  const uraian = document.getElementById("uraian").value;
  const jumlah = document.getElementById("jumlah").value;
  const keterangan = document.getElementById("keterangan").value;

  if (!tanggal || !uraian || !jumlah) {
    alert("Tanggal, Uraian, dan Jumlah wajib diisi.");
    return;
  }

  const formData = new FormData();
  formData.append("Tanggal", tanggal);
  formData.append("Uraian", uraian);
  formData.append("Debet", jenis === "pengeluaran" ? jumlah : "");
  formData.append("Kredit", jenis === "penerimaan" ? jumlah : "");
  formData.append("Keterangan", keterangan);

  try {
    await fetch(SHEET_API_URL, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    document.getElementById("formTransaksi").reset();
    const notif = document.getElementById("notif");
    notif.classList.remove("hidden");
    setTimeout(() => notif.classList.add("hidden"), 3000);
  } catch (err) {
    console.error("❌ Error simpan:", err);
    alert("Gagal mengirim data.");
  }
});
