/** Rutas públicas de torneos — seguras para componentes cliente (sin Node crypto). */

export function mesaUrl(token: string): string {
  return `/torneo/mesa/${token}`;
}

export function mesaHubUrl(token: string): string {
  return `/torneo/mesa/hub/${token}`;
}

export function delegateUrl(token: string): string {
  return `/torneo/equipo/${token}`;
}

export function tournamentSignageScreenPath(token: string): string {
  return `/torneo/pantallas/${token}`;
}

export function gateUrl(token: string): string {
  return `/torneo/taquilla/${token}`;
}

export function publicTournamentUrl(slug: string): string {
  return `/torneo/${slug}`;
}
