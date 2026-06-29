-- Redes sociales y web pública en la ficha única del club
alter table public.synq_clubs
  add column if not exists website_url text,
  add column if not exists facebook_url text,
  add column if not exists x_url text,
  add column if not exists tiktok_url text,
  add column if not exists youtube_url text;
