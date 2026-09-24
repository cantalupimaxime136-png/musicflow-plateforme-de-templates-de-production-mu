-- Schéma de départ pour ton projet Supabase.
-- À coller dans Supabase > SQL Editor > New query > Run. Rejouable sans risque.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Les visiteurs (clé "anon") peuvent seulement AJOUTER un email ; personne ne peut les lire
-- depuis le site. Consulte-les depuis Supabase > Table Editor.
drop policy if exists "leads: anyone can subscribe" on public.leads;
create policy "leads: anyone can subscribe" on public.leads
  for insert to anon
  with check (true);
