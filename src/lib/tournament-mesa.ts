import type { MatchEvent, TournamentSport } from '@/lib/tournaments';

export function formatMatchTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function elapsedMatchSeconds(liveStartedAt: string | null, running: boolean): number {
  if (!running || !liveStartedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(liveStartedAt).getTime()) / 1000));
}

function isScoringEvent(event: MatchEvent): boolean {
  return (event.type === 'goal' || event.type === 'penalty') && !event.voided;
}

export function goalsForTeam(events: MatchEvent[], teamId: string | null): number {
  if (!teamId) return 0;
  return events.filter((event) => isScoringEvent(event) && event.team_id === teamId).length;
}

export function playerGoalCount(events: MatchEvent[], teamId: string | null, playerName: string): number {
  if (!teamId) return 0;
  return events.filter(
    (event) =>
      isScoringEvent(event) && event.team_id === teamId && event.player_name === playerName
  ).length;
}

export function playerCardCount(
  events: MatchEvent[],
  teamId: string | null,
  playerName: string,
  card: 'yellow' | 'red'
): number {
  if (!teamId) return 0;
  return events.filter(
    (event) => !event.voided && event.type === card && event.team_id === teamId && event.player_name === playerName
  ).length;
}

export function playerFoulCount(events: MatchEvent[], teamId: string | null, playerName: string): number {
  if (!teamId) return 0;
  return events.filter(
    (event) =>
      !event.voided &&
      event.type === 'note' &&
      event.description === 'falta' &&
      event.team_id === teamId &&
      event.player_name === playerName
  ).length;
}

export type ScorerRow = {
  playerName: string;
  teamId: string;
  goals: { minute: number; type: 'goal' | 'penalty' }[];
};

export function buildScorerTable(events: MatchEvent[]): ScorerRow[] {
  const map = new Map<string, ScorerRow>();

  for (const event of events) {
    if (!isScoringEvent(event) || !event.team_id || !event.player_name) continue;
    const key = `${event.team_id}::${event.player_name}`;
    const row = map.get(key) ?? {
      playerName: event.player_name,
      teamId: event.team_id,
      goals: [],
    };
    row.goals.push({ minute: event.minute, type: event.type === 'penalty' ? 'penalty' : 'goal' });
    map.set(key, row);
  }

  return [...map.values()].sort((a, b) => {
    if (b.goals.length !== a.goals.length) return b.goals.length - a.goals.length;
    const aMin = Math.min(...a.goals.map((g) => g.minute));
    const bMin = Math.min(...b.goals.map((g) => g.minute));
    return aMin - bMin;
  });
}

function newEventId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createGoalEvent(teamId: string, playerName: string, minute: number): MatchEvent {
  return {
    id: newEventId('goal'),
    minute,
    type: 'goal',
    team_id: teamId,
    player_name: playerName,
  };
}

export function createCardEvent(
  teamId: string,
  playerName: string,
  minute: number,
  card: 'yellow' | 'red'
): MatchEvent {
  return {
    id: newEventId(card),
    minute,
    type: card,
    team_id: teamId,
    player_name: playerName,
  };
}

export function createFoulEvent(teamId: string, playerName: string, minute: number): MatchEvent {
  return {
    id: newEventId('foul'),
    minute,
    type: 'note',
    team_id: teamId,
    player_name: playerName,
    description: 'falta',
  };
}

export function voidMatchEvent(events: MatchEvent[], eventId: string): MatchEvent[] {
  return events.map((event) => (event.id === eventId ? { ...event, voided: true } : event));
}

export function isAnnulableMatchEvent(event: MatchEvent): boolean {
  if (event.voided) return false;
  return (
    event.type === 'goal' ||
    event.type === 'penalty' ||
    event.type === 'yellow' ||
    event.type === 'red' ||
    (event.type === 'note' && event.description === 'falta')
  );
}

export function matchEventLabel(event: MatchEvent): string {
  if (event.voided) return 'Anulado';
  switch (event.type) {
    case 'goal':
      return 'Gol';
    case 'penalty':
      return 'Penalti';
    case 'yellow':
      return 'Amarilla';
    case 'red':
      return 'Roja';
    case 'note':
      return event.description === 'falta' ? 'Falta' : event.description ?? 'Nota';
    default:
      return 'Evento';
  }
}

export type MesaSportCapabilities = {
  goals: boolean;
  cards: boolean;
  fouls: boolean;
};

const MESA_CAPABILITIES: Record<TournamentSport, MesaSportCapabilities> = {
  football: { goals: true, cards: true, fouls: true },
  futsal: { goals: true, cards: true, fouls: true },
  basketball: { goals: true, cards: false, fouls: true },
  handball: { goals: true, cards: true, fouls: true },
  volleyball: { goals: false, cards: false, fouls: false },
  waterpolo: { goals: true, cards: true, fouls: true },
};

export function mesaCapabilitiesForSport(sport: TournamentSport): MesaSportCapabilities {
  return MESA_CAPABILITIES[sport] ?? MESA_CAPABILITIES.football;
}

export type MatchStatusFilter = 'live' | 'scheduled' | 'finished' | 'all';

export function filterMatchesByStatus<T extends { status: string }>(
  matches: T[],
  filter: MatchStatusFilter
): T[] {
  if (filter === 'all') return matches;
  return matches.filter((m) => m.status === filter);
}

export function scheduledHourKey(iso: string | null): string {
  if (!iso) return 'sin-horario';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
