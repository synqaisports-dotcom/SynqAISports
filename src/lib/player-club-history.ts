export type PlayerClubHistoryKind =
  | 'joined'
  | 'team_change'
  | 'category_change'
  | 'paused'
  | 'reactivated'
  | 'medical';

export type PlayerClubHistoryEvent = {
  id: string;
  kind: PlayerClubHistoryKind;
  title: string;
  detail: string;
  occurredAt: string;
};

export function parsePlayerHistoryJson(value: unknown): PlayerClubHistoryEvent[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => ({
      id: String(item?.id ?? `history-${index}`),
      kind: (item?.kind as PlayerClubHistoryKind) ?? 'joined',
      title: String(item?.title ?? '').trim(),
      detail: String(item?.detail ?? '').trim(),
      occurredAt: String(item?.occurredAt ?? item?.occurred_at ?? '').trim(),
    }))
    .filter((event) => event.title && event.occurredAt)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function buildPlayerClubHistory(
  player: {
    team_name: string;
    created_at?: string | null;
    history?: PlayerClubHistoryEvent[];
  }
): PlayerClubHistoryEvent[] {
  if (player.history && player.history.length > 0) return player.history;

  if (!player.created_at) return [];

  return [
    {
      id: 'joined-default',
      kind: 'joined',
      title: 'Alta en el club',
      detail: player.team_name ? `Plantilla · ${player.team_name}` : 'Incorporación a la cantera',
      occurredAt: player.created_at,
    },
  ];
}

export function buildInitialPlayerHistory(teamName: string | null): PlayerClubHistoryEvent[] {
  const occurredAt = new Date().toISOString();
  return [
    {
      id: `joined-${occurredAt}`,
      kind: 'joined',
      title: 'Alta en el club',
      detail: teamName ? `Plantilla · ${teamName}` : 'Sin equipo asignado',
      occurredAt,
    },
  ];
}

export function formatPlayerHistoryWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
