-- SynqAI Sports — esquema inicial (proyecto Supabase independiente de TrendPulse)
-- Ejecutar en SQL Editor del NUEVO proyecto Supabase de SynqAI.

create extension if not exists "pgcrypto";

create table if not exists public.synq_clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  players_count int not null default 0,
  family_fee_annual_eur numeric(6, 2) not null default 12.00,
  synq_rate_per_user_eur numeric(4, 2) not null default 0.50,
  created_at timestamptz not null default now()
);

create table if not exists public.synq_players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.synq_clubs (id) on delete cascade,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists synq_players_club_id_idx on public.synq_players (club_id);

alter table public.synq_clubs enable row level security;
alter table public.synq_players enable row level security;
