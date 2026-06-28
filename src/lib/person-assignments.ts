import type { AccessProfile } from '@/lib/club-people';

export type TeamOption = {
  id: string;
  name: string;
  category: string;
};

export const DEMO_TEAMS: TeamOption[] = [
  { id: 'demo-team-u14a', name: 'Sub-14 A', category: 'Sub-14' },
  { id: 'demo-team-u14b', name: 'Sub-14 B', category: 'Sub-14' },
  { id: 'demo-team-u16a', name: 'Sub-16 A', category: 'Sub-16' },
  { id: 'demo-team-u16b', name: 'Sub-16 B', category: 'Sub-16' },
  { id: 'demo-team-u18', name: 'Sub-18', category: 'Sub-18' },
];

export type AssignmentRole =
  | 'coach'
  | 'assistant_coach'
  | 'delegate'
  | 'physical_trainer'
  | 'stage_coordinator'
  | 'goalkeeper_coach';

export const ASSIGNMENT_ROLE_LABELS: Record<AssignmentRole, string> = {
  coach: 'Entrenador',
  assistant_coach: '2º entrenador',
  delegate: 'Delegado',
  physical_trainer: 'Preparador físico',
  stage_coordinator: 'Coordinador de etapa',
  goalkeeper_coach: 'Entrenador de porteros',
};

export type PersonAssignment = {
  id?: string;
  person_id: string;
  team_id: string | null;
  category: string | null;
  assignment_role: AssignmentRole;
};

export type PersonAssignmentInput = {
  teamId: string | null;
  category: string | null;
  assignmentRole: AssignmentRole;
};

export function defaultAssignmentRoleForProfile(profile: AccessProfile): AssignmentRole {
  switch (profile) {
    case 'coordinator':
      return 'stage_coordinator';
    case 'delegate':
      return 'delegate';
    default:
      return 'coach';
  }
}

export function assignmentModeForProfile(
  profile: AccessProfile
): 'teams' | 'category' | 'none' {
  if (profile === 'coordinator') return 'category';
  if (
    profile === 'coach' ||
    profile === 'delegate' ||
    profile === 'methodology' ||
    profile === 'admin'
  ) {
    return 'teams';
  }
  if (profile === 'sport_director' || profile === 'none' || profile === 'president') {
    return 'none';
  }
  return 'teams';
}

export function uniqueCategories(teams: TeamOption[]): string[] {
  return [...new Set(teams.map((team) => team.category))].sort((a, b) => a.localeCompare(b));
}

export function formatAssignmentSummary(
  assignments: PersonAssignment[],
  teams: TeamOption[]
): string {
  if (assignments.length === 0) return '';
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const labels = assignments.map((assignment) => {
    if (assignment.team_id) {
      const team = teamById.get(assignment.team_id);
      return team ? `${ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} · ${team.name}` : '';
    }
    if (assignment.category) {
      return `${ASSIGNMENT_ROLE_LABELS[assignment.assignment_role]} · ${assignment.category}`;
    }
    return '';
  });
  return labels.filter(Boolean).join(', ');
}

export function parseAssignmentsJson(raw: string): PersonAssignmentInput[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as PersonAssignmentInput[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row) =>
        row.assignmentRole &&
        (row.teamId || (row.category && row.category.trim()))
    );
  } catch {
    return [];
  }
}
