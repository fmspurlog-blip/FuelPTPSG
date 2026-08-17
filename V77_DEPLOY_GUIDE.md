# Fuel Management System V77 — Permanent Database Deployment

V77 memakai **Google Apps Script Web App + Google Spreadsheet** sebagai database pusat. Dashboard GitHub Pages tetap menjadi tampilan utama, tetapi semua PC/HP akan membaca dataset terbaru dari database pusat.

## 1. Buat Apps Script
1. Buka https://script.google.com/ dan buat project baru.
2. Hapus isi `Code.gs` bawaan.
3. Copy seluruh isi file repository `backend/Code.gs` ke `Code.gs` project Apps Script.
4. Save project dengan nama `Fuel Management System V77 Database`.

## 2. Buat database Spreadsheet
1. Dari dropdown function, pilih `setupDatabase`.
2. Klik **Run**.
3. Izinkan permission Google yang diminta.
4. Buka **Execution log**. Sistem akan menampilkan Database ID dan URL Spreadsheet.
5. Spreadsheet akan memiliki sheet: `Meta`, `Usage`, `Receipts`, `Stock`, `Recon`.

## 3. Deploy sebagai Web App
1. Klik **Deploy > New deployment**.
2. Pilih **Web app**.
3. Description: `Fuel Management System V77 API`.
4. Execute as: **Me / User deploying**.
5. Who has access: **Anyone** (atau opsi anonymous/public yang tersedia pada akun Anda), karena dashboard GitHub Pages harus dapat melakukan GET tanpa login.
6. Klik **Deploy**.
7. Copy URL yang berakhir `/exec`.

## 4. Hubungkan dashboard
Edit file `v77-config.js` di repository dan isi:

```js
window.FUEL_V77 = Object.assign({
  apiUrl: 'PASTE_URL_APPS_SCRIPT_EXEC_DI_SINI',
  pollMs: 60000,
  requestTimeoutMs: 20000
}, window.FUEL_V77 || {});
```

Setelah commit, tunggu GitHub Pages melakukan publish.

## 5. Test
1. Buka dashboard dengan `?v=77.0#dashboard`.
2. Header harus menampilkan status CLOUD.
3. Upload Excel terbaru memakai password upload yang sudah ada.
4. Setelah local upload berhasil, akan muncul pesan kedua: `V77 DATABASE PERMANENT berhasil disinkronkan`.
5. Buka dashboard dari HP atau PC lain. Dalam maksimal ±60 detik, data terbaru harus tampil otomatis.
6. Refresh/CTRL+F5 tidak boleh mengembalikan dataset lama karena remote database menjadi authoritative source.

## Arsitektur
- GitHub Pages: UI/dashboard.
- Google Apps Script: API read/write.
- Google Spreadsheet: persistent central database.
- Upload Excel: replace dataset pusat (bukan append dataset lama).
- PC/HP lain: auto-pull database setiap 60 detik dan saat halaman kembali aktif.
- Write API dilindungi password hash yang sama dengan proteksi Upload dashboard.

## Catatan keamanan
Akses baca dibuat publik agar dashboard bisa dibuka dari PC/HP tanpa login Google. Akses tulis tetap divalidasi password pada backend. Jangan mengubah hash password backend tanpa mengubah proteksi upload dashboard secara bersamaan.
