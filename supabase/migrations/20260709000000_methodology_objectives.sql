-- Objetivos formativos por categoría (matriz metodológica editable)

create table if not exists public.synq_methodology_objectives (
  club_id uuid primary key references public.synq_clubs (id) on delete cascade,
  objectives_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.synq_methodology_objectives enable row level security;

create policy synq_methodology_objectives_staff
  on public.synq_methodology_objectives
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
