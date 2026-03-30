/**
 * Sincronización del cronómetro de partido entre pestañas/dispositivos (misma origin).
 * La pizarra /board/match y /smartwatch leen y escriben la misma clave.
 * Nota: el evento `storage` solo llega a *otras* pestañas, no a la que escribe.
 */

export const MATCH_TIMER_SYNC_KEY = "synq_match_timer_v1";

/**
 * Tiempo "preset" (en minutos) para que el botón reset no vuelva siempre a 45.
 * Compartido entre `/board/match` y `/smartwatch`.
 */
export const MATCH_TIMER_PRESET_MINUTES_KEY = "synq_match_timer_preset_minutes_v1";

export type MatchTimerSyncScope = {
  clubId: string;
  teamId: string;
  mcc: string;
  session: string;
  mode: string;
};

function safeKeyPart(v: string): string {
  return String(v || "")
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function matchTimerSyncKey(scope?: Partial<MatchTimerSyncScope> | null): string {
  if (!scope?.clubId || !scope?.teamId || !scope?.mcc || !scope?.session || !scope?.mode) return MATCH_TIMER_SYNC_KEY;
  return [
    MATCH_TIMER_SYNC_KEY,
    safeKeyPart(scope.clubId),
    safeKeyPart(scope.teamId),
    safeKeyPart(scope.mcc),
    safeKeyPart(scope.session),
    safeKeyPart(scope.mode),
  ].join("__");
}

export function readMatchTimerPresetMinutes(defaultMinutes = 45): number {
  if (typeof window === "undefined") return defaultMinutes;
  try {
    const raw = localStorage.getItem(MATCH_TIMER_PRESET_MINUTES_KEY);
    if (!raw) return defaultMinutes;
    const n = Number(raw);
    return Number.isFinite(n) ? n : defaultMinutes;
  } catch {
    return defaultMinutes;
  }
}

export function writeMatchTimerPresetMinutes(minutes: number): void {
  try {
    localStorage.setItem(MATCH_TIMER_PRESET_MINUTES_KEY, String(minutes));
  } catch {
    /* noop */
  }
}

export type MatchTimerSyncPayload = {
  remainingSec: number;
  running: boolean;
  updatedAt: number;
  origin?: "board" | "watch" | "continuity";
};

export function writeMatchTimerSync(payload: MatchTimerSyncPayload, key: string = MATCH_TIMER_SYNC_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

export function readMatchTimerSync(key: string = MATCH_TIMER_SYNC_KEY): MatchTimerSyncPayload | null {
  try {
    const s = localStorage.getItem(key);
    if (!s) return null;
    return JSON.parse(s) as MatchTimerSyncPayload;
  } catch {
    return null;
  }
}

/** Aplica estado remoto si es más reciente que `lastAppliedAt` (ref ms). */
export function shouldApplyRemoteTimer(
  remote: MatchTimerSyncPayload | null,
  lastAppliedAt: number,
): remote is MatchTimerSyncPayload {
  return !!remote && remote.updatedAt > lastAppliedAt;
}
