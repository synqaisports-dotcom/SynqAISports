import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import { loadMethodologyObjectives } from '@/app/actions/methodology';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import type { MethodologyObjectivesMap } from '@/lib/methodology-objectives';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';

export type MethodologyLandingStats = {
  totalTeams: number;
  totalExercises: number;
  totalObjectives: number;
  pendingRequests: number;
};

function countFilledObjectives(objectives: MethodologyObjectivesMap): number {
  let total = 0;
  for (const category of Object.values(objectives)) {
    for (const dimension of Object.values(category)) {
      if (dimension.content.trim()) total += 1;
    }
  }
  return total;
}

export async function loadMethodologyLandingStats(
  supabase: SupabaseClient,
  clubId: string,
  primarySport: ClubPracticedSport
): Promise<MethodologyLandingStats> {
  const demo = await isDemoActive();

  const [teamsResult, exercises, objectives, requests] = await Promise.all([
    supabase
      .from('synq_teams')
      .select('id', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('active', true),
    loadExerciseLibrary(supabase, clubId, primarySport),
    loadMethodologyObjectives(clubId, primarySport),
    fetchChangeRequestInbox({ status: 'pending', limit: 100 }),
  ]);

  let totalTeams = teamsResult.count ?? 0;
  if (demo && totalTeams === 0) {
    totalTeams = DEMO_CANTERA_TEAMS.length;
  } else if (demo) {
    const { data: existingTeams } = await supabase
      .from('synq_teams')
      .select('id')
      .eq('club_id', clubId)
      .eq('active', true);
    const existingIds = new Set((existingTeams ?? []).map((team) => team.id));
    totalTeams += DEMO_CANTERA_TEAMS.filter((team) => !existingIds.has(team.id)).length;
  }

  return {
    totalTeams,
    totalExercises: exercises.length,
    totalObjectives: countFilledObjectives(objectives),
    pendingRequests: requests.length,
  };
}
