-- SynqAI Sports — metodología: ejercicios, microciclos, objetivos, solicitudes

create table if not exists public.synq_exercises (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  title text not null,
  objectives text not null default '',
  duration_min int not null default 15 check (duration_min > 0),
  materials text not null default '',
  drawing_json jsonb not null default '{"strokes":[]}'::jsonb,
  notes text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_exercises_club_id_idx on public.synq_exercises (club_id);

create table if not exists public.synq_category_goals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  category text not null,
  season text not null,
  goals_text text not null default '',
  checklist_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (club_id, category, season)
);

create index if not exists synq_category_goals_club_id_idx on public.synq_category_goals (club_id);

create table if not exists public.synq_microcycles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  team_id uuid references public.synq_teams (id) on delete set null,
  title text not null,
  week_label text not null default '',
  week_start date,
  week_number int,
  created_at timestamptz not null default now()
);

create index if not exists synq_microcycles_club_id_idx on public.synq_microcycles (club_id);

create table if not exists public.synq_microcycle_slots (
  id uuid primary key default gen_random_uuid(),
  microcycle_id uuid not null references public.synq_microcycles (id) on delete cascade,
  slot_type text not null check (slot_type in ('warmup', 'main', 'cooldown')),
  exercise_id uuid references public.synq_exercises (id) on delete set null,
  title text not null default '',
  notes text not null default '',
  order_index int not null default 0,
  session_date date,
  unique (microcycle_id, order_index)
);

create index if not exists synq_microcycle_slots_microcycle_id_idx
  on public.synq_microcycle_slots (microcycle_id);

create table if not exists public.synq_change_requests (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  exercise_id uuid references public.synq_exercises (id) on delete cascade,
  microcycle_slot_id uuid references public.synq_microcycle_slots (id) on delete set null,
  requested_by uuid references auth.users (id) on delete set null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  resolved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.synq_exercises enable row level security;
alter table public.synq_category_goals enable row level security;
alter table public.synq_microcycles enable row level security;
alter table public.synq_microcycle_slots enable row level security;
alter table public.synq_change_requests enable row level security;

-- RLS ejercicios y derivados (staff del club)
create policy synq_exercises_staff
  on public.synq_exercises for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_category_goals_staff
  on public.synq_category_goals for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_microcycles_staff
  on public.synq_microcycles for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_microcycle_slots_staff
  on public.synq_microcycle_slots for all to authenticated
  using (
    microcycle_id in (
      select id from public.synq_microcycles
      where club_id in (select public.synq_user_club_ids())
    )
  )
  with check (
    microcycle_id in (
      select id from public.synq_microcycles
      where club_id in (select public.synq_user_club_ids())
    )
  );

create policy synq_change_requests_select_staff
  on public.synq_change_requests for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_change_requests_insert_staff
  on public.synq_change_requests for insert to authenticated
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_change_requests_update_staff
  on public.synq_change_requests for update to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));
