# Farikhi Football Universe v6.0

Update besar v6:

- Liga 2 Indonesia / Pegadaian Championship berisi 20 klub musim 2025/26, dibagi Grup Barat dan Grup Timur.
- Format 27 pertandingan per klub dengan triple round robin di dalam grup.
- Promosi dan degradasi otomatis saat pergantian musim:
  - juara masing-masing grup promosi langsung,
  - runner-up memperebutkan tiket promosi ketiga,
  - juru kunci masing-masing grup turun langsung,
  - peringkat 9 menjalani simulasi play-off degradasi.
- Tiga klub terbawah Liga 1 turun ke Liga 2.
- Kompetisi regional: UEFA Champions League, Europa League, Conference League, AFC Champions League Two, dan ASEAN Club Championship Shopee Cup.
- Logo klub memakai sinkronisasi TheSportsDB dengan fallback Wikipedia.
- Wajah pemain dan pelatih nyata memakai sumber visual publik saat tersedia.
- Staf fiksi memakai avatar generatif dan ditandai jelas agar tidak menyamar sebagai orang nyata.
- Tim nasional memiliki bendera SVG, lambang timnas, foto pelatih, roster, ranking, dan riwayat pertandingan.
- Tetap mendukung save lama v5.2 dan migrasi otomatis.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik `OPEN-GAME.bat`.
3. Browser membuka `http://localhost:8080`.
4. Aktifkan internet lalu tekan **Sinkron Visual** untuk memuat logo/foto.

Bisa membuka `FFU-Standalone.html` langsung, tetapi server lokal lebih stabil untuk visual, PWA, dan penyimpanan.

## Deploy Vercel

```bash
npm run build
vercel --prod
```
