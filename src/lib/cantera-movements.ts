import type { SupabaseClient } from '@supabase/supabase-js';
import { DEMO_CANTERA_TEAMS, DEMO_TEAM_PLAYERS } from '@/lib/cantera-teams';

export type CanteraMovementKind = 'player_joined' | 'team_created';

export type CanteraMovement = {
  id: string;
  kind: CanteraMovementKind;
  title: string;
  detail: string;
  occurredAt: string;
  href?: string;
};

const MOVEMENT_FETCH_LIMIT = 8;

function playerDisplayName(row: {
  display_name: string;
  first_name?: string | null;
  last_name?: string | null;
}): string {
  const fromParts = [row.first_name, row.last_name].filter(Boolean).join(' ').trim();
  return fromParts || row.display_name;
}

function mergeRecentMovements(
  players: CanteraMovement[],
  teams: CanteraMovement[],
  limit = 5
): CanteraMovement[] {
  return [...players, ...teams]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit);
}

export function demoCanteraMovements(): CanteraMovement[] {
  const now = Date.now();
  const hours = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  const teamById = new Map(DEMO_CANTERA_TEAMS.map((team) => [team.id, team]));

  const playerMoves: CanteraMovement[] = DEMO_TEAM_PLAYERS.slice(0, 4).map((player, index) => {
    const team = teamById.get(player.team_id);
    return {
      id: `demo-move-player-${player.id}`,
      kind: 'player_joined',
      title: 'Alta de jugador',
      detail: `${player.first_name} ${player.last_name}${team ? ` · ${team.name}` : ''}`,
      occurredAt: hours(index + 1),
      href: `/portal/cantera/jugadores?player=${player.id}`,
    };
  });

  const teamMoves: CanteraMovement[] = DEMO_CANTERA_TEAMS.slice(0, 3).map((team, index) => ({
    id: `demo-move-team-${team.id}`,
    kind: 'team_created',
    title: 'Nuevo equipo',
    detail: team.name,
    occurredAt: hours(index + 5),
    href: team.category_slug
      ? `/portal/cantera/equipos/equipo/${team.id}`
      : '/portal/cantera/equipos',
  }));

  return mergeRecentMovements(playerMoves, teamMoves);
}

export async function loadCanteraRecentMovements(
  supabase: SupabaseClient,
  clubId: string,
  limit = 5
): Promise<CanteraMovement[]> {
  const [playersRes, teamsRes] = await Promise.all([
    supabase
      .from('synq_players')
      .select('id, display_name, first_name, last_name, created_at, team_id, synq_teams(name)')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(MOVEMENT_FETCH_LIMIT),
    supabase
      .from('synq_teams')
      .select('id, name, category_slug, created_at')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(MOVEMENT_FETCH_LIMIT),
  ]);

  const playerMoves: CanteraMovement[] = (playersRes.data ?? []).map((row) => {
    const team = Array.isArray(row.synq_teams) ? row.synq_teams[0] : row.synq_teams;
    const name = playerDisplayName(row);
    return {
      id: `player-${row.id}`,
      kind: 'player_joined',
      title: 'Alta de jugador',
      detail: team?.name ? `${name} · ${team.name}` : name,
      occurredAt: row.created_at,
      href: `/portal/cantera/jugadores?player=${row.id}`,
    };
  });

  const teamMoves: CanteraMovement[] = (teamsRes.data ?? []).map((row) => ({
    id: `team-${row.id}`,
    kind: 'team_created',
    title: 'Nuevo equipo',
    detail: row.name,
    occurredAt: row.created_at,
    href: row.category_slug
      ? `/portal/cantera/equipos/equipo/${row.id}`
      : '/portal/cantera/equipos',
  }));

  return mergeRecentMovements(playerMoves, teamMoves, limit);
}

export function formatCanteraMovementWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
