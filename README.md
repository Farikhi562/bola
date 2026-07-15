# Farikhi Football Universe v9.0

Game manajer sepak bola PWA yang bisa dimainkan lokal maupun di-deploy ke Vercel.

## Fitur baru v9

- Transfer Search Advanced: nama, klub, liga, negara, posisi, umur, harga pasar, atribut/skill minimum, kaki dominan, status kontrak, pemain U-21, pemain yang sudah di-scout, shortlist, dan berbagai pilihan urutan.
- Ruang negosiasi transfer animatif dengan empat tahap: proposal, respons klub, pembicaraan agen, dan keputusan akhir.
- Struktur proposal mencakup biaya awal, persentase pembayaran muka, sell-on clause, gaji, durasi kontrak, peran skuad, signing bonus, bonus tampil/gol, dan release clause.
- Ballon d’Or dan penghargaan pemain: pencetak gol terbaik dunia, playmaker, wonderkid, kiper, bek, pemain terbaik liga, dan top skor tiap liga.
- Riwayat gelar dan penghargaan permanen di profil pemain, termasuk liga domestik dan kompetisi regional.
- 10 tim nasional tambahan. Total database timnas v9: 62.
- Save v8 dimigrasikan otomatis ke struktur v9.

## Cara main di Windows

1. Ekstrak ZIP ke folder baru.
2. Jalankan `OPEN-GAME.bat`.
3. Buka alamat lokal yang tampil, biasanya `http://localhost:8080`.
4. Pilih klub dan mulai karier baru. Save lama masih dapat dimigrasikan, tetapi save baru disarankan setelah upgrade besar.

## Deploy Vercel

```bash
npm run build
npx vercel --prod
```

Output build berada di folder `dist`.
