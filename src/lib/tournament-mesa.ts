import type { MatchEvent } from '@/lib/tournaments';

export function formatMatchTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function elapsedMatchSeconds(liveStartedAt: string | null, running: boolean): number {
  if (!running || !liveStartedAt) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(liveStartedAt).getTime()) / 1000));
}

export function goalsForTeam(events: MatchEvent[], teamId: string | null): number {
  if (!teamId) return 0;
  return events.filter((event) => event.type === 'goal' && event.team_id === teamId).length;
}

export function playerGoalCount(events: MatchEvent[], teamId: string | null, playerName: string): number {
  if (!teamId) return 0;
  return events.filter(
    (event) => event.type === 'goal' && event.team_id === teamId && event.player_name === playerName
  ).length;
}

export function createGoalEvent(
  teamId: string,
  playerName: string,
  minute: number
): MatchEvent {
  return {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    minute,
    type: 'goal',
    team_id: teamId,
    player_name: playerName,
  };
}
