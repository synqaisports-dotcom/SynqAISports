import type { ClubPerson } from '@/lib/club-people';
import { ACCESS_PROFILE_LABELS, personSubtitle } from '@/lib/club-people';

export function medicalStatus(person: ClubPerson): { ok: boolean; label: string } {
  if (!person.medical_until) return { ok: false, label: 'Pendiente' };
  const until = new Date(`${person.medical_until}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const ok = until >= today;
  return { ok, label: ok ? 'Médico OK' : 'Caducado' };
}

export function clubPersonInstitutionalFields(person: ClubPerson) {
  const fields = [
    { label: 'Email', value: person.email ?? '' },
    { label: 'Teléfono', value: person.phone ?? '' },
  ];
  if (person.access_profile && person.access_profile !== 'none') {
    fields.push({
      label: 'Perfil acceso',
      value: ACCESS_PROFILE_LABELS[person.access_profile],
    });
  }
  return fields;
}

export function clubPersonSportFields(person: ClubPerson) {
  const medical = medicalStatus(person);
  return [
    { label: 'Equipos', value: person.sport_teams ?? '' },
    { label: 'Email', value: person.email ?? '' },
    { label: 'Teléfono', value: person.phone ?? '' },
    {
      label: 'Reconocimiento médico',
      value: medical.ok
        ? `Válido${person.medical_until ? ` hasta ${formatDate(person.medical_until)}` : ''}`
        : medical.label,
    },
  ];
}

export function clubPersonRowSubtitle(person: ClubPerson): string {
  return personSubtitle(person);
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export type PlayerListRow = {
  id: string;
  display_name: string;
  jersey_number: number | null;
  position: string | null;
  photo_url: string | null;
  team_name: string;
  team_category: string;
};

export function playerListFields(player: PlayerListRow) {
  return [
    { label: 'Equipo', value: player.team_name },
    { label: 'Categoría', value: player.team_category },
    { label: 'Posición', value: player.position ?? '' },
    {
      label: 'Dorsal',
      value: player.jersey_number != null ? `#${player.jersey_number}` : '',
    },
  ];
}
