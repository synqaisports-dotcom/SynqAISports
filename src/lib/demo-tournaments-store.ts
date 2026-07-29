import { getDemoClubIdFallback } from '@/lib/demo-constants';
import { generateMultifinalCompetition } from '@/lib/tournament-brackets';
import { generateAccessToken, generateInviteToken, hashToken } from '@/lib/tournament-tokens';
import type {
  Tournament,
  TournamentBundle,
  TournamentCategory,
  TournamentDossier,
  TournamentField,
  TournamentGroup,
  TournamentMatch,
  TournamentPhase,
  TournamentSponsor,
  TournamentTeam,
  TournamentTicket,
  TournamentTicketType,
} from '@/lib/tournaments';
import { DEFAULT_PLACEMENT_BRACKETS } from '@/lib/tournaments';

const clubId = getDemoClubIdFallback();
const tournamentId = 'demo-tournament-1';
const categorySub10Id = 'demo-cat-sub10';
const categorySub12Id = 'demo-cat-sub12';
const groupPhaseId = 'demo-phase-groups';
const field1Id = 'demo-field-1';
const field2Id = 'demo-field-2';

const now = new Date();
const weekendStart = new Date(now);
weekendStart.setDate(weekendStart.getDate() + ((6 - weekendStart.getDay() + 7) % 7) || 7);
weekendStart.setHours(9, 0, 0, 0);
const weekendEnd = new Date(weekendStart);
weekendEnd.setDate(weekendEnd.getDate() + 1);
weekendEnd.setHours(20, 0, 0, 0);

export const DEMO_TOURNAMENT: Tournament = {
  id: tournamentId,
  club_id: clubId,
  tenant_type: 'club',
  name: 'Torneo Ciudad de Madrid',
  slug: 'torneo-ciudad-madrid',
  sport_key: 'football',
  status: 'registration_open',
  starts_at: weekendStart.toISOString(),
  ends_at: weekendEnd.toISOString(),
  description:
    'Torneo de fin de semana multideporte con categorías Sub-10 y Sub-12. Fase de grupos y finales paralelas Platinum, Gold, Silver y Bronze.',
  rules_text: 'Partidos de 2×20 min. Empate en eliminatorias: penaltis. Máximo 12 jugadores por plantilla.',
  cover_image_url: null,
  venue_name: 'Polideportivo Municipal Norte',
  venue_map_url: null,
  venue_images_json: [],
  format_json: { weekend_mode: true, multifinal: true },
  registration_config_json: { max_teams_per_category: 24, deadline_days_before: 3 },
  ticketing_config_json: { projected_attendance: 600, gate_enabled: true },
  revenue_estimates_json: {
    ticketing: { projected_attendance: 600, avg_ticket_cents: 500 },
    sponsorship: { gold_slots: 2, silver_slots: 4, bronze_slots: 6, estimated_total_cents: 510000 },
    signage: { impressions_per_day: 1800, cpm_cents: 800 },
  },
  public_enabled: true,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
};

export const DEMO_CATEGORIES: TournamentCategory[] = [
  {
    id: categorySub10Id,
    tournament_id: tournamentId,
    name: 'Sub-10',
    sport_key: 'football',
    groups_count: 6,
    teams_per_group: 4,
    format_type: 'groups_multifinal',
    placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS,
    sort_order: 0,
  },
  {
    id: categorySub12Id,
    tournament_id: tournamentId,
    name: 'Sub-12',
    sport_key: 'football',
    groups_count: 4,
    teams_per_group: 4,
    format_type: 'groups_multifinal',
    placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS,
    sort_order: 1,
  },
];

export const DEMO_FIELDS: TournamentField[] = [
  { id: field1Id, tournament_id: tournamentId, facility_id: null, label: 'Campo 1', map_url: null, notes: 'Césped artificial', sort_order: 0 },
  { id: field2Id, tournament_id: tournamentId, facility_id: null, label: 'Campo 2', map_url: null, notes: null, sort_order: 1 },
];

