-- Deportes que practica el club (multiselección en ficha del club).

alter table public.synq_clubs
  add column if not exists practiced_sports text[] not null default array['football']::text[];

alter table public.synq_clubs drop constraint if exists synq_clubs_practiced_sports_check;
alter table public.synq_clubs add constraint synq_clubs_practiced_sports_check check (
  practiced_sports <@ array[
    'football',
    'futsal',
    'basketball',
    'volleyball',
    'handball',
    'waterpolo'
  ]::text[]
  and cardinality(practiced_sports) >= 1
);

update public.synq_clubs
set practiced_sports = array['football', 'futsal']::text[]
where practiced_sports = array['football']::text[];
