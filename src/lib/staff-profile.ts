import type { ClubPerson } from '@/lib/club-people';
import { ACCESS_PROFILE_LABELS } from '@/lib/club-people';
import {
  ASSIGNMENT_ROLE_LABELS,
  formatAssignmentSummary,
  type PersonAssignment,
  type TeamOption,
} from '@/lib/person-assignments';

export type StaffProfile = ClubPerson & {
  assignments: PersonAssignment[];
  teams_label: string;
};

export type StaffListSortMode = 'name-asc' | 'name-desc';

export function buildStaffProfile(
  person: ClubPerson,
  assignments: PersonAssignment[],
  teams: TeamOption[]
): StaffProfile {
  return {
    ...person,
    assignments,
    teams_label: formatAssignmentSummary(assignments, teams) || person.sport_teams || '',
  };
}

export function staffSortKey(person: StaffProfile): string {
  return person.full_name.trim().toLowerCase();
}

export function compareStaffForList(
  a: StaffProfile,
  b: StaffProfile,
  mode: StaffListSortMode
): number {
  const cmp = staffSortKey(a).localeCompare(staffSortKey(b), 'es');
  return mode === 'name-asc' ? cmp : -cmp;
}

export function staffAssignedToTeam(
  person: StaffProfile,
  teamId: string,
  teams: TeamOption[] = []
): boolean {
  if (person.assignments.some((assignment) => assignment.team_id === teamId)) {
    return true;
  }
  const team = teams.find((item) => item.id === teamId);
  if (!team || !person.sport_teams) return false;
  return person.sport_teams.includes(team.name);
}

export function staffAccessProfileLabel(person: StaffProfile): string {
  if (!person.access_profile || person.access_profile === 'none') return 'Sin acceso portal';
  return ACCESS_PROFILE_LABELS[person.access_profile];
}

export function staffAssignmentRows(
  person: StaffProfile,
  teams: TeamOption[]
): { label: string; href?: string }[] {
  if (person.assignments.length === 0) {
    return person.teams_label ? [{ label: person.teams_label }] : [];
  }

  const teamById = new Map(teams.map((team) => [team.id, team]));
  return person.assignments.map((assignment) => {
    if (assignment.team_id) {
      const team = teamById.get(assignment.team_id);
      return {
        label: `${ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} · ${team?.name ?? 'Equipo'}`,
        href: `/portal/cantera/equipos?team=${assignment.team_id}`,
      };
    }
    if (assignment.category) {
      return {
        label: `${ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} · ${assignment.category}`,
      };
    }
    return { label: ASSIGNMENT_ROLE_LABELS[assignment.assignment_role] };
  });
}
