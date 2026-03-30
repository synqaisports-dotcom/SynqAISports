/**
 * Sincronización del marcador de partido entre pestañas/dispositivos (misma origin).
 * Compartido entre `/board/match` y `/smartwatch`.
 */

export const MATCH_SCORE_SYNC_KEY = "synq_match_score_v1";

export type MatchScoreSyncScope = {
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

export function matchScoreSyncKey(scope?: Partial<MatchScoreSyncScope> | null): string {
  if (!scope?.clubId || !scope?.teamId || !scope?.mcc || !scope?.session || !scope?.mode) return MATCH_SCORE_SYNC_KEY;
  return [
    MATCH_SCORE_SYNC_KEY,
    safeKeyPart(scope.clubId),
    safeKeyPart(scope.teamId),
    safeKeyPart(scope.mcc),
    safeKeyPart(scope.session),
    safeKeyPart(scope.mode),
  ].join("__");
}

export type MatchScoreSyncPayload = {
  home: number;
  guest: number;
  updatedAt: number;
  origin?: "board" | "watch";
};

export function writeMatchScoreSync(payload: MatchScoreSyncPayload, key: string = MATCH_SCORE_SYNC_KEY) {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

export function readMatchScoreSync(key: string = MATCH_SCORE_SYNC_KEY): MatchScoreSyncPayload | null {
  try {
    const s = localStorage.getItem(key);
    if (!s) return null;
    return JSON.parse(s) as MatchScoreSyncPayload;
  } catch {
    return null;
  }
}

export function shouldApplyRemoteScore(
  remote: MatchScoreSyncPayload | null,
  lastAppliedAt: number,
): remote is MatchScoreSyncPayload {
  return !!remote && remote.updatedAt > lastAppliedAt;
}
