alter table public.synq_clubs
  add column if not exists organigrama_json jsonb;
