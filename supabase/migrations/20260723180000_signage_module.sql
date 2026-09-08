-- Módulo digital signage: patrocinadores, contenido, pantallas, playlists y emparejamiento.

-- Patrocinadores
create table if not exists public.synq_sponsors (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  logo_url text,
  tier text not null default 'silver' check (tier in ('gold', 'silver', 'bronze')),
  url text,
  default_duration_sec integer not null default 30 check (default_duration_sec between 5 and 120),
  active_from date,
  active_until date,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_sponsors_club_id_idx on public.synq_sponsors (club_id);

-- Biblioteca de contenido signage
create table if not exists public.synq_signage_assets (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  title text not null,
  asset_type text not null check (
    asset_type in ('video', 'image', 'sponsor_slide', 'exercise_animation', 'club_branding')
  ),
  media_url text,
  thumbnail_url text,
  sponsor_id uuid references public.synq_sponsors (id) on delete set null,
  exercise_id uuid references public.synq_exercises (id) on delete set null,
  duration_sec integer not null default 10 check (duration_sec between 0 and 600),
  orientation text not null default 'both' check (orientation in ('landscape', 'portrait', 'both')),
  metadata_json jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_signage_assets_club_id_idx on public.synq_signage_assets (club_id);
create index if not exists synq_signage_assets_sponsor_id_idx on public.synq_signage_assets (sponsor_id)
  where sponsor_id is not null;

-- Pantallas / dispositivos
create table if not exists public.synq_signage_devices (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  zone_type text not null default 'waiting' check (
    zone_type in ('cafeteria', 'waiting', 'gym', 'reception', 'field_perimeter', 'other')
  ),
  facility_id uuid references public.synq_facilities (id) on delete set null,
  orientation text not null default 'landscape' check (orientation in ('landscape', 'portrait')),
  device_token text not null unique,
  playlist_id uuid,
  last_seen_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_signage_devices_club_id_idx on public.synq_signage_devices (club_id);
create index if not exists synq_signage_devices_token_idx on public.synq_signage_devices (device_token);

-- Playlists
create table if not exists public.synq_signage_playlists (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  scope text not null default 'club' check (scope in ('club', 'device')),
  device_id uuid references public.synq_signage_devices (id) on delete cascade,
  is_default boolean not null default false,
  rotation_mode text not null default 'sequential' check (
    rotation_mode in ('sequential', 'shuffle', 'weighted')
  ),
  items_json jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists synq_signage_playlists_club_id_idx on public.synq_signage_playlists (club_id);
create unique index if not exists synq_signage_playlists_default_club_idx
  on public.synq_signage_playlists (club_id)
  where is_default = true and scope = 'club';

alter table public.synq_signage_devices
  add constraint synq_signage_devices_playlist_id_fkey
  foreign key (playlist_id) references public.synq_signage_playlists (id) on delete set null;

-- Horarios (club o por pantalla)
create table if not exists public.synq_signage_schedules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  device_id uuid references public.synq_signage_devices (id) on delete cascade,
  active_from_hour integer not null default 10 check (active_from_hour between 0 and 23),
  active_to_hour integer not null default 22 check (active_to_hour between 1 and 24),
  days_mask integer not null default 127 check (days_mask between 0 and 127),
  standby_mode text not null default 'logo' check (standby_mode in ('logo', 'black')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint synq_signage_schedules_hours_check check (active_to_hour > active_from_hour)
);

create index if not exists synq_signage_schedules_club_id_idx on public.synq_signage_schedules (club_id);
create unique index if not exists synq_signage_schedules_club_default_idx
  on public.synq_signage_schedules (club_id)
  where device_id is null;

-- Sesiones de emparejamiento (TV sin auth)
create table if not exists public.synq_signage_pairing_sessions (
  id uuid primary key default gen_random_uuid(),
  pairing_code text not null unique,
  device_token text not null unique,
  club_id uuid references public.synq_clubs (id) on delete cascade,
  device_id uuid references public.synq_signage_devices (id) on delete cascade,
  expires_at timestamptz not null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists synq_signage_pairing_code_idx on public.synq_signage_pairing_sessions (pairing_code);

-- updated_at triggers
create or replace function public.synq_signage_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists synq_sponsors_updated_at on public.synq_sponsors;
create trigger synq_sponsors_updated_at
  before update on public.synq_sponsors
  for each row execute function public.synq_signage_set_updated_at();

drop trigger if exists synq_signage_assets_updated_at on public.synq_signage_assets;
create trigger synq_signage_assets_updated_at
  before update on public.synq_signage_assets
  for each row execute function public.synq_signage_set_updated_at();

drop trigger if exists synq_signage_devices_updated_at on public.synq_signage_devices;
create trigger synq_signage_devices_updated_at
  before update on public.synq_signage_devices
  for each row execute function public.synq_signage_set_updated_at();

drop trigger if exists synq_signage_playlists_updated_at on public.synq_signage_playlists;
create trigger synq_signage_playlists_updated_at
  before update on public.synq_signage_playlists
  for each row execute function public.synq_signage_set_updated_at();

drop trigger if exists synq_signage_schedules_updated_at on public.synq_signage_schedules;
create trigger synq_signage_schedules_updated_at
  before update on public.synq_signage_schedules
  for each row execute function public.synq_signage_set_updated_at();

-- RLS
alter table public.synq_sponsors enable row level security;
alter table public.synq_signage_assets enable row level security;
alter table public.synq_signage_devices enable row level security;
alter table public.synq_signage_playlists enable row level security;
alter table public.synq_signage_schedules enable row level security;
alter table public.synq_signage_pairing_sessions enable row level security;

create policy synq_sponsors_select_staff on public.synq_sponsors for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));
create policy synq_sponsors_write_staff on public.synq_sponsors for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_signage_assets_select_staff on public.synq_signage_assets for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));
create policy synq_signage_assets_write_staff on public.synq_signage_assets for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_signage_devices_select_staff on public.synq_signage_devices for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));
create policy synq_signage_devices_write_staff on public.synq_signage_devices for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_signage_playlists_select_staff on public.synq_signage_playlists for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));
create policy synq_signage_playlists_write_staff on public.synq_signage_playlists for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

