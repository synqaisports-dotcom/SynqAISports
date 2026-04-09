-- Cola de eventos de anuncios y uso para Sandbox apps abiertas.
-- Idempotente para staging/producción.

create table if not exists public.ad_events_queue (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  event_type text not null,
  event_ts timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  app text not null default 'synqai-sports',
  ingested_at timestamptz not null default now()
);

create index if not exists ad_events_queue_ingested_at_idx on public.ad_events_queue(ingested_at desc);
create index if not exists ad_events_queue_event_type_idx on public.ad_events_queue(event_type);
create index if not exists ad_events_queue_metadata_gin_idx on public.ad_events_queue using gin (metadata);

alter table public.ad_events_queue enable row level security;

drop policy if exists "ad_events_queue_select_superadmin" on public.ad_events_queue;
create policy "ad_events_queue_select_superadmin"
on public.ad_events_queue
for select
to authenticated
using (public.is_superadmin());

grant select on public.ad_events_queue to authenticated;
grant all on public.ad_events_queue to service_role;
