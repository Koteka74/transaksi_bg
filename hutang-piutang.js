// hutang-piutang.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formHP");
  const notif = document.getElementById("notif");
  const tabel = document.getElementById("tabelHP");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const jenis = document.getElementById("jenis").value;
    const tanggal = document.getElementById("tanggal").value;
    const uraian = document.getElementById("uraian").value;
    const jumlah = document.getElementById("jumlah").value.replace(/\./g, "");

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    
    if (!tanggal || !uraian || !jumlah) {
      alert("Isi semua data");
      return;
    }

    try {
      const res = await fetch("/api/kirim-hutangpiutang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Tanggal: tanggal, Uraian: uraian, Jenis: jenis, Jumlah: jumlah }),
      });

      const json = await res.json();
      console.log("✅ Simpan:", json);

      if (json.result === "success") {
        form.reset();
        notif.classList.remove("hidden");
        setTimeout(() => notif.classList.add("hidden"), 3000);
        loadData();
      } else {
        alert("Gagal simpan");
      }
    } catch (err) {
      console.error("❌ Error simpan:", err);
      alert("Gagal mengirim data.");
    } finally {
      submitBtn.classList.remove('loading');
    }
  });

  async function loadData() {
    try {
      const res = await fetch("/api/proxy?sheet=HutangPiutang");
      const json = await res.json();
      const data = json.data || [];

      tabel.innerHTML = "";
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="p-2 border">${row.Tanggal}</td>
          <td class="p-2 border">${row.Uraian}</td>
          <td class="p-2 border text-right">${row.Hutang || ""}</td>
          <td class="p-2 border text-right">${row.Piutang || ""}</td>
          <td class="p-2 border text-right">${row.Saldo || ""}</td>
        `;
        tabel.appendChild(tr);
      });
    } catch (err) {
      console.error("❌ Gagal load data:", err);
    }
  }

  loadData();
});
