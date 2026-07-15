-- Farikhi Football Universe v10 cloud save table
-- Jalankan sekali di Supabase SQL Editor.
create table if not exists public.ffu_saves (
  user_code text not null,
  slot_name text not null default 'karier-utama',
  save_data jsonb not null,
  game_version text not null default '10.0.0',
  updated_at timestamptz not null default now(),
  primary key (user_code, slot_name)
);

alter table public.ffu_saves enable row level security;

-- Mode personal sederhana: akses memakai anon key + kode sinkron pribadi.
-- Siapa pun yang mengetahui kode sinkron dapat membaca slot tersebut.
drop policy if exists "ffu saves anon read" on public.ffu_saves;
create policy "ffu saves anon read" on public.ffu_saves
for select to anon using (true);

drop policy if exists "ffu saves anon insert" on public.ffu_saves;
create policy "ffu saves anon insert" on public.ffu_saves
for insert to anon with check (true);

drop policy if exists "ffu saves anon update" on public.ffu_saves;
create policy "ffu saves anon update" on public.ffu_saves
for update to anon using (true) with check (true);
