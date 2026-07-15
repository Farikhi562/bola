# Farikhi Football Universe v11.0

Game manajer sepak bola PWA yang bisa dimainkan lokal, diinstal di HP, atau dideploy ke Vercel.

## Fitur utama v11

- Dunia klub: profil klub, pelatih, pemain, form, riwayat pertandingan, aktivitas transfer, stadion, keuangan, dan trophy cabinet.
- Klub AI lebih hidup: kebutuhan posisi, strategi rekrutmen, transfer mingguan, tawaran masuk ke klub pengguna, pergantian pelatih, dan deadline day.
- Transfer lanjutan: filter pemain lengkap, negosiasi, pinjaman, opsi beli, FFP, shortlist, scouting, dan profil klub langsung dari pasar transfer.
- Medical Centre: diagnosis, risiko cedera, program rehabilitasi, risiko kambuh, dan riwayat medis.
- Media & Fans: konferensi pers, sentimen suporter, media rating, social feed, dan popularitas pemain.
- Stadion & bisnis: upgrade fasilitas, harga tiket, sponsor, naming rights, museum, megastore, serta proyek pembangunan.
- Match preparation: analisis lawan, set-piece plan, marking, team talk, dan readiness.
- Animasi 2D ringan: 22 pemain, bola, shot trail, goal flash, crowd pulse, kartu, replay highlight, serta mode Hemat/Normal/Sinematik.
- Career Lab: create-a-club, challenge mode, mode direktur olahraga, pekerjaan timnas, mod/database pack, achievement, dan pemain pensiun menjadi staf.
- Akademi, ruang ganti, karier manajer, penghargaan, timnas, kompetisi regional, promosi-degradasi, cloud save, dan editor database tetap tersedia.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik dua kali `OPEN-GAME.bat`.
3. Browser akan membuka `http://localhost:8080`.
4. Jangan tutup jendela terminal selama bermain.

Kalau Python tidak terpasang, file batch akan membuka `FFU-Standalone.html`.

## Instal di HP

Cara terbaik adalah deploy ke Vercel, lalu buka URL-nya di Chrome Android atau Safari iPhone. Gunakan tombol **Install PWA** di game atau menu **Add to Home Screen**.

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```

Output build berada di folder `dist/`.

## Save lama

Save v10 dicoba dimigrasikan otomatis. Karena struktur AI klub, medis, media, fasilitas, dan pinjaman berubah, save baru tetap paling aman.

## Catatan data visual

Logo, foto pemain, foto pelatih, dan bendera menggunakan sinkronisasi sumber publik dengan fallback lokal. Ketersediaan gambar bergantung pada koneksi dan data sumber. Pemain atau staf fiksi memakai avatar fallback.

## Konfigurasi Supabase lewat .env

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `FFU_SUPABASE_URL` dan `FFU_SUPABASE_ANON_KEY` dari Supabase Project Settings > API.
3. Jalankan `SUPABASE-CLOUD-SAVE.sql` sekali melalui Supabase SQL Editor.
4. Jalankan `npm run dev` untuk lokal atau deploy ke Vercel.
5. Kode sinkron pribadi tetap diisi dari menu **Save & Data** dalam game dan tidak dimasukkan ke `.env`, karena semua nilai frontend dapat dilihat pengguna browser.
