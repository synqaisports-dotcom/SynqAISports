export type ContinuityMode = "match" | "training";

export type ContinuityContext = {
  clubId: string;
  mode: ContinuityMode;
  teamId: string;
  mcc: string;
  session: string;
  updatedAt: number;
};

const CONTINUITY_CONTEXT_PREFIX = "synq_continuity_ctx_v1";

function safeKeyPart(v: string): string {
  return String(v || "")
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function continuityContextKey(clubId: string): string {
  const c = safeKeyPart(clubId || "global-hq");
  return `${CONTINUITY_CONTEXT_PREFIX}__${c}`;
}

export function readContinuityContext(clubId: string): ContinuityContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(continuityContextKey(clubId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ContinuityContext>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.clubId !== clubId) return null;
    if (parsed.mode !== "match" && parsed.mode !== "training") return null;
    if (!parsed.teamId || !parsed.mcc || !parsed.session) return null;
    const updatedAt = Number(parsed.updatedAt);
    if (!Number.isFinite(updatedAt)) return null;
    return {
      clubId,
      mode: parsed.mode,
      teamId: String(parsed.teamId),
      mcc: String(parsed.mcc),
      session: String(parsed.session),
      updatedAt,
    };
  } catch {
    return null;
  }
}

export function writeContinuityContext(next: Omit<ContinuityContext, "updatedAt">): ContinuityContext {
  const payload: ContinuityContext = { ...next, updatedAt: Date.now() };
  if (typeof window === "undefined") return payload;
  try {
    localStorage.setItem(continuityContextKey(next.clubId), JSON.stringify(payload));
  } catch {
    // noop
  }
  return payload;
}

export function subscribeContinuityContext(
  clubId: string,
  onChange: (ctx: ContinuityContext | null) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const key = continuityContextKey(clubId);
  const handler = (e: StorageEvent) => {
    if (e.key !== key && e.key !== null) return;
    onChange(readContinuityContext(clubId));
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

