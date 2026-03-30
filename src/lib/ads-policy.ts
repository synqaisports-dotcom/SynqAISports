export type AdsSurface = "training_board" | "promo_board" | "mobile_continuity";
export type AdsMode = "sandbox" | "elite";

type AdsPolicyInput = {
  surface: AdsSurface;
  mode: AdsMode;
  role?: string | null;
};

/**
 * Política comercial de anuncios:
 * - Elite club/tablet: sin anuncios.
 * - Sandbox y continuidad móvil: permitido.
 */
export function canShowAds({ surface, mode, role }: AdsPolicyInput): boolean {
  if (mode === "elite") return false;
  if (surface === "mobile_continuity") return true;
  if (surface === "promo_board") return true;
  if (surface === "training_board") return role === "promo_coach";
  return false;
}
