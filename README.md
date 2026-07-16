# Farikhi Football Universe v4.1.0 — Career Universe

Game manajer sepak bola PWA offline-first buatan Muhamad Fauzan Al Farikhi. Versi v4 mengubah fondasi game dari sekadar skuad + pertandingan menjadi simulasi karier mingguan yang saling terhubung: taktik memengaruhi match engine, latihan memengaruhi perkembangan dan cedera, fasilitas memengaruhi akademi serta pemulihan, sementara media, ruang ganti, direksi, dan transfer ikut menentukan nasib manajer.

## Cara menjalankan

### Windows
1. Ekstrak ZIP ke folder biasa.
2. Klik `start-server.bat`.
3. Buka `http://localhost:8080` di Chrome atau Edge.
4. Untuk memasang sebagai aplikasi, buka menu browser lalu pilih **Install app / Pasang aplikasi**.

### macOS / Linux
1. Buka Terminal di folder game.
2. Jalankan `chmod +x start-server.sh && ./start-server.sh`.
3. Buka `http://localhost:8080`.

Jangan membuka `index.html` langsung lewat `file://`. Service worker, cache offline, dan beberapa fitur browser memang memerlukan server lokal. Browser punya aturan sendiri, sebab manusia rupanya belum cukup punya birokrasi.

## Update besar v4.1.0

### Match Engine Taktis v2
- Peluang dihitung dari kualitas XI, fitness, morale, cohesion, atribut posisi, dan instruksi taktik.
- Event lebih lengkap: build-up, counter, shot, save kiper, block, corner, offside, foul, kartu, cedera, dan pergantian otomatis.
- Statistik pertandingan: possession, shots, shots on target, xG, passing, tackle, corner, kartu, serta rating pemain.
- Hasil laga memperbarui penampilan, gol, assist, rating, form, fitness, moral, dan statistik lanjutan pemain.
- Animasi 3D mendapat event khusus untuk save, tackle, counter, tembakan, dan selebrasi gol.

### Taktik Lengkap
- Enam formasi awal dan penyusunan XI interaktif.
- Mentality, tempo, passing, pressing, defensive line, width, marking, build-up, set-piece focus.
- Counter-press, counterattack, dan time wasting.
- Preview dampak taktik terhadap serangan, kontrol, pertahanan, risiko stamina, dan risiko ruang belakang.

### Training & Medical
- Fokus latihan tim, intensitas, recovery, dan fokus individu.
- Perkembangan atribut berdasarkan umur, potential, performa latihan, fasilitas, serta staf.
- Risiko cedera dipengaruhi intensitas, recovery, fitness, dan medical centre.
- Daftar cedera, masa pemulihan, serta pengurangan performa ketika pemain belum bugar.

### Akademi & Regen
- Akademi berisi pemain muda Indonesia yang dihasilkan secara prosedural.
- Youth intake, promosi ke tim utama, pelepasan pemain, posisi, atribut, overall, potential, dan perkembangan usia muda.
- Kualitas intake dipengaruhi level akademi, scouting network, dan staf youth development.

### Ruang Ganti
- Hierarki pemain, role skuad, morale, happiness, personality, dan status janji kontrak.
- Team talk dapat meningkatkan atau menurunkan suasana ruang ganti.
- Pemain bereaksi terhadap menit bermain, hasil pertandingan, latihan, serta keputusan manajer.

### Media & Direksi
- Konferensi pers dengan respons berbeda yang memengaruhi morale, fans, reputasi, dan tekanan direksi.
- Board confidence, target musim, dukungan suporter, dan penilaian mingguan.
- Karier manajer: reputasi, pengalaman, coaching badge, riwayat, dan tawaran pekerjaan.

### Transfer & Kontrak v2
- Biaya transfer, cicilan, signing bonus, agent fee, release clause, sell-on clause, durasi kontrak.
- Role skuad dan janji kontrak.
- Kewajiban cicilan transfer diproses pada pekan berikutnya.
- Wajah pemain dan agen dimuat saat layar negosiasi dibuka, lalu dicache agar startup tetap ringan.

### Klub, Staf, dan Fasilitas
- Training ground, youth academy, medical centre, scouting network, stadium, dan commercial department.
- Upgrade fasilitas memiliki biaya, level, dan efek langsung terhadap simulasi.
- Staf kepelatihan, medis, scouting, analisis, dan akademi dengan atribut serta pengembangan kursus.

### Kompetisi & Analytics
- BRI Super League aktif penuh.
- Premier League dan La Liga berjalan sebagai dunia simulasi pendukung.
- Piala Indonesia dengan struktur knockout.
- Dashboard analytics: form tim, performa skuad, xG, passing, duel, tackle, kontribusi gol, dan grafik perkembangan.

### Editor Admin
- Tambah, edit, pindah klub, dan hapus pemain.
- Edit biodata, atribut, overall, potential, role, trait, kontrak, nilai pasar, gaji, fitness, morale, form, serta statistik.
- Tetap tersedia saat save berjalan karena akses game memang pribadi, bukan lembaga antikorupsi.

## Database

- 712 pemain.
- 65 klub.
- Liga aktif memiliki skuad minimum untuk simulasi pertandingan.
- Tidak ada ID pemain atau nama pemain yang terduplikasi pada seed v4.
- M. Fauzan A.F: Real Madrid, CF/LW/RW/ST, nomor 7, usia 16, OVR 70, POT 99.

Nama klub dan pemain dipakai sebagai seed permainan pribadi. Sebagian atribut, harga, gaji, statistik awal, dan detail agen merupakan estimasi untuk balancing game dan dapat diedit melalui Admin.

## Save dan migrasi

- Save v3 dimigrasikan otomatis ketika dibuka di v4.
- Lima slot save manual dan autosave lokal.
- Ekspor serta impor save JSON.
- Sistem baru seperti fasilitas, akademi, media, staf, dan karier manajer akan dibuat otomatis pada save lama.
- Sebelum mengganti folder versi lama, ekspor save JSON sebagai cadangan. Kepercayaan itu indah, backup lebih berguna.

## Rekomendasi performa

- HP entry-level: mode 2D atau 3D Low, 20–30 FPS, kamera Broadcast.
- HP kelas menengah: 3D Medium, 30 FPS.
- HP kuat/laptop: 3D High, 45 FPS.
- Tutup aplikasi berat lain jika match 3D patah-patah.
- Gunakan 2D untuk simulasi panjang. Seluruh logika pertandingan tetap sama, hanya render-nya yang lebih ringan.

## Struktur file penting

- `data.js` — seed klub, pemain, dan klasemen.
- `app.js` — aplikasi utama, save, transfer, editor, dan match engine.
- `career-v4.js` — modul karier v4: training, academy, locker room, media, facilities, manager, analytics.
- `match3d.js` — renderer pertandingan 3D low-poly.
- `styles.css` — tampilan responsif desktop dan mobile.
- `sw.js` — cache PWA dan dukungan offline.


## Hotfix v4.1.0
- Paket Vercel sekarang flat di root, bukan folder bersarang.
- `vercel.json` disertakan.
- Cache service worker memakai network-first untuk JS/CSS agar update tidak nyangkut di v3.
- Tombol Install PWA, ikon PNG 192/512, maskable icon, dan dukungan iOS ditambahkan.
- Menu mobile memiliki tombol Semua Menu.
- Dashboard menampilkan seluruh modul Career Universe agar fitur tidak tersembunyi.
