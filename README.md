# Farikhi Football Universe v5.2

Perbaikan utama v5.2:

- Memperbaiki layar dashboard kosong akibat ukuran save v5.1 melebihi kuota `localStorage` browser.
- Save sekarang dipadatkan secara otomatis dan save lama v5.1 dimigrasikan.
- Jika penyimpanan penuh, game membersihkan key lama dan tetap menjalankan UI.
- Ada layar error boot dan tombol reset, jadi kegagalan tidak lagi menghasilkan halaman hitam kosong.
- Sinkronisasi logo klub dan wajah pemain nyata tetap tersedia melalui internet.
- Bendera negara menggunakan SVG dari FlagCDN dan memiliki fallback teks.

## Cara paling aman di Windows

1. Ekstrak ZIP ke folder baru.
2. Jalankan `start-windows.bat`.
3. Browser akan membuka `http://localhost:8080`.
4. Tunggu database selesai dimuat.

Bisa juga membuka `FFU-Standalone.html` langsung. Namun server lokal lebih stabil untuk PWA, cache, gambar, dan save.

Jika masih ada masalah dari save lama, buka `RESET-GAME.html` satu kali.

## Vercel

```bash
npm run build
vercel --prod
```
