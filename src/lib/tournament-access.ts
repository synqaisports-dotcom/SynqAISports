import { createHash, randomBytes } from 'crypto';

export function generateAccessToken(): string {
  return randomBytes(24).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateMesaPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function generateInviteToken(): string {
  return randomBytes(16).toString('base64url');
}

export function generateQrPayload(tournamentId: string, ticketId: string): string {
  return `synq-ticket:${tournamentId}:${ticketId}`;
}

export function generateQrHash(payload: string): string {
  return createHash('sha256').update(payload).digest('hex').slice(0, 32);
}

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

export function tokenExpiresAt(hours = 48): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
