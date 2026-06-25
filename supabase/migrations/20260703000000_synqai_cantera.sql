-- SynqAI Sports — cantera: equipos y jugadores ampliados

create table if not exists public.synq_teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  category text not null,
  sport text not null default 'football' check (sport in ('football', 'futsal')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists synq_teams_club_id_idx on public.synq_teams (club_id);

alter table public.synq_teams enable row level security;

alter table public.synq_players
  add column if not exists team_id uuid references public.synq_teams (id) on delete set null,
  add column if not exists jersey_number int,
  add column if not exists position text,
  add column if not exists birth_year int;

create index if not exists synq_players_team_id_idx on public.synq_players (team_id);

create policy synq_teams_select_staff
  on public.synq_teams
  for select
  to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_teams_write_staff
  on public.synq_teams
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
