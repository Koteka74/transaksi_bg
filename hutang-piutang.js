document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formHP");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const tanggal = document.getElementById("tanggalHP").value;
    const uraian = document.getElementById("uraianHP").value;
    const jumlahFormatted = document.getElementById("jumlahHP").value;
    const jenis = document.getElementById("jenisHP").value;

    const jumlah = jumlahFormatted.replace(/\./g, "").replace(/,/g, "");
    if (!tanggal || !uraian || !jumlah) {
      alert("Semua kolom wajib diisi");
      return;
    }

    const data = {
      Tanggal: tanggal,
      Uraian: uraian,
      Hutang: jenis === "hutang" ? jumlah : "",
      Piutang: jenis === "piutang" ? jumlah : "",
      sheet: "HutangPiutang"
    };

    try {
      const res = await fetch("/api/kirim-hutangpiutang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const hasil = await res.json();
      if (hasil.result === "success") {
        document.getElementById("formHP").reset();
        document.getElementById("notifHP").classList.remove("hidden");
        await loadData();
        setTimeout(() => {
          document.getElementById("notifHP").classList.add("hidden");
        }, 3000);
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("❌ Gagal kirim:", err);
      alert("Terjadi kesalahan saat mengirim data.");
    }
  });

  document.getElementById("jumlahHP").addEventListener("input", function () {
    const raw = this.value.replace(/\D/g, "");
    if (raw) {
      try {
        this.value = parseInt(raw).toLocaleString("id-ID");
      } catch (e) {
        this.value = "";
      }
    } else {
      this.value = "";
    }
  });

  loadData();
});

function formatAngka(nilai) {
  if (!nilai || isNaN(nilai)) return "0";
  return parseInt(nilai).toLocaleString("id-ID");
}

async function loadData() {
  try {
    const res = await fetch("/api/kirim-hutangpiutang?sheet=HutangPiutang");
    const json = await res.json();

    const tbody = document.querySelector("#tabelHP tbody");
    tbody.innerHTML = "";

    let totalHutang = 0;
    let totalPiutang = 0;

    json.forEach(row => {
      const tr = document.createElement("tr");
      const tanggal = new Date(row.Tanggal);
      const tdTanggal = isNaN(tanggal) ? row.Tanggal : tanggal.toLocaleDateString("id-ID");

      tr.innerHTML = `
        <td class="border p-1">${tdTanggal}</td>
        <td class="border p-1">${row.Uraian}</td>
        <td class="border p-1 text-right">${formatAngka(row.Hutang)}</td>
        <td class="border p-1 text-right">${formatAngka(row.Piutang)}</td>
        <td class="border p-1 text-right">${formatAngka(row.Saldo)}</td>
      `;
      tbody.appendChild(tr);

      totalHutang += parseInt(row.Hutang || 0);
      totalPiutang += parseInt(row.Piutang || 0);
    });

    // Tambahkan baris total
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td colspan="2" class="border p-1 text-right font-bold">Jumlah</td>
      <td class="border p-1 text-right font-bold text-red-600">${formatAngka(totalHutang)}</td>
      <td class="border p-1 text-right font-bold text-green-600">${formatAngka(totalPiutang)}</td>
      <td class="border p-1"></td>
    `;
    tbody.appendChild(totalRow);

  } catch (err) {
    console.error("❌ Gagal ambil data:", err);
  }
}