export const DEMO_SPONSORS: TournamentSponsor[] = [
  { id: 'demo-ts-1', tournament_id: tournamentId, name: 'Deportes López', logo_url: null, tier: 'gold', url: null, notes: null, sort_order: 0, active: true },
  { id: 'demo-ts-2', tournament_id: tournamentId, name: 'Agua Pura', logo_url: null, tier: 'silver', url: null, notes: null, sort_order: 1, active: true },
  { id: 'demo-ts-3', tournament_id: tournamentId, name: 'Panadería Gol', logo_url: null, tier: 'bronze', url: null, notes: null, sort_order: 2, active: true },
];

function buildDemoTeams(categoryId: string, prefix: string, groupsCount: number): TournamentTeam[] {
  const teams: TournamentTeam[] = [];
  const letters = 'ABCDEF';
  let idx = 0;
  for (let g = 0; g < groupsCount; g++) {
    const code = letters[g];
    for (let p = 1; p <= 4; p++) {
      idx++;
      teams.push({
        id: `demo-team-${categoryId}-${code}${p}`,
        tournament_id: tournamentId,
        category_id: categoryId,
        club_team_id: null,
        name: `${prefix} ${code}${p}`,
        external_club_name: `Club ${code}${p}`,
        contact_name: `Delegado ${code}${p}`,
        contact_email: `delegado${idx}@demo.test`,
        contact_phone: null,
        logo_url: null,
        status: idx <= groupsCount * 3 ? 'confirmed' : 'invited',
        invite_token: generateInviteToken(),
        group_code: code,
        group_position: null,
        squad_json: [
          { id: `p-${idx}-1`, name: 'Portero', dorsal: 1 },
          { id: `p-${idx}-2`, name: 'Defensa 1', dorsal: 4 },
          { id: `p-${idx}-3`, name: 'Defensa 2', dorsal: 5 },
          { id: `p-${idx}-4`, name: 'Medio 1', dorsal: 8 },
          { id: `p-${idx}-5`, name: 'Medio 2', dorsal: 10 },
          { id: `p-${idx}-6`, name: 'Delantero', dorsal: 9 },
        ],
        confirmed_at: idx <= groupsCount * 3 ? now.toISOString() : null,
        notes: null,
      });
    }
  }
  return teams;
}

