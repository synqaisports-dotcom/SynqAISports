-- Material del club e inventario por almacén, equipo o instalación
create table if not exists public.synq_club_materials (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  name text not null,
  category text not null,
  unit text not null default 'unit',
  sku text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.synq_club_material_stock (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  material_id uuid not null references public.synq_club_materials (id) on delete cascade,
  location_type text not null check (location_type in ('club', 'team', 'facility')),
  location_id uuid,
  quantity integer not null default 0 check (quantity >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists synq_club_material_stock_location_uidx
  on public.synq_club_material_stock (club_id, material_id, location_type, coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid));

alter table public.synq_club_materials enable row level security;
alter table public.synq_club_material_stock enable row level security;
