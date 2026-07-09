export type PlayerMedicalInfo = {
  medical_until: string | null;
  medical_document_url: string | null;
};

export function playerMedicalStatus(player: PlayerMedicalInfo): { ok: boolean; label: string } {
  if (!player.medical_until) return { ok: false, label: 'Médico NOK' };

  const until = new Date(`${player.medical_until}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const ok = until >= today;

  return { ok, label: ok ? 'Médico OK' : 'Médico NOK' };
}

export function formatMedicalDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function isValidMedicalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function defaultMedicalUntilValue(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
