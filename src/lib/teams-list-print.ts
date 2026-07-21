import {
  CANTERA_CATEGORIES,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';

export type TeamsListPrintTeam = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
  team_letter: string | null;
  sport: string;
  active: boolean;
  player_count: number;
  created_at: string | null;
};

export type TeamsListPrintSection = {
  categorySlug: CanteraCategorySlug | null;
  categoryName: string;
  categoryAges: string | null;
  teams: TeamsListPrintTeam[];
};

export type TeamsListStatusFilter = 'all' | 'active' | 'paused';

export function filterTeamsForPrint(
  teams: TeamsListPrintTeam[],
  status: TeamsListStatusFilter
): TeamsListPrintTeam[] {
  if (status === 'active') return teams.filter((team) => team.active);
  if (status === 'paused') return teams.filter((team) => !team.active);
  return teams;
}

export function groupTeamsForPrint(teams: TeamsListPrintTeam[]): TeamsListPrintSection[] {
  const groups: TeamsListPrintSection[] = CANTERA_CATEGORIES.map((category) => ({
    categorySlug: category.slug,
    categoryName: category.name,
    categoryAges: category.ages,
    teams: teams.filter((team) => team.category_slug === category.slug),
  })).filter((group) => group.teams.length > 0);

  const uncategorized = teams.filter((team) => !team.category_slug);
  if (uncategorized.length > 0) {
    groups.push({
      categorySlug: null,
      categoryName: 'Sin categoría',
      categoryAges: null,
      teams: uncategorized,
    });
  }

  return groups;
}

export function teamsListStatusLabel(status: TeamsListStatusFilter): string {
  if (status === 'active') return 'Solo equipos activos';
  if (status === 'paused') return 'Solo equipos pausados';
  return 'Activos y pausados';
}

export function formatTeamCreatedAt(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function teamSportLabel(sport: string): string {
  return sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';
}
