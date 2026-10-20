import type { StaffProfile } from '@/lib/staff-profile';
import type { AssignmentRole } from '@/lib/person-assignments';

export type TeamCoachingRoleKey =
  | 'academy_director'
  | 'stage_coordinator'
  | 'head_coach'
  | 'assistant_coach'
  | 'epr'
  | 'delegate'
  | 'physical_trainer';

export type TeamCoachingRoleCard = {
  key: TeamCoachingRoleKey;
  label: string;
  person: StaffProfile | null;
};

export const TEAM_COACHING_ROLE_LABELS: Record<TeamCoachingRoleKey, string> = {
  academy_director: 'Director de cantera',
  stage_coordinator: 'Coordinador de etapa',
  head_coach: 'Primer entrenador',
  assistant_coach: 'Segundo entrenador',
  epr: 'EPR',
  delegate: 'Delegado',
  physical_trainer: 'Preparador físico',
};

const TEAM_COACHING_ROLE_ORDER: TeamCoachingRoleKey[] = [
  'academy_director',
  'stage_coordinator',
  'head_coach',
  'assistant_coach',
  'epr',
  'delegate',
  'physical_trainer',
];

type TeamTarget = {
  id: string;
  name: string;
  category: string;
};

function personAssignedToTeam(person: StaffProfile, team: TeamTarget): boolean {
  if (person.assignments.some((assignment) => assignment.team_id === team.id)) {
    return true;
  }
  if (!person.sport_teams) return false;
  return person.sport_teams
    .split(',')
    .map((item) => item.trim())
    .includes(team.name);
}

function findByAssignment(
  staff: StaffProfile[],
  team: TeamTarget,
  role: AssignmentRole,
  options?: { categoryLevel?: boolean }
): StaffProfile | null {
  return (
    staff.find((person) =>
      person.assignments.some((assignment) => {
        if (assignment.assignment_role !== role) return false;
        if (options?.categoryLevel) {
          return assignment.category === team.category && !assignment.team_id;
        }
        return assignment.team_id === team.id;
      })
    ) ??
    staff.find((person) => {
      if (!personAssignedToTeam(person, team)) return false;
      return person.assignments.some((assignment) => assignment.assignment_role === role);
    }) ??
    null
  );
}

function findAcademyDirector(staff: StaffProfile[]): StaffProfile | null {
  return (
    staff.find((person) => person.access_profile === 'sport_director') ??
    staff.find((person) => /director.*cantera/i.test(person.sport_role ?? '')) ??
    null
  );
}

function findBySportRoleHint(
  staff: StaffProfile[],
  team: TeamTarget,
  pattern: RegExp
): StaffProfile | null {
  return (
    staff.find(
      (person) =>
        personAssignedToTeam(person, team) && pattern.test(person.sport_role ?? '')
    ) ?? null
  );
}

export function buildTeamCoachingStaffCards(
  team: TeamTarget,
  staff: StaffProfile[]
): TeamCoachingRoleCard[] {
  const sportStaff = staff.filter(
    (person) => person.person_kind === 'sport' || person.person_kind === 'mixed'
  );

  const resolvePerson = (key: TeamCoachingRoleKey): StaffProfile | null => {
    switch (key) {
      case 'academy_director':
        return findAcademyDirector(sportStaff);
      case 'stage_coordinator':
        return (
          findByAssignment(sportStaff, team, 'stage_coordinator', { categoryLevel: true }) ??
          findByAssignment(sportStaff, team, 'stage_coordinator') ??
          sportStaff.find((person) => person.access_profile === 'coordinator') ??
          null
        );
      case 'head_coach':
        return (
          findByAssignment(sportStaff, team, 'coach') ??
          findBySportRoleHint(sportStaff, team, /entrenador/i) ??
          null
        );
      case 'assistant_coach':
        return (
          findByAssignment(sportStaff, team, 'assistant_coach') ??
          findBySportRoleHint(sportStaff, team, /2.?ª?\s*entrenador|segundo entrenador/i) ??
          null
        );
      case 'epr':
        return (
          findByAssignment(sportStaff, team, 'goalkeeper_coach') ??
          findBySportRoleHint(sportStaff, team, /epr|porter/i) ??
          null
        );
      case 'delegate':
        return (
          findByAssignment(sportStaff, team, 'delegate') ??
          findBySportRoleHint(sportStaff, team, /delegad/i) ??
          null
        );
      case 'physical_trainer':
        return (
          findByAssignment(sportStaff, team, 'physical_trainer') ??
          findBySportRoleHint(sportStaff, team, /preparador f[ií]sico/i) ??
          null
        );
      default:
        return null;
    }
  };

  return TEAM_COACHING_ROLE_ORDER.map((key) => ({
    key,
    label: TEAM_COACHING_ROLE_LABELS[key],
    person: resolvePerson(key),
  }));
}
