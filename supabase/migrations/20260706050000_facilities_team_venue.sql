-- Instalaciones del club y datos de entreno/partidos por equipo.

create table if not exists public.synq_facilities (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  surface_type text,
  division_mode text not null default 'full' check (
    division_mode in ('full', 'halves_2', 'quarters_4')
  ),
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists synq_facilities_club_id_idx on public.synq_facilities (club_id);

alter table public.synq_facilities enable row level security;

create policy synq_facilities_select_staff
  on public.synq_facilities
  for select
  to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_facilities_write_staff
  on public.synq_facilities
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

alter table public.synq_teams
  add column if not exists team_purpose text not null default 'competition' check (
    team_purpose in ('competition', 'formation')
  ),
  add column if not exists training_facility_id uuid references public.synq_facilities (id) on delete set null,
  add column if not exists training_division text check (
    training_division is null
    or training_division in (
      'full',
      'half_1',
      'half_2',
      'quarter_1',
      'quarter_2',
      'quarter_3',
      'quarter_4'
    )
  ),
  add column if not exists training_days text,
  add column if not exists training_start time,
  add column if not exists training_end time,
  add column if not exists match_venue_type text not null default 'own' check (
    match_venue_type in ('own', 'external')
  ),
  add column if not exists match_own_single_venue boolean not null default true,
  add column if not exists match_home_mode text,
  add column if not exists match_away_mode text,
  add column if not exists external_venue_name text,
  add column if not exists external_venue_address text;

create index if not exists synq_teams_training_facility_id_idx
  on public.synq_teams (training_facility_id)
  where training_facility_id is not null;
