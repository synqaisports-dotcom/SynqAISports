export type TeamClubHistoryKind =
  | 'season_promotion'
  | 'letter_change'
  | 'category_bulk'
  | 'roster_merge'
  | 'paused'
  | 'reactivated';

export type TeamClubHistoryEvent = {
  id: string;
  kind: TeamClubHistoryKind;
  title: string;
  detail: string;
  occurredAt: string;
  seasonLabel?: string;
  playerCount?: number;
};

export function parseTeamHistoryJson(value: unknown): TeamClubHistoryEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => ({
      id: String(item?.id ?? `team-history-${index}`),
      kind: (item?.kind as TeamClubHistoryKind) ?? 'season_promotion',
      title: String(item?.title ?? '').trim(),
      detail: String(item?.detail ?? '').trim(),
      occurredAt: String(item?.occurredAt ?? item?.occurred_at ?? '').trim(),
      seasonLabel: item?.seasonLabel ? String(item.seasonLabel) : undefined,
      playerCount:
        typeof item?.playerCount === 'number' ? item.playerCount : undefined,
    }))
    .filter((event) => event.title && event.occurredAt)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function prependTeamHistoryEvent(
  existing: TeamClubHistoryEvent[],
  event: Omit<TeamClubHistoryEvent, 'id'> & { id?: string }
): TeamClubHistoryEvent[] {
  const entry: TeamClubHistoryEvent = {
    id: event.id ?? `team-history-${Date.now()}`,
    kind: event.kind,
    title: event.title,
    detail: event.detail,
    occurredAt: event.occurredAt,
    seasonLabel: event.seasonLabel,
    playerCount: event.playerCount,
  };
  return [entry, ...existing];
}

export function formatTeamHistoryWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
