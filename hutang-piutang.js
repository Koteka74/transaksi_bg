/**
 * Hutang-Piutang Manager
 * Kode siap pakai untuk integrasi dengan Google Apps Script
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi
    initApp();
});

function initApp() {
    // Load data saat pertama kali dibuka
    loadData();
    
    // Setup form submission
    const form = document.getElementById('formInput');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveData();
        });
    } else {
        console.error("Form dengan ID 'formInput' tidak ditemukan!");
    }
}

function loadData() {
    // Pastikan google.script.run tersedia
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(displayData)
            .withFailureHandler(showError)
            .ambilData();
    } else {
        console.error("Google script API tidak tersedia. Pastikan diakses melalui Web App Google.");
        // Tampilkan pesan ke pengguna
        alert("Aplikasi ini harus diakses melalui link Web App Google. Jangan buka file HTML langsung.");
    }
}

function saveData() {
    const form = document.getElementById('formInput');
    const data = {
        tanggal: form.tanggal.value,
        uraian: form.uraian.value,
        jenis: form.jenis.value,
        jumlah: form.jumlah.value
    };

    // Validasi input
    if (!data.tanggal || !data.uraian || !data.jumlah) {
        alert("Harap isi semua field yang wajib diisi!");
        return;
    }

    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(function() {
                alert("Data berhasil disimpan!");
                form.reset();
                loadData(); // Refresh data
            })
            .withFailureHandler(showError)
            .simpanData(data);
    }
}

function displayData(dataFromSheet) {
    const tableBody = document.querySelector('#tabelData tbody');
    if (!tableBody) return;

    // Kosongkan tabel
    tableBody.innerHTML = '';

    // Isi dengan data baru
    dataFromSheet.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
        
        tr.innerHTML = `
            <td class="px-4 py-2 border">${formatDate(row[0])}</td>
            <td class="px-4 py-2 border">${row[1] || '-'}</td>
            <td class="px-4 py-2 border text-right">${row[2] ? formatCurrency(row[2]) : '-'}</td>
            <td class="px-4 py-2 border text-right">${row[3] ? formatCurrency(row[3]) : '-'}</td>
            <td class="px-4 py-2 border text-right font-medium">${formatCurrency(row[4])}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatCurrency(amount) {
    return 'Rp ' + parseFloat(amount).toLocaleString('id-ID');
}

function showError(error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan: " + error.message);
}