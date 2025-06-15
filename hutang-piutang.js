const SHEET_API_URL = "/api/kirim-hutangpiutang?sheet=HutangPiutang";
const POST_API_URL = "/api/kirim-hutangpiutang";

document.addEventListener("DOMContentLoaded", () => {
  tampilkanDataHutangPiutang();

  const form = document.getElementById("formHP");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const jenis = document.getElementById("jenisTransaksi").value;
      const tanggal = document.getElementById("tanggalHP").value;
      const uraian = document.getElementById("uraianHP").value;
      const jumlahRaw = document.getElementById("jumlahHP").value;
      const jumlah = jumlahRaw.replace(/\./g, "").replace(/,/g, "");

      if (!tanggal || !uraian || !jumlah) {
        alert("Semua field wajib diisi.");
        return;
      }

      const data = {
        Tanggal: tanggal,
        Uraian: uraian,
        Hutang: jenis === "hutang" ? jumlah : "",
        Piutang: jenis === "piutang" ? jumlah : ""
      };

      try {
        const res = await fetch(POST_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const hasil = await res.json();
        console.log("✅ Respons:", hasil);

        if (hasil.result === "success") {
          document.getElementById("formHP").reset();
          tampilkanDataHutangPiutang();
        } else {
          alert("Gagal simpan data.");
        }
      } catch (err) {
        console.error("❌ Gagal kirim:", err);
        alert("Gagal menyimpan data.");
      }
    });
  }
});

async function tampilkanDataHutangPiutang() {
  try {
    const res = await fetch(SHEET_API_URL);
    const json = await res.json();
    const data = json.data || [];

    const tbody = document.getElementById("tbodyHP");
    if (!tbody) return;

    tbody.innerHTML = "";
    data.forEach(row => {
      const tr = buatBarisTabel(row);
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ Gagal ambil data Hutang Piutang:", err);
  }
}

function buatBarisTabel(row) {
  const tr = document.createElement("tr");

  const tgl = new Date(row.Tanggal);
  const tglFormatted = !isNaN(tgl) ? tgl.toLocaleDateString("id-ID") : row.Tanggal;

  tr.innerHTML = `
    <td class="border px-2 py-1">${tglFormatted}</td>
    <td class="border px-2 py-1">${row.Uraian || ""}</td>
    <td class="border px-2 py-1 text-right">${formatRupiah(row.Hutang || "")}</td>
    <td class="border px-2 py-1 text-right">${formatRupiah(row.Piutang || "")}</td>
    <td class="border px-2 py-1 text-right">${formatRupiah(row.Jumlah || "")}</td>
  `;
  return tr;
}

function formatRupiah(angka) {
  const num = Number(angka.toString().replace(/[^\d]/g, ""));
  return isNaN(num) ? "" : num.toLocaleString("id-ID");
}
