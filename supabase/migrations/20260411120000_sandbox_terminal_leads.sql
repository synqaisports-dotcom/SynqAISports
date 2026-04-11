-- Leads capturados en /sandbox/login antes de OAuth (Command Hub)
create table if not exists public.sandbox_terminal_leads (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  country text not null,
  city text not null,
  address text not null,
  email text not null,
  source text not null default 'sandbox_login',
  created_at timestamptz not null default now()
);

create index if not exists sandbox_terminal_leads_created_at_idx
  on public.sandbox_terminal_leads (created_at desc);

create index if not exists sandbox_terminal_leads_email_idx
  on public.sandbox_terminal_leads (email);

alter table public.sandbox_terminal_leads enable row level security;

-- Solo service role (API server) inserta; sin políticas para anon/authenticated = denegado por RLS

grant usage on schema public to service_role;
grant all on public.sandbox_terminal_leads to service_role;
