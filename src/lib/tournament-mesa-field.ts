import { fieldLabel } from '@/lib/tournament-schedule';
import { buildScheduleSlots } from '@/lib/tournament-scheduling';
import type { Tournament, TournamentBundle, TournamentMatch } from '@/lib/tournaments';

export type MesaFieldSlot = {
  fieldId: string;
  divisionKey: string;
  slotKey: string;
  label: string;
  token: string;
};

export function mesaSlotKey(fieldId: string, divisionKey: string): string {
  return `${fieldId}:${divisionKey}`;
}

export function matchDivisionKey(match: TournamentMatch): string {
  const key = (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key;
  return key && key.length > 0 ? key : 'full';
}

export function matchHasAssignedTeams(match: TournamentMatch): boolean {
  return Boolean(match.home_team_id && match.away_team_id);
}

export function matchBelongsToMesaSlot(
  match: TournamentMatch,
  fieldId: string,
  divisionKey: string
): boolean {
  if (match.field_id !== fieldId) return false;
  return matchDivisionKey(match) === divisionKey;
}

export function mesaMatchesForSlot(
  matches: TournamentMatch[],
  fieldId: string,
  divisionKey: string
): TournamentMatch[] {
  return matches
    .filter((m) => matchBelongsToMesaSlot(m, fieldId, divisionKey) && matchHasAssignedTeams(m))
    .sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''));
}

type MesaTokenMap = Record<string, string>;

export function getMesaTokenMap(tournament: Pick<Tournament, 'format_json'>): MesaTokenMap {
  const signage = tournament.format_json?.signage as { mesa_tokens?: MesaTokenMap } | undefined;
  return signage?.mesa_tokens ?? {};
}

export function buildMesaFieldSlots(bundle: TournamentBundle): MesaFieldSlot[] {
  const tokenMap = getMesaTokenMap(bundle.tournament);
  const scheduleSlots = buildScheduleSlots(bundle.fields, bundle.tournament);

  return scheduleSlots.map((slot) => {
    const slotKey = mesaSlotKey(slot.field_id, slot.division_key);
    const token = tokenMap[slotKey] ?? `mesa-${bundle.tournament.slug}-${slot.field_id}-${slot.division_key}`;
    return {
      fieldId: slot.field_id,
      divisionKey: slot.division_key,
      slotKey,
      label: slot.label,
      token,
    };
  });
}

export function resolveMesaFieldSlotByToken(
  bundle: TournamentBundle,
  token: string
): MesaFieldSlot | null {
  return buildMesaFieldSlots(bundle).find((slot) => slot.token === token) ?? null;
}

export function mesaSlotLabel(bundle: TournamentBundle, fieldId: string, divisionKey: string): string {
  return fieldLabel(bundle.fields, fieldId, divisionKey === 'full' ? null : divisionKey);
}

export function mesaFieldUrlForMatch(bundle: TournamentBundle, match: TournamentMatch): string | null {
  if (!matchHasAssignedTeams(match) || !match.field_id) return null;
  const divisionKey = matchDivisionKey(match);
  const slot = buildMesaFieldSlots(bundle).find(
    (s) => s.fieldId === match.field_id && s.divisionKey === divisionKey
  );
  if (!slot) return null;
  return `/torneo/mesa/${slot.token}`;
}
