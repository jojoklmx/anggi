# Sistem Stok & Kasir 3 Toko (Perabot Plastik)

Aplikasi Web Manajemen Stok dan Kasir POS untuk 3 Cabang Toko Perabot Plastik & Kebutuhan Rumah Tangga. Dirancang khusus agar sangat ringan dan kompatibel penuh dengan **Safari iOS 9 (iPad Mini 1 & 2)**, serta siap di-deploy ke **Vercel** dan di-push ke **GitHub**.

---

## Fitur Utama

1. **Multi Toko (3 Toko)**:
   - Toko 1 (Pusat)
   - Toko 2 (Cabang Pasar)
   - Toko 3 (Cabang Ruko)
2. **Kategori & Kode Prefix Otomatis**:
   - `EMB` / `BSK`: Ember & Baskom
   - `KRS` / `MJA`: Kursi & Meja
   - `LMR` / `LCI`: Lemari & Laci
   - `KTK` / `BOX`: Kontainer & Box
   - `RAK` / `KRJ`: Rak & Keranjang
   - `BTL` / `TRM`: Botol & Termos
   - `DPR`: Peralatan Dapur
   - `KBR` / `SPU`: Alat Kebersihan
   - `PRT`: Kebutuhan Keluarga
3. **Kasir POS & Struk**:
   - Pilihan Toko Aktif (Toko 1 / Toko 2 / Toko 3).
   - Mode Harga Eceran & Grosir.
   - Perhitungan kembalian dan cetak struk nota belanja.
   - Pengurangan stok otomatis per toko.
4. **Kompatibilitas Penuh iOS 9 iPad Mini**:
   - Ditulis murni dalam vanilla ES5 JavaScript (tanpa dependensi framework berat).
   - Mendukung HTML5 Offline Application Cache (`app.appcache`).
   - Ukuran tombol ramah layar sentuh (touch-target 44px+).
5. **Vercel & Cloud Ready**:
   - File static otomatis dilayani oleh CDN Vercel.
   - Endpoint API serverless di `/api/*`.
   - Opsional: Sinkronisasi database cloud via Firebase Realtime Database atau langsung ke repositori GitHub via `GITHUB_TOKEN`.

---

## Cara Menjalankan di Komputer Lokal

1. **Jalankan Server**:
   - Klik ganda `JALANKAN_SERVER.bat`, atau
   - Buka terminal dan ketik:
     ```bash
     npm start
     ```
2. **Buka di Browser PC**:
   - Akses: `http://localhost:3000`
3. **Buka di iPad Mini (iOS 9)**:
   - Pastikan iPad Mini terhubung ke jaringan Wi-Fi yang sama dengan PC/Laptop.
   - Buka Safari di iPad Mini, ketik IP yang muncul di layar terminal (misal: `http://192.168.1.10:3000`).
   - Tekan tombol **Share** di Safari -> pilih **"Add to Home Screen"** agar ikon kasir muncul di layar utama iPad.

---

## Cara Upload ke GitHub dan Deploy ke Vercel

### Langkah 1: Push ke GitHub
```bash
git add .
git commit -m "Siap deploy ke Vercel dan GitHub: Sistem Stok 3 Toko iPad Mini"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

### Langkah 2: Deploy di Vercel (1-Click)
1. Buka dashboard [vercel.com](https://vercel.com).
2. Klik tombol **"Add New..."** -> **"Project"**.
3. Pilih repository GitHub Anda, lalu klik **"Import"**.
4. Di bagian **Framework Preset**, biarkan **"Other"**.
5. Klik **"Deploy"**.
6. Proyek Anda langsung aktif di domain `https://nama-proyek.vercel.app`!

---

## Struktur Folder

```
├── api/                   # Vercel Serverless Functions
│   ├── index.js           # Core API handler
│   ├── state.js           # GET /api/state
│   ├── sale.js            # POST /api/sale (Kasir)
│   ├── stock-in.js        # POST /api/stock-in (Barang Masuk)
│   ├── stock-move.js      # POST /api/stock-move (Mutasi / Koreksi)
│   ├── product-delete.js  # POST /api/product-delete
│   ├── settings.js        # POST /api/settings
│   ├── sync.js            # POST /api/sync
│   └── [...all].js        # Catch-all API fallback
├── data/
│   └── database.json      # Database awal produk & riwayat
├── public/                # Static files
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── app.appcache
├── index.html             # Root static entry
├── style.css
├── app.js
├── app.appcache
├── JALANKAN_SERVER.bat    # Launcher Windows
├── package.json
├── server.js              # Server lokal Node.js
└── vercel.json            # Konfigurasi Vercel (rewrites & headers)
```
