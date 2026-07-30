import { SPORT_LABELS, type ClubSport } from '@/lib/club-facilities';

/** Deportes soportados en torneos (multisport). */
export const TOURNAMENT_SPORTS = [
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'handball',
  'waterpolo',
] as const;

export type TournamentSport = (typeof TOURNAMENT_SPORTS)[number];

export const TOURNAMENT_SPORT_LABELS: Record<TournamentSport, string> = {
  football: SPORT_LABELS.football,
  futsal: SPORT_LABELS.futsal,
  basketball: SPORT_LABELS.basketball,
  volleyball: SPORT_LABELS.volleyball,
  handball: SPORT_LABELS.handball,
  waterpolo: SPORT_LABELS.waterpolo,
};

export const TOURNAMENT_STATUSES = [
  'draft',
  'inviting',
  'registration_open',
  'registration_closed',
  'in_progress',
  'finished',
  'cancelled',
] as const;

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const TOURNAMENT_STATUS_LABELS: Record<TournamentStatus, string> = {
  draft: 'Borrador',
  inviting: 'Invitaciones',
  registration_open: 'Inscripción abierta',
  registration_closed: 'Inscripción cerrada',
  in_progress: 'En juego',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

export const FORMAT_TYPES = [
  'groups_multifinal',
  'league',
  'knockout',
  'groups_knockout',
] as const;

export type FormatType = (typeof FORMAT_TYPES)[number];

export const FORMAT_TYPE_LABELS: Record<FormatType, string> = {
  groups_multifinal: 'Grupos + finales paralelas',
  league: 'Liga',
  knockout: 'Eliminatoria directa',
  groups_knockout: 'Grupos + eliminatoria',
};

export const PHASE_TYPES = [
  'group',
  'placement_bracket',
  'semifinal',
  'final',
  'consolation',
  'third_place',
] as const;

export type PhaseType = (typeof PHASE_TYPES)[number];

export const ROUND_KEYS = [
  'group',
  'r16',
  'qf',
  'sf',
  'final',
  'third_place',
  'consolation_final',
] as const;

export type RoundKey = (typeof ROUND_KEYS)[number];

export const ROUND_KEY_LABELS: Record<RoundKey, string> = {
  group: 'Grupos',
  r16: 'Octavos',
  qf: 'Cuartos',
  sf: 'Semifinal',
  final: 'Final',
  third_place: '3.er puesto',
  consolation_final: 'Final consolación',
};

export const MATCH_STATUSES = [
  'scheduled',
  'live',
  'halftime',
  'finished',
  'cancelled',
  'walkover',
] as const;

export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  scheduled: 'Programado',
  live: 'En vivo',
  halftime: 'Descanso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
  walkover: 'Walkover',
};

export const TEAM_STATUSES = ['invited', 'confirmed', 'rejected', 'withdrawn'] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const TEAM_STATUS_LABELS: Record<TeamStatus, string> = {
  invited: 'Invitado',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado',
};

export const TICKET_SCOPES = ['match', 'day', 'tournament'] as const;
export type TicketScope = (typeof TICKET_SCOPES)[number];

export const SPONSOR_TIERS = ['gold', 'silver', 'bronze'] as const;
export type TournamentSponsorTier = (typeof SPONSOR_TIERS)[number];

/** Bandeja de clasificación por puesto en grupo (Platinum, Silver…). */
export type PlacementBracketConfig = {
  position: number;
  name: string;
  bracket_key: string;
  color?: string;
};

export const DEFAULT_PLACEMENT_BRACKETS: PlacementBracketConfig[] = [
  { position: 1, name: 'Platinum', bracket_key: 'p1', color: '#e8f4fc' },
  { position: 2, name: 'Gold', bracket_key: 'p2', color: '#ffd700' },
  { position: 3, name: 'Silver', bracket_key: 'p3', color: '#c0c0c0' },
  { position: 4, name: 'Bronze', bracket_key: 'p4', color: '#cd7f32' },
];

export const CONSOLATION_BRACKET: PlacementBracketConfig = {
  position: 99,
  name: 'Consolación',
  bracket_key: 'consolation',
  color: '#94a3b8',
};

export type SquadPlayer = {
  id: string;
  name: string;
  dorsal: number | null;
  position?: string;
};

export type TournamentDossierConfig = {
  welcome_message?: string;
  contact_email?: string;
  contact_phone?: string;
  include_sponsors?: boolean;
  hide_ticketing?: boolean;
};

