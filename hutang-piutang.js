document.getElementById("formHP").addEventListener("submit", async function (e) {
  e.preventDefault();

  const jenis = document.getElementById("jenis").value;
  const tanggal = document.getElementById("tanggal").value;
  const uraian = document.getElementById("uraian").value;
  const jumlah = document.getElementById("jumlahHP").value.replace(/\./g, "");

  const data = {
    sheet: "HutangPiutang",
    Tanggal: tanggal,
    Uraian: uraian,
    Hutang: jenis === "hutang" ? jumlah : "",
    Piutang: jenis === "piutang" ? jumlah : ""
  };
  
  try {
    const res = await fetch("/api/kirim-hutangpiutang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const hasil = await res.json();
    if (hasil.result === "success") {
      this.reset();
      muatData();
    } else {
      alert("Gagal simpan: " + hasil.message);
    }
  } catch (err) {
    console.error("❌ Gagal kirim:", err);
  }
});

function formatTanggalLokal(isoDate) {
  const d = new Date(isoDate);
  if (isNaN(d)) return isoDate; // fallback
  return d.toLocaleDateString("id-ID"); // output: dd/mm/yyyy
}

async function muatData() {
  try {
    const res = await fetch("/api/kirim-hutangpiutang");
    const hasil = await res.json();
    const tbody = document.getElementById("tbodyHP");
    
    tbody.innerHTML = "";
    hasil.data.forEach(row => {
      const tr = document.createElement("tr");

      const tdTanggal = document.createElement("td");
      tdTanggal.textContent = formatTanggalLokal(row[0]);
      
      tr.innerHTML = `
        <td class="border p-1">${formatTanggalLokal(row.Tanggal)}</td>
        <td class="border p-1">${row.Uraian}</td>
        <td class="border p-1 text-right">${formatAngka(row.Hutang)}</td>
        <td class="border p-1 text-right">${formatAngka(row.Piutang)}</td>
        <td class="border p-1 text-right">${formatAngka(row.Saldo)}</td>
      `;
      tbody.appendChild(tr);
    });   
  } catch (err) {
    console.error("❌ Gagal ambil data:", err);
  }
}

function formatAngka(nilai) {
  const n = parseFloat(nilai || "0");
  return n ? n.toLocaleString("id-ID") : "";
}

document.addEventListener("DOMContentLoaded", muatData);
