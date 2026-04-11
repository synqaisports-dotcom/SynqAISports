/**
 * Rutas de la micro-app Sandbox (Command Hub).
 *
 * Usa `NEXT_PUBLIC_SANDBOX_BASE_PATH` (p. ej. `/sandbox` o vacío si la app vive en la raíz de un subdominio).
 * Todas las navegaciones internas del sandbox deberían derivar de aquí para poder aislar el despliegue.
 */
const raw = (process.env.NEXT_PUBLIC_SANDBOX_BASE_PATH ?? "/sandbox").replace(/\/$/, "");
export const SANDBOX_BASE_PATH = raw === "/" ? "" : raw;

/** Raíz de la micro-app logueada (Command Hub). */
export const SANDBOX_APP_ROOT = joinBase("/app");

/** Login dedicado del sandbox. */
export const SANDBOX_LOGIN_PATH = joinBase("/login");

/** Portal previo al login (puede vivir fuera del prefijo; configurable). */
export const SANDBOX_PORTAL_PATH =
  process.env.NEXT_PUBLIC_SANDBOX_PORTAL_PATH ?? "/sandbox-portal";

/** Manifest y SW suelen colgar del prefijo sandbox. */
export const SANDBOX_MANIFEST_PATH = joinBase("/manifest.json");

function joinBase(suffix: string): string {
  const s = suffix.startsWith("/") ? suffix : `/${suffix}`;
  if (!SANDBOX_BASE_PATH) return s;
  return `${SANDBOX_BASE_PATH}${s}`.replace(/\/{2,}/g, "/");
}

/** Ruta bajo `/app`: p.ej. `sandboxAppHref("/team")` → `/sandbox/app/team`. */
export function sandboxAppHref(path = ""): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return SANDBOX_APP_ROOT;
  return `${SANDBOX_APP_ROOT}${p}`.replace(/\/{2,}/g, "/");
}

/** Base de pizarras dentro del micro-app: `/sandbox/app/board`. */
export const SANDBOX_APP_BOARD_ROOT = sandboxAppHref("/board");

export function sandboxBoardMatchHref(query: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== "") q.set(k, v);
  }
  const qs = q.toString();
  return qs ? `${SANDBOX_APP_BOARD_ROOT}/match?${qs}` : `${SANDBOX_APP_BOARD_ROOT}/match`;
}

export function sandboxBoardPromoHref(id?: string | number): string {
  const base = `${SANDBOX_APP_BOARD_ROOT}/promo`;
  if (id == null || id === "") return base;
  return `${base}?id=${encodeURIComponent(String(id))}`;
}

/** `true` si el pathname actual pertenece al Command Hub (no login suelto). */
export function isSandboxAppPathname(pathname: string): boolean {
  return pathname === SANDBOX_APP_ROOT || pathname.startsWith(`${SANDBOX_APP_ROOT}/`);
}

export function isSandboxBoardPathname(pathname: string): boolean {
  return pathname.startsWith(`${SANDBOX_APP_BOARD_ROOT}/`);
}

export function isSandboxCommandHubHome(pathname: string): boolean {
  return pathname === SANDBOX_APP_ROOT;
}

export function sandboxLoginHref(nextPath: string): string {
  const n = encodeURIComponent(nextPath.startsWith("/") ? nextPath : `/${nextPath}`);
  return `${SANDBOX_LOGIN_PATH}?next=${n}`;
}
