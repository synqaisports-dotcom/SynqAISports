-- Estado de lesión en ficha de jugador (cantera)
alter table public.synq_players
  add column if not exists injured boolean not null default false;

create index if not exists synq_players_club_injured_idx
  on public.synq_players (club_id, injured)
  where injured = true;
