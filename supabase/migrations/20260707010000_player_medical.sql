alter table public.synq_players
  add column if not exists medical_until date,
  add column if not exists medical_document_url text;