export type Tournament = {
  id: string;
  club_id: string | null;
  tenant_type: 'club' | 'standalone' | 'api_external';
  name: string;
  slug: string;
  sport_key: TournamentSport;
  status: TournamentStatus;
  starts_at: string | null;
  ends_at: string | null;
  description: string | null;
  rules_text: string | null;
  cover_image_url: string | null;
  venue_name: string | null;
  venue_map_url: string | null;
  venue_images_json: string[];
  format_json: Record<string, unknown>;
  registration_config_json: Record<string, unknown>;
  ticketing_config_json: Record<string, unknown>;
  revenue_estimates_json: RevenueEstimates;
  public_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CategorySchedulingWindow = {
  /** Fecha concreta dentro del torneo (YYYY-MM-DD) */
  day_date: string;
  day_start: string;
  day_end: string;
  lunch_break_enabled?: boolean;
  lunch_start?: string;
  lunch_end?: string;
};

export function getCategorySchedulingMap(
  tournament: Pick<Tournament, 'format_json'>
): Record<string, CategorySchedulingWindow> {
  const raw = tournament.format_json?.category_scheduling;
  if (!raw || typeof raw !== 'object') return {};
  return raw as Record<string, CategorySchedulingWindow>;
}

export type TournamentCategory = {
  id: string;
  tournament_id: string;
  name: string;
  sport_key: TournamentSport | null;
  groups_count: number;
  teams_per_group: number;
  format_type: FormatType;
  placement_brackets_json: PlacementBracketConfig[];
  sort_order: number;
};

export const FIELD_DIVISION_MODES = ['full', 'halves_2', 'quarters_4'] as const;
export type FieldDivisionMode = (typeof FIELD_DIVISION_MODES)[number];

export type TournamentField = {
  id: string;
  tournament_id: string;
  facility_id: string | null;
  label: string;
  map_url: string | null;
  notes: string | null;
  sort_order: number;
  /** División física del campo (F11 en mitades = 2 pistas F7). */
  division_mode?: FieldDivisionMode;
};

export type TournamentSponsor = {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  tier: TournamentSponsorTier;
  url: string | null;
  notes: string | null;
  amount_cents: number | null;
  sort_order: number;
  active: boolean;
};

export type TournamentTeam = {
  id: string;
  tournament_id: string;
  category_id: string;
  club_team_id: string | null;
  name: string;
  external_club_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  status: TeamStatus;
  invite_token: string | null;
  group_code: string | null;
  group_position: number | null;
  squad_json: SquadPlayer[];
  confirmed_at: string | null;
  notes: string | null;
};

export type TournamentPhase = {
  id: string;
  tournament_id: string;
  category_id: string;
  phase_type: PhaseType;
  bracket_key: string;
  name: string;
  group_position_source: number | null;
  sort_order: number;
};

export type TournamentGroup = {
  id: string;
  phase_id: string;
  tournament_id: string;
  category_id: string;
  code: string;
  name: string | null;
  sort_order: number;
};

export type MatchEvent = {
  id: string;
  minute: number;
  type: 'goal' | 'penalty' | 'yellow' | 'red' | 'note';
  team_id: string | null;
  player_name?: string;
  description?: string;
};

export type TournamentMatch = {
  id: string;
  tournament_id: string;
  category_id: string;
  phase_id: string | null;
  group_id: string | null;
  bracket_key: string | null;
  round_key: RoundKey;
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  field_id: string | null;
  scheduled_at: string | null;
  status: MatchStatus;
  score_home: number;
  score_away: number;
  score_penalties_home: number | null;
  score_penalties_away: number | null;
  went_to_penalties: boolean;
  mesa_token: string | null;
  mesa_token_expires_at: string | null;
  live_started_at: string | null;
  live_finished_at: string | null;
  events_json: MatchEvent[];
  metadata_json: Record<string, unknown>;
};

export type TournamentDossier = {
  id: string;
  tournament_id: string;
  dossier_type: 'invitation' | 'official';
  version: number;
  pdf_url: string | null;
  content_json: Record<string, unknown>;
  generated_at: string;
};

export type TournamentTicketType = {
  id: string;
  tournament_id: string;
  name: string;
  description: string | null;
  ticket_scope: TicketScope;
  price_cents: number;
  currency: string;
  valid_for_date: string | null;
  match_id: string | null;
  max_quantity: number | null;
  active: boolean;
  sort_order: number;
};

export type TournamentTicket = {
  id: string;
  tournament_id: string;
  ticket_type_id: string;
  purchaser_name: string;
  purchaser_email: string | null;
  qr_code_hash: string;
  qr_payload: string;
  status: 'valid' | 'used' | 'cancelled';
  paid_flag: boolean;
  paid_amount_cents: number;
  valid_for_date: string | null;
  match_id: string | null;
  scanned_at: string | null;
  scanned_by: string | null;
};

export type RevenueEstimates = {
  /** Acompañantes / público estimado × precio medio */
  spectators?: { count: number; unit_cents: number };
  /** Bonos o abonos vendidos */
  bonos?: { count: number; unit_cents: number };
  /** Suma de patrocinadores (gestión SynqAI / costes micro-app) */
  sponsorship?: { total_cents: number };
  signage?: { impressions_per_day: number; cpm_cents: number };
  /** @deprecated usar spectators */
  ticketing?: { projected_attendance: number; avg_ticket_cents: number };
};

export type TournamentBundle = {
  tournament: Tournament;
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
};

export function placementBracketsForCategory(category: Pick<TournamentCategory, 'teams_per_group' | 'placement_brackets_json'>): PlacementBracketConfig[] {
  if (category.placement_brackets_json.length > 0) return category.placement_brackets_json;
  return DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= category.teams_per_group);
}

