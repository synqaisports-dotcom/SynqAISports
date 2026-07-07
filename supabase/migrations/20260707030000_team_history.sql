-- Histórico de equipo (cierres de temporada, ascensos, fusiones)
alter table public.synq_teams
  add column if not exists team_history_json jsonb;
