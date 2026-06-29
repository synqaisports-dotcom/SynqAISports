-- Horario específico en el que el campo se divide en mitades o cuartos.

alter table public.synq_facilities
  add column if not exists division_schedule_days text,
  add column if not exists division_schedule_start time,
  add column if not exists division_schedule_end time;
