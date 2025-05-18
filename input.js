const SHEET_API_URL = '/api/proxy';

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

  const data = {
    Tanggal: tanggal,
    Uraian: uraian,
    Debet: jenis === "pengeluaran" ? jumlah : "",
    Kredit: jenis === "penerimaan" ? jumlah : "",
    Keterangan: keterangan
  };

  try {
    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const hasil = await res.json();
    console.log("✅ Respons:", hasil);

    if (hasil.result === "success") {
      document.getElementById("formTransaksi").reset();
      const notif = document.getElementById("notif");
      notif.classList.remove("hidden");
      setTimeout(() => notif.classList.add("hidden"), 3000);
    } else {
      alert("Gagal simpan: " + hasil.result);
    }

  } catch (err) {
    console.error("❌ Error simpan:", err);
    alert("Gagal mengirim data.");
  }
});