export function slugifyTournamentName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

export function groupCodeFromIndex(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOP';
  return letters[index] ?? `G${index + 1}`;
}

export function formatMatchScore(match: Pick<TournamentMatch, 'score_home' | 'score_away' | 'went_to_penalties' | 'score_penalties_home' | 'score_penalties_away'>): string {
  if (match.went_to_penalties && match.score_penalties_home != null && match.score_penalties_away != null) {
    return `${match.score_home}-${match.score_away} (${match.score_penalties_home}-${match.score_penalties_away} pen.)`;
  }
  return `${match.score_home}-${match.score_away}`;
}

export function estimateTournamentRevenue(
  sponsors: TournamentSponsor[],
  _ticketTypes: TournamentTicketType[],
  ticketingConfig: Record<string, unknown>,
  existing?: RevenueEstimates
): RevenueEstimates {
  const sponsorshipTotal = sponsors
    .filter((s) => s.active)
    .reduce((sum, s) => {
      const amount =
        s.amount_cents ??
        ({ gold: 150_000, silver: 60_000, bronze: 25_000 } as const)[s.tier];
      return sum + amount;
    }, 0);

  const spectatorCount = Number(
    existing?.spectators?.count ??
      ticketingConfig.projected_attendance ??
      existing?.ticketing?.projected_attendance ??
      400
  );
  const spectatorUnit = Number(
    existing?.spectators?.unit_cents ??
      existing?.ticketing?.avg_ticket_cents ??
      500
  );

  return {
    spectators: { count: spectatorCount, unit_cents: spectatorUnit },
    bonos: existing?.bonos ?? { count: 0, unit_cents: 1500 },
    sponsorship: { total_cents: sponsorshipTotal },
    signage: existing?.signage ?? {
      impressions_per_day: spectatorCount * 3,
      cpm_cents: 800,
    },
  };
}

export function totalEstimatedRevenueCents(estimates: RevenueEstimates): number {
  const spectators =
    (estimates.spectators?.count ?? estimates.ticketing?.projected_attendance ?? 0) *
    (estimates.spectators?.unit_cents ?? estimates.ticketing?.avg_ticket_cents ?? 0);
  const bonos = (estimates.bonos?.count ?? 0) * (estimates.bonos?.unit_cents ?? 0);
  const sponsor = estimates.sponsorship?.total_cents ?? 0;
  const signage =
    ((estimates.signage?.impressions_per_day ?? 0) * (estimates.signage?.cpm_cents ?? 0)) / 1000;
  return Math.round(spectators + bonos + sponsor + signage);
}

export function revenueBreakdownCents(estimates: RevenueEstimates): {
  spectators: number;
  bonos: number;
  sponsorship: number;
  signage: number;
} {
  return {
    spectators:
      (estimates.spectators?.count ?? estimates.ticketing?.projected_attendance ?? 0) *
      (estimates.spectators?.unit_cents ?? estimates.ticketing?.avg_ticket_cents ?? 0),
    bonos: (estimates.bonos?.count ?? 0) * (estimates.bonos?.unit_cents ?? 0),
    sponsorship: estimates.sponsorship?.total_cents ?? 0,
    signage:
      ((estimates.signage?.impressions_per_day ?? 0) * (estimates.signage?.cpm_cents ?? 0)) / 1000,
  };
}

export function isTournamentLive(status: TournamentStatus): boolean {
  return status === 'in_progress';
}

export function isTournamentPublic(tournament: Pick<Tournament, 'public_enabled' | 'status'>): boolean {
  return tournament.public_enabled && tournament.status !== 'draft' && tournament.status !== 'cancelled';
}

export function aggregateTournamentStats(
  tournaments: Tournament[],
  categories: TournamentCategory[],
  teams: TournamentTeam[],
  matches: TournamentMatch[]
) {
  const tournamentIds = new Set(tournaments.map((t) => t.id));
  return {
    categoriesCount: categories.filter((c) => tournamentIds.has(c.tournament_id)).length,
    teamsCount: teams.filter((t) => tournamentIds.has(t.tournament_id)).length,
    liveMatches: matches.filter((m) => tournamentIds.has(m.tournament_id) && m.status === 'live').length,
  };
}

export const TOURNAMENT_SELECT =
  'id, club_id, tenant_type, name, slug, sport_key, status, starts_at, ends_at, description, rules_text, cover_image_url, venue_name, venue_map_url, venue_images_json, format_json, registration_config_json, ticketing_config_json, revenue_estimates_json, public_enabled, created_at, updated_at';

export function parseTournamentSport(value: unknown): TournamentSport {
  if (typeof value === 'string' && (TOURNAMENT_SPORTS as readonly string[]).includes(value)) {
    return value as TournamentSport;
  }
  return 'football';
}

export function isClubSportForTournament(sport: ClubSport): sport is TournamentSport {
  return (TOURNAMENT_SPORTS as readonly string[]).includes(sport);
}
