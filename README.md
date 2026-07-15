# Farikhi Football Universe v8.0

Versi siap main dengan piramida liga yang lebih besar, promosi-degradasi lintas divisi, pertandingan 2D, statistik semusim, scouting, board, kontrak, staf, tim nasional, editor, dan PWA.

## Liga aktif

- Indonesia: Liga 1 dan Liga 2
- Inggris: Premier League dan EFL Championship
- Spanyol: La Liga dan LaLiga Hypermotion
- Italia: Serie A dan Serie B
- Jerman: Bundesliga dan 2. Bundesliga
- Prancis: Ligue 1 dan Ligue 2
- Belanda: Eredivisie dan Eerste Divisie
- Belgia: Jupiler Pro League dan Challenger Pro League

Promosi-degradasi antar tingkat berjalan saat pergantian musim. Liga Belgia memakai transisi jumlah peserta dari struktur awal 2025/26 sebelum menjadi 18 klub di divisi utama dan 15 klub di divisi kedua pada musim berikutnya.

## Isi v8

- 307 klub awal dan lebih dari 3.900 pemain.
- Struktur klub dan liga memakai snapshot 2025/26 yang dapat diedit.
- Pemain pelengkap generatif diberi label fiksi, bukan diklaim sebagai pemain nyata.
- Saat memilih klub dari liga baru, skuad otomatis dilengkapi minimal 18 pemain agar langsung dapat dimainkan.
- Jadwal penuh, klasemen, statistik klub/pemain, top skor, rating, xG, assist, kartu, clean sheet, dan riwayat laga.
- Match Centre teks dan animasi 2D dengan 22 pemain.
- Taktik, latihan, scouting, transfer, kontrak, staf, keuangan, board, tim nasional, editor database, save/import/export.
- Hamburger drawer lengkap dan install PWA di HP.
- Migrasi save versi lama dilakukan otomatis. Untuk pengalaman paling bersih, save baru tetap direkomendasikan.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik `OPEN-GAME.bat`.
3. Browser membuka `http://localhost:8080`.
4. Pilih liga dan klub, lalu tekan **Mulai Karier**.
5. Aktifkan internet dan tekan **Sinkron Visual** bila ingin memuat logo/foto yang tersedia.

Jangan membuka `index.html` melalui `file://` untuk permainan utama. Browser dapat memblokir penyimpanan, service worker, dan request visual.

## Install di HP

Deploy proyek ke Vercel, lalu buka URL HTTPS dari HP.

- Android: tekan tombol **Install FFU** di game atau menu Chrome → Install app.
- iPhone/iPad: Safari → Share → Add to Home Screen.

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```

Output statis berada di folder `dist`.
