/**
 * Sincronización del marcador de partido entre pestañas/dispositivos (misma origin).
 * Compartido entre `/board/match` y `/smartwatch`.
 */

export const MATCH_SCORE_SYNC_KEY = "synq_match_score_v1";

export type MatchScoreSyncPayload = {
  home: number;
  guest: number;
  updatedAt: number;
  origin?: "board" | "watch";
};

export function writeMatchScoreSync(payload: MatchScoreSyncPayload) {
  try {
    localStorage.setItem(MATCH_SCORE_SYNC_KEY, JSON.stringify(payload));
  } catch {
    /* noop */
  }
}

export function readMatchScoreSync(): MatchScoreSyncPayload | null {
  try {
    const s = localStorage.getItem(MATCH_SCORE_SYNC_KEY);
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
