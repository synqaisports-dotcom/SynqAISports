import { DEMO_CANTERA_TEAMS, DEMO_TEAM_PLAYERS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CanteraWeeklyAbsenceDay = {
  label: string;
  confirmed: number;
};

export type CanteraStats = {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  totalPlayers: number;
  avgPlayersPerTeam: number | null;
  injuredPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  weeklyAbsences: CanteraWeeklyAbsenceDay[];
  weeklyConfirmedAbsences: number;
};

function currentWeekAbsenceDays(): CanteraWeeklyAbsenceDay[] {
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - mondayOffset);

  return labels.map((label, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const isFuture = day > today;
    return { label, confirmed: isFuture ? 0 : 0 };
  });
}

const DEMO_INJURED_PLAYER_IDS = new Set(['demo-pl-ben-1']);

export function demoCanteraStats(): CanteraStats {
  const activeTeams = DEMO_CANTERA_TEAMS.filter((team) => team.active).length;
  const inactiveTeams = DEMO_CANTERA_TEAMS.filter((team) => !team.active).length;
  const totalTeams = activeTeams + inactiveTeams;
  const totalPlayers = DEMO_TEAM_PLAYERS.length;
  const injuredPlayers = DEMO_TEAM_PLAYERS.filter((player) =>
    DEMO_INJURED_PLAYER_IDS.has(player.id)
  ).length;
  const inactivePlayers = 0;
  const activePlayers = totalPlayers - inactivePlayers;

  const weeklyAbsences = currentWeekAbsenceDays();
  weeklyAbsences[1] = { ...weeklyAbsences[1], confirmed: 1 };
  weeklyAbsences[3] = { ...weeklyAbsences[3], confirmed: 1 };
  const weeklyConfirmedAbsences = weeklyAbsences.reduce((sum, day) => sum + day.confirmed, 0);

  return {
    totalTeams,
    activeTeams,
    inactiveTeams,
    totalPlayers,
    avgPlayersPerTeam: activeTeams > 0 ? activePlayers / activeTeams : null,
    injuredPlayers,
    activePlayers,
    inactivePlayers,
    weeklyAbsences,
    weeklyConfirmedAbsences,
  };
}

export async function loadCanteraStats(
  supabase: SupabaseClient,
  clubId: string
): Promise<CanteraStats> {
  if (await isDemoActive()) return demoCanteraStats();

  const [activeTeamsRes, inactiveTeamsRes, allPlayersRes, activePlayersRes, inactivePlayersRes, injuredRes] =
    await Promise.all([
      supabase
        .from('synq_teams')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('active', true),
      supabase
        .from('synq_teams')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('active', false),
      supabase
        .from('synq_players')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId),
      supabase
        .from('synq_players')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('active', true),
      supabase
        .from('synq_players')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('active', false),
      supabase
        .from('synq_players')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .eq('injured', true)
        .eq('active', true),
    ]);

  const activeTeams = activeTeamsRes.count ?? 0;
  const inactiveTeams = inactiveTeamsRes.count ?? 0;
  const totalTeams = activeTeams + inactiveTeams;
  const totalPlayers = allPlayersRes.count ?? 0;
  const activePlayers = activePlayersRes.count ?? 0;
  const inactivePlayers = inactivePlayersRes.count ?? 0;
  const injuredPlayers = injuredRes.count ?? 0;
  const weeklyAbsences = currentWeekAbsenceDays();

  return {
    totalTeams,
    activeTeams,
    inactiveTeams,
    totalPlayers,
    avgPlayersPerTeam: activeTeams > 0 ? activePlayers / activeTeams : null,
    injuredPlayers,
    activePlayers,
    inactivePlayers,
    weeklyAbsences,
    weeklyConfirmedAbsences: 0,
  };
}

export function formatCanteraAverage(value: number | null) {
  if (value == null) return '—';
  return value.toLocaleString('es-ES', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}
