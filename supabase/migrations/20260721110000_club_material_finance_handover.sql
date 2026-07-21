-- Material: coste por unidad, moneda y recibís de entrega de temporada

alter table public.synq_club_materials
  add column if not exists currency_code text not null default 'EUR',
  add column if not exists unit_cost numeric(10, 2);

alter table public.synq_club_materials drop constraint if exists synq_club_materials_currency_check;
alter table public.synq_club_materials add constraint synq_club_materials_currency_check check (
  currency_code in ('EUR', 'USD', 'GBP', 'CHF')
);

create table if not exists public.synq_club_material_handovers (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  season text not null,
  recipient_name text not null,
  recipient_role text not null default 'coach',
  location_type text not null check (location_type in ('club', 'team', 'facility')),
  location_id uuid,
  location_label text not null,
  handed_at timestamptz not null default now(),
  notes text,
  items_json jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists synq_club_material_handovers_club_idx
  on public.synq_club_material_handovers (club_id, handed_at desc);

alter table public.synq_club_material_handovers enable row level security;
