-- Módulo Torneos SynqAI: multisport, grupos + finales paralelas (Platinum/Silver/...),
-- equipos invitados, mesa móvil, ticketing QR, dossiers y signage por torneo.

-- ---------------------------------------------------------------------------
-- Torneo principal
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournaments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.synq_clubs (id) on delete cascade,
  tenant_type text not null default 'club' check (tenant_type in ('club', 'standalone', 'api_external')),
  name text not null,
  slug text not null,
  sport_key text not null default 'football',
  status text not null default 'draft' check (
    status in (
      'draft',
      'inviting',
      'registration_open',
      'registration_closed',
      'in_progress',
      'finished',
      'cancelled'
    )
  ),
  starts_at timestamptz,
  ends_at timestamptz,
  description text,
  rules_text text,
  cover_image_url text,
  venue_name text,
  venue_map_url text,
  venue_images_json jsonb not null default '[]'::jsonb,
  format_json jsonb not null default '{}'::jsonb,
  registration_config_json jsonb not null default '{}'::jsonb,
  ticketing_config_json jsonb not null default '{}'::jsonb,
  revenue_estimates_json jsonb not null default '{}'::jsonb,
  public_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_tournaments_slug_unique unique (slug)
);

create index if not exists synq_tournaments_club_id_idx on public.synq_tournaments (club_id);
create index if not exists synq_tournaments_slug_idx on public.synq_tournaments (slug);
create index if not exists synq_tournaments_status_idx on public.synq_tournaments (status);

