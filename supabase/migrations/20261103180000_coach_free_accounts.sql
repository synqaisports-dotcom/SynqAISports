-- Censo de entrenadores Free. La pizarra vive en el aparato; aquí solo el alta y el código.

create table if not exists public.synq_coach_free_accounts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  country_code text not null,
  access_code text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.synq_coach_free_accounts enable row level security;

-- Sin políticas para anon/authenticated: el alta y el censo pasan por la clave de servicio.
