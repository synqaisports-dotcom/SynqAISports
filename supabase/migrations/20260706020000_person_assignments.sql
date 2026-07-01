-- Asignaciones de personas a equipos o categorías (coordinador de etapa, entrenador, delegado…)
-- Base para la ficha de equipo: staff, horarios, jugadores, campos.

create table if not exists public.synq_person_assignments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  person_id uuid not null references public.synq_club_people (id) on delete cascade,
  team_id uuid references public.synq_teams (id) on delete cascade,
  category text,
  assignment_role text not null check (
    assignment_role in (
      'coach',
      'assistant_coach',
      'delegate',
      'physical_trainer',
      'stage_coordinator',
      'goalkeeper_coach'
    )
  ),
  created_at timestamptz not null default now(),
  constraint synq_person_assignments_target_check check (
    team_id is not null or (category is not null and trim(category) <> '')
  )
);

create unique index if not exists synq_person_assignments_team_role_uidx
  on public.synq_person_assignments (person_id, team_id, assignment_role)
  where team_id is not null;

create unique index if not exists synq_person_assignments_category_role_uidx
  on public.synq_person_assignments (person_id, category, assignment_role)
  where team_id is null;

create index if not exists synq_person_assignments_club_id_idx
  on public.synq_person_assignments (club_id);
create index if not exists synq_person_assignments_person_id_idx
  on public.synq_person_assignments (person_id);
create index if not exists synq_person_assignments_team_id_idx
  on public.synq_person_assignments (team_id)
  where team_id is not null;

alter table public.synq_person_assignments enable row level security;

create policy synq_person_assignments_select_staff
  on public.synq_person_assignments
  for select
  to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_person_assignments_write_staff
  on public.synq_person_assignments
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
