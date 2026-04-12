/**
 * Capa de abstracción: lectura/escritura local SQLite + cola outbox.
 * Fallback: si WASM falla, no rompe la app (retorna null / no-op donde aplique).
 */
import { getLocalSqliteDb, persistCurrentDb } from "./sqlite-engine";
import { DEVICE_ID_KEY } from "./schema-sql";
import { enqueueOutbox } from "./outbox-sync";

export type AppDataScope = "sandbox-coach" | "tutor" | "continuity";

const PROMO_TEAM_ID = "promo_team";
const PROMO_VAULT_ID = "promo_vault";

function nowIso() {
  return new Date().toISOString();
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = `dev_${crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `ephemeral_${Date.now()}`;
  }
}

export async function upsertDocument(
  scope: AppDataScope,
  collection: string,
  recordId: string,
  payload: unknown,
  options?: { enqueueSync?: boolean },
): Promise<void> {
  const enqueueSync = options?.enqueueSync !== false;
  const db = await getLocalSqliteDb();
  const json = JSON.stringify(payload);
  const t = nowIso();
  if (!db) {
    const lsKey =
      collection === "team" && recordId === PROMO_TEAM_ID
        ? "synq_promo_team"
        : collection === "vault" && recordId === PROMO_VAULT_ID
          ? "synq_promo_vault"
          : null;
    if (lsKey) {
      try {
        localStorage.setItem(lsKey, json);
        if (lsKey === "synq_promo_team") {
          const vaultRaw = localStorage.getItem("synq_promo_vault");
          let vault: Record<string, unknown> = { exercises: [], sessions: [], matches: [] };
          try {
            vault = vaultRaw ? (JSON.parse(vaultRaw) as Record<string, unknown>) : vault;
          } catch {
            /* noop */
          }
          localStorage.setItem("synq_promo_vault", JSON.stringify({ ...vault, team: payload }));
        }
      } catch {
        /* noop */
      }
    }
    if (enqueueSync) void enqueueOutbox(scope, "document_upsert", { collection, recordId, payload });
    return;
  }

  db.run(
    `INSERT INTO documents (scope, collection, record_id, payload, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(scope, collection, record_id) DO UPDATE SET
       payload = excluded.payload,
       updated_at = excluded.updated_at`,
    [scope, collection, recordId, json, t],
  );
  persistCurrentDb(db);

  if (collection === "team" && recordId === PROMO_TEAM_ID) {
    const vaultStmt = db.prepare(`SELECT payload FROM documents WHERE scope = ? AND collection = ? AND record_id = ?`);
    vaultStmt.bind([scope, "vault", PROMO_VAULT_ID]);
    let vaultObj: Record<string, unknown> = { exercises: [], sessions: [], matches: [] };
    if (vaultStmt.step()) {
      const row = vaultStmt.getAsObject();
      try {
        vaultObj = JSON.parse(String(row.payload ?? "{}")) as Record<string, unknown>;
      } catch {
        /* noop */
      }
    }
    vaultStmt.free();
    vaultObj.team = payload;
    const vjson = JSON.stringify(vaultObj);
    db.run(
      `INSERT INTO documents (scope, collection, record_id, payload, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(scope, collection, record_id) DO UPDATE SET
         payload = excluded.payload,
         updated_at = excluded.updated_at`,
      [scope, "vault", PROMO_VAULT_ID, vjson, t],
    );
  }

  if (collection === "vault" && recordId === PROMO_VAULT_ID) {
    const teamStmt = db.prepare(`SELECT payload FROM documents WHERE scope = ? AND collection = ? AND record_id = ?`);
    teamStmt.bind([scope, "team", PROMO_TEAM_ID]);
    let teamPayload: unknown = null;
    if (teamStmt.step()) {
      const row = teamStmt.getAsObject();
      try {
        teamPayload = JSON.parse(String(row.payload ?? "null"));
      } catch {
        teamPayload = null;
      }
    }
    teamStmt.free();
    if (teamPayload && typeof teamPayload === "object") {
      const v = JSON.parse(json) as Record<string, unknown>;
      v.team = teamPayload;
      const merged = JSON.stringify(v);
      db.run(
        `UPDATE documents SET payload = ?, updated_at = ? WHERE scope = ? AND collection = ? AND record_id = ?`,
        [merged, t, scope, "vault", PROMO_VAULT_ID],
      );
    }
  }

  persistCurrentDb(db);

  if (scope === "sandbox-coach") {
    try {
      const readPayload = (coll: string, rid: string): string | null => {
        const s = db.prepare(
          `SELECT payload FROM documents WHERE scope = ? AND collection = ? AND record_id = ? LIMIT 1`,
        );
        s.bind([scope, coll, rid]);
        let p: string | null = null;
        if (s.step()) {
          const row = s.getAsObject();
          p = String(row.payload ?? "");
        }
        s.free();
        return p;
      };
      const teamP = readPayload("team", PROMO_TEAM_ID);
      const vaultP = readPayload("vault", PROMO_VAULT_ID);
      if (teamP) localStorage.setItem("synq_promo_team", teamP);
      if (vaultP) localStorage.setItem("synq_promo_vault", vaultP);
    } catch {
      /* noop */
    }
  }

  const payloadForOutbox =
    collection === "vault" && recordId === PROMO_VAULT_ID
      ? (() => {
          try {
            const s = db.prepare(
              `SELECT payload FROM documents WHERE scope = ? AND collection = ? AND record_id = ? LIMIT 1`,
            );
            s.bind([scope, collection, recordId]);
            let p: Record<string, unknown> = {};
            if (s.step()) {
              const row = s.getAsObject();
              p = JSON.parse(String(row.payload ?? "{}")) as Record<string, unknown>;
            }
            s.free();
            return p;
          } catch {
            return JSON.parse(json) as Record<string, unknown>;
          }
        })()
      : (JSON.parse(json) as Record<string, unknown>);

  if (enqueueSync) {
    void enqueueOutbox(scope, "document_upsert", { collection, recordId, payload: payloadForOutbox });
  }
}

export async function getDocumentJson<T>(
  scope: AppDataScope,
  collection: string,
  recordId: string,
  fallback: T,
): Promise<T> {
  const db = await getLocalSqliteDb();
  if (!db) {
    const lsKey =
      collection === "team" && recordId === PROMO_TEAM_ID
        ? "synq_promo_team"
        : collection === "vault" && recordId === PROMO_VAULT_ID
          ? "synq_promo_vault"
          : null;
    if (lsKey) {
      try {
        const raw = localStorage.getItem(lsKey);
        if (raw) return JSON.parse(raw) as T;
      } catch {
        /* noop */
      }
    }
    return fallback;
  }

  const stmt = db.prepare(
    `SELECT payload FROM documents WHERE scope = ? AND collection = ? AND record_id = ? LIMIT 1`,
  );
  stmt.bind([scope, collection, recordId]);
  let out: T = fallback;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    try {
      out = JSON.parse(String(row.payload ?? "")) as T;
    } catch {
      out = fallback;
    }
  }
  stmt.free();
  return out;
}

/** Partido / entrenamiento: evento táctico local + outbox. */
export async function insertMatchEvent(
  scope: AppDataScope,
  matchId: string,
  kind: string,
  payload: unknown,
): Promise<string> {
  const id = `me_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const db = await getLocalSqliteDb();
  const t = nowIso();
  if (!db) {
    void enqueueOutbox(scope, "match_event", { id, matchId, kind, payload, occurredAt: t });
    return id;
  }
  db.run(
    `INSERT INTO match_events (id, scope, match_id, kind, payload, occurred_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, scope, matchId, kind, JSON.stringify(payload), t, t],
  );
  persistCurrentDb(db);
  void enqueueOutbox(scope, "match_event", { id, matchId, kind, payload, occurredAt: t });
  return id;
}

/** Incidencia (continuidad / operativa) local + outbox. */
export async function insertIncident(scope: AppDataScope, context: string, payload: unknown): Promise<string> {
  const id = `inc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const db = await getLocalSqliteDb();
  const t = nowIso();
  if (!db) {
    void enqueueOutbox(scope, "incident", { id, context, payload, createdAt: t });
    return id;
  }
  db.run(
    `INSERT INTO incidents (id, scope, context, payload, created_at) VALUES (?, ?, ?, ?, ?)`,
    [id, scope, context, JSON.stringify(payload), t],
  );
  persistCurrentDb(db);
  void enqueueOutbox(scope, "incident", { id, context, payload, createdAt: t });
  return id;
}
