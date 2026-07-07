alter table public.synq_players
  add column if not exists is_minor boolean not null default false,
  add column if not exists guardians_json jsonb;
