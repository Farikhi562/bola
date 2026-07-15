# Farikhi Football Universe v3.0

Game manajer sepak bola PWA/offline buatan Muhamad Fauzan Al Farikhi.

## Mulai cepat
- Tanpa instalasi: buka `FFU-Standalone.html` di Chrome atau Edge.
- Mode PWA lokal Windows: jalankan `start-windows.bat`, lalu buka `http://localhost:8080`.
- Mode development Node: jalankan `npm run dev`.

## Fitur v3
- Wajib memilih klub sebelum karier dimulai.
- Enam liga aktif: Liga 1, Premier League, La Liga, Serie A, Bundesliga, dan Ligue 1.
- 114 klub liga dengan ekonomi, reputasi, stadion, dan budget berbeda.
- Database pemain nyata terkurasi musim 2025/26, ditambah pemain akademi/regens yang ditandai sebagai fiksi.
- 16 tim nasional dengan roster nyata terkurasi dan simulasi pertandingan internasional.
- Editor penuh untuk menambah, mengedit, dan menghapus pemain, klub, staf, serta timnas fiksi.
- Klub fiksi otomatis memperoleh skuad dan jadwal liga dibangun ulang.
- Taktik lanjutan: 6 formasi, mentalitas, tempo, pressing, garis pertahanan, build-up, gaya passing, transisi, fokus serangan, bola mati, dan role pemain.
- Staf spesialis memiliki penjelasan fungsi, atribut, tugas mingguan, workload, laporan, gaji, dan efek gameplay.
- Scouting, transfer, kontrak, latihan, keuangan, sponsor, pertandingan teks live, save/load, ekspor/impor JSON, dan PWA offline.
- Siap deploy ke Vercel melalui `vercel.json` dan build statis ke `dist/`.

## Catatan database
Data pemain merupakan snapshot terkurasi untuk pengalaman game, bukan feed lisensi komersial atau database live. Transfer dan skuad dunia nyata dapat berubah. Semua data dapat diperbarui dari halaman Admin Database.

## Deploy
Baca `DEPLOY-VERCEL.md`.
