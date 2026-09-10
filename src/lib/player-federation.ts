export type PlayerFederationInfo = {
  federation_until: string | null;
  federation_document_url: string | null;
};

export function playerFederationStatus(
  player: PlayerFederationInfo
): { ok: boolean; label: string } {
  if (!player.federation_until) return { ok: false, label: 'Federación NOK' };

  const until = new Date(`${player.federation_until}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const ok = until >= today;

  return { ok, label: ok ? 'Federación OK' : 'Federación NOK' };
}

export function defaultFederationUntilValue(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
