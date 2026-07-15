# Farikhi Football Universe v10.0

Game manajer sepak bola PWA yang bisa dimainkan lokal, dipasang di HP, dan di-deploy ke Vercel.

## Fitur baru v10

- **Ruang Ganti Dinamis:** kepribadian, hierarki, kelompok sosial, hubungan dengan manajer, kebahagiaan, masalah, meeting tim, percakapan pribadi, janji menit bermain, dan pemilihan kapten.
- **Akademi 2.0:** tim U-18/U-21, youth intake, laga akademi mingguan, perkembangan pemain, fasilitas, coaching, jaringan rekrutmen, laporan prospek, promosi, dan pelepasan pemain.
- **Karier Manajer:** lisensi kepelatihan, XP, level, reputasi, statistik karier, riwayat klub, kursus lisensi, tawaran pekerjaan, dan pindah klub.
- **Match Engine AI:** cuaca, kondisi lapangan, tactical familiarity, analisis asisten pada menit penting, serta substitusi otomatis berdasarkan stamina, posisi, dan rating.
- **Cloud Save Opsional:** upload/download save lintas perangkat memakai Supabase. Konfigurasi dilakukan dari halaman Save & Data.
- Semua fitur v9 tetap ada: 16 liga, piramida divisi, transfer advanced, animasi negosiasi, Ballon d’Or, trofi pemain, 62 timnas, match 2D, scouting, staf, editor, dan PWA.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik `OPEN-GAME.bat`.
3. Buka `http://localhost:8080` bila browser tidak terbuka otomatis.
4. Pilih klub dan mulai save baru. Save v9 dimigrasikan otomatis, tetapi save baru paling aman setelah upgrade besar.

## Install di HP

Deploy ke Vercel, buka URL HTTPS melalui Chrome/Safari, lalu tekan **Install FFU** atau **Add to Home Screen**.

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```

## Cloud save Supabase

1. Buat proyek Supabase.
2. Jalankan `SUPABASE-CLOUD-SAVE.sql` di SQL Editor.
3. Buka FFU → Save & Data.
4. Isi Project URL, anon key, kode sinkron pribadi, dan nama slot.
5. Tekan Upload Save atau Download Save.

Kode sinkron bertindak sebagai rahasia slot. Mode ini dibuat untuk penggunaan personal, bukan layanan publik multi-user.
