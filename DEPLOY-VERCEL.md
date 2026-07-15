# Deploy FFU v12 ke Vercel

## CLI

```bash
npm run build
npx vercel --prod
```

## GitHub

```bash
git add .
git commit -m "update FFU v12 cinematic matchday"
git push origin main
```

Hubungkan repository ke Vercel. Output build berada di folder `dist` sesuai `vercel.json`.

## Environment variables opsional

- `FFU_SUPABASE_URL`
- `FFU_SUPABASE_ANON_KEY`
- `FFU_DEFAULT_CLOUD_SLOT`

Tambahkan di Vercel Project → Settings → Environment Variables lalu redeploy. Gunakan anon key, bukan service role key.
