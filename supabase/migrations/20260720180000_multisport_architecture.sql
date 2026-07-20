-- Arquitectura multideporte: membresías jugador-equipo, sport en metodología y equipos ampliados.
-- Ver docs/MULTISPORT_ARQUITECTURA.md

-- 1. Membresías jugador ↔ equipo (dorsal/posición por deporte/equipo)
create table if not exists public.synq_player_team_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  player_id uuid not null references public.synq_players (id) on delete cascade,
  team_id uuid not null references public.synq_teams (id) on delete cascade,
  sport text not null default 'football',
  jersey_number integer,
  position text,
  is_primary boolean not null default false,
  active boolean not null default true,
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_player_team_memberships_player_team_unique unique (player_id, team_id),
  constraint synq_player_team_memberships_sport_check check (
    sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
  )
);

create index if not exists synq_player_team_memberships_player_idx
  on public.synq_player_team_memberships (player_id);

create index if not exists synq_player_team_memberships_team_idx
  on public.synq_player_team_memberships (team_id);

create index if not exists synq_player_team_memberships_club_idx
  on public.synq_player_team_memberships (club_id);

-- Backfill desde jugadores con equipo actual
insert into public.synq_player_team_memberships (
  club_id,
  player_id,
  team_id,
  sport,
  jersey_number,
  position,
  is_primary,
  active
)
select
  p.club_id,
  p.id,
  p.team_id,
  coalesce(t.sport, 'football'),
  p.jersey_number,
  p.position,
  true,
  p.active
from public.synq_players p
join public.synq_teams t on t.id = p.team_id
where p.team_id is not null
on conflict (player_id, team_id) do nothing;

-- 2. Ampliar deportes en equipos
alter table public.synq_teams drop constraint if exists synq_teams_sport_check;
alter table public.synq_teams add constraint synq_teams_sport_check check (
  sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
);

-- 3. Sport en ejercicios
alter table public.synq_exercises
  add column if not exists sport text not null default 'football';

alter table public.synq_exercises drop constraint if exists synq_exercises_sport_check;
alter table public.synq_exercises add constraint synq_exercises_sport_check check (
  sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
);

create index if not exists synq_exercises_club_sport_idx
  on public.synq_exercises (club_id, sport);

-- 4. Sport en microciclos
alter table public.synq_microcycles
  add column if not exists sport text;

update public.synq_microcycles m
set sport = coalesce(t.sport, 'football')
from public.synq_teams t
where m.team_id = t.id
  and m.sport is null;

update public.synq_microcycles
set sport = 'football'
where sport is null;

alter table public.synq_microcycles
  alter column sport set default 'football';

alter table public.synq_microcycles
  alter column sport set not null;

alter table public.synq_microcycles drop constraint if exists synq_microcycles_sport_check;
alter table public.synq_microcycles add constraint synq_microcycles_sport_check check (
  sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
);

-- 5. Objetivos por deporte (PK compuesta)
alter table public.synq_methodology_objectives
  add column if not exists sport text not null default 'football';

alter table public.synq_methodology_objectives drop constraint if exists synq_methodology_objectives_pkey;
alter table public.synq_methodology_objectives drop constraint if exists synq_methodology_objectives_sport_check;
alter table public.synq_methodology_objectives add constraint synq_methodology_objectives_sport_check check (
  sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
);
alter table public.synq_methodology_objectives add primary key (club_id, sport);

-- 6. Periodización por deporte
alter table public.synq_periodization_plans
  add column if not exists sport text not null default 'football';

alter table public.synq_periodization_plans drop constraint if exists synq_periodization_plans_pkey;
alter table public.synq_periodization_plans drop constraint if exists synq_periodization_plans_sport_check;
alter table public.synq_periodization_plans add constraint synq_periodization_plans_sport_check check (
  sport in ('football', 'futsal', 'basketball', 'volleyball', 'handball', 'waterpolo')
);
alter table public.synq_periodization_plans add primary key (club_id, sport, category_slug);

-- 7. RLS membresías
alter table public.synq_player_team_memberships enable row level security;

create policy synq_player_team_memberships_staff_all on public.synq_player_team_memberships
  for all
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
