-- SynqAI Sports — portal club (fase 2): founding, staff, códigos, RLS

-- Ampliar synq_clubs
alter table public.synq_clubs
  add column if not exists country_code text not null default 'ES',
  add column if not exists locale_default text not null default 'es',
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists cover_url text,
  add column if not exists logo_url text,
  add column if not exists founding_until timestamptz,
  add column if not exists is_founding boolean not null default false,
  add column if not exists timezone text not null default 'Europe/Madrid',
  add column if not exists invite_code text unique;

create index if not exists synq_clubs_invite_code_idx on public.synq_clubs (invite_code);

-- Solicitudes founding (formulario web público)
create table if not exists public.synq_founding_leads (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  contact_name text not null,
  contact_email text not null,
  country_code text not null default 'ES',
  players_count int not null check (players_count > 0),
  sites_count int not null default 1 check (sites_count > 0),
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.synq_founding_leads enable row level security;

-- Staff del club vinculado a auth.users
create table if not exists public.synq_staff (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin' check (
    role in ('president', 'sport_director', 'methodology', 'coordinator', 'treasurer', 'coach', 'admin')
  ),
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create index if not exists synq_staff_user_id_idx on public.synq_staff (user_id);
create index if not exists synq_staff_club_id_idx on public.synq_staff (club_id);

alter table public.synq_staff enable row level security;

-- Helper: club_id del usuario autenticado
create or replace function public.synq_user_club_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id from public.synq_staff where user_id = auth.uid();
$$;

-- RLS synq_founding_leads: insert público, lectura solo service role (sin policy SELECT para anon/authenticated)
create policy synq_founding_leads_insert_anon
  on public.synq_founding_leads
  for insert
  to anon, authenticated
  with check (true);

-- RLS synq_clubs
create policy synq_clubs_select_staff
  on public.synq_clubs
  for select
  to authenticated
  using (id in (select public.synq_user_club_ids()));

create policy synq_clubs_update_staff
  on public.synq_clubs
  for update
  to authenticated
  using (id in (select public.synq_user_club_ids()))
  with check (id in (select public.synq_user_club_ids()));

-- RLS synq_players
create policy synq_players_select_staff
  on public.synq_players
  for select
  to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_players_write_staff
  on public.synq_players
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

-- RLS synq_staff
create policy synq_staff_select_own
  on public.synq_staff
  for select
  to authenticated
  using (user_id = auth.uid());

-- Generar código de invitación (8 chars alfanuméricos)
create or replace function public.synq_generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;
