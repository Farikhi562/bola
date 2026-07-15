# Deploy Farikhi Football Universe v11 ke Vercel

## Melalui GitHub

1. Ekstrak seluruh isi ZIP ke repository.
2. Jalankan:

```bash
git add .
git commit -m "update FFU v11"
git push origin main
```

3. Hubungkan repository ke Vercel.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy.

## Melalui Vercel CLI

```bash
npm run build
npx vercel --prod
```

Tidak ada environment variable wajib untuk mode lokal. Supabase hanya diperlukan untuk cloud save opsional.
