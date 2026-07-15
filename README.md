# Farikhi Football Universe v1.0.0

Game manajer sepak bola berbasis PWA, dapat dimainkan lokal dan offline setelah cache pertama.

## Menjalankan

### Cara paling gampang
1. Ekstrak ZIP.
2. Jalankan `start-windows.bat` di Windows atau `./start-linux.sh` di Linux/macOS.
3. Buka alamat yang ditampilkan, biasanya `http://localhost:8080`.

### Alternatif Python
```bash
python -m http.server 8080
```
Lalu buka `http://localhost:8080`.

> Jangan membuka `index.html` langsung melalui `file://` bila ingin service worker/PWA bekerja. Browser memang suka aturan kecil yang bikin manusia emosi.

## Fitur versi 1.0
- PWA mobile-first, tema gelap, offline cache.
- Musim 2025/2026.
- Liga 1 aktif dengan 18 klub, jadwal dua putaran, klasemen, simulasi mingguan.
- Premier League dan La Liga disimulasikan ringan.
- Database pemain editable, termasuk pemain top terkurasi dan M. Fauzan A.F di Real Madrid.
- Atribut 1-100, stamina, form, moral, cedera, perkembangan dan penurunan usia.
- Skuad, detail statistik dan atribut.
- Taktik 4-3-3 dengan drag-and-drop pergantian pemain.
- Match centre komentar teks, pause, kecepatan, xG, tembakan, penguasaan, efek suara.
- Transfer beli/jual, kontrak dan gaji.
- Scouting untuk membuka overall dan potensi.
- Staf spesialis lengkap dengan rating bintang dan biaya kontrak.
- Keuangan klub berdasarkan reputasi, sponsor, suporter dan stadion.
- Admin CRUD pemain, klub, dan staf.
- 10 slot save manual, autosave, ekspor/impor JSON.

## Catatan database
Database awal adalah MVP terkurasi dan generatif agar game tetap ringan serta bebas dependency. Bukan salinan penuh database komersial. Semua nama, atribut, klub, foto URL, saldo, staf, dan nilai bisa diubah melalui Admin Database.

Logo/foto internet memakai kolom URL yang dapat diisi lewat editor. Placeholder otomatis dipakai bila URL kosong atau gagal dimuat, sehingga game tidak rusak saat offline.