function materializeStructure(
  category: TournamentCategory,
  teams: TournamentTeam[]
): { phases: TournamentPhase[]; groups: TournamentGroup[]; matches: TournamentMatch[] } {
  let counter = 0;
  const nextId = () => `demo-gen-${category.id}-${++counter}`;
  const structure = generateMultifinalCompetition(category, nextId);

  const phaseIdMap = new Map(structure.phases.map((p) => [p.temp_id, `demo-phase-${category.id}-${p.bracket_key}`]));
  const groupIdMap = new Map(structure.groups.map((g) => [g.temp_id, `demo-group-${category.id}-${g.code}`]));

  const phases: TournamentPhase[] = structure.phases.map((p) => ({
    id: phaseIdMap.get(p.temp_id)!,
    tournament_id: tournamentId,
    category_id: category.id,
    phase_type: p.phase_type,
    bracket_key: p.bracket_key,
    name: p.name,
    group_position_source: p.group_position_source,
    sort_order: p.sort_order,
  }));

  const groups: TournamentGroup[] = structure.groups.map((g) => ({
    id: groupIdMap.get(g.temp_id)!,
    phase_id: phaseIdMap.get(g.phase_id)!,
    tournament_id: tournamentId,
    category_id: category.id,
    code: g.code,
    name: g.name,
    sort_order: g.sort_order,
  }));

  const teamsByGroup = new Map<string, TournamentTeam[]>();
  for (const t of teams) {
    if (!t.group_code) continue;
    const list = teamsByGroup.get(t.group_code) ?? [];
    list.push(t);
    teamsByGroup.set(t.group_code, list);
  }

  const matches: TournamentMatch[] = structure.matches.map((m, i) => {
    const groupId = m.group_id ? groupIdMap.get(m.group_id) ?? null : null;
    let homeId = m.home_team_id;
    let awayId = m.away_team_id;

    if (m.round_key === 'group' && groupId) {
      const group = groups.find((g) => g.id === groupId);
      const meta = m.metadata_json as { placeholder_home?: string; placeholder_away?: string };
      const groupTeams = group ? teamsByGroup.get(group.code) ?? [] : [];
      const homeIdx = meta.placeholder_home ? parseInt(meta.placeholder_home.split('-t')[1] ?? '1', 10) - 1 : 0;
      const awayIdx = meta.placeholder_away ? parseInt(meta.placeholder_away.split('-t')[1] ?? '2', 10) - 1 : 1;
      homeId = groupTeams[homeIdx]?.id ?? null;
      awayId = groupTeams[awayIdx]?.id ?? null;
    }

    const scheduled = new Date(weekendStart);
    scheduled.setHours(9 + Math.floor(i / 4), (i % 4) * 15, 0, 0);

    return {
      id: `demo-match-${category.id}-${i + 1}`,
      tournament_id: tournamentId,
      category_id: category.id,
      phase_id: phaseIdMap.get(m.phase_id)!,
      group_id: groupId,
      bracket_key: m.bracket_key,
      round_key: m.round_key,
      match_number: m.match_number,
      home_team_id: homeId,
      away_team_id: awayId,
      field_id: i % 2 === 0 ? field1Id : field2Id,
      scheduled_at: scheduled.toISOString(),
      status: i < 3 ? 'finished' : i === 3 ? 'live' : 'scheduled',
      score_home: i < 3 ? [2, 1, 3][i] ?? 0 : i === 3 ? 1 : 0,
      score_away: i < 3 ? [1, 1, 0][i] ?? 0 : i === 3 ? 0 : 0,
      score_penalties_home: null,
      score_penalties_away: null,
      went_to_penalties: false,
      mesa_token: generateAccessToken(),
      mesa_token_expires_at: weekendEnd.toISOString(),
      live_started_at: i === 3 ? now.toISOString() : null,
      live_finished_at: i < 3 ? scheduled.toISOString() : null,
      events_json: [],
      metadata_json: m.metadata_json,
    };
  });

  return { phases, groups, matches };
}

const sub10Teams = buildDemoTeams(categorySub10Id, 'Sub10', 6);
const sub12Teams = buildDemoTeams(categorySub12Id, 'Sub12', 4);
const sub10Structure = materializeStructure(DEMO_CATEGORIES[0], sub10Teams);
const sub12Structure = materializeStructure(DEMO_CATEGORIES[1], sub12Teams);

export const DEMO_TEAMS: TournamentTeam[] = [...sub10Teams, ...sub12Teams];
export const DEMO_PHASES: TournamentPhase[] = [...sub10Structure.phases, ...sub12Structure.phases];
export const DEMO_GROUPS: TournamentGroup[] = [...sub10Structure.groups, ...sub12Structure.groups];
export const DEMO_MATCHES: TournamentMatch[] = [...sub10Structure.matches, ...sub12Structure.matches];

export const DEMO_DOSSIERS: TournamentDossier[] = [
  {
    id: 'demo-dossier-inv',
    tournament_id: tournamentId,
    dossier_type: 'invitation',
    version: 1,
    pdf_url: null,
    content_json: { title: 'Invitación oficial', sections: ['fechas', 'formato', 'inscripción'] },
    generated_at: now.toISOString(),
  },
];

