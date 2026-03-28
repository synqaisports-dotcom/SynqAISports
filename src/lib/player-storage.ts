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

function safeParsePlayers(raw: string | null): unknown[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function readPlayersLocal(clubScopeId: string): unknown[] {
  if (typeof window === "undefined") return [];
  migrateLegacyPlayersStorageKey(clubScopeId);
  const raw = localStorage.getItem(playersStorageKey(clubScopeId));
  return safeParsePlayers(raw);
}

export function writePlayersLocal(clubScopeId: string, players: unknown[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(playersStorageKey(clubScopeId), JSON.stringify(players));
}

/**
 * Para micro-app Tutor: no conocemos clubId a priori. Leemos todos los stores locales disponibles.
 * Incluye legacy `synq_players` + todas las claves `synq_players_v1_*`.
 */
export function readPlayersLocalAcrossClubs(): unknown[] {
  if (typeof window === "undefined") return [];
  const out: unknown[] = [];

  // Legacy global
  out.push(...safeParsePlayers(localStorage.getItem(LEGACY_PLAYERS_STORAGE_KEY)));

  // Club-scoped keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(`${PLAYERS_STORAGE_PREFIX}_`)) continue;
    out.push(...safeParsePlayers(localStorage.getItem(key)));
  }
  return out;
}

/**
 * Suscripción a cambios de jugadores en localStorage (para Tutor y otras vistas).
 */
export function subscribePlayersStorageChanges(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    const k = e.key ?? "";
    if (k === LEGACY_PLAYERS_STORAGE_KEY || k.startsWith(`${PLAYERS_STORAGE_PREFIX}_`)) cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
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
