# Deploy Farikhi Football Universe v10 ke Vercel

## Cara cepat

```bash
npm run build
npx vercel --prod
```

Output statis berada di folder `dist`.

## Lewat GitHub

```bash
git add .
git commit -m "update FFU v10"
git push origin main
```

Hubungkan repository ke Vercel. Build Command: `npm run build`. Output Directory: `dist`.

## Cloud save

Cloud save tidak membutuhkan environment variable Vercel. Project URL dan anon key Supabase dimasukkan oleh pemain melalui halaman **Save & Data** dan disimpan lokal di perangkat. Jalankan `SUPABASE-CLOUD-SAVE.sql` pada proyek Supabase terlebih dahulu.
