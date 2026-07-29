/** Rutas públicas de torneos — seguras para componentes cliente (sin Node crypto). */

export function mesaUrl(token: string): string {
  return `/torneo/mesa/${token}`;
}

export function delegateUrl(token: string): string {
  return `/torneo/equipo/${token}`;
}

export function gateUrl(token: string): string {
  return `/torneo/taquilla/${token}`;
}

export function publicTournamentUrl(slug: string): string {
  return `/torneo/${slug}`;
}
