"use client";

const QUEUE_KEY = "synq_continuity_pending_incidents_v1";
const MAX_QUEUE = 80;

export type PendingContinuityIncident = {
  syncKey: string;
  teamId: string;
  mcc: string;
  session: string;
  incidentId: string;
  incidentLabel: string;
  score: { home: number; guest: number };
  remainingSec: number;
  source: string;
};

function readQueue(): PendingContinuityIncident[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const p = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(p) ? (p as PendingContinuityIncident[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PendingContinuityIncident[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUE)));
  } catch {
    /* noop */
  }
}

export function enqueueContinuityIncidentSync(item: PendingContinuityIncident) {
  const q = readQueue();
  if (q.some((x) => x.syncKey === item.syncKey)) return;
  writeQueue([...q, item]);
}

export function removeContinuityIncidentFromQueue(syncKey: string) {
  writeQueue(readQueue().filter((x) => x.syncKey !== syncKey));
}

export async function promoteContinuityIncident(
  accessToken: string,
  item: PendingContinuityIncident,
): Promise<{ ok: boolean; duplicate?: boolean }> {
  const res = await fetch("/api/sync/promote-continuity", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      syncKey: item.syncKey,
      teamId: item.teamId,
      mcc: item.mcc,
      session: item.session,
      incidentId: item.incidentId,
      incidentLabel: item.incidentLabel,
      score: item.score,
      remainingSec: item.remainingSec,
      source: item.source,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    duplicate?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    return { ok: false };
  }
  return { ok: true, duplicate: Boolean(data.duplicate) };
}

export async function flushContinuityIncidentQueue(accessToken: string): Promise<void> {
  const pending = readQueue();
  if (pending.length === 0) return;
  const remaining: PendingContinuityIncident[] = [];
  for (const item of pending) {
    const r = await promoteContinuityIncident(accessToken, item);
    if (r.ok) {
      continue;
    }
    remaining.push(item);
  }
  writeQueue(remaining);
}
