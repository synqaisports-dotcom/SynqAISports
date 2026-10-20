import { fieldLabel } from '@/lib/tournament-schedule';
import type { TournamentBundle, TournamentField, TournamentGroup, TournamentMatch } from '@/lib/tournaments';

export type ScheduleFieldGroup = {
  fieldId: string;
  label: string;
  matches: TournamentMatch[];
};

export type ScheduleGroupBucket = {
  groupCode: string;
  groupName: string;
  matches: TournamentMatch[];
};

function divisionKey(match: TournamentMatch): string | undefined {
  return (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key;
}

export function groupMatchesByField(
  matches: TournamentMatch[],
  fields: TournamentField[]
): ScheduleFieldGroup[] {
  const map = new Map<string, TournamentMatch[]>();
  const unassigned: TournamentMatch[] = [];

  for (const match of matches) {
    if (!match.field_id) {
      unassigned.push(match);
      continue;
    }
    const key = `${match.field_id}|${divisionKey(match) ?? 'full'}`;
    const list = map.get(key) ?? [];
    list.push(match);
    map.set(key, list);
  }

  const groups: ScheduleFieldGroup[] = fields.flatMap((field) => {
    const keys = [...map.keys()].filter((k) => k.startsWith(`${field.id}|`));
    if (keys.length === 0) return [];
    return keys.map((key) => {
      const div = key.split('|')[1];
      return {
        fieldId: field.id,
        label: fieldLabel(fields, field.id, div === 'full' ? null : div),
        matches: (map.get(key) ?? []).sort((a, b) =>
          (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')
        ),
      };
    });
  });

  if (unassigned.length > 0) {
    groups.push({
      fieldId: 'unassigned',
      label: 'Sin campo asignado',
      matches: unassigned.sort((a, b) => a.match_number - b.match_number),
    });
  }

  return groups;
}

export function groupMatchesByGroupCode(
  matches: TournamentMatch[],
  groups: TournamentGroup[],
  bundle: TournamentBundle
): ScheduleGroupBucket[] {
  const map = new Map<string, TournamentMatch[]>();
  const ungrouped: TournamentMatch[] = [];

  for (const match of matches) {
    if (match.round_key !== 'group') continue;
    let code: string | null = null;
    if (match.group_id) {
      code = groups.find((g) => g.id === match.group_id)?.code ?? null;
    }
    if (!code) {
      const meta = match.metadata_json as { group_code?: string };
      code = meta.group_code ?? null;
    }
    if (!code) {
      ungrouped.push(match);
      continue;
    }
    const list = map.get(code) ?? [];
    list.push(match);
    map.set(code, list);
  }

  const buckets = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupCode, groupMatches]) => ({
      groupCode,
      groupName: groups.find((g) => g.code === groupCode)?.name ?? `Grupo ${groupCode}`,
      matches: groupMatches.sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')),
    }));

  if (ungrouped.length > 0) {
    buckets.push({
      groupCode: '—',
      groupName: 'Sin grupo',
      matches: ungrouped,
    });
  }

  return buckets;
}
