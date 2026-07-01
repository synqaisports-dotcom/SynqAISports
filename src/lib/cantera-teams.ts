import type { CanteraCategorySlug } from '@/lib/cantera-categories';

export const TEAM_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function teamLetterOptions(usedLetters: string[] = []) {
  const used = new Set(usedLetters.map((letter) => letter.toUpperCase()));
  return TEAM_LETTERS.map((letter) => ({
    value: letter,
    label: letter,
    disabled: used.has(letter),
  })).filter((opt) => !opt.disabled);
}

export function formatTeamName(categoryName: string, letter: string): string {
  return `${categoryName} ${letter.toUpperCase()}`;
}

export type TeamRecord = {
  id: string;
  name: string;
  category: string;
  category_slug: CanteraCategorySlug | null;
  team_letter: string | null;
  sport: string;
  active: boolean;
  player_count?: number;
};

export const DEMO_CANTERA_TEAMS: TeamRecord[] = [
  {
    id: 'demo-team-debutantes-a',
    name: 'Debutantes A',
    category: 'Debutantes',
    category_slug: 'debutantes',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 12,
  },
  {
    id: 'demo-team-prebenjamin-a',
    name: 'Prebenjamín A',
    category: 'Prebenjamín',
    category_slug: 'prebenjamin',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 14,
  },
  {
    id: 'demo-team-benjamin-a',
    name: 'Benjamín A',
    category: 'Benjamín',
    category_slug: 'benjamin',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 16,
  },
  {
    id: 'demo-team-alevin-a',
    name: 'Alevín A',
    category: 'Alevín',
    category_slug: 'alevin',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 18,
  },
  {
    id: 'demo-team-alevin-b',
    name: 'Alevín B',
    category: 'Alevín',
    category_slug: 'alevin',
    team_letter: 'B',
    sport: 'football',
    active: true,
    player_count: 16,
  },
  {
    id: 'demo-team-infantil-a',
    name: 'Infantil A',
    category: 'Infantil',
    category_slug: 'infantil',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 20,
  },
  {
    id: 'demo-team-cadete-a',
    name: 'Cadete A',
    category: 'Cadete',
    category_slug: 'cadete',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 22,
  },
  {
    id: 'demo-team-juvenil-a',
    name: 'Juvenil A',
    category: 'Juvenil',
    category_slug: 'juvenil',
    team_letter: 'A',
    sport: 'football',
    active: true,
    player_count: 24,
  },
];

export type DemoTeamPlayer = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  photo_url: string | null;
  jersey_number: number | null;
};

export const DEMO_TEAM_PLAYERS: DemoTeamPlayer[] = [
  {
    id: 'demo-pl-deb-1',
    team_id: 'demo-team-debutantes-a',
    first_name: 'Lucas',
    last_name: 'Martín',
    position: 'DL',
    photo_url: null,
    jersey_number: 7,
  },
  {
    id: 'demo-pl-deb-2',
    team_id: 'demo-team-debutantes-a',
    first_name: 'Sofía',
    last_name: 'López',
    position: 'MC',
    photo_url: null,
    jersey_number: 10,
  },
  {
    id: 'demo-pl-pre-1',
    team_id: 'demo-team-prebenjamin-a',
    first_name: 'Hugo',
    last_name: 'Ramírez',
    position: 'POR',
    photo_url: null,
    jersey_number: 1,
  },
  {
    id: 'demo-pl-ben-1',
    team_id: 'demo-team-benjamin-a',
    first_name: 'Pablo',
    last_name: 'Navarro',
    position: 'DF',
    photo_url: null,
    jersey_number: 4,
  },
  {
    id: 'demo-pl-ale-1',
    team_id: 'demo-team-alevin-a',
    first_name: 'Diego',
    last_name: 'Castro',
    position: 'EXT',
    photo_url: null,
    jersey_number: 11,
  },
  {
    id: 'demo-pl-inf-1',
    team_id: 'demo-team-infantil-a',
    first_name: 'Álvaro',
    last_name: 'Iglesias',
    position: 'MC',
    photo_url: null,
    jersey_number: 8,
  },
  {
    id: 'demo-pl-cad-1',
    team_id: 'demo-team-cadete-a',
    first_name: 'Marcos',
    last_name: 'Vega',
    position: 'DL',
    photo_url: null,
    jersey_number: 9,
  },
  {
    id: 'demo-pl-juv-1',
    team_id: 'demo-team-juvenil-a',
    first_name: 'Iván',
    last_name: 'Herrera',
    position: 'LT',
    photo_url: null,
    jersey_number: 2,
  },
];

export function playerDisplayName(firstName: string | null, lastName: string | null, fallback: string) {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  return full || fallback;
}
