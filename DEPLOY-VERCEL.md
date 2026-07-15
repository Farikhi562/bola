# Deploy Farikhi Football Universe v7 ke Vercel

## Melalui terminal

```bash
npm run build
npx vercel --prod
```

Output build berada di folder `dist` dan `vercel.json` sudah menunjuk ke folder tersebut.

## Melalui dashboard Vercel

1. Buat repository GitHub dan unggah seluruh folder proyek.
2. Import repository tersebut di Vercel.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

Setelah memakai URL HTTPS Vercel, browser HP dapat menampilkan prompt install PWA. Pada iPhone, gunakan Safari → Share → Add to Home Screen.