create policy synq_signage_schedules_select_staff on public.synq_signage_schedules for select to authenticated
  using (club_id in (select public.synq_user_club_ids()));
create policy synq_signage_schedules_write_staff on public.synq_signage_schedules for all to authenticated
  using (club_id in (select public.synq_user_club_ids()))
  with check (club_id in (select public.synq_user_club_ids()));

-- Emparejamiento: staff puede leer/escribir; anon puede insertar sesión y leer por código
create policy synq_signage_pairing_select_staff on public.synq_signage_pairing_sessions for select to authenticated
  using (club_id is null or club_id in (select public.synq_user_club_ids()));
create policy synq_signage_pairing_write_staff on public.synq_signage_pairing_sessions for all to authenticated
  using (club_id is null or club_id in (select public.synq_user_club_ids()))
  with check (club_id is null or club_id in (select public.synq_user_club_ids()));
create policy synq_signage_pairing_insert_anon on public.synq_signage_pairing_sessions for insert to anon, authenticated
  with check (true);
create policy synq_signage_pairing_select_anon on public.synq_signage_pairing_sessions for select to anon
  using (expires_at > now());

-- Lectura pública de dispositivos por token (player web)
create policy synq_signage_devices_select_public on public.synq_signage_devices for select to anon
  using (active = true);

-- Bucket vídeo/imagen signage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'signage-media',
  'signage-media',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

create policy signage_media_public_read on storage.objects for select to public
  using (bucket_id = 'signage-media');

create policy signage_media_authenticated_upload on storage.objects for insert to authenticated, anon
  with check (bucket_id = 'signage-media');

create policy signage_media_authenticated_update on storage.objects for update to authenticated, anon
  using (bucket_id = 'signage-media');

create policy signage_media_authenticated_delete on storage.objects for delete to authenticated, anon
  using (bucket_id = 'signage-media');
