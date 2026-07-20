-- Reservas de instalaciones, cuentas familiares y rol fisio.

-- Rol fisio en staff
alter table public.synq_staff drop constraint if exists synq_staff_role_check;
alter table public.synq_staff add constraint synq_staff_role_check check (
  role in (
    'president',
    'sport_director',
    'methodology',
    'coordinator',
    'treasurer',
    'coach',
    'physio',
    'admin'
  )
);

-- Configuración de reservas por instalación
alter table public.synq_facilities
  add column if not exists reservation_capacity integer not null default 1,
  add column if not exists slot_duration_minutes integer not null default 60,
  add column if not exists booking_mode text not null default 'instant',
  add column if not exists max_active_reservations_per_player integer not null default 3,
  add column if not exists advance_booking_days integer not null default 14;

alter table public.synq_facilities drop constraint if exists synq_facilities_booking_mode_check;
alter table public.synq_facilities add constraint synq_facilities_booking_mode_check check (
  booking_mode in ('instant', 'approval')
);

update public.synq_facilities
set
  reservation_capacity = 8,
  slot_duration_minutes = 60,
  booking_mode = 'instant'
where facility_kind = 'gym';

update public.synq_facilities
set
  reservation_capacity = 1,
  slot_duration_minutes = 45,
  booking_mode = 'approval'
where facility_kind = 'physiotherapy_room';

-- Cuentas familiares (tutores y jugadores mayores)
create table if not exists public.synq_family_accounts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  display_name text,
  account_type text not null default 'tutor',
  status text not null default 'invited',
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_family_accounts_account_type_check check (account_type in ('tutor', 'player')),
  constraint synq_family_accounts_status_check check (status in ('invited', 'active', 'disabled')),
  constraint synq_family_accounts_club_email_unique unique (club_id, email)
);

create index if not exists synq_family_accounts_user_id_idx
  on public.synq_family_accounts (user_id);

create index if not exists synq_family_accounts_club_id_idx
  on public.synq_family_accounts (club_id);

-- Vínculo cuenta familiar ↔ jugador
create table if not exists public.synq_family_player_links (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  family_account_id uuid not null references public.synq_family_accounts (id) on delete cascade,
  player_id uuid not null references public.synq_players (id) on delete cascade,
  relationship text not null default 'tutor',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint synq_family_player_links_relationship_check check (relationship in ('tutor', 'self')),
  constraint synq_family_player_links_unique unique (family_account_id, player_id)
);

create index if not exists synq_family_player_links_player_id_idx
  on public.synq_family_player_links (player_id);

create index if not exists synq_family_player_links_club_id_idx
  on public.synq_family_player_links (club_id);

-- Reservas de instalaciones
create table if not exists public.synq_facility_reservations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  facility_id uuid not null references public.synq_facilities (id) on delete cascade,
  player_id uuid not null references public.synq_players (id) on delete cascade,
  booked_by_family_account_id uuid references public.synq_family_accounts (id) on delete set null,
  booked_by_staff_user_id uuid references auth.users (id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending',
  booking_source text not null default 'portal',
  notes text,
  reviewed_by_user_id uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_facility_reservations_status_check check (
    status in ('pending', 'confirmed', 'cancelled', 'rejected')
  ),
  constraint synq_facility_reservations_source_check check (
    booking_source in ('portal', 'families_web', 'families_app')
  ),
  constraint synq_facility_reservations_time_check check (end_at > start_at)
);

create index if not exists synq_facility_reservations_facility_start_idx
  on public.synq_facility_reservations (facility_id, start_at);

create index if not exists synq_facility_reservations_club_status_idx
  on public.synq_facility_reservations (club_id, status);

create index if not exists synq_facility_reservations_player_idx
  on public.synq_facility_reservations (player_id);

-- Helpers RLS
create or replace function public.synq_user_family_account_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.synq_family_accounts
  where user_id = auth.uid()
    and status = 'active';
$$;

create or replace function public.synq_user_family_club_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select club_id
  from public.synq_family_accounts
  where user_id = auth.uid()
    and status = 'active';
$$;

create or replace function public.synq_user_linked_player_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select l.player_id
  from public.synq_family_player_links l
  join public.synq_family_accounts a on a.id = l.family_account_id
  where a.user_id = auth.uid()
    and a.status = 'active';
$$;

-- RLS family accounts
alter table public.synq_family_accounts enable row level security;

create policy synq_family_accounts_staff_select on public.synq_family_accounts
  for select using (club_id in (select public.synq_user_club_ids()));

create policy synq_family_accounts_staff_all on public.synq_family_accounts
  for all
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_family_accounts_self_select on public.synq_family_accounts
  for select using (id in (select public.synq_user_family_account_ids()));

create policy synq_family_accounts_self_update on public.synq_family_accounts
  for update
  using (id in (select public.synq_user_family_account_ids()))
  with check (id in (select public.synq_user_family_account_ids()));

-- RLS family player links
alter table public.synq_family_player_links enable row level security;

create policy synq_family_player_links_staff_all on public.synq_family_player_links
  for all
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_family_player_links_self_select on public.synq_family_player_links
  for select using (family_account_id in (select public.synq_user_family_account_ids()));

-- RLS reservations
alter table public.synq_facility_reservations enable row level security;

create policy synq_facility_reservations_staff_all on public.synq_facility_reservations
  for all
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_facility_reservations_family_select on public.synq_facility_reservations
  for select using (
    club_id in (select public.synq_user_family_club_ids())
    and player_id in (select public.synq_user_linked_player_ids())
  );

create policy synq_facility_reservations_family_insert on public.synq_facility_reservations
  for insert
  with check (
    club_id in (select public.synq_user_family_club_ids())
    and player_id in (select public.synq_user_linked_player_ids())
    and booked_by_family_account_id in (select public.synq_user_family_account_ids())
  );

create policy synq_facility_reservations_family_update on public.synq_facility_reservations
  for update
  using (
    club_id in (select public.synq_user_family_club_ids())
    and player_id in (select public.synq_user_linked_player_ids())
  )
  with check (
    club_id in (select public.synq_user_family_club_ids())
    and player_id in (select public.synq_user_linked_player_ids())
  );

alter table public.synq_players
  add column if not exists contact_email text;
