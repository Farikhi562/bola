# Farikhi Football Universe v7.0

Update utama:

- Eredivisie 2025/26: 18 klub, 34 laga, zona Eropa, play-off, dan degradasi.
- Eerste Divisie / Keuken Kampioen Divisie: 20 klub, 38 laga, dua tiket promosi langsung, play-off, dan larangan promosi tim Jong.
- Promosi-degradasi Belanda berjalan otomatis saat pergantian musim.
- Database pemain Belanda diperluas dengan pemain nyata terkurasi dan regen sebagai pelengkap.
- Lebih dari 50 tim nasional dengan FIFA ranking dinamis, filter wilayah, pencarian negara, roster, pelatih, bendera, dan visual.
- Halaman Board & Karier: target pemilik, kepercayaan board, evaluasi bulanan, kontrak manajer, kontrak pemain, role skuad, dan negosiasi gaji.
- Dashboard baru dengan next match, posisi, keuangan, performa, quick actions, inbox, dan status board.
- UI/UX baru untuk desktop dan HP.
- Hamburger menu HP menampilkan seluruh halaman game.
- PWA install prompt di Android serta panduan Add to Home Screen di iPhone/iPad.
- Ikon PWA 192px dan 512px, offline cache v7, serta build statis siap Vercel.
- Save v6 dimigrasikan otomatis ke v7.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik `OPEN-GAME.bat`.
3. Browser membuka `http://localhost:8080`.
4. Aktifkan internet lalu tekan **Sinkron Visual** untuk memuat logo dan wajah yang tersedia.

## Install di HP

Cara terbaik adalah deploy ke Vercel lalu buka URL HTTPS di Chrome/Safari.

- Android: tekan tombol **Install** yang muncul di game.
- iPhone/iPad: Safari → Share → Add to Home Screen.

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```
