import {
  CANTERA_CATEGORIES,
  type CanteraCategorySlug,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import type { TeamOption } from '@/lib/person-assignments';
import { medicalStatus } from '@/lib/profile-row';
import type { StaffProfile } from '@/lib/staff-profile';

export type StaffCategoryStats = {
  categorySlug: CanteraCategorySlug;
  categoryName: string;
  ages: string;
  borderClass: string;
  badgeClass: string;
  teams: number;
  staff: number;
  medicalOk: number;
};

type TeamRow = TeamOption & { category_slug?: string | null };

function teamCategorySlug(team: TeamRow): CanteraCategorySlug | null {
  return resolveTeamCategorySlug(team.category, team.category_slug);
}

export function staffBelongsToCategory(
  person: StaffProfile,
  categorySlug: CanteraCategorySlug,
  teams: TeamRow[]
): boolean {
  const categoryName = CANTERA_CATEGORIES.find((item) => item.slug === categorySlug)?.name;

  for (const assignment of person.assignments) {
    if (assignment.team_id) {
      const team = teams.find((item) => item.id === assignment.team_id);
      if (team && teamCategorySlug(team) === categorySlug) return true;
    }
    if (assignment.category) {
      const slug = resolveTeamCategorySlug(assignment.category, null);
      if (slug === categorySlug) return true;
    }
  }

  if (person.sport_teams) {
    const sportTeams = person.sport_teams.toLowerCase();
    for (const team of teams) {
      if (sportTeams.includes(team.name.toLowerCase()) && teamCategorySlug(team) === categorySlug) {
        return true;
      }
    }
    if (categoryName && sportTeams.includes(categoryName.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export function buildStaffCategoryStats(
  profiles: StaffProfile[],
  teams: TeamRow[]
): StaffCategoryStats[] {
  return CANTERA_CATEGORIES.map((category) => {
    const categoryTeams = teams.filter((team) => teamCategorySlug(team) === category.slug);
    const staffInCategory = profiles.filter((person) =>
      staffBelongsToCategory(person, category.slug, teams)
    );
    const medicalOk = staffInCategory.filter((person) => medicalStatus(person).ok).length;

    return {
      categorySlug: category.slug,
      categoryName: category.name,
      ages: category.ages,
      borderClass: category.borderClass,
      badgeClass: category.badgeClass,
      teams: categoryTeams.length,
      staff: staffInCategory.length,
      medicalOk,
    };
  });
}
