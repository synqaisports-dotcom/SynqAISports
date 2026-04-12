/**
 * Política centralizada de monetización web (AdSense).
 * Rutas WEB-ONLY y VISUALIZADORES no cargan scripts de Google.
 * Ver docs/PLAN_MAESTRO.md.
 */
export type AdsWebZone = "monetization" | "web_only" | "visualizer";

/**
 * Prefijos donde AdSense web está permitido (NATIVO-CANDIDATE / hook comercial en web).
 */
const ADSENSE_WEB_ALLOWED_PREFIXES = [
  "/sandbox",
  "/smartwatch",
  "/board/promo",
] as const;

/** Subrutas bajo /dashboard que sí monetizan en web (continuidad = candidato nativo con ads). */
const ADSENSE_WEB_ALLOWED_DASHBOARD_PATHS = ["/dashboard/mobile-continuity"] as const;

export function shouldAllowAdsenseWeb(pathname: string): boolean {
  const p = pathname || "";
  if (!p || p === "/") return false;

  for (const prefix of ADSENSE_WEB_ALLOWED_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return true;
  }
  for (const exact of ADSENSE_WEB_ALLOWED_DASHBOARD_PATHS) {
    if (p === exact || p.startsWith(`${exact}/`)) return true;
  }
  return false;
}

/** Pizarra entrenamiento: franja “multiplex” (placeholder / futuro AdSense) según rol/modo — no implica cargar googlesyndication. */
export function canShowAds(ctx: {
  surface: "training_board";
  mode: "sandbox" | "elite";
  role?: string;
}): boolean {
  if (ctx.surface !== "training_board") return false;
  if (ctx.role === "superadmin") return true;
  return ctx.mode === "sandbox";
}

export function getAdsWebZone(pathname: string): AdsWebZone {
  const p = pathname || "";
  if (shouldAllowAdsenseWeb(p)) return "monetization";

  if (
    p.startsWith("/live-fields") ||
    p.startsWith("/tournaments/checkin")
  ) {
    return "visualizer";
  }
  if (
    p.startsWith("/dashboard") ||
    p.startsWith("/admin-global") ||
    p.startsWith("/tutor") ||
    p.startsWith("/store") ||
    p.startsWith("/apps") ||
    p.startsWith("/plataforma") ||
    p.startsWith("/precios") ||
    p.startsWith("/contacto") ||
    p.startsWith("/login")
  ) {
    return "web_only";
  }
  return "web_only";
}
