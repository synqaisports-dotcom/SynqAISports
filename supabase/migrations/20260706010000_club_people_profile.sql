alter table public.synq_club_people
  add column if not exists photo_url text,
  add column if not exists medical_until date,
  add column if not exists sport_teams text;

alter table public.synq_players
  add column if not exists photo_url text;
