-- Días, franja horaria y flag de sede de partidos en instalaciones.

alter table public.synq_facilities
  add column if not exists availability_days text,
  add column if not exists availability_start time,
  add column if not exists availability_end time,
  add column if not exists is_match_venue boolean not null default false;