-- ---------------------------------------------------------------------------
-- Categorías del torneo (Sub-10, Sub-12, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_categories (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  name text not null,
  sport_key text,
  groups_count integer not null default 4 check (groups_count between 1 and 16),
  teams_per_group integer not null default 4 check (teams_per_group between 2 and 8),
  format_type text not null default 'groups_multifinal' check (
    format_type in ('groups_multifinal', 'league', 'knockout', 'groups_knockout')
  ),
  placement_brackets_json jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_categories_tournament_id_idx
  on public.synq_tournament_categories (tournament_id);

-- ---------------------------------------------------------------------------
-- Campos / sedes del torneo
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_fields (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  facility_id uuid references public.synq_facilities (id) on delete set null,
  label text not null,
  map_url text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_fields_tournament_id_idx
  on public.synq_tournament_fields (tournament_id);

-- ---------------------------------------------------------------------------
-- Patrocinadores del torneo (scoped al evento)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_sponsors (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  name text not null,
  logo_url text,
  tier text not null default 'silver' check (tier in ('gold', 'silver', 'bronze')),
  url text,
  notes text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_sponsors_tournament_id_idx
  on public.synq_tournament_sponsors (tournament_id);

-- ---------------------------------------------------------------------------
-- Equipos invitados / inscritos
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  category_id uuid not null references public.synq_tournament_categories (id) on delete cascade,
  club_team_id uuid references public.synq_teams (id) on delete set null,
  name text not null,
  external_club_name text,
  contact_name text,
  contact_email text,
  contact_phone text,
  logo_url text,
  status text not null default 'invited' check (
    status in ('invited', 'confirmed', 'rejected', 'withdrawn')
  ),
  invite_token text unique,
  group_code text,
  group_position integer check (group_position is null or group_position between 1 and 8),
  squad_json jsonb not null default '[]'::jsonb,
  confirmed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_teams_tournament_id_idx
  on public.synq_tournament_teams (tournament_id);
create index if not exists synq_tournament_teams_category_id_idx
  on public.synq_tournament_teams (category_id);
create index if not exists synq_tournament_teams_invite_token_idx
  on public.synq_tournament_teams (invite_token)
  where invite_token is not null;

-- ---------------------------------------------------------------------------
-- Fases (grupos, platinum, silver, bronze, consolación…)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_phases (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  category_id uuid not null references public.synq_tournament_categories (id) on delete cascade,
  phase_type text not null check (
    phase_type in ('group', 'placement_bracket', 'semifinal', 'final', 'consolation', 'third_place')
  ),
  bracket_key text not null,
  name text not null,
  group_position_source integer check (group_position_source is null or group_position_source between 1 and 8),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_tournament_phases_bracket_unique unique (tournament_id, category_id, bracket_key)
);

create index if not exists synq_tournament_phases_tournament_id_idx
  on public.synq_tournament_phases (tournament_id);

-- ---------------------------------------------------------------------------
-- Grupos (fase de grupos)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_groups (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.synq_tournament_phases (id) on delete cascade,
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  category_id uuid not null references public.synq_tournament_categories (id) on delete cascade,
  code text not null,
  name text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint synq_tournament_groups_code_unique unique (tournament_id, category_id, code)
);

create index if not exists synq_tournament_groups_phase_id_idx on public.synq_tournament_groups (phase_id);

-- ---------------------------------------------------------------------------
-- Partidos
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  category_id uuid not null references public.synq_tournament_categories (id) on delete cascade,
  phase_id uuid references public.synq_tournament_phases (id) on delete set null,
  group_id uuid references public.synq_tournament_groups (id) on delete set null,
  bracket_key text,
  round_key text not null default 'group' check (
    round_key in ('group', 'r16', 'qf', 'sf', 'final', 'third_place', 'consolation_final')
  ),
  match_number integer not null default 1,
  home_team_id uuid references public.synq_tournament_teams (id) on delete set null,
  away_team_id uuid references public.synq_tournament_teams (id) on delete set null,
  field_id uuid references public.synq_tournament_fields (id) on delete set null,
  scheduled_at timestamptz,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'live', 'halftime', 'finished', 'cancelled', 'walkover')
  ),
  score_home integer not null default 0 check (score_home >= 0),
  score_away integer not null default 0 check (score_away >= 0),
  score_penalties_home integer check (score_penalties_home is null or score_penalties_home >= 0),
  score_penalties_away integer check (score_penalties_away is null or score_penalties_away >= 0),
  went_to_penalties boolean not null default false,
  mesa_token text unique,
  mesa_token_expires_at timestamptz,
  live_started_at timestamptz,
  live_finished_at timestamptz,
  events_json jsonb not null default '[]'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_matches_tournament_id_idx
  on public.synq_tournament_matches (tournament_id);
create index if not exists synq_tournament_matches_category_id_idx
  on public.synq_tournament_matches (category_id);
create index if not exists synq_tournament_matches_scheduled_at_idx
  on public.synq_tournament_matches (scheduled_at);
create index if not exists synq_tournament_matches_mesa_token_idx
  on public.synq_tournament_matches (mesa_token)
  where mesa_token is not null;

-- ---------------------------------------------------------------------------
-- Dossiers (invitación / oficial)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_dossiers (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  dossier_type text not null check (dossier_type in ('invitation', 'official')),
  version integer not null default 1,
  pdf_url text,
  content_json jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists synq_tournament_dossiers_tournament_id_idx
  on public.synq_tournament_dossiers (tournament_id);

-- ---------------------------------------------------------------------------
-- Tipos de entrada / pase
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_ticket_types (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  name text not null,
  description text,
  ticket_scope text not null default 'day' check (ticket_scope in ('match', 'day', 'tournament')),
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'EUR',
  valid_for_date date,
  match_id uuid references public.synq_tournament_matches (id) on delete set null,
  max_quantity integer check (max_quantity is null or max_quantity > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_ticket_types_tournament_id_idx
  on public.synq_tournament_ticket_types (tournament_id);

-- ---------------------------------------------------------------------------
-- Entradas emitidas (QR)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_tickets (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  ticket_type_id uuid not null references public.synq_tournament_ticket_types (id) on delete cascade,
  purchaser_name text not null,
  purchaser_email text,
  qr_code_hash text not null unique,
  qr_payload text not null,
  status text not null default 'valid' check (status in ('valid', 'used', 'cancelled')),
  paid_flag boolean not null default false,
  paid_amount_cents integer not null default 0 check (paid_amount_cents >= 0),
  valid_for_date date,
  match_id uuid references public.synq_tournament_matches (id) on delete set null,
  scanned_at timestamptz,
  scanned_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_tournament_tickets_tournament_id_idx
  on public.synq_tournament_tickets (tournament_id);
create index if not exists synq_tournament_tickets_qr_hash_idx on public.synq_tournament_tickets (qr_code_hash);

-- ---------------------------------------------------------------------------
-- Tokens de acceso (taquilla / mesa global)
-- ---------------------------------------------------------------------------
create table if not exists public.synq_tournament_access_tokens (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.synq_tournaments (id) on delete cascade,
  token_type text not null check (token_type in ('mesa', 'gate', 'delegate')),
  match_id uuid references public.synq_tournament_matches (id) on delete cascade,
  team_id uuid references public.synq_tournament_teams (id) on delete cascade,
  token_hash text not null unique,
  pin_display text,
  expires_at timestamptz,
  permissions_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists synq_tournament_access_tokens_tournament_id_idx
  on public.synq_tournament_access_tokens (tournament_id);

-- ---------------------------------------------------------------------------
-- Signage: scope torneo en playlists
-- ---------------------------------------------------------------------------
alter table public.synq_signage_playlists
  add column if not exists tournament_id uuid references public.synq_tournaments (id) on delete cascade;

alter table public.synq_signage_playlists
  drop constraint if exists synq_signage_playlists_scope_check;

alter table public.synq_signage_playlists
  add constraint synq_signage_playlists_scope_check
  check (scope in ('club', 'device', 'tournament'));

create index if not exists synq_signage_playlists_tournament_id_idx
  on public.synq_signage_playlists (tournament_id)
  where tournament_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.synq_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'synq_tournaments',
    'synq_tournament_categories',
    'synq_tournament_fields',
    'synq_tournament_sponsors',
    'synq_tournament_teams',
    'synq_tournament_phases',
    'synq_tournament_matches',
    'synq_tournament_ticket_types',
    'synq_tournament_tickets'
  ]
  loop
    execute format('
      drop trigger if exists %I_updated_at on public.%I;
      create trigger %I_updated_at
        before update on public.%I
        for each row execute function public.synq_set_updated_at();
    ', t, t, t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS — staff del club
-- ---------------------------------------------------------------------------
alter table public.synq_tournaments enable row level security;
alter table public.synq_tournament_categories enable row level security;
alter table public.synq_tournament_fields enable row level security;
alter table public.synq_tournament_sponsors enable row level security;
alter table public.synq_tournament_teams enable row level security;
alter table public.synq_tournament_phases enable row level security;
alter table public.synq_tournament_groups enable row level security;
alter table public.synq_tournament_matches enable row level security;
alter table public.synq_tournament_dossiers enable row level security;
alter table public.synq_tournament_ticket_types enable row level security;
alter table public.synq_tournament_tickets enable row level security;
alter table public.synq_tournament_access_tokens enable row level security;

-- Torneos: staff ve torneos de su club
create policy synq_tournaments_select_staff on public.synq_tournaments
  for select using (club_id in (select public.synq_user_club_ids()));
create policy synq_tournaments_write_staff on public.synq_tournaments
  for all using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

-- Hijo: acceso vía tournament_id → club_id
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'synq_tournament_categories',
    'synq_tournament_fields',
    'synq_tournament_sponsors',
    'synq_tournament_teams',
    'synq_tournament_phases',
    'synq_tournament_dossiers',
    'synq_tournament_ticket_types',
    'synq_tournament_tickets',
    'synq_tournament_access_tokens'
  ]
  loop
    execute format('
      create policy %I_select_staff on public.%I for select using (
        tournament_id in (
          select id from public.synq_tournaments
          where club_id in (select public.synq_user_club_ids())
        )
      );
      create policy %I_write_staff on public.%I for all using (
        tournament_id in (
          select id from public.synq_tournaments
          where club_id in (select public.synq_user_club_ids())
        )
      ) with check (
        tournament_id in (
          select id from public.synq_tournaments
          where club_id in (select public.synq_user_club_ids())
        )
      );
    ', tbl, tbl, tbl, tbl);
  end loop;
end;
$$;

-- Grupos: via tournament_id en la tabla
create policy synq_tournament_groups_select_staff on public.synq_tournament_groups
  for select using (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  );
create policy synq_tournament_groups_write_staff on public.synq_tournament_groups
  for all using (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  ) with check (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  );

-- Partidos
create policy synq_tournament_matches_select_staff on public.synq_tournament_matches
  for select using (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  );
create policy synq_tournament_matches_write_staff on public.synq_tournament_matches
  for all using (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  ) with check (
    tournament_id in (
      select id from public.synq_tournaments
      where club_id in (select public.synq_user_club_ids())
    )
  );

-- Lectura pública anónima: torneos publicados + partidos (vía slug en API server)
create policy synq_tournaments_select_public on public.synq_tournaments
  for select to anon using (public_enabled = true and status <> 'draft');

create policy synq_tournament_matches_select_public on public.synq_tournament_matches
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_teams_select_public on public.synq_tournament_teams
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_categories_select_public on public.synq_tournament_categories
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_fields_select_public on public.synq_tournament_fields
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_sponsors_select_public on public.synq_tournament_sponsors
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_phases_select_public on public.synq_tournament_phases
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );

create policy synq_tournament_groups_select_public on public.synq_tournament_groups
  for select to anon using (
    tournament_id in (
      select id from public.synq_tournaments
      where public_enabled = true and status <> 'draft'
    )
  );
