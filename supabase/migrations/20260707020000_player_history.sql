alter table public.synq_players
  add column if not exists player_history_json jsonb;
