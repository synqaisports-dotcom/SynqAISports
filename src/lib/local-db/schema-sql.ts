/** Esquema SQLite embebido (Sandbox + Tutor + outbox). */
export const LOCAL_SQLITE_SCHEMA = `
PRAGMA journal_mode = MEMORY;
PRAGMA synchronous = OFF;

CREATE TABLE IF NOT EXISTS documents (
  scope TEXT NOT NULL,
  collection TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (scope, collection, record_id)
);

CREATE TABLE IF NOT EXISTS match_events (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  match_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS match_events_match_id_idx ON match_events (match_id);
CREATE INDEX IF NOT EXISTS match_events_scope_idx ON match_events (scope);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  context TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS incidents_scope_idx ON incidents (scope);

CREATE TABLE IF NOT EXISTS sync_outbox (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT
);

CREATE INDEX IF NOT EXISTS sync_outbox_pending_idx ON sync_outbox (created_at);
`;

export const SQLITE_STORAGE_KEY = "synq_sqlite_db_v1";
export const DEVICE_ID_KEY = "synq_device_id_v1";
export const MIGRATION_LS_FLAG = "synq_sqlite_migrated_from_ls_v1";
