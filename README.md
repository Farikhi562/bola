# Farikhi Football Universe v3.0.0

Game manajer sepak bola PWA offline-first buatan Muhamad Fauzan Al Farikhi. Versi ini menambahkan Match Centre 3D low-poly berbasis WebGL, sambil mempertahankan mode 2D ringan sebagai fallback.

## Cara menjalankan

### Windows
1. Ekstrak ZIP.
2. Klik `start-server.bat`.
3. Buka `http://localhost:8080` di Chrome atau Edge.

### macOS / Linux
1. Buka Terminal di folder game.
2. Jalankan `chmod +x start-server.sh && ./start-server.sh`.
3. Buka `http://localhost:8080`.

Jangan membuka `index.html` langsung lewat `file://`, karena service worker dan beberapa fitur PWA memang butuh server lokal. Browser juga punya standar, walau kadang kelakuannya seperti birokrasi.

## Fitur v3.0.0

- Mode pertandingan 3D low-poly WebGL.
- 22 model pemain dengan badan, kaki, tangan, kepala, wajah sederhana, nomor punggung, dan bayangan.
- Lapangan 3D, gawang, tribun, papan iklan, pencahayaan, kabut stadion, dan bola 3D.
- Kamera Broadcast, Pinggir Lapangan, dan Ikuti Bola.
- Highlight tembakan dan gol dengan lintasan bola serta kamera dinamis.
- Pilihan kualitas Low, Medium, dan High.
- Pilihan 20, 30, dan 45 FPS.
- Mode 2D tetap tersedia untuk HP yang lebih lemah.
- Animasi berhenti saat tab tidak aktif dan resolusi render dibatasi sesuai kualitas.
- Database 712 pemain, 65 klub, Liga Indonesia aktif, Inggris dan Spanyol disimulasikan.
- Transfer, negosiasi pemain dan agen, scouting, taktik, statistik, keuangan, editor admin, save/load, ekspor-impor JSON.

## Rekomendasi performa Android

- HP entry-level: 3D Low, 20 atau 30 FPS, Kamera Broadcast.
- HP kelas menengah: 3D Medium, 30 FPS.
- HP kuat: 3D High, 45 FPS.
- Bila perangkat panas atau patah-patah, gunakan mode 2D. Itu bukan kalah, itu namanya tidak membakar chipset demi polygon paha pemain.

## Catatan data

Nama klub dan pemain digunakan sebagai seed permainan pribadi. Beberapa atribut, harga, gaji, dan statistik adalah estimasi untuk kebutuhan balancing dan bisa diedit melalui halaman Admin. Foto pemain dimuat ketika detail atau negosiasi dibuka, lalu dicache agar startup tidak dihajar ratusan request sekaligus.
