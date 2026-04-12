"use client";

import { getLocalSqliteDb, persistCurrentDb } from "./sqlite-engine";
import { getOrCreateDeviceId, type AppDataScope } from "./database-service";
import { MIGRATION_LS_FLAG } from "./schema-sql";

const OUTBOX_FLUSH_ENDPOINT =
  process.env.NEXT_PUBLIC_OUTBOX_SYNC_ENDPOINT ?? "/api/sync/outbox";

let flushInFlight = false;

function newOutboxId() {
  return `ob_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function enqueueOutbox(scope: AppDataScope, op: string, payload: unknown): Promise<void> {
  const db = await getLocalSqliteDb();
  const id = newOutboxId();
  const t = new Date().toISOString();
  const json = JSON.stringify(payload);

  if (!db) {
    try {
      const key = "synq_outbox_fallback_queue";
      const q = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
      const arr = Array.isArray(q) ? q : [];
      arr.push({ id, scope, op, payload: JSON.parse(json), created_at: t });
      const trimmed = arr.slice(-500);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
      /* noop */
    }
    if (typeof navigator !== "undefined" && navigator.onLine) {
      void flushOutbox();
    }
    return;
  }

  db.run(
    `INSERT INTO sync_outbox (id, scope, op, payload, created_at, attempts) VALUES (?, ?, ?, ?, ?, 0)`,
    [id, scope, op, json, t],
  );
  persistCurrentDb(db);

  if (typeof navigator !== "undefined" && navigator.onLine) {
    void flushOutbox();
  }
}

async function fetchOutboxRows(): Promise<
  { id: string; scope: string; op: string; payload: string; created_at: string }[]
> {
  const db = await getLocalSqliteDb();
  if (!db) return [];
  const stmt = db.prepare(
    `SELECT id, scope, op, payload, created_at FROM sync_outbox ORDER BY created_at ASC LIMIT 100`,
  );
  const rows: { id: string; scope: string; op: string; payload: string; created_at: string }[] = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();
    rows.push({
      id: String(o.id),
      scope: String(o.scope),
      op: String(o.op),
      payload: String(o.payload),
      created_at: String(o.created_at),
    });
  }
  stmt.free();
  return rows;
}

function deleteOutboxIds(ids: string[]) {
  void (async () => {
    const db = await getLocalSqliteDb();
    if (!db || ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(",");
    db.run(`DELETE FROM sync_outbox WHERE id IN (${placeholders})`, ids);
    persistCurrentDb(db);
  })();
}

async function flushFallbackLsQueue(): Promise<boolean> {
  const key = "synq_outbox_fallback_queue";
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const q = JSON.parse(raw) as unknown;
    if (!Array.isArray(q) || q.length === 0) return true;

    const deviceId = getOrCreateDeviceId();
    const res = await fetch(OUTBOX_FLUSH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        jobs: q.map((j: { id?: string; scope?: string; op?: string; payload?: unknown }) => ({
          id: String(j.id ?? newOutboxId()),
          scope: String(j.scope ?? "sandbox-coach"),
          op: String(j.op ?? "unknown"),
          payload: j.payload ?? {},
        })),
      }),
    });
    if (!res.ok) return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function flushOutbox(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine || flushInFlight) return;
  flushInFlight = true;
  try {
    const fallbackOk = await flushFallbackLsQueue();
    if (!fallbackOk) return;

    const rows = await fetchOutboxRows();
    if (rows.length === 0) return;

    const deviceId = getOrCreateDeviceId();
    const jobs = rows.map((r) => ({
      id: r.id,
      scope: r.scope as AppDataScope,
      op: r.op,
      payload: (() => {
        try {
          return JSON.parse(r.payload) as Record<string, unknown>;
        } catch {
          return {} as Record<string, unknown>;
        }
      })(),
    }));

    const res = await fetch(OUTBOX_FLUSH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, jobs }),
    });

    if (!res.ok) {
      const db = await getLocalSqliteDb();
      if (db) {
        for (const r of rows) {
          db.run(`UPDATE sync_outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?`, [
            `http_${res.status}`,
            r.id,
          ]);
        }
        persistCurrentDb(db);
      }
      return;
    }

    deleteOutboxIds(rows.map((r) => r.id));
  } catch {
    /* red */
  } finally {
    flushInFlight = false;
  }
}

export function registerOutboxOnlineListener() {
  if (typeof window === "undefined") return () => {};
  const onOnline = () => void flushOutbox();
  const onVis = () => {
    if (document.visibilityState === "visible") void flushOutbox();
  };
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVis);
  void flushOutbox();
  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVis);
  };
}

/** Una sola vez: copiar synq_promo_* a SQLite sin generar jobs duplicados. */
export async function migrateLegacyPromoLocalStorageOnce(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(MIGRATION_LS_FLAG) === "1") return;
    const db = await getLocalSqliteDb();
    if (!db) {
      localStorage.setItem(MIGRATION_LS_FLAG, "1");
      return;
    }
    const scope: AppDataScope = "sandbox-coach";
    const t = new Date().toISOString();

    const teamRaw = localStorage.getItem("synq_promo_team");
    const vaultRaw = localStorage.getItem("synq_promo_vault");

    if (teamRaw) {
      db.run(
        `INSERT INTO documents (scope, collection, record_id, payload, updated_at)
         VALUES (?, 'team', 'promo_team', ?, ?)
         ON CONFLICT(scope, collection, record_id) DO UPDATE SET
           payload = excluded.payload,
           updated_at = excluded.updated_at`,
        [scope, teamRaw, t],
      );
    }
    if (vaultRaw) {
      let merged = vaultRaw;
      if (teamRaw) {
        try {
          const v = JSON.parse(vaultRaw) as Record<string, unknown>;
          v.team = JSON.parse(teamRaw);
          merged = JSON.stringify(v);
        } catch {
          merged = vaultRaw;
        }
      }
      db.run(
        `INSERT INTO documents (scope, collection, record_id, payload, updated_at)
         VALUES (?, 'vault', 'promo_vault', ?, ?)
         ON CONFLICT(scope, collection, record_id) DO UPDATE SET
           payload = excluded.payload,
           updated_at = excluded.updated_at`,
        [scope, merged, t],
      );
    }

    persistCurrentDb(db);
    localStorage.setItem(MIGRATION_LS_FLAG, "1");
  } catch {
    /* noop */
  }
}
