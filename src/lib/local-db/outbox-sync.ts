"use client";

import { getLocalSqliteDb, persistCurrentDb } from "./sqlite-engine";
import { getOrCreateDeviceId, type AppDataScope } from "./database-service";
import { MIGRATION_LS_FLAG } from "./schema-sql";

const OUTBOX_FLUSH_ENDPOINT =
  process.env.NEXT_PUBLIC_OUTBOX_SYNC_ENDPOINT ?? "/api/sync/outbox";

/** Máximo de reintentos por job antes de descartar (evita crecimiento infinito). */
const MAX_SYNC_ATTEMPTS = 12;
const BATCH_SIZE = 50;
const BASE_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 120_000;
const FLUSH_INTERVAL_MS = 30_000;
const FALLBACK_RETRY_GAP_MS = 8000;

const OUTBOX_METRICS_KEY = "synq_outbox_metrics_v1";
const FALLBACK_LAST_FAIL_KEY = "synq_outbox_fallback_last_fail_v1";

let flushInFlight = false;
let intervalId: number | null = null;

export type OutboxSyncMetrics = {
  pendingCount: number;
  lastFlushAt: string | null;
  lastFlushOk: boolean | null;
  lastError: string | null;
  lastAccepted: number;
  updatedAt: string;
};

function newOutboxId() {
  return `ob_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function backoffMsAfterFailures(attempts: number): number {
  if (attempts <= 0) return 0;
  const exp = Math.min(attempts - 1, 16);
  return Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** exp);
}

function writeMetrics(partial: Partial<OutboxSyncMetrics> & { pendingCount?: number }) {
  try {
    const prev = JSON.parse(localStorage.getItem(OUTBOX_METRICS_KEY) || "{}") as Partial<OutboxSyncMetrics>;
    const next: OutboxSyncMetrics = {
      pendingCount: partial.pendingCount ?? prev.pendingCount ?? 0,
      lastFlushAt: partial.lastFlushAt ?? prev.lastFlushAt ?? null,
      lastFlushOk: partial.lastFlushOk ?? prev.lastFlushOk ?? null,
      lastError: partial.lastError !== undefined ? partial.lastError : prev.lastError ?? null,
      lastAccepted: partial.lastAccepted ?? prev.lastAccepted ?? 0,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(OUTBOX_METRICS_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("synq:outbox-metrics-updated", { detail: next }));
  } catch {
    /* noop */
  }
}

export function getOutboxSyncMetrics(): OutboxSyncMetrics | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OUTBOX_METRICS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OutboxSyncMetrics;
  } catch {
    return null;
  }
}

export async function getOutboxPendingCount(): Promise<number> {
  const db = await getLocalSqliteDb();
  if (!db) {
    try {
      const q = JSON.parse(localStorage.getItem("synq_outbox_fallback_queue") || "[]") as unknown;
      return Array.isArray(q) ? q.length : 0;
    } catch {
      return 0;
    }
  }
  const stmt = db.prepare(`SELECT COUNT(*) AS c FROM sync_outbox WHERE attempts < ?`);
  stmt.bind([MAX_SYNC_ATTEMPTS]);
  let c = 0;
  if (stmt.step()) {
    const row = stmt.getAsObject();
    c = Number(row.c) || 0;
  }
  stmt.free();
  return c;
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
      writeMetrics({ pendingCount: trimmed.length });
    } catch {
      /* noop */
    }
    if (typeof navigator !== "undefined" && navigator.onLine) {
      void flushOutbox();
    }
    return;
  }

  db.run(
    `INSERT INTO sync_outbox (id, scope, op, payload, created_at, attempts, last_attempt_at) VALUES (?, ?, ?, ?, ?, 0, NULL)`,
    [id, scope, op, json, t],
  );
  persistCurrentDb(db);
  const pending = await getOutboxPendingCount();
  writeMetrics({ pendingCount: pending });

  if (typeof navigator !== "undefined" && navigator.onLine) {
    void flushOutbox();
  }
}

type OutboxRow = {
  id: string;
  scope: string;
  op: string;
  payload: string;
  created_at: string;
  attempts: number;
  last_attempt_at: string | null;
};

async function fetchAllOutboxRows(): Promise<OutboxRow[]> {
  const db = await getLocalSqliteDb();
  if (!db) return [];
  const stmt = db.prepare(
    `SELECT id, scope, op, payload, created_at, attempts, last_attempt_at FROM sync_outbox ORDER BY created_at ASC LIMIT 500`,
  );
  const rows: OutboxRow[] = [];
  while (stmt.step()) {
    const o = stmt.getAsObject();
    rows.push({
      id: String(o.id),
      scope: String(o.scope),
      op: String(o.op),
      payload: String(o.payload),
      created_at: String(o.created_at),
      attempts: Number(o.attempts) || 0,
      last_attempt_at: o.last_attempt_at != null && String(o.last_attempt_at) !== "" ? String(o.last_attempt_at) : null,
    });
  }
  stmt.free();
  return rows;
}

function pickEligibleBatch(rows: OutboxRow[]): OutboxRow[] {
  const now = Date.now();
  const eligible: OutboxRow[] = [];
  for (const r of rows) {
    if (r.attempts >= MAX_SYNC_ATTEMPTS) continue;
    if (!r.last_attempt_at) {
      eligible.push(r);
    } else {
      const last = Date.parse(r.last_attempt_at);
      if (!Number.isFinite(last)) {
        eligible.push(r);
        continue;
      }
      const wait = backoffMsAfterFailures(r.attempts);
      if (now >= last + wait) eligible.push(r);
    }
    if (eligible.length >= BATCH_SIZE) break;
  }
  return eligible;
}

function deleteOutboxIds(ids: string[]) {
  void (async () => {
    const db = await getLocalSqliteDb();
    if (!db || ids.length === 0) return;
    const placeholders = ids.map(() => "?").join(",");
    db.run(`DELETE FROM sync_outbox WHERE id IN (${placeholders})`, ids);
    persistCurrentDb(db);
    const pending = await getOutboxPendingCount();
    writeMetrics({ pendingCount: pending });
  })();
}

function markOutboxFailed(rows: OutboxRow[], errorLabel: string) {
  void (async () => {
    const db = await getLocalSqliteDb();
    if (!db || rows.length === 0) return;
    const now = new Date().toISOString();
    const err = errorLabel.slice(0, 500);
    for (const r of rows) {
      db.run(
        `UPDATE sync_outbox SET attempts = attempts + 1, last_error = ?, last_attempt_at = ? WHERE id = ?`,
        [err, now, r.id],
      );
      const nextAttempts = r.attempts + 1;
      if (nextAttempts >= MAX_SYNC_ATTEMPTS) {
        console.warn("[SynqOutbox] Job descartado tras máximo de reintentos:", r.id, r.op);
        db.run(`DELETE FROM sync_outbox WHERE id = ?`, [r.id]);
      }
    }
    persistCurrentDb(db);
    const pending = await getOutboxPendingCount();
    writeMetrics({ pendingCount: pending, lastFlushOk: false, lastError: errorLabel });
  })();
}

async function flushFallbackLsQueue(): Promise<boolean> {
  const key = "synq_outbox_fallback_queue";
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return true;
    const q = JSON.parse(raw) as unknown;
    if (!Array.isArray(q) || q.length === 0) return true;

    const lastFail = Number(localStorage.getItem(FALLBACK_LAST_FAIL_KEY) || "0");
    if (Number.isFinite(lastFail) && Date.now() - lastFail < FALLBACK_RETRY_GAP_MS) {
      return false;
    }

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
    if (!res.ok) {
      localStorage.setItem(FALLBACK_LAST_FAIL_KEY, String(Date.now()));
      writeMetrics({ lastFlushOk: false, lastError: `http_${res.status}`, lastAccepted: 0 });
      return false;
    }
    localStorage.removeItem(key);
    localStorage.removeItem(FALLBACK_LAST_FAIL_KEY);
    writeMetrics({ pendingCount: 0, lastFlushOk: true, lastError: null, lastAccepted: q.length });
    return true;
  } catch {
    localStorage.setItem(FALLBACK_LAST_FAIL_KEY, String(Date.now()));
    writeMetrics({ lastFlushOk: false, lastError: "network", lastAccepted: 0 });
    return false;
  }
}

export async function flushOutbox(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine || flushInFlight) return;
  flushInFlight = true;
  let sentBatch: OutboxRow[] = [];
  try {
    const fallbackOk = await flushFallbackLsQueue();
    if (!fallbackOk) return;

    const allRows = await fetchAllOutboxRows();
    sentBatch = pickEligibleBatch(allRows);
    if (sentBatch.length === 0) {
      const pending = await getOutboxPendingCount();
      writeMetrics({ pendingCount: pending });
      return;
    }

    const deviceId = getOrCreateDeviceId();
    const jobs = sentBatch.map((r) => ({
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
      markOutboxFailed(sentBatch, `http_${res.status}`);
      writeMetrics({
        lastFlushAt: new Date().toISOString(),
        lastFlushOk: false,
        lastError: `http_${res.status}`,
        lastAccepted: 0,
      });
      return;
    }

    deleteOutboxIds(sentBatch.map((r) => r.id));
    writeMetrics({
      pendingCount: await getOutboxPendingCount(),
      lastFlushAt: new Date().toISOString(),
      lastFlushOk: true,
      lastError: null,
      lastAccepted: sentBatch.length,
    });
  } catch {
    if (sentBatch.length > 0) {
      markOutboxFailed(sentBatch, "network");
    }
    writeMetrics({
      lastFlushAt: new Date().toISOString(),
      lastFlushOk: false,
      lastError: "network",
      lastAccepted: 0,
    });
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

  if (intervalId === null) {
    intervalId = window.setInterval(() => {
      void (async () => {
        const n = await getOutboxPendingCount();
        if (n > 0 && navigator.onLine) void flushOutbox();
      })();
    }, FLUSH_INTERVAL_MS);
  }

  return () => {
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVis);
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
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
