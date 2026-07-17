import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import {
  DEMO_FACILITIES,
  TRAINING_DIVISION_LABELS,
  formatTimeRange,
  formatTrainingDayLetters,
  type ClubFacility,
} from '@/lib/club-facilities';
import { DEMO_TEAM_SETUP, teamSetupFromDb, type TeamSetupData } from '@/lib/team-setup';
import type { SupabaseClient } from '@supabase/supabase-js';

export type CoachTeamContext = {
  playerCount: number;
  facilityName: string | null;
  facilityAddress: string | null;
  trainingDivisionLabel: string | null;
  trainingDays: string;
  trainingDaysLabel: string;
  trainingTimeLabel: string;
  trainingStart: string;
  trainingEnd: string;
};

export type CoachSessionStats = {
  players: number;
  attendees: number;
  absentees: number;
  sessionDurationLabel: string;
  avgExerciseDurationLabel: string;
  absenceRateLabel: string;
};

const TEAM_SETUP_SELECT =
  'id, training_facility_id, training_division, training_days, training_start, training_end';

function facilityForSetup(
  setup: TeamSetupData,
  facilities: ClubFacility[]
): ClubFacility | null {
  if (!setup.training_facility_id) return null;
  return facilities.find((facility) => facility.id === setup.training_facility_id) ?? null;
}

function demoContextForTeam(teamId: string, facilities: ClubFacility[]): CoachTeamContext | null {
  const demoTeam = DEMO_CANTERA_TEAMS.find((team) => team.id === teamId);
  const setup = DEMO_TEAM_SETUP[teamId];
  if (!demoTeam || !setup) return null;

  const facility = facilityForSetup(setup, facilities.length ? facilities : DEMO_FACILITIES);
  const days = formatTrainingDayLetters(setup.training_days);
  const time = formatTimeRange(setup.training_start, setup.training_end);

  return {
    playerCount: demoTeam.player_count ?? 0,
    facilityName: facility?.name ?? null,
    facilityAddress: facility?.address ?? null,
    trainingDivisionLabel: setup.training_division
      ? TRAINING_DIVISION_LABELS[setup.training_division]
      : null,
    trainingDays: setup.training_days,
    trainingDaysLabel: days === '—' ? 'Sin días asignados' : days,
    trainingTimeLabel: time === '—' ? 'Sin horario' : time,
    trainingStart: setup.training_start,
    trainingEnd: setup.training_end,
  };
}

export async function loadCoachTeamContexts(
  supabase: SupabaseClient,
  clubId: string,
  teamIds: string[],
  options: { demoMode: boolean; facilities: ClubFacility[] }
): Promise<Record<string, CoachTeamContext>> {
  if (teamIds.length === 0) return {};

  const facilities = options.facilities.length ? options.facilities : DEMO_FACILITIES;
  const contexts: Record<string, CoachTeamContext> = {};

  if (options.demoMode) {
    for (const teamId of teamIds) {
      const demo = demoContextForTeam(teamId, facilities);
      if (demo) contexts[teamId] = demo;
    }
    return contexts;
  }

  const { data: teamRows } = await supabase
    .from('synq_teams')
    .select(TEAM_SETUP_SELECT)
    .eq('club_id', clubId)
    .in('id', teamIds);

  const { data: playerRows } = await supabase
    .from('synq_players')
    .select('team_id')
    .eq('club_id', clubId)
    .eq('active', true)
    .in('team_id', teamIds);

  const playerCounts = new Map<string, number>();
  for (const row of playerRows ?? []) {
    if (!row.team_id) continue;
    playerCounts.set(row.team_id, (playerCounts.get(row.team_id) ?? 0) + 1);
  }

  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));

  for (const row of teamRows ?? []) {
    const setup = teamSetupFromDb(row);
    const facility = setup.training_facility_id
      ? facilityById.get(setup.training_facility_id) ?? null
      : null;
    const days = formatTrainingDayLetters(setup.training_days);
    const time = formatTimeRange(setup.training_start, setup.training_end);

    contexts[row.id] = {
      playerCount: playerCounts.get(row.id) ?? 0,
      facilityName: facility?.name ?? null,
      facilityAddress: facility?.address ?? null,
      trainingDivisionLabel: setup.training_division
        ? TRAINING_DIVISION_LABELS[setup.training_division]
        : null,
      trainingDays: setup.training_days,
      trainingDaysLabel: days === '—' ? 'Sin días asignados' : days,
      trainingTimeLabel: time === '—' ? 'Sin horario' : time,
      trainingStart: setup.training_start,
      trainingEnd: setup.training_end,
    };
  }

  for (const teamId of teamIds) {
    if (contexts[teamId]) continue;
    const demo = demoContextForTeam(teamId, facilities);
    if (demo) contexts[teamId] = demo;
  }

  return contexts;
}

function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const [hours, minutes] = trimmed.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

export function formatCoachDurationLabel(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}H`;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}H ${rest}m` : `${hours}H`;
  }
  return `${minutes} m`;
}

export function computeCoachSessionStats(
  playerCount: number,
  trainingStart: string,
  trainingEnd: string,
  exerciseDurations: number[]
): CoachSessionStats {
  let sessionMinutes: number | null = null;
  const start = parseTimeToMinutes(trainingStart);
  const end = parseTimeToMinutes(trainingEnd);
  if (start != null && end != null && end > start) {
    sessionMinutes = end - start;
  }

  if (exerciseDurations.length > 0) {
    const slotTotal = exerciseDurations.reduce((sum, value) => sum + value, 0);
    if (!sessionMinutes || slotTotal > 0) sessionMinutes = slotTotal;
  }

  if (!sessionMinutes) sessionMinutes = 60;

  const avgMinutes =
    exerciseDurations.length > 0
      ? Math.round(exerciseDurations.reduce((sum, value) => sum + value, 0) / exerciseDurations.length)
      : 12;

  return {
    players: playerCount,
    attendees: 0,
    absentees: 0,
    sessionDurationLabel: formatCoachDurationLabel(sessionMinutes),
    avgExerciseDurationLabel: `${avgMinutes} m`,
    absenceRateLabel: '0 %',
  };
}
