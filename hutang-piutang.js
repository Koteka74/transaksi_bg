// hutang-piutang.js

const SHEET_API_URL = '/api/kirim-hutangpiutang';

// Submit form hutang/piutang
document.getElementById("formHutangPiutang")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Tampilkan loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const submitText = submitBtn.querySelector('#submit-text');
  const spinner = submitBtn.querySelector('#submit-spinner');
  
  submitText.textContent = "Menyimpan...";
  spinner.classList.remove("hidden");

  try {
    const jenis = document.getElementById("jenisHP").value;
    const tanggal = document.getElementById("tanggalHP").value;
    const uraian = document.getElementById("uraianHP").value;
    const jumlahFormatted = document.getElementById("jumlahHP").value;
    const jumlah = jumlahFormatted.replace(/\D/g, "");

    // Validasi
    if (!tanggal || !uraian || !jumlah) {
      throw new Error("Tanggal, Uraian, dan Jumlah wajib diisi.");
    }

    if (!Number.isInteger(Number(jumlah))) {
      throw new Error("Jumlah harus berupa angka bulat.");
    }

    const data = {
      sheet: "HutangPiutang",
      Tanggal: tanggal,
      Uraian: uraian,
      Hutang: jenis === "hutang" ? jumlah : "",
      Piutang: jenis === "piutang" ? jumlah : "",
      Jumlah: jumlah
    };

    const res = await fetch(SHEET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const hasil = await res.json();
    console.log("✅ Respons:", hasil);

    if (!res.ok) {
      throw new Error(hasil.message || "Gagal menyimpan data");
    }

    if (hasil.result === "success" || hasil.result === "SUKSES") {
      document.getElementById("formHutangPiutang").reset();
      showNotification("Data berhasil disimpan!", true);
      await loadDataHutangPiutang();
    } else {
      throw new Error(hasil.message || "Format response tidak valid");
    }
  } catch (err) {
    console.error("❌ Error simpan:", err);
    showNotification(err.message || "Gagal menyimpan data", false);
  } finally {
    // Reset button state
    if (submitText) submitText.textContent = "Simpan";
    if (spinner) spinner.classList.add("hidden");
  }
});

// Menampilkan data dari sheet
async function loadDataHutangPiutang() {
  try {
    const res = await fetch("/api/kirim-hutangpiutang?sheet=HutangPiutang");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const json = await res.json();
    const data = json.data || [];

    const tbody = document.getElementById("tabelHutangPiutang");
    if (!tbody) return; // Pastikan element ada
    
    tbody.innerHTML = "";

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${row.Tanggal || ""}</td>
        <td class="border p-2">${row.Uraian || ""}</td>
        <td class="border p-2 text-right">${row.Hutang ? formatRupiah(row.Hutang) : "-"}</td>
        <td class="border p-2 text-right">${row.Piutang ? formatRupiah(row.Piutang) : "-"}</td>
        <td class="border p-2 text-right">${row.Jumlah ? formatRupiah(row.Jumlah) : "-"}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ Gagal ambil data Hutang Piutang:", err);
    // Tambahkan fallback UI error jika perlu
  }
}

// Format angka ke rupiah
function formatRupiah(nilai) {
  const n = Number(nilai || 0);
  return n > 0 ? "Rp " + n.toLocaleString("id-ID") : "";
}

// Tampilkan notifikasi
function showNotification(message, isSuccess = true) {
  const notif = document.getElementById("notifHP");
  if (notif) {
    notif.textContent = message;
    notif.className = isSuccess 
      ? "fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
      : "fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded";
    notif.classList.remove("hidden");
    setTimeout(() => notif.classList.add("hidden"), 3000);
  } else {
    alert(message);
  }
}

// Format input saat diketik
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

// Sidebar toggle (hamburger)
document.addEventListener("DOMContentLoaded", function () {
  loadDataHutangPiutang();

  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("-translate-x-full");
      overlay.classList.toggle("hidden");
    });

    document.querySelectorAll("#sidebar a").forEach(link => {
      link.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
      });
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
      overlay.classList.add("hidden");
    });
  }
});
