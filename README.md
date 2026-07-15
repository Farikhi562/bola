# Farikhi Football Universe v12.1.0

FFU v12 adalah game manajer sepak bola PWA offline-first dengan cinematic matchday, animasi 2D adaptif, klub AI hidup, transfer realistis, kompetisi multi-negara, tim nasional, media, medis, akademi, stadion, bisnis, penghargaan, modding, dan cloud save Supabase opsional.

## Menjalankan di Windows

1. Ekstrak ZIP ke folder baru.
2. Klik `OPEN-GAME.bat`.
3. Buka `http://localhost:8080` bila browser tidak terbuka otomatis.
4. Pilih klub lalu buat save baru untuk hasil paling stabil.

## Mode grafis

- **Auto**: mendeteksi CPU, RAM perangkat dan ukuran layar.
- **Hemat**: efek minimum, label dikurangi, cocok untuk HP lemah.
- **Normal**: intro, cuaca, crowd dan event overlay seimbang.
- **Tinggi**: partikel, crowd, kamera dan efek sinematik penuh.

Pengaturan tersedia pada halaman Pertandingan.

## Install di HP

Deploy ke Vercel, buka URL menggunakan Chrome Android atau Safari iPhone, lalu gunakan tombol **Install FFU**. Android juga dapat memilih menu browser → Install app. iPhone: Share → Add to Home Screen.

## Build dan deploy

```bash
npm run build
npx vercel --prod
```

Konfigurasi Supabase opsional menggunakan `.env.local`:

```env
FFU_SUPABASE_URL=https://PROJECT_REF.supabase.co
FFU_SUPABASE_ANON_KEY=ANON_KEY
FFU_DEFAULT_CLOUD_SLOT=karier-utama
```

Jangan taruh service role key di frontend.


## Skip ke Akhir Musim
Gunakan tombol **Skip Akhir Musim** di header. Game tetap mensimulasikan seluruh sistem mingguan dan membuat autosave setelah proses selesai atau dihentikan.
