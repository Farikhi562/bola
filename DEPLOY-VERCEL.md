# Deploy Farikhi Football Universe v9 ke Vercel

## Melalui terminal

```bash
npm run build
npx vercel --prod
```

Output build berada di folder `dist` dan `vercel.json` sudah menunjuk ke folder tersebut.

## Melalui GitHub dan dashboard Vercel

1. Commit dan push seluruh folder proyek ke GitHub.
2. Import repository tersebut di Vercel.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

Setelah memakai URL HTTPS Vercel, browser HP dapat menampilkan prompt instalasi PWA. Pada Android gunakan tombol Install FFU atau menu browser. Pada iPhone gunakan Safari → Share → Add to Home Screen.
