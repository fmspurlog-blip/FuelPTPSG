# Fuel Management System — PT Prima Sarana Gemilang

Versi dashboard web yang siap dipublikasikan melalui GitHub Pages (HTTPS).

## Fitur
- Logo PRIMA
- KPI Fuel Issued, Average/Day, Active Unit, Average L/HM
- Over Consumption dan Efficient berdasarkan liter
- Fuel Stock: FS01-FS06 dan FTRL44G004/FTRL44G005
- Daily Fuel Consumption berbentuk bar chart + label liter
- Shift Mix Day/Night: total liter + persentase
- Produksi vs General Support: liter + persentase
- Consumption by Category
- Fuel Truck Distribution
- Consumption Status
- Top 5 Consumer / Over / Efficient
- Recent Fuel Transaction
- Filter tanggal, shift, category, fuel truck, unit
- Upload Excel
- Export data filter ke CSV
- Responsive untuk desktop/tablet

## Publish ke HTTPS dengan GitHub Pages
1. Login ke GitHub.
2. Buat repository baru, contoh: `FuelPTPSG`.
3. Upload semua isi folder ini ke root repository.
4. Buka `Settings` → `Pages`.
5. Source: `Deploy from a branch`.
6. Branch: `main`, folder: `/ (root)`.
7. Klik Save.
8. Tunggu proses deployment selesai.
9. URL akan berbentuk:
   `https://USERNAME.github.io/FuelPTPSG/`

GitHub Pages otomatis menggunakan HTTPS.

## File utama
- index.html
- style.css
- app.js
- assets/prima-logo.png
- data/fuel_data.js
- data/stock_data.js

## Catatan data stock
Snapshot stock bawaan dashboard menggunakan tanggal operasional terakhir yang tersedia pada periode Fuel Usage (27 Juni 2026).
Saat database stock berikutnya sudah dibersihkan, `stock_data.js` dapat dibuat dinamis seperti Fuel Usage.


## VERSION 3 — DYNAMIC FUEL STOCK

Panel **2. FUEL STOCK** sekarang tidak lagi memakai satu angka statis.

Sumber data:
- STOCK HARIAN FT BY SONDING
- STOCK HARIAN FS BY SONDING
- Fuel Receipt
- Tera FTRL44G004
- Tera FTRL44G005
- Tera 50KL

Logic snapshot:
1. Untuk setiap tanggal dan asset, pembacaan `AKHIR SHIFT` diprioritaskan.
2. Jika tidak ada `AKHIR SHIFT`, dipilih pembacaan dengan waktu paling akhir.
3. Saat filter `Sampai Tanggal` berubah, dashboard mengambil snapshot stock paling akhir yang tersedia **pada atau sebelum tanggal tersebut**.
4. Total Fuel Stock = FS01+FS02+FS03+FS04+FS05+FS06+FTRL44G004+FTRL44G005.

Folder `clean_database` berisi database hasil normalisasi CSV yang dapat dibuka di Excel.


## VERSION 4 — FUEL CONTROL & RECONCILIATION

Dashboard sekarang menghitung rekonsiliasi harian:

`Opening Stock + Fuel Receipt - Fuel Issued = Book Closing Stock`

Kemudian dibandingkan dengan:

`Physical Closing Stock = sounding akhir / snapshot fisik`

Variance:
`Physical Closing - Book Closing`

Status awal:
- BALANCE: absolute variance <= 0,25%
- WATCH: > 0,25% sampai 0,50%
- INVESTIGATE: > 0,50%

Panel baru:
- Fuel Receipt
- Book Closing Stock
- Physical Closing Stock
- Stock Variance Liter
- Stock Variance %
- Reconciliation Status
- Grafik Book Stock vs Physical Stock
- Daily Reconciliation Summary

File audit:
`clean_database/Fuel_Reconciliation_Daily.csv`


## VERSION 5 — MULTI-SECTION DASHBOARD

Sidebar sekarang benar-benar berfungsi sebagai navigasi satu aplikasi:
- Dashboard
- Fuel Usage
- Fuel Stock
- Fuel Receipt
- Fuel Truck
- Efficiency
- Reports
- Data Quality
- Master Data

Semua section mengikuti filter global periode, shift, category, fuel truck, dan search unit.
Versi ini tetap berupa static web app sehingga kompatibel dengan GitHub Pages HTTPS tanpa server.
