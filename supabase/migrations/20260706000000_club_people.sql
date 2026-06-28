-- Personas maestras del club (Opción A): una ficha por persona, varios roles posibles.
-- Base para organigrama, staff deportivo y estructura institucional + RBAC futuro.

create table if not exists public.synq_club_people (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  person_kind text not null default 'institutional' check (
    person_kind in ('sport', 'institutional', 'mixed')
  ),
  institutional_role text,
  sport_role text,
  access_profile text check (
    access_profile is null
    or access_profile in (
      'president',
      'sport_director',
      'methodology',
      'coordinator',
      'treasurer',
      'coach',
      'admin',
      'delegate',
      'none'
    )
  ),
  user_id uuid references auth.users (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_club_people_club_id_idx on public.synq_club_people (club_id);
create index if not exists synq_club_people_user_id_idx on public.synq_club_people (user_id)
  where user_id is not null;

-- Enlazar staff de portal con persona maestra (fase 2 RBAC)
alter table public.synq_staff
  add column if not exists person_id uuid references public.synq_club_people (id) on delete set null;

create index if not exists synq_staff_person_id_idx on public.synq_staff (person_id)
  where person_id is not null;

alter table public.synq_club_people enable row level security;

create policy synq_club_people_select_staff
  on public.synq_club_people
  for select
  to authenticated
  using (club_id in (select public.synq_user_club_ids()));

create policy synq_club_people_write_staff
  on public.synq_club_people
  for all
  to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create or replace function public.synq_club_people_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists synq_club_people_updated_at on public.synq_club_people;
create trigger synq_club_people_updated_at
  before update on public.synq_club_people
  for each row
  execute function public.synq_club_people_set_updated_at();
