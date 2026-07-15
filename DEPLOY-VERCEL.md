# Deploy Farikhi Football Universe v3 ke Vercel

## Cara paling gampang lewat dashboard
1. Ekstrak ZIP.
2. Upload folder ini ke repository GitHub baru.
3. Buka Vercel, pilih **Add New > Project**.
4. Import repository tadi.
5. Framework Preset: **Other**.
6. Build Command dan Output Directory akan terbaca dari `vercel.json`.
7. Klik **Deploy**.

## Lewat terminal
Pastikan Node.js sudah terpasang, lalu jalankan dari folder proyek:

```bash
npm install -g vercel
vercel
```

Untuk production:

```bash
vercel --prod
```

## Tes build sebelum deploy

```bash
npm run build
```

Hasil static build berada di folder `dist/`.
