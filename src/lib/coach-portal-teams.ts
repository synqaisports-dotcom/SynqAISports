import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { CANTERA_CATEGORIES, getCanteraCategory, resolveTeamCategorySlug } from '@/lib/cantera-categories';
import { ACCESS_PROFILE_LABELS, type AccessProfile } from '@/lib/club-people';
import type { AssignmentRole } from '@/lib/person-assignments';

export type CoachPortalTeam = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
  category_name: string;
};

export type CoachPortalViewMode = 'coach' | 'coordinator' | 'supervisor';

export type CoachPortalViewer = {
  displayName: string;
  role: string;
  viewMode: CoachPortalViewMode;
  viewModeLabel: string;
  teams: CoachPortalTeam[];
};

type TeamRow = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
};

type AssignmentRow = {
  team_id: string | null;
  category: string | null;
  assignment_role: AssignmentRole;
};

const SUPERVISOR_ROLES = new Set(['admin', 'president', 'sport_director', 'methodology']);

function withCategoryNames(teams: TeamRow[]): CoachPortalTeam[] {
  return teams.map((team) => {
    const category = team.category_slug ? getCanteraCategory(team.category_slug) : null;
    return {
      id: team.id,
      name: team.name,
      category_slug: team.category_slug,
      category_name: category?.name ?? team.category_slug ?? 'Sin categoría',
    };
  });
}

function filterTeamsForAssignments(
  teams: TeamRow[],
  assignments: AssignmentRow[]
): CoachPortalTeam[] {
  if (assignments.length === 0) return [];

  const teamIds = new Set(
    assignments.map((item) => item.team_id).filter((id): id is string => Boolean(id))
  );
  const categories = new Set(
    assignments
      .map((item) => item.category?.trim())
      .filter((value): value is string => Boolean(value))
  );

  const filtered = teams.filter((team) => {
    if (teamIds.has(team.id)) return true;
    if (!team.category_slug) return false;
    const category = getCanteraCategory(team.category_slug);
    if (!category) return false;
    return categories.has(category.name) || categories.has(team.category_slug);
  });

  return withCategoryNames(filtered);
}

/** Demo: entrenador con dos equipos alevín; coordinador ve toda la categoría alevín. */
function demoTeamsForRole(role: string, teams: TeamRow[]): CoachPortalTeam[] {
  const all = withCategoryNames(teams);
  if (SUPERVISOR_ROLES.has(role)) return all;

  if (role === 'coordinator') {
    return all.filter((team) => team.category_slug === 'alevin');
  }

  if (role === 'coach' || role === 'delegate') {
    return all.filter((team) =>
      ['demo-team-alevin-a', 'demo-team-alevin-b'].includes(team.id)
    );
  }

  return all;
}

export function resolveCoachPortalViewMode(role: string, assignments: AssignmentRow[]): CoachPortalViewMode {
  if (SUPERVISOR_ROLES.has(role)) return 'supervisor';
  if (role === 'coordinator' || assignments.some((item) => item.assignment_role === 'stage_coordinator')) {
    return 'coordinator';
  }
  return 'coach';
}

export function coachPortalViewModeLabel(mode: CoachPortalViewMode, teamCount: number): string {
  switch (mode) {
    case 'supervisor':
      return `Supervisión del club · ${teamCount} equipos`;
    case 'coordinator':
      return `Coordinador de etapa · ${teamCount} equipos en tu categoría`;
    default:
      return teamCount === 1
        ? 'Tu equipo'
        : `${teamCount} equipos asignados · selecciona uno`;
  }
}

export async function resolveCoachPortalViewer(input: {
  role: string;
  displayName: string;
  teams: TeamRow[];
  assignments: AssignmentRow[];
  demoMode: boolean;
}): Promise<CoachPortalViewer> {
  const { role, displayName, teams, assignments, demoMode } = input;

  let visible: CoachPortalTeam[];
  if (demoMode) {
    visible = demoTeamsForRole(role, teams);
  } else if (SUPERVISOR_ROLES.has(role)) {
    visible = withCategoryNames(teams);
  } else if (assignments.length > 0) {
    visible = filterTeamsForAssignments(teams, assignments);
  } else {
    visible = [];
  }

  visible.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  const viewMode = resolveCoachPortalViewMode(role, assignments);

  return {
    displayName,
    role,
    viewMode,
    viewModeLabel: coachPortalViewModeLabel(viewMode, visible.length),
    teams: visible,
  };
}

export function coachPortalRoleLabel(role: string): string {
  const profile = role as NonNullable<AccessProfile>;
  return ACCESS_PROFILE_LABELS[profile] ?? role;
}

export function groupTeamsByCategory(teams: CoachPortalTeam[]): {
  categorySlug: CanteraCategorySlug;
  category: string;
  ages: string;
  teams: CoachPortalTeam[];
}[] {
  const groups = new Map<CanteraCategorySlug, CoachPortalTeam[]>();
  for (const category of CANTERA_CATEGORIES) {
    groups.set(category.slug, []);
  }

  for (const team of teams) {
    const slug =
      team.category_slug ?? resolveTeamCategorySlug(team.category_name, team.category_slug);
    if (slug && groups.has(slug)) {
      groups.get(slug)!.push(team);
      continue;
    }

    const byName = CANTERA_CATEGORIES.find(
      (category) => category.name.toLowerCase() === team.category_name.toLowerCase()
    );
    if (byName) groups.get(byName.slug)!.push(team);
  }

  for (const [, list] of groups) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }

  return CANTERA_CATEGORIES.map((category) => ({
    categorySlug: category.slug,
    category: category.name,
    ages: category.ages,
    teams: groups.get(category.slug) ?? [],
  })).filter((group) => group.teams.length > 0);
}
