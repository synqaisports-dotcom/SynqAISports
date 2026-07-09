import {
  getCanteraCategory,
  resolveTeamCategorySlug,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import type { TeamViewPlayer } from '@/components/portal/TeamViewSections';
import type { TeamClubHistoryEvent } from '@/lib/team-club-history';
import type { TeamSetupData } from '@/lib/team-setup';

export type TeamProfile = {
  id: string;
  name: string;
  category: string;
  category_slug: CanteraCategorySlug | null;
  team_letter: string | null;
  sport: string;
  active: boolean;
  player_count: number;
  setup: TeamSetupData;
  facility_name: string | null;
  players: TeamViewPlayer[];
  history: TeamClubHistoryEvent[];
  is_demo: boolean;
};

export type TeamListSortMode = 'category' | 'name-asc' | 'name-desc';

export function teamCategoryOrder(
  team: Pick<TeamProfile, 'category_slug' | 'category'>
): number {
  const slug =
    team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  const meta = slug ? getCanteraCategory(slug) : null;
  return meta?.order ?? 999;
}

export function compareTeamsForList(
  a: TeamProfile,
  b: TeamProfile,
  mode: TeamListSortMode
): number {
  if (mode === 'category') {
    const byCategory = teamCategoryOrder(a) - teamCategoryOrder(b);
    if (byCategory !== 0) return byCategory;
    return a.name.localeCompare(b.name, 'es');
  }

  const cmp = a.name.localeCompare(b.name, 'es');
  return mode === 'name-asc' ? cmp : -cmp;
}

export function usedTeamLettersInCategory(
  teams: TeamProfile[],
  categorySlug: string,
  excludeTeamId?: string
): string[] {
  return teams
    .filter(
      (team) =>
        team.category_slug === categorySlug &&
        team.team_letter &&
        team.id !== excludeTeamId
    )
    .map((team) => team.team_letter!.toUpperCase());
}