export const DEMO_TICKET_TYPES: TournamentTicketType[] = [
  {
    id: 'demo-tt-day',
    tournament_id: tournamentId,
    name: 'Entrada día',
    description: 'Acceso todo el día del torneo',
    ticket_scope: 'day',
    price_cents: 500,
    currency: 'EUR',
    valid_for_date: weekendStart.toISOString().slice(0, 10),
    match_id: null,
    max_quantity: 500,
    active: true,
    sort_order: 0,
  },
  {
    id: 'demo-tt-tournament',
    tournament_id: tournamentId,
    name: 'Abono fin de semana',
    description: 'Sábado y domingo',
    ticket_scope: 'tournament',
    price_cents: 800,
    currency: 'EUR',
    valid_for_date: null,
    match_id: null,
    max_quantity: 200,
    active: true,
    sort_order: 1,
  },
];

export const DEMO_TICKETS: TournamentTicket[] = [];

export const DEMO_GATE_TOKEN = generateAccessToken();
export const DEMO_GATE_TOKEN_HASH = hashToken(DEMO_GATE_TOKEN);

type DemoTournamentStore = {
  tournaments: Tournament[];
  categories: TournamentCategory[];
  fields: TournamentField[];
  sponsors: TournamentSponsor[];
  teams: TournamentTeam[];
  phases: TournamentPhase[];
  groups: TournamentGroup[];
  matches: TournamentMatch[];
  dossiers: TournamentDossier[];
  ticketTypes: TournamentTicketType[];
  tickets: TournamentTicket[];
  gateToken: string;
};

const store: DemoTournamentStore = {
  tournaments: [DEMO_TOURNAMENT],
  categories: [...DEMO_CATEGORIES],
  fields: [...DEMO_FIELDS],
  sponsors: [...DEMO_SPONSORS],
  teams: [...DEMO_TEAMS],
  phases: [...DEMO_PHASES],
  groups: [...DEMO_GROUPS],
  matches: [...DEMO_MATCHES],
  dossiers: [...DEMO_DOSSIERS],
  ticketTypes: [...DEMO_TICKET_TYPES],
  tickets: [...DEMO_TICKETS],
  gateToken: DEMO_GATE_TOKEN,
};

export function getDemoTournamentsStore() {
  return store;
}

export function getDemoTournamentBundle(tournamentId: string): TournamentBundle | null {
  const tournament = store.tournaments.find((t) => t.id === tournamentId);
  if (!tournament) return null;
  return {
    tournament,
    categories: store.categories.filter((c) => c.tournament_id === tournamentId),
    fields: store.fields.filter((f) => f.tournament_id === tournamentId),
    sponsors: store.sponsors.filter((s) => s.tournament_id === tournamentId),
    teams: store.teams.filter((t) => t.tournament_id === tournamentId),
    phases: store.phases.filter((p) => p.tournament_id === tournamentId),
    groups: store.groups.filter((g) => g.tournament_id === tournamentId),
    matches: store.matches.filter((m) => m.tournament_id === tournamentId),
    dossiers: store.dossiers.filter((d) => d.tournament_id === tournamentId),
    ticketTypes: store.ticketTypes.filter((tt) => tt.tournament_id === tournamentId),
    tickets: store.tickets.filter((tk) => tk.tournament_id === tournamentId),
  };
}

export function resetDemoTournamentsStore() {
  store.tournaments = [{ ...DEMO_TOURNAMENT }];
  store.categories = [...DEMO_CATEGORIES];
  store.fields = [...DEMO_FIELDS];
  store.sponsors = [...DEMO_SPONSORS];
  store.teams = [...DEMO_TEAMS];
  store.phases = [...DEMO_PHASES];
  store.groups = [...DEMO_GROUPS];
  store.matches = [...DEMO_MATCHES];
  store.dossiers = [...DEMO_DOSSIERS];
  store.ticketTypes = [...DEMO_TICKET_TYPES];
  store.tickets = [];
  store.gateToken = DEMO_GATE_TOKEN;
}

export { clubId as DEMO_TOURNAMENTS_CLUB_ID, tournamentId as DEMO_TOURNAMENT_ID };
