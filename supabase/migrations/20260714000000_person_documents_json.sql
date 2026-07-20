alter table public.synq_club_people
  add column if not exists documents_json jsonb not null default '{"fixed":{},"custom":[]}'::jsonb;
