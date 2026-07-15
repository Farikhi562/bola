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

## Environment Variables Supabase

Tambahkan di Vercel Project Settings > Environment Variables:

```env
FFU_SUPABASE_URL=https://PROJECT_REF.supabase.co
FFU_SUPABASE_ANON_KEY=PASTE_SUPABASE_ANON_KEY_DI_SINI
FFU_DEFAULT_CLOUD_SLOT=karier-utama
```

Untuk lokal, salin `.env.example` menjadi `.env.local`, isi nilainya, lalu jalankan `npm run dev` atau `npm run build`.

`FFU_SUPABASE_ANON_KEY` boleh berada di frontend selama Row Level Security Supabase aktif. Jangan pernah memakai `service_role` key.
