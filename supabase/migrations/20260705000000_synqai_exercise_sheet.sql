-- Plantilla UEFA de tarea — sheet_json en ejercicios y slots de microciclo

alter table public.synq_exercises
  add column if not exists sheet_json jsonb not null default '{}'::jsonb,
  add column if not exists task_type text not null default 'main' check (
    task_type in ('warmup', 'main', 'cooldown')
  );

alter table public.synq_microcycle_slots
  add column if not exists sheet_json jsonb not null default '{}'::jsonb;

-- Rellenar sheet_json desde columnas legacy donde esté vacío
update public.synq_exercises
set sheet_json = jsonb_build_object(
  'templateVersion', 1,
  'taskType', 'main',
  'title', title,
  'didacticStrategy', '',
  'objectives', objectives,
  'conditionalGrid', jsonb_build_object(
    'conditionalContent', '',
    'time', duration_min::text || ' minutos',
    'space', '',
    'gameSituation', '',
    'coordination', ''
  ),
  'technicalAction', '',
  'tacticalAction', '',
  'collectiveContent', '',
  'description', notes,
  'rules', materials,
  'coachingCues', ''
)
where sheet_json = '{}'::jsonb or sheet_json is null;
