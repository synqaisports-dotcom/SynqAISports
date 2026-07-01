-- Planificación por categoría: temporadas, macrociclos, mesociclos y microciclos (JSON)

create table if not exists public.synq_periodization_plans (
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  category_slug text not null,
  plan_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (club_id, category_slug)
);

alter table public.synq_periodization_plans enable row level security;

create policy synq_periodization_plans_staff
  on public.synq_periodization_plans
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
