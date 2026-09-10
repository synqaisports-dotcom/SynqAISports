alter table public.synq_players
  add column if not exists federation_until date,
  add column if not exists federation_document_url text;
