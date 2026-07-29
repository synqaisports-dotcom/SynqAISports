import type { TournamentField, TournamentMatch } from '@/lib/tournaments';
import { ROUND_KEY_LABELS } from '@/lib/tournaments';

export type ScheduleDayGroup = {
  dateKey: string;
  label: string;
  matches: TournamentMatch[];
};

export function formatMatchDateTime(iso: string | null): { date: string; time: string; full: string } {
  if (!iso) return { date: 'Sin fecha', time: '—', full: 'Por programar' };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function fieldLabel(
  fields: TournamentField[],
  fieldId: string | null,
  divisionKey?: string | null
): string {
  if (!fieldId) return 'Sin asignar';
  const base = fields.find((f) => f.id === fieldId)?.label ?? 'Campo';
  if (!divisionKey || divisionKey === 'full') return base;
  if (divisionKey === 'half_1') return `${base} · Mitad 1`;
  if (divisionKey === 'half_2') return `${base} · Mitad 2`;
  if (divisionKey.startsWith('quarter_')) return `${base} · C${divisionKey.replace('quarter_', '')}`;
  return base;
}

export function groupMatchesByDay(matches: TournamentMatch[]): ScheduleDayGroup[] {
  const map = new Map<string, TournamentMatch[]>();
  const unscheduled: TournamentMatch[] = [];

  for (const m of matches) {
    if (!m.scheduled_at) {
      unscheduled.push(m);
      continue;
    }
    const key = m.scheduled_at.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }

  const days = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, dayMatches]) => ({
      dateKey,
      label: formatMatchDateTime(`${dateKey}T12:00:00`).date,
      matches: dayMatches.sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? '')),
    }));

  if (unscheduled.length > 0) {
    days.push({
      dateKey: 'unscheduled',
      label: 'Por programar',
      matches: unscheduled.sort((a, b) => a.match_number - b.match_number),
    });
  }

  return days;
}

export function roundSortOrder(round: TournamentMatch['round_key']): number {
  const order: Record<TournamentMatch['round_key'], number> = {
    group: 0,
    r16: 1,
    qf: 2,
    sf: 3,
    final: 4,
    third_place: 5,
    consolation_final: 6,
  };
  return order[round] ?? 99;
}

export function roundLabelWithBracket(
  round: TournamentMatch['round_key'],
  bracketName?: string
): string {
  const base = ROUND_KEY_LABELS[round];
  return bracketName ? `${bracketName} · ${base}` : base;
}
