export const LEGACY_WATCH_PAIRING_CODE_KEY = "synq_watch_pairing_code";
export const LEGACY_WATCH_LINKED_KEY = "synq_watch_linked";

export type WatchPairingScope = {
  clubId: string;
  mode: "elite" | "sandbox" | "continuity";
};

function safeKeyPart(v: string): string {
  return String(v || "")
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function watchPairingCodeKey(scope?: Partial<WatchPairingScope> | null): string {
  if (!scope?.clubId || !scope?.mode) return LEGACY_WATCH_PAIRING_CODE_KEY;
  return [LEGACY_WATCH_PAIRING_CODE_KEY, safeKeyPart(scope.clubId), safeKeyPart(scope.mode)].join("__");
}

export function watchLinkedKey(scope?: Partial<WatchPairingScope> | null): string {
  if (!scope?.clubId || !scope?.mode) return LEGACY_WATCH_LINKED_KEY;
  return [LEGACY_WATCH_LINKED_KEY, safeKeyPart(scope.clubId), safeKeyPart(scope.mode)].join("__");
}

export function ensureWatchPairingCode(scope?: Partial<WatchPairingScope> | null): string {
  if (typeof window === "undefined") return "";
  const scopedKey = watchPairingCodeKey(scope);
  try {
    const existing = localStorage.getItem(scopedKey);
    if (existing && /^\d{6,12}$/.test(existing)) return existing;

    // Migración best-effort desde legacy a scoped (sin borrar legacy).
    const legacy = localStorage.getItem(LEGACY_WATCH_PAIRING_CODE_KEY);
    if (legacy && /^\d{6,12}$/.test(legacy)) {
      localStorage.setItem(scopedKey, legacy);
      return legacy;
    }

    const next = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(scopedKey, next);
    return next;
  } catch {
    return "";
  }
}

export function readWatchLinked(scope?: Partial<WatchPairingScope> | null): boolean {
  if (typeof window === "undefined") return false;
  const key = watchLinkedKey(scope);
  try {
    const scoped = localStorage.getItem(key);
    if (scoped === "true") return true;
    if (scoped === "false") return false;

    const legacy = localStorage.getItem(LEGACY_WATCH_LINKED_KEY);
    if (legacy === "true") {
      // Migración soft a scoped
      localStorage.setItem(key, "true");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function writeWatchLinked(linked: boolean, scope?: Partial<WatchPairingScope> | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(watchLinkedKey(scope), linked ? "true" : "false");
  } catch {
    /* noop */
  }
}

export function writeWatchPairingCode(code: string, scope?: Partial<WatchPairingScope> | null): void {
  if (typeof window === "undefined") return;
  const cleaned = String(code || "").trim();
  if (!/^\d{4,64}$/.test(cleaned)) return;
  try {
    localStorage.setItem(watchPairingCodeKey(scope), cleaned);
  } catch {
    /* noop */
  }
}

