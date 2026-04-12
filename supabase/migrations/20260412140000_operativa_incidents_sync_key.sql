-- Fase 6: idempotencia al promover incidencias de continuidad (outbox / cola local → operativa_mobile_incidents)
-- sync_key estable por fila local (ej. continuity:inc_<timestamp>_<rand>)

alter table if exists public.operativa_mobile_incidents
  add column if not exists sync_key text;

create unique index if not exists operativa_mobile_incidents_sync_key_uidx
  on public.operativa_mobile_incidents (sync_key)
  where sync_key is not null;

comment on column public.operativa_mobile_incidents.sync_key is 'Clave idempotente cliente/API; evita duplicados al reintentar sync.';
