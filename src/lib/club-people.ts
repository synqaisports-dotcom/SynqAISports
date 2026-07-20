export type PersonKind = 'sport' | 'institutional' | 'mixed';

export type AccessProfile =
  | 'president'
  | 'sport_director'
  | 'methodology'
  | 'coordinator'
  | 'treasurer'
  | 'coach'
  | 'admin'
  | 'delegate'
  | 'none'
  | null;

export type ClubPerson = {
  id: string;
  club_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  person_kind: PersonKind;
  institutional_role: string | null;
  sport_role: string | null;
  access_profile: AccessProfile;
  user_id: string | null;
  notes: string | null;
  photo_url: string | null;
  medical_until: string | null;
  sport_teams: string | null;
  documents_json?: unknown;
};

export const PERSON_KIND_LABELS: Record<PersonKind, string> = {
  sport: 'Cuerpo técnico',
  institutional: 'Estructura no deportiva',
  mixed: 'Mixto',
};

export const ACCESS_PROFILE_LABELS: Record<NonNullable<AccessProfile>, string> = {
  president: 'Presidente',
  sport_director: 'Director deportivo',
  methodology: 'Metodología',
  coordinator: 'Coordinador de etapa',
  treasurer: 'Tesorero',
  coach: 'Entrenador',
  admin: 'Administración',
  delegate: 'Delegado',
  none: 'Sin acceso portal',
};

export const DEMO_CLUB_PEOPLE: ClubPerson[] = [
  {
    id: 'demo-person-sport-1',
    club_id: 'demo',
    full_name: 'Carlos Méndez',
    email: 'carlos@demo.club',
    phone: '+34 600 111 001',
    person_kind: 'sport',
    institutional_role: null,
    sport_role: 'Entrenador Sub-14 A',
    access_profile: 'coach',
    user_id: null,
    notes: null,
    photo_url: null,
    medical_until: '2026-08-15',
    sport_teams: 'Infantil A',
  },
  {
    id: 'demo-person-sport-2',
    club_id: 'demo',
    full_name: 'Laura Ruiz',
    email: 'laura@demo.club',
    phone: null,
    person_kind: 'sport',
    institutional_role: null,
    sport_role: '2ª entrenadora Sub-16',
    access_profile: 'coach',
    user_id: null,
    notes: null,
    photo_url: null,
    medical_until: null,
    sport_teams: 'Cadete B',
  },
  {
    id: 'demo-person-sport-3',
    club_id: 'demo',
    full_name: 'Miguel Soto',
    email: null,
    phone: null,
    person_kind: 'mixed',
    institutional_role: null,
    sport_role: 'Preparador físico',
    access_profile: 'coach',
    user_id: null,
    notes: null,
    photo_url: null,
    medical_until: '2026-11-01',
    sport_teams: 'Cadete A, Juvenil A',
  },
  {
    id: 'demo-person-inst-1',
    club_id: 'demo',
    full_name: 'Ana García',
    email: 'presidenta@demo.club',
    phone: '+34 600 222 002',
    person_kind: 'institutional',
    institutional_role: 'Presidenta',
    sport_role: null,
    access_profile: 'president',
    user_id: null,
    notes: null,
    photo_url: null,
    medical_until: null,
    sport_teams: null,
  },
  {
    id: 'demo-person-inst-2',
    club_id: 'demo',
    full_name: 'Javier Ortega',
    email: 'tesorero@demo.club',
    phone: null,
    person_kind: 'institutional',
    institutional_role: 'Tesorero',
    sport_role: null,
    access_profile: 'treasurer',
    user_id: null,
    notes: null,
    photo_url: null,
    medical_until: null,
    sport_teams: null,
  },
];

export function peopleById(people: ClubPerson[]): Map<string, ClubPerson> {
  return new Map(people.map((person) => [person.id, person]));
}

export function displayPersonName(person: ClubPerson | undefined): string {
  if (!person) return 'Por asignar';
  return person.full_name;
}

export function personSubtitle(person: ClubPerson): string {
  if (person.person_kind === 'institutional' && person.institutional_role) {
    return person.institutional_role;
  }
  if (person.sport_role) return person.sport_role;
  return PERSON_KIND_LABELS[person.person_kind];
}

export function filterPeopleByKind(people: ClubPerson[], kinds: PersonKind[]): ClubPerson[] {
  return people.filter((person) => kinds.includes(person.person_kind));
}

export type PersonSelectGroup = {
  label: string;
  options: { value: string; label: string }[];
};

export function sportAccessProfileOptions() {
  const sportKeys: NonNullable<AccessProfile>[] = [
    'sport_director',
    'methodology',
    'coordinator',
    'coach',
    'delegate',
    'admin',
    'none',
  ];
  return sportKeys.map((value) => ({ value, label: ACCESS_PROFILE_LABELS[value] }));
}

export function accessProfileOptions() {
  return Object.entries(ACCESS_PROFILE_LABELS).map(([value, label]) => ({ value, label }));
}

export function buildPersonSelectGroups(people: ClubPerson[]): PersonSelectGroup[] {
  const sport = filterPeopleByKind(people, ['sport', 'mixed']);
  const institutional = filterPeopleByKind(people, ['institutional', 'mixed']);

  const groups: PersonSelectGroup[] = [
    {
      label: 'Asignación',
      options: [{ value: '', label: 'Vacante' }],
    },
  ];

  if (sport.length > 0) {
    groups.push({
      label: 'Cuerpo técnico',
      options: sport.map((person) => ({
        value: person.id,
        label: `${person.full_name}${person.sport_role ? ` · ${person.sport_role}` : ''}`,
      })),
    });
  }

  if (institutional.length > 0) {
    groups.push({
      label: 'Estructura no deportiva',
      options: institutional.map((person) => ({
        value: person.id,
        label: `${person.full_name}${person.institutional_role ? ` · ${person.institutional_role}` : ''}`,
      })),
    });
  }

  return groups;
}
