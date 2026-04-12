-- Ingesta de snapshots locales (Sandbox / Tutor) desde cola outbox del cliente.
-- La API usa service_role; sin políticas públicas de lectura.

create table if not exists public.sandbox_device_snapshots (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  app_scope text not null default 'sandbox-coach',
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists sandbox_device_snapshots_device_created_idx
  on public.sandbox_device_snapshots (device_id, created_at desc);

create index if not exists sandbox_device_snapshots_app_scope_idx
  on public.sandbox_device_snapshots (app_scope, created_at desc);

alter table public.sandbox_device_snapshots enable row level security;

grant usage on schema public to service_role;
grant insert on public.sandbox_device_snapshots to service_role;
grant select on public.sandbox_device_snapshots to service_role;

-- Preview sin SERVICE_ROLE: API usa anon
drop policy if exists "sandbox_device_snapshots_insert_anon" on public.sandbox_device_snapshots;
create policy "sandbox_device_snapshots_insert_anon"
on public.sandbox_device_snapshots
for insert
to anon
with check (true);

grant insert on public.sandbox_device_snapshots to anon;
