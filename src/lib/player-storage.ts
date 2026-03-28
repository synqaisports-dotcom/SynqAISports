export const LEGACY_PLAYERS_STORAGE_KEY = "synq_players";
export const PLAYERS_STORAGE_PREFIX = "synq_players_v1";

export function playersStorageKey(clubScopeId: string) {
  return `${PLAYERS_STORAGE_PREFIX}_${clubScopeId}`;
}

export function migrateLegacyPlayersStorageKey(clubScopeId: string) {
  if (typeof window === "undefined") return;
  const scopedKey = playersStorageKey(clubScopeId);
  const existing = localStorage.getItem(scopedKey);
  if (existing) return;
  const legacy = localStorage.getItem(LEGACY_PLAYERS_STORAGE_KEY);
  if (!legacy) return;
  localStorage.setItem(scopedKey, legacy);
}

export function readPlayersLocal(clubScopeId: string): unknown[] {
  if (typeof window === "undefined") return [];
  migrateLegacyPlayersStorageKey(clubScopeId);
  const raw = localStorage.getItem(playersStorageKey(clubScopeId));
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePlayersLocal(clubScopeId: string, players: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(playersStorageKey(clubScopeId), JSON.stringify(players));
}

/**
 * Compat exports (para no repetir lógica en cada módulo).
 */
export function readPlayersForClub(clubScopeId: string): unknown[] {
  return readPlayersLocal(clubScopeId);
}

export function readClubPlayersFromStorage(clubScopeId: string): unknown[] {
  return readPlayersLocal(clubScopeId);
}

export function getPlayersStorageKey(clubScopeId: string): string {
  return playersStorageKey(clubScopeId);
}

export function migrateLegacyGlobalPlayersKey(clubScopeId: string) {
  return migrateLegacyPlayersStorageKey(clubScopeId);
}

export function getPlayerStorageKey(clubScopeId: string): string {
  return playersStorageKey(clubScopeId);
}

export function loadLocalPlayersForClub(clubScopeId: string | null | undefined): unknown[] {
  return readPlayersLocal(clubScopeId ?? "global-hq");
}

export function subscribePlayersStorageForClub(
  clubScopeId: string | null | undefined,
  onChange: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  const key = playersStorageKey(clubScopeId ?? "global-hq");
  const handler = (e: StorageEvent) => {
    if (e.key === key || e.key === LEGACY_PLAYERS_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
