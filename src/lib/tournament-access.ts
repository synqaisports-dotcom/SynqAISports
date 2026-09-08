/**
 * @deprecated Importar desde `tournament-urls` (cliente) o `tournament-tokens` (servidor).
 * Re-export temporal para no romper imports existentes en servidor.
 */
export {
  delegateUrl,
  gateUrl,
  mesaUrl,
  publicTournamentUrl,
} from '@/lib/tournament-urls';

export {
  generateAccessToken,
  generateInviteToken,
  generateMesaPin,
  generateQrHash,
  generateQrPayload,
  hashToken,
  tokenExpiresAt,
} from '@/lib/tournament-tokens';
