-- Fase E: slots por sesión dentro de cada microciclo
-- Ver docs/PERIODIZATION_DB_DEFERRED.md para el checklist completo en producción.

alter table public.synq_microcycles
  add column if not exists sessions_per_micro smallint check (sessions_per_micro in (2, 3)),
  add column if not exists main_tasks_per_session smallint check (main_tasks_per_session in (2, 3));

comment on column public.synq_microcycles.sessions_per_micro is
  'Sesiones de entreno por semana (variante 2 o 3). Copiado desde plan_variant_id al crear desde MCC.';
comment on column public.synq_microcycles.main_tasks_per_session is
  'Tareas principales por sesión (2 o 3). Define la plantilla de slots.';

alter table public.synq_microcycle_slots
  add column if not exists session_index smallint not null default 1 check (session_index >= 1);

comment on column public.synq_microcycle_slots.session_index is
  'Índice de sesión dentro del microciclo (1..sessions_per_micro).';

-- Sustituir unicidad plana por (microciclo, sesión, orden de tarea)
alter table public.synq_microcycle_slots
  drop constraint if exists synq_microcycle_slots_microcycle_id_order_index_key;

create unique index if not exists synq_microcycle_slots_session_order_idx
  on public.synq_microcycle_slots (microcycle_id, session_index, order_index);

create index if not exists synq_microcycle_slots_session_idx
  on public.synq_microcycle_slots (microcycle_id, session_index);
