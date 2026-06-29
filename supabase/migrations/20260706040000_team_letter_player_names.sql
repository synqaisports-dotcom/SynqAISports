-- Letra de equipo (A–Z) única por categoría y club; nombres de jugador en dos campos.

alter table public.synq_teams
  add column if not exists team_letter char(1) check (team_letter ~ '^[A-Z]$');

create unique index if not exists synq_teams_club_category_letter_uidx
  on public.synq_teams (club_id, category_slug, team_letter)
  where category_slug is not null and team_letter is not null;

alter table public.synq_players
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Rellenar nombres a partir de display_name existente
update public.synq_players
set
  first_name = coalesce(
    first_name,
    nullif(trim(split_part(display_name, ' ', 1)), '')
  ),
  last_name = coalesce(
    last_name,
    nullif(trim(substring(display_name from position(' ' in display_name) + 1)), '')
  )
where first_name is null or last_name is null;
