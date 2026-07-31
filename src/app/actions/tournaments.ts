'use server';

import { requireClubId } from '@/lib/auth-staff';
import {
  DEMO_TOURNAMENT_ID,
  DEMO_TOURNAMENTS_CLUB_ID,
  getDemoTournamentBundle,
  getDemoTournamentsStore,
} from '@/lib/demo-tournaments-store';
import { isDemoActive } from '@/lib/demo';
import { generateMultifinalCompetition } from '@/lib/tournament-brackets';
import { buildTournamentPlayerMetrics } from '@/lib/tournament-summary';
import {
  analyzeCategoryCapacity,
  suggestCategoryWindows,
  validateCategoryWindows,
} from '@/lib/tournament-category-scheduling';
import {
  calculateTournamentSchedule,
  resolveSchedulingConfig,
  type TournamentSchedulingConfig,
} from '@/lib/tournament-scheduling';
import type { CategorySchedulingWindow } from '@/lib/tournaments';
import { getCategorySchedulingMap } from '@/lib/tournaments';
import {
  delegateUrl,
  gateUrl,
  mesaUrl,
  publicTournamentUrl,
} from '@/lib/tournament-urls';
import {
  buildTournamentSignageFormatPatch,
  createTournamentSignageScreenToken,
  getTournamentSignageScreenToken,
  tournamentSignageScreenPath,
} from '@/lib/tournament-signage';
import {
  generateAccessToken,
  generateInviteToken,
  generateQrHash,
  generateQrPayload,
  tokenExpiresAt,
} from '@/lib/tournament-tokens';
import {
  DEFAULT_PLACEMENT_BRACKETS,
  aggregateTournamentStats,
  estimateTournamentRevenue,
  slugifyTournamentName,
  TOURNAMENT_SELECT,
  totalEstimatedRevenueCents,
  type FormatType,
  type FieldDivisionMode,
  type MatchEvent,
  type Tournament,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentDossierConfig,
  type TournamentField,
  type TournamentMatch,
  type TournamentSponsor,
  type TournamentSport,
  type TournamentStatus,
  type TournamentTeam,
  type TournamentTicket,
  type TournamentTicketType,
} from '@/lib/tournaments';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

export type TournamentActionState = { ok: boolean; message?: string; id?: string; slug?: string };

const TOURNAMENT_PATHS = ['/portal/torneos'];

function enrichFieldsWithDivisions(
  tournament: Tournament,
  fields: TournamentField[]
): TournamentField[] {
  const map = tournament.format_json?.field_divisions as Record<string, FieldDivisionMode> | undefined;
  return fields.map((f) => ({
    ...f,
    division_mode: f.division_mode ?? map?.[f.id] ?? 'full',
  }));
}

function enrichBundle(bundle: TournamentBundle): TournamentBundle {
  return {
    ...bundle,
    fields: enrichFieldsWithDivisions(bundle.tournament, bundle.fields),
  };
}

function revalidateTournaments() {
  for (const path of TOURNAMENT_PATHS) revalidatePath(path, 'layout');
}

function revalidateTournamentPublic(slug: string) {
  revalidatePath(`/torneo/${slug}`);
}

function isMesaTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

function updateDemoMatchScore(
  match: TournamentMatch,
  scoreHome: number,
  scoreAway: number,
  status: TournamentMatch['status'],
  eventsJson?: MatchEvent[]
): TournamentActionState {
  if (isMesaTokenExpired(match.mesa_token_expires_at)) {
    return { ok: false, message: 'Enlace de mesa caducado. Solicita uno nuevo al organizador.' };
  }

  match.score_home = scoreHome;
  match.score_away = scoreAway;
  match.status = status;
  if (eventsJson) match.events_json = eventsJson;
  if (status === 'live' && !match.live_started_at) {
    match.live_started_at = new Date().toISOString();
  }
  if (status === 'finished') {
    match.live_finished_at = new Date().toISOString();
  }

  const bundle = getDemoTournamentBundle(match.tournament_id);
  if (bundle) revalidateTournamentPublic(bundle.tournament.slug);
  revalidateTournaments();
  return { ok: true, message: 'Guardado' };
}

export type MesaMatchUpdate = {
  scoreHome: number;
  scoreAway: number;
  status: TournamentMatch['status'];
  eventsJson?: MatchEvent[];
};

function mapTournament(row: Record<string, unknown>): Tournament {
  return {
    id: String(row.id),
    club_id: row.club_id ? String(row.club_id) : null,
    tenant_type: (row.tenant_type as Tournament['tenant_type']) ?? 'club',
    name: String(row.name),
    slug: String(row.slug),
    sport_key: row.sport_key as TournamentSport,
    status: row.status as TournamentStatus,
    starts_at: row.starts_at ? String(row.starts_at) : null,
    ends_at: row.ends_at ? String(row.ends_at) : null,
    description: row.description ? String(row.description) : null,
    rules_text: row.rules_text ? String(row.rules_text) : null,
    cover_image_url: row.cover_image_url ? String(row.cover_image_url) : null,
    venue_name: row.venue_name ? String(row.venue_name) : null,
    venue_map_url: row.venue_map_url ? String(row.venue_map_url) : null,
    venue_images_json: Array.isArray(row.venue_images_json) ? (row.venue_images_json as string[]) : [],
    format_json: (row.format_json as Record<string, unknown>) ?? {},
    registration_config_json: (row.registration_config_json as Record<string, unknown>) ?? {},
    ticketing_config_json: (row.ticketing_config_json as Record<string, unknown>) ?? {},
    revenue_estimates_json: (row.revenue_estimates_json as Tournament['revenue_estimates_json']) ?? {},
    public_enabled: row.public_enabled === true,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listTournaments(clubId: string): Promise<Tournament[]> {
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const demoClubId = DEMO_TOURNAMENTS_CLUB_ID;
    return store.tournaments.filter(
      (t) => t.club_id === clubId || t.club_id === demoClubId || clubId === demoClubId
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournaments')
    .select(TOURNAMENT_SELECT)
    .eq('club_id', clubId)
    .order('starts_at', { ascending: false });

  if (error) {
    console.error('[torneos] listTournaments:', error.message);
    return [];
  }

  return (data ?? []).map((r) => mapTournament(r as Record<string, unknown>));
}

export type TournamentPortalStats = {
  categoriesCount: number;
  teamsCount: number;
  liveMatches: number;
  teamCountsByTournament: [string, number][];
};

export async function loadTournamentPortalStats(
  clubId: string,
  tournaments: Tournament[]
): Promise<TournamentPortalStats> {
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const agg = aggregateTournamentStats(tournaments, store.categories, store.teams, store.matches);
    const teamCounts = new Map<string, number>();
    for (const t of store.teams) {
      teamCounts.set(t.tournament_id, (teamCounts.get(t.tournament_id) ?? 0) + 1);
    }
    return { ...agg, teamCountsByTournament: [...teamCounts.entries()] };
  }

  return {
    categoriesCount: 0,
    teamsCount: 0,
    liveMatches: 0,
    teamCountsByTournament: [],
  };
}

export type DemoTorneoPwaLinks = {
  tournamentName: string;
  publicWeb: string;
  mesa: string;
  mesaLabel: string;
  delegado: string;
  delegadoLabel: string;
  taquilla: string;
  totalPlayers: number;
  confirmedPlayers: number;
  pendingPlayers: number;
};

export async function getTournamentPwaLinks(tournamentId: string): Promise<DemoTorneoPwaLinks | null> {
  const bundle = await loadTournamentBundle(tournamentId);
  if (!bundle) return null;

  const { tournament, matches, teams } = bundle;
  const liveMatch =
    matches.find((m) => m.status === 'live' && m.mesa_token) ?? matches.find((m) => m.mesa_token);
  const team = teams.find((t) => t.invite_token);

  let taquilla = '/torneo/demo';
  if (await isDemoActive() || demoBundleById(tournamentId)) {
    taquilla = gateUrl(getDemoTournamentsStore().gateToken);
  }

  const players = buildTournamentPlayerMetrics(bundle);

  return {
    tournamentName: tournament.name,
    publicWeb: publicTournamentUrl(tournament.slug),
    mesa: liveMatch?.mesa_token ? mesaUrl(liveMatch.mesa_token) : publicTournamentUrl(tournament.slug),
    mesaLabel: liveMatch
      ? `${teams.find((t) => t.id === liveMatch.home_team_id)?.name ?? 'Local'} vs ${teams.find((t) => t.id === liveMatch.away_team_id)?.name ?? 'Visitante'}`
      : 'Sin partido asignado',
    delegado: team?.invite_token ? delegateUrl(team.invite_token) : publicTournamentUrl(tournament.slug),
    delegadoLabel: team?.name ?? 'Equipo invitado',
    taquilla,
    ...players,
  };
}

export async function getDemoTorneoPwaLinks(): Promise<DemoTorneoPwaLinks | null> {
  return getTournamentPwaLinks(DEMO_TOURNAMENT_ID);
}

function demoBundleById(tournamentId: string): TournamentBundle | null {
  if (tournamentId === DEMO_TOURNAMENT_ID || tournamentId.startsWith('demo-tournament')) {
    const bundle = getDemoTournamentBundle(tournamentId) ?? getDemoTournamentBundle(DEMO_TOURNAMENT_ID);
    return bundle ? enrichBundle(bundle) : null;
  }
  const bundle = getDemoTournamentBundle(tournamentId);
  return bundle ? enrichBundle(bundle) : null;
}

function demoBundleBySlug(slug: string): TournamentBundle | null {
  const store = getDemoTournamentsStore();
  const t = store.tournaments.find((x) => x.slug === slug);
  const bundle = t ? getDemoTournamentBundle(t.id) : null;
  return bundle ? enrichBundle(bundle) : null;
}

export async function loadTournamentBundle(tournamentId: string): Promise<TournamentBundle | null> {
  const demo = demoBundleById(tournamentId);
  if (demo) return demo;

  if (await isDemoActive()) {
    return getDemoTournamentBundle(tournamentId);
  }

  const supabase = await createClient();
  const { data: tournament } = await supabase
    .from('synq_tournaments')
    .select(TOURNAMENT_SELECT)
    .eq('id', tournamentId)
    .maybeSingle();
  if (!tournament) return null;

  const [categories, fields, sponsors, teams, phases, groups, matches, dossiers, ticketTypes, tickets] =
    await Promise.all([
      supabase.from('synq_tournament_categories').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_fields').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_sponsors').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_teams').select('*').eq('tournament_id', tournamentId),
      supabase.from('synq_tournament_phases').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_groups').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_matches').select('*').eq('tournament_id', tournamentId).order('match_number'),
      supabase.from('synq_tournament_dossiers').select('*').eq('tournament_id', tournamentId),
      supabase.from('synq_tournament_ticket_types').select('*').eq('tournament_id', tournamentId).order('sort_order'),
      supabase.from('synq_tournament_tickets').select('*').eq('tournament_id', tournamentId),
    ]);

  return enrichBundle({
    tournament: mapTournament(tournament as Record<string, unknown>),
    categories: (categories.data ?? []) as TournamentCategory[],
    fields: (fields.data ?? []) as TournamentField[],
    sponsors: (sponsors.data ?? []) as TournamentSponsor[],
    teams: (teams.data ?? []) as TournamentTeam[],
    phases: (phases.data ?? []) as TournamentBundle['phases'],
    groups: (groups.data ?? []) as TournamentBundle['groups'],
    matches: (matches.data ?? []) as TournamentMatch[],
    dossiers: (dossiers.data ?? []) as TournamentBundle['dossiers'],
    ticketTypes: (ticketTypes.data ?? []) as TournamentTicketType[],
    tickets: (tickets.data ?? []) as TournamentTicket[],
  });
}

export async function loadTournamentBySlug(slug: string): Promise<TournamentBundle | null> {
  const { loadPublicTournamentBySlug } = await import('@/lib/tournament-loader');
  return loadPublicTournamentBySlug(slug);
}

export async function loadTournamentBySignageToken(token: string): Promise<TournamentBundle | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const store = getDemoTournamentsStore();
  const demoTournament = store.tournaments.find((t) => getTournamentSignageScreenToken(t) === trimmed);
  if (demoTournament) return loadTournamentBundle(demoTournament.id);

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('synq_tournaments')
    .select('id, format_json')
    .contains('format_json', { signage: { screen_token: trimmed } });

  const row = rows?.find(
    (r) => getTournamentSignageScreenToken({ format_json: (r.format_json as Record<string, unknown>) ?? {} }) === trimmed
  );
  if (!row) return null;
  return loadTournamentBundle(String(row.id));
}

export async function ensureTournamentSignageScreenToken(
  tournamentId: string
): Promise<{ ok: boolean; path?: string; message?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    let screenToken = getTournamentSignageScreenToken(t);
    if (!screenToken) {
      screenToken = createTournamentSignageScreenToken();
      t.format_json = buildTournamentSignageFormatPatch(t, screenToken);
      t.updated_at = new Date().toISOString();
    }
    revalidateTournaments();
    return { ok: true, path: tournamentSignageScreenPath(screenToken) };
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from('synq_tournaments')
    .select('format_json')
    .eq('id', tournamentId)
    .maybeSingle();
  if (!row) return { ok: false, message: 'Torneo no encontrado' };

  const formatJson = (row.format_json as Record<string, unknown>) ?? {};
  let screenToken = getTournamentSignageScreenToken({ format_json: formatJson });
  if (!screenToken) {
    screenToken = createTournamentSignageScreenToken();
    const { error } = await supabase
      .from('synq_tournaments')
      .update({ format_json: buildTournamentSignageFormatPatch({ format_json: formatJson }, screenToken) })
      .eq('id', tournamentId);
    if (error) return { ok: false, message: error.message };
  }

  revalidateTournaments();
  return { ok: true, path: tournamentSignageScreenPath(screenToken) };
}

export async function ensureTournamentDefaults(clubId: string): Promise<void> {
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    if (store.tournaments.length === 0) {
      const { resetDemoTournamentsStore } = await import('@/lib/demo-tournaments-store');
      resetDemoTournamentsStore();
    }
    return;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from('synq_tournaments')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', clubId);
  if ((count ?? 0) > 0) return;
}

export async function createTournament(formData: FormData): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const name = String(formData.get('name') ?? '').trim();
  const sportKey = String(formData.get('sport_key') ?? 'football') as TournamentSport;
  const venueName = String(formData.get('venue_name') ?? '').trim() || null;
  const startsAt = String(formData.get('starts_at') ?? '').trim() || null;
  const endsAt = String(formData.get('ends_at') ?? '').trim() || null;
  const description = String(formData.get('description') ?? '').trim() || null;

  if (!name) return { ok: false, message: 'El nombre es obligatorio' };

  const slug = `${slugifyTournamentName(name)}-${Date.now().toString(36).slice(-4)}`;

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const id = `demo-tournament-${Date.now()}`;
    store.tournaments.unshift({
      id,
      club_id: clubId,
      tenant_type: 'club',
      name,
      slug,
      sport_key: sportKey,
      status: 'draft',
      starts_at: startsAt,
      ends_at: endsAt,
      description,
      rules_text: null,
      cover_image_url: null,
      venue_name: venueName,
      venue_map_url: null,
      venue_images_json: [],
      format_json: { weekend_mode: true, multifinal: true },
      registration_config_json: {},
      ticketing_config_json: { projected_attendance: 400 },
      revenue_estimates_json: {},
      public_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    revalidateTournaments();
    return { ok: true, id, slug, message: 'Torneo creado (demo)' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournaments')
    .insert({
      club_id: clubId,
      name,
      slug,
      sport_key: sportKey,
      venue_name: venueName,
      starts_at: startsAt,
      ends_at: endsAt,
      description,
      format_json: { weekend_mode: true, multifinal: true },
    })
    .select('id, slug')
    .single();

  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, id: String(data.id), slug: String(data.slug) };
}

export type { CreateTournamentWizardPayload } from '@/lib/tournament-create-wizard';

export async function createTournamentFull(
  payload: import('@/lib/tournament-create-wizard').CreateTournamentWizardPayload
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (!payload.name.trim()) return { ok: false, message: 'El nombre es obligatorio' };
  if (payload.categories.length === 0) return { ok: false, message: 'Añade al menos una categoría' };
  if (payload.fields.length === 0) return { ok: false, message: 'Añade al menos un campo' };

  const slug = `${slugifyTournamentName(payload.name)}-${Date.now().toString(36).slice(-4)}`;
  const scheduling = resolveSchedulingConfig(payload.scheduling);

  const draftCategories = payload.categories.map((c, i) => ({
    tempId: c.tempId,
    name: c.name.trim(),
    groups_count: c.groups_count,
    teams_per_group: c.teams_per_group,
    format_type: c.format_type,
    sort_order: i,
  }));

  if (draftCategories.some((c) => !c.name)) {
    return { ok: false, message: 'Todas las categorías necesitan nombre' };
  }

  const draftFields = payload.fields.map((f, i) => ({
    tempId: f.tempId,
    label: f.label.trim(),
    division_mode: f.division_mode,
    notes: f.notes.trim() || null,
    sort_order: i,
  }));

  if (draftFields.some((f) => !f.label)) {
    return { ok: false, message: 'Todos los campos necesitan nombre' };
  }

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const tournamentId = `demo-tournament-${Date.now()}`;
    const mockTournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'> = {
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      format_json: { scheduling },
    };

    const mockCategories: TournamentCategory[] = draftCategories.map((c) => ({
      id: c.tempId,
      tournament_id: tournamentId,
      name: c.name,
      sport_key: payload.sport_key,
      groups_count: c.groups_count,
      teams_per_group: c.teams_per_group,
      format_type: c.format_type,
      placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= c.teams_per_group),
      sort_order: c.sort_order,
    }));

    const mockFields: TournamentField[] = draftFields.map((f) => ({
      id: f.tempId,
      tournament_id: tournamentId,
      facility_id: null,
      label: f.label,
      map_url: null,
      notes: f.notes,
      sort_order: f.sort_order,
      division_mode: f.division_mode,
    }));

    const suggestedWindows = suggestCategoryWindows({
      categories: mockCategories,
      tournament: mockTournament,
      fields: mockFields,
      config: scheduling,
    });

    const categoryIdMap = new Map<string, string>();
    const fieldDivisions: Record<string, FieldDivisionMode> = {};

    store.tournaments.unshift({
      id: tournamentId,
      club_id: clubId,
      tenant_type: 'club',
      name: payload.name.trim(),
      slug,
      sport_key: payload.sport_key,
      status: 'draft',
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      description: payload.description,
      rules_text: payload.rules_text,
      cover_image_url: null,
      venue_name: payload.venue_name,
      venue_map_url: null,
      venue_images_json: [],
      format_json: {
        weekend_mode: true,
        multifinal: true,
        scheduling,
        category_scheduling: {},
        field_divisions: {},
      },
      registration_config_json: {},
      ticketing_config_json: { projected_attendance: 400 },
      revenue_estimates_json: {},
      public_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const tournament = store.tournaments.find((t) => t.id === tournamentId)!;
    const categoryScheduling: Record<string, CategorySchedulingWindow> = {};

    for (const c of draftCategories) {
      const catId = `demo-cat-${tournamentId}-${c.tempId}`;
      categoryIdMap.set(c.tempId, catId);
      store.categories.push({
        id: catId,
        tournament_id: tournamentId,
        name: c.name,
        sport_key: payload.sport_key,
        groups_count: c.groups_count,
        teams_per_group: c.teams_per_group,
        format_type: c.format_type,
        placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= c.teams_per_group),
        sort_order: c.sort_order,
      });
      const window = suggestedWindows[c.tempId];
      if (window) categoryScheduling[catId] = window;
    }

    for (const f of draftFields) {
      const fieldId = `demo-field-${tournamentId}-${f.tempId}`;
      fieldDivisions[fieldId] = f.division_mode;
      store.fields.push({
        id: fieldId,
        tournament_id: tournamentId,
        facility_id: null,
        label: f.label,
        map_url: null,
        notes: f.notes,
        sort_order: f.sort_order,
        division_mode: f.division_mode,
      });
    }

    tournament.format_json = {
      ...tournament.format_json,
      category_scheduling: categoryScheduling,
      field_divisions: fieldDivisions,
    };

    revalidateTournaments();
    return { ok: true, id: tournamentId, slug, message: 'Torneo creado con categorías, campos y planificación' };
  }

  const supabase = await createClient();
  const { data: tRow, error: tErr } = await supabase
    .from('synq_tournaments')
    .insert({
      club_id: clubId,
      name: payload.name.trim(),
      slug,
      sport_key: payload.sport_key,
      venue_name: payload.venue_name,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      description: payload.description,
      rules_text: payload.rules_text,
      format_json: { weekend_mode: true, multifinal: true, scheduling },
    })
    .select('id, slug')
    .single();

  if (tErr || !tRow) return { ok: false, message: tErr?.message ?? 'Error al crear torneo' };

  const tournamentId = String(tRow.id);
  const categoryScheduling: Record<string, CategorySchedulingWindow> = {};
  const fieldDivisions: Record<string, FieldDivisionMode> = {};
  const createdCategories: TournamentCategory[] = [];

  for (const c of draftCategories) {
    const { data: catRow, error: catErr } = await supabase
      .from('synq_tournament_categories')
      .insert({
        tournament_id: tournamentId,
        name: c.name,
        groups_count: c.groups_count,
        teams_per_group: c.teams_per_group,
        format_type: c.format_type,
        placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= c.teams_per_group),
        sort_order: c.sort_order,
      })
      .select('*')
      .single();
    if (catErr || !catRow) return { ok: false, message: catErr?.message ?? 'Error al crear categoría' };
    const cat = catRow as TournamentCategory;
    createdCategories.push(cat);
  }

  const mockTournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'> = {
    starts_at: payload.starts_at,
    ends_at: payload.ends_at,
    format_json: { scheduling },
  };

  const mockFieldsForSuggest: TournamentField[] = [];
  for (const f of draftFields) {
    const { data: fieldRow, error: fieldErr } = await supabase
      .from('synq_tournament_fields')
      .insert({ tournament_id: tournamentId, label: f.label, notes: f.notes, sort_order: f.sort_order })
      .select('id')
      .single();
    if (fieldErr || !fieldRow) return { ok: false, message: fieldErr?.message ?? 'Error al crear campo' };
    const fieldId = String(fieldRow.id);
    fieldDivisions[fieldId] = f.division_mode;
    mockFieldsForSuggest.push({
      id: fieldId,
      tournament_id: tournamentId,
      facility_id: null,
      label: f.label,
      map_url: null,
      notes: f.notes,
      sort_order: f.sort_order,
      division_mode: f.division_mode,
    });
  }

  const suggestedWindows = suggestCategoryWindows({
    categories: createdCategories,
    tournament: mockTournament,
    fields: mockFieldsForSuggest,
    config: scheduling,
  });

  for (const cat of createdCategories) {
    const window = suggestedWindows[cat.id];
    if (window) categoryScheduling[cat.id] = window;
  }

  await supabase
    .from('synq_tournaments')
    .update({
      format_json: {
        weekend_mode: true,
        multifinal: true,
        scheduling,
        category_scheduling: categoryScheduling,
        field_divisions: fieldDivisions,
      },
    })
    .eq('id', tournamentId);

  revalidateTournaments();
  return { ok: true, id: tournamentId, slug: String(tRow.slug), message: 'Torneo creado' };
}

export async function addTournamentCategory(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const name = String(formData.get('name') ?? '').trim();
  const groupsCount = Math.min(16, Math.max(1, Number(formData.get('groups_count') ?? 4)));
  const teamsPerGroup = Math.min(8, Math.max(2, Number(formData.get('teams_per_group') ?? 4)));
  const formatType = (String(formData.get('format_type') ?? 'groups_multifinal') as FormatType) || 'groups_multifinal';

  if (!name) return { ok: false, message: 'Nombre de categoría obligatorio' };

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const id = `demo-cat-${Date.now()}`;
    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    const newCategory = {
      id,
      tournament_id: tournamentId,
      name,
      sport_key: null,
      groups_count: groupsCount,
      teams_per_group: teamsPerGroup,
      format_type: formatType,
      placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= teamsPerGroup),
      sort_order: store.categories.filter((c) => c.tournament_id === tournamentId).length,
    };
    store.categories.push(newCategory);

    if (tournament) {
      const fields = store.fields.filter((f) => f.tournament_id === tournamentId);
      const suggested = suggestCategoryWindows({
        categories: store.categories.filter((c) => c.tournament_id === tournamentId),
        tournament,
        fields,
      });
      tournament.format_json = { ...tournament.format_json, category_scheduling: suggested };
      tournament.updated_at = new Date().toISOString();
    }

    revalidateTournaments();
    return { ok: true, id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournament_categories')
    .insert({
      tournament_id: tournamentId,
      name,
      groups_count: groupsCount,
      teams_per_group: teamsPerGroup,
      format_type: formatType,
      placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= teamsPerGroup),
      sort_order: 0,
    })
    .select('id')
    .single();

  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, id: String(data.id) };
}

export async function updateTournamentSettings(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const patch = {
    name: String(formData.get('name') ?? '').trim(),
    sport_key: String(formData.get('sport_key') ?? 'football') as TournamentSport,
    status: String(formData.get('status') ?? 'draft') as TournamentStatus,
    starts_at: String(formData.get('starts_at') ?? '').trim() || null,
    ends_at: String(formData.get('ends_at') ?? '').trim() || null,
    venue_name: String(formData.get('venue_name') ?? '').trim() || null,
    venue_map_url: String(formData.get('venue_map_url') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    rules_text: String(formData.get('rules_text') ?? '').trim() || null,
  };

  if (!patch.name) return { ok: false, message: 'El nombre es obligatorio' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    Object.assign(t, patch, { updated_at: new Date().toISOString() });
    revalidateTournaments();
    return { ok: true, message: 'Datos del torneo guardados' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_tournaments').update(patch).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Datos del torneo guardados' };
}

export async function updateTournamentDossierConfig(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const dossier: TournamentDossierConfig = {
    welcome_message: String(formData.get('welcome_message') ?? '').trim() || undefined,
    contact_email: String(formData.get('contact_email') ?? '').trim() || undefined,
    contact_phone: String(formData.get('contact_phone') ?? '').trim() || undefined,
    include_sponsors: formData.get('include_sponsors') === 'true',
  };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    t.format_json = { ...t.format_json, dossier };
    t.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: 'Textos del dossier guardados' };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from('synq_tournaments').select('format_json').eq('id', tournamentId).maybeSingle();
  const formatJson = { ...((row?.format_json as Record<string, unknown>) ?? {}), dossier };
  const { error } = await supabase.from('synq_tournaments').update({ format_json: formatJson }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Textos del dossier guardados' };
}

export async function addTournamentField(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const label = String(formData.get('label') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const mapUrl = String(formData.get('map_url') ?? '').trim() || null;
  const divisionMode = (String(formData.get('division_mode') ?? 'full') as FieldDivisionMode) || 'full';
  if (!label) return { ok: false, message: 'Nombre del campo obligatorio' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const id = `demo-field-${Date.now()}`;
    store.fields.push({
      id,
      tournament_id: tournamentId,
      facility_id: null,
      label,
      map_url: mapUrl,
      notes,
      sort_order: store.fields.filter((f) => f.tournament_id === tournamentId).length,
      division_mode: divisionMode,
    });
    revalidateTournaments();
    return { ok: true, id, message: 'Campo añadido' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournament_fields')
    .insert({ tournament_id: tournamentId, label, notes, map_url: mapUrl })
    .select('id')
    .single();
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, id: String(data.id), message: 'Campo añadido' };
}

export async function addTournamentSponsor(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const name = String(formData.get('name') ?? '').trim();
  const tier = (String(formData.get('tier') ?? 'silver') as TournamentSponsor['tier']) || 'silver';
  const logoUrl = String(formData.get('logo_url') ?? '').trim() || null;
  const url = String(formData.get('url') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const amountCents = Number(formData.get('amount_cents') ?? 0) || null;
  if (!name) return { ok: false, message: 'Nombre obligatorio' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const id = `demo-ts-${Date.now()}`;
    store.sponsors.push({
      id,
      tournament_id: tournamentId,
      name,
      logo_url: logoUrl,
      tier,
      url,
      notes,
      amount_cents: amountCents,
      sort_order: store.sponsors.filter((s) => s.tournament_id === tournamentId).length,
      active: true,
    });
    await syncTournamentSponsorshipRevenue(tournamentId);
    revalidateTournaments();
    return { ok: true, id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournament_sponsors')
    .insert({
      tournament_id: tournamentId,
      name,
      tier,
      logo_url: logoUrl,
      url,
      notes,
      amount_cents: amountCents,
      active: true,
    })
    .select('id')
    .single();
  if (error) return { ok: false, message: error.message };
  await syncTournamentSponsorshipRevenue(tournamentId);
  revalidateTournaments();
  return { ok: true, id: String(data.id) };
}

export async function updateTournamentSponsor(
  sponsorId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const name = String(formData.get('name') ?? '').trim();
  const tier = (String(formData.get('tier') ?? 'silver') as TournamentSponsor['tier']) || 'silver';
  const logoUrl = String(formData.get('logo_url') ?? '').trim() || null;
  const url = String(formData.get('url') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;
  const amountCents = Number(formData.get('amount_cents') ?? 0) || null;
  if (!name) return { ok: false, message: 'Nombre obligatorio' };

  if (await isDemoActive() || getDemoTournamentsStore().sponsors.some((s) => s.id === sponsorId)) {
    const store = getDemoTournamentsStore();
    const sponsor = store.sponsors.find((s) => s.id === sponsorId);
    if (!sponsor) return { ok: false, message: 'Patrocinador no encontrado' };
    sponsor.name = name;
    sponsor.tier = tier;
    sponsor.logo_url = logoUrl;
    sponsor.url = url;
    sponsor.notes = notes;
    sponsor.amount_cents = amountCents;
    await syncTournamentSponsorshipRevenue(sponsor.tournament_id);
    revalidateTournaments();
    return { ok: true, message: 'Patrocinador actualizado' };
  }

  const supabase = await createClient();
  const { data: row } = await supabase
    .from('synq_tournament_sponsors')
    .select('tournament_id')
    .eq('id', sponsorId)
    .maybeSingle();
  if (!row) return { ok: false, message: 'Patrocinador no encontrado' };

  const { error } = await supabase
    .from('synq_tournament_sponsors')
    .update({
      name,
      tier,
      logo_url: logoUrl,
      url,
      notes,
      amount_cents: amountCents,
    })
    .eq('id', sponsorId);
  if (error) return { ok: false, message: error.message };

  await syncTournamentSponsorshipRevenue(String(row.tournament_id));
  revalidateTournaments();
  return { ok: true, message: 'Patrocinador actualizado' };
}

async function syncTournamentSponsorshipRevenue(tournamentId: string): Promise<void> {
  const bundle = await loadTournamentBundle(tournamentId);
  if (!bundle) return;

  const { sumActiveSponsorCents } = await import('@/lib/tournament-sponsors');
  const sponsorshipTotal = sumActiveSponsorCents(bundle.sponsors);
  const estimates = {
    ...bundle.tournament.revenue_estimates_json,
    sponsorship: { total_cents: sponsorshipTotal },
  };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (t) t.revenue_estimates_json = estimates;
    return;
  }

  const supabase = await createClient();
  await supabase.from('synq_tournaments').update({ revenue_estimates_json: estimates }).eq('id', tournamentId);
}

export async function generateCompetitionStructure(
  tournamentId: string,
  categoryId: string
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const category = store.categories.find((c) => c.id === categoryId);
    if (!category) return { ok: false, message: 'Categoría no encontrada' };

    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneo no encontrado' };

    const fields = enrichFieldsWithDivisions(tournament, store.fields.filter((f) => f.tournament_id === tournamentId));
    const analysis = analyzeCategoryCapacity({
      category,
      tournament,
      fields,
      teamsRegistered: store.teams.filter((t) => t.category_id === categoryId).length,
    });
    if (!analysis.fits_structure) {
      return {
        ok: false,
        message: `No se puede generar: ${category.name} necesita ${analysis.match_count} partidos pero su ventana solo tiene ${analysis.capacity?.total_capacity ?? 0} huecos.`,
      };
    }

    const existing = store.matches.filter((m) => m.category_id === categoryId).length;
    if (existing > 0) {
      return { ok: true, message: `Competición ya generada (${existing} partidos)` };
    }

    let counter = 0;
    const nextId = () => `demo-gen-${categoryId}-${++counter}`;
    const structure = generateMultifinalCompetition(category, nextId);
    const phaseIdMap = new Map(structure.phases.map((p) => [p.temp_id, `demo-phase-${categoryId}-${p.bracket_key}-${Date.now()}`]));
    const groupIdMap = new Map(structure.groups.map((g) => [g.temp_id, `demo-group-${categoryId}-${g.code}`]));

    for (const p of structure.phases) {
      store.phases.push({
        id: phaseIdMap.get(p.temp_id)!,
        tournament_id: tournamentId,
        category_id: categoryId,
        phase_type: p.phase_type,
        bracket_key: p.bracket_key,
        name: p.name,
        group_position_source: p.group_position_source,
        sort_order: p.sort_order,
      });
    }
    for (const g of structure.groups) {
      store.groups.push({
        id: groupIdMap.get(g.temp_id)!,
        phase_id: phaseIdMap.get(g.phase_id)!,
        tournament_id: tournamentId,
        category_id: categoryId,
        code: g.code,
        name: g.name,
        sort_order: g.sort_order,
      });
    }

    let matchIdx = 0;

    for (const m of structure.matches) {
      store.matches.push({
        id: `demo-match-${categoryId}-${matchIdx + 1}`,
        tournament_id: tournamentId,
        category_id: categoryId,
        phase_id: phaseIdMap.get(m.phase_id)!,
        group_id: m.group_id ? groupIdMap.get(m.group_id) ?? null : null,
        bracket_key: m.bracket_key,
        round_key: m.round_key,
        match_number: m.match_number,
        home_team_id: null,
        away_team_id: null,
        field_id: null,
        scheduled_at: null,
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        score_penalties_home: null,
        score_penalties_away: null,
        went_to_penalties: false,
        mesa_token: generateAccessToken(),
        mesa_token_expires_at: tokenExpiresAt(72),
        live_started_at: null,
        live_finished_at: null,
        events_json: [],
        metadata_json: m.metadata_json,
      });
      matchIdx++;
    }

    revalidateTournaments();
    return { ok: true, message: `Generados ${matchIdx} partidos` };
  }

  const supabase = await createClient();
  const { data: category } = await supabase
    .from('synq_tournament_categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle();
  if (!category) return { ok: false, message: 'Categoría no encontrada' };

  let counter = 0;
  const nextId = () => `gen-${++counter}`;
  const structure = generateMultifinalCompetition(category as TournamentCategory, nextId);

  const phaseRows = structure.phases.map((p) => ({
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    category_id: categoryId,
    phase_type: p.phase_type,
    bracket_key: p.bracket_key,
    name: p.name,
    group_position_source: p.group_position_source,
    sort_order: p.sort_order,
    _temp: p.temp_id,
  }));

  const phaseIdMap = new Map(phaseRows.map((p) => [p._temp, p.id]));
  const groupRows = structure.groups.map((g) => ({
    id: crypto.randomUUID(),
    phase_id: phaseIdMap.get(g.phase_id)!,
    tournament_id: tournamentId,
    category_id: categoryId,
    code: g.code,
    name: g.name,
    sort_order: g.sort_order,
    _temp: g.temp_id,
  }));
  const groupIdMap = new Map(groupRows.map((g) => [g._temp, g.id]));

  const matchRows = structure.matches
    .filter((m) => m.phase_id)
    .map((m) => ({
    id: crypto.randomUUID(),
    tournament_id: tournamentId,
    category_id: categoryId,
    phase_id: phaseIdMap.get(m.phase_id!)!,
    group_id: m.group_id ? groupIdMap.get(m.group_id) ?? null : null,
    bracket_key: m.bracket_key,
    round_key: m.round_key,
    match_number: m.match_number,
    home_team_id: m.home_team_id,
    away_team_id: m.away_team_id,
    status: m.status,
    metadata_json: m.metadata_json,
    mesa_token: generateAccessToken(),
    mesa_token_expires_at: tokenExpiresAt(72),
  }));

  const { error: pErr } = await supabase.from('synq_tournament_phases').insert(
    phaseRows.map(({ _temp, ...r }) => r)
  );
  if (pErr) return { ok: false, message: pErr.message };

  const { error: gErr } = await supabase.from('synq_tournament_groups').insert(
    groupRows.map(({ _temp, ...r }) => r)
  );
  if (gErr) return { ok: false, message: gErr.message };

  const { error: mErr } = await supabase.from('synq_tournament_matches').insert(matchRows);
  if (mErr) return { ok: false, message: mErr.message };

  revalidateTournaments();
  return { ok: true, message: `Generados ${matchRows.length} partidos` };
}

export async function updateMatchScore(
  matchId: string,
  scoreHome: number,
  scoreAway: number,
  status: TournamentMatch['status'] = 'finished'
): Promise<TournamentActionState> {
  const store = getDemoTournamentsStore();
  const demoMatch = store.matches.find((m) => m.id === matchId);
  if (demoMatch) {
    return updateDemoMatchScore(demoMatch, scoreHome, scoreAway, status);
  }

  if (await isDemoActive()) {
    return { ok: false, message: 'Partido no encontrado' };
  }

  const supabase = createServiceClient() ?? (await createClient());
  const { error } = await supabase
    .from('synq_tournament_matches')
    .update({
      score_home: scoreHome,
      score_away: scoreAway,
      status,
      live_started_at: status === 'live' ? new Date().toISOString() : undefined,
      live_finished_at: status === 'finished' ? new Date().toISOString() : undefined,
    })
    .eq('id', matchId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true };
}

export async function updateMatchScoreByMesaToken(
  token: string,
  update: MesaMatchUpdate
): Promise<TournamentActionState> {
  const { scoreHome, scoreAway, status, eventsJson } = update;
  const store = getDemoTournamentsStore();
  const demoMatch = store.matches.find((m) => m.mesa_token === token);
  if (demoMatch) {
    return updateDemoMatchScore(demoMatch, scoreHome, scoreAway, status, eventsJson);
  }

  const supabase = createServiceClient() ?? (await createClient());
  const { data } = await supabase
    .from('synq_tournament_matches')
    .select('id, mesa_token_expires_at, tournament_id, live_started_at')
    .eq('mesa_token', token)
    .maybeSingle();
  if (!data) return { ok: false, message: 'Token inválido' };
  if (isMesaTokenExpired(data.mesa_token_expires_at ? String(data.mesa_token_expires_at) : null)) {
    return { ok: false, message: 'Enlace de mesa caducado. Solicita uno nuevo al organizador.' };
  }

  const liveStartedAt =
    status === 'live'
      ? data.live_started_at
        ? String(data.live_started_at)
        : new Date().toISOString()
      : undefined;

  const { error } = await supabase
    .from('synq_tournament_matches')
    .update({
      score_home: scoreHome,
      score_away: scoreAway,
      status,
      events_json: eventsJson,
      live_started_at: liveStartedAt,
      live_finished_at: status === 'finished' ? new Date().toISOString() : undefined,
    })
    .eq('id', data.id);

  if (error) return { ok: false, message: error.message };

  const bundle = await loadTournamentBundle(String(data.tournament_id));
  if (bundle) revalidateTournamentPublic(bundle.tournament.slug);
  revalidateTournaments();
  return { ok: true, message: 'Guardado' };
}

export async function loadMatchByMesaToken(token: string): Promise<{
  match: TournamentMatch;
  bundle: TournamentBundle;
} | null> {
  {
    const store = getDemoTournamentsStore();
    const match = store.matches.find((m) => m.mesa_token === token);
    if (match) {
      if (isMesaTokenExpired(match.mesa_token_expires_at)) return null;
      const bundle = getDemoTournamentBundle(match.tournament_id);
      if (bundle) return { match, bundle };
    }
  }

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const match = store.matches.find((m) => m.mesa_token === token);
    if (!match) return null;
    const bundle = getDemoTournamentBundle(match.tournament_id);
    if (!bundle) return null;
    return { match, bundle };
  }

  const supabase = await createClient();
  const { data: match } = await supabase.from('synq_tournament_matches').select('*').eq('mesa_token', token).maybeSingle();
  if (!match) return null;
  if (isMesaTokenExpired(match.mesa_token_expires_at ? String(match.mesa_token_expires_at) : null)) return null;
  const bundle = await loadTournamentBundle(String(match.tournament_id));
  if (!bundle) return null;
  return { match: match as TournamentMatch, bundle };
}

export async function loadTeamByInviteToken(token: string): Promise<{
  team: TournamentTeam;
  bundle: TournamentBundle;
} | null> {
  {
    const store = getDemoTournamentsStore();
    const team = store.teams.find((t) => t.invite_token === token);
    if (team) {
      const bundle = getDemoTournamentBundle(team.tournament_id);
      if (bundle) return { team, bundle };
    }
  }

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const team = store.teams.find((t) => t.invite_token === token);
    if (!team) return null;
    const bundle = getDemoTournamentBundle(team.tournament_id);
    if (!bundle) return null;
    return { team, bundle };
  }

  const supabase = await createClient();
  const { data: team } = await supabase.from('synq_tournament_teams').select('*').eq('invite_token', token).maybeSingle();
  if (!team) return null;
  const bundle = await loadTournamentBundle(String(team.tournament_id));
  if (!bundle) return null;
  return { team: team as TournamentTeam, bundle };
}

export async function confirmTeamAttendance(
  inviteToken: string,
  squadJson: TournamentTeam['squad_json']
): Promise<TournamentActionState> {
  const filled = squadJson.filter((p) => p.name.trim());
  if (filled.length === 0) {
    return { ok: false, message: 'Añade al menos un jugador con nombre.' };
  }

  const dorsals = filled.map((p) => p.dorsal).filter((d): d is number => d != null);
  if (new Set(dorsals).size !== dorsals.length) {
    return { ok: false, message: 'Los dorsales deben ser únicos.' };
  }

  const store = getDemoTournamentsStore();
  const demoTeam = store.teams.find((t) => t.invite_token === inviteToken);
  if (demoTeam) {
    demoTeam.status = 'confirmed';
    demoTeam.squad_json = filled;
    demoTeam.confirmed_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: 'Asistencia confirmada' };
  }

  const supabase = createServiceClient() ?? (await createClient());
  const { error } = await supabase
    .from('synq_tournament_teams')
    .update({ status: 'confirmed', squad_json: filled, confirmed_at: new Date().toISOString() })
    .eq('invite_token', inviteToken);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Asistencia confirmada' };
}

export async function rejectTeamAttendance(inviteToken: string): Promise<TournamentActionState> {
  const store = getDemoTournamentsStore();
  const demoTeam = store.teams.find((t) => t.invite_token === inviteToken);
  if (demoTeam) {
    demoTeam.status = 'rejected';
    demoTeam.confirmed_at = null;
    revalidateTournaments();
    return { ok: true, message: 'Asistencia rechazada' };
  }

  const supabase = createServiceClient() ?? (await createClient());
  const { error } = await supabase
    .from('synq_tournament_teams')
    .update({ status: 'rejected', confirmed_at: null })
    .eq('invite_token', inviteToken);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Asistencia rechazada' };
}

export async function toggleTournamentPublic(
  tournamentId: string,
  enabled: boolean
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (t) t.public_enabled = enabled;
    revalidateTournaments();
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_tournaments').update({ public_enabled: enabled }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true };
}

export async function refreshRevenueEstimates(tournamentId: string): Promise<TournamentActionState> {
  const bundle = await loadTournamentBundle(tournamentId);
  if (!bundle) return { ok: false, message: 'Torneo no encontrado' };

  const estimates = estimateTournamentRevenue(
    bundle.sponsors,
    bundle.ticketTypes,
    bundle.tournament.ticketing_config_json,
    bundle.tournament.revenue_estimates_json
  );

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (t) t.revenue_estimates_json = estimates;
    revalidateTournaments();
    return { ok: true, message: `Estimación: ${(totalEstimatedRevenueCents(estimates) / 100).toFixed(0)} €` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_tournaments')
    .update({ revenue_estimates_json: estimates })
    .eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: `Estimación: ${(totalEstimatedRevenueCents(estimates) / 100).toFixed(0)} €` };
}

export async function getGateAccessUrl(tournamentId: string): Promise<string | null> {
  if (tournamentId === DEMO_TOURNAMENT_ID || tournamentId.startsWith('demo-tournament')) {
    return gateUrl(getDemoTournamentsStore().gateToken);
  }
  if (await isDemoActive()) {
    return gateUrl(generateAccessToken());
  }
  return null;
}

export async function inviteTeam(
  tournamentId: string,
  categoryId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const name = String(formData.get('name') ?? '').trim();
  const externalClub = String(formData.get('external_club_name') ?? '').trim() || null;
  const email = String(formData.get('contact_email') ?? '').trim() || null;
  const groupCode = String(formData.get('group_code') ?? '').trim().toUpperCase() || null;

  if (!name) return { ok: false, message: 'Nombre del equipo obligatorio' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    const category = store.categories.find((c) => c.id === categoryId);
    if (!tournament || !category) return { ok: false, message: 'Categoría no encontrada' };

    const fields = enrichFieldsWithDivisions(tournament, store.fields.filter((f) => f.tournament_id === tournamentId));
    const teamsInCategory = store.teams.filter((t) => t.category_id === categoryId);
    const analysis = analyzeCategoryCapacity({
      category,
      tournament,
      fields,
      teamsRegistered: teamsInCategory.length,
    });

    if (teamsInCategory.length >= analysis.team_slots) {
      return {
        ok: false,
        message: `Plazas agotadas en ${category.name} (${analysis.team_slots} equipos máx. para ${category.groups_count}×${category.teams_per_group}).`,
      };
    }

    if (!analysis.fits_structure) {
      return {
        ok: false,
        message: `La estructura de ${category.name} no cabe en su ventana horaria (faltan ~${analysis.overflow_matches} huecos). Amplía la franja o reduce grupos/equipos.`,
      };
    }
  }

  const inviteToken = generateInviteToken();

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const id = `demo-team-${Date.now()}`;
    store.teams.push({
      id,
      tournament_id: tournamentId,
      category_id: categoryId,
      club_team_id: null,
      name,
      external_club_name: externalClub,
      contact_name: null,
      contact_email: email,
      contact_phone: null,
      logo_url: null,
      status: 'invited',
      invite_token: inviteToken,
      group_code: groupCode,
      group_position: null,
      squad_json: [],
      confirmed_at: null,
      notes: null,
    });
    revalidateTournaments();
    return { ok: true, id, message: delegateUrl(inviteToken) };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_tournament_teams')
    .insert({
      tournament_id: tournamentId,
      category_id: categoryId,
      name,
      external_club_name: externalClub,
      contact_email: email,
      group_code: groupCode,
      invite_token: inviteToken,
    })
    .select('id')
    .single();
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, id: String(data.id), message: delegateUrl(inviteToken) };
}

export async function issueTicket(
  tournamentId: string,
  ticketTypeId: string,
  purchaserName: string,
  purchaserEmail?: string
): Promise<TournamentActionState & { qrPayload?: string }> {
  const ticketId = crypto.randomUUID();
  const payload = generateQrPayload(tournamentId, ticketId);
  const hash = generateQrHash(payload);

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const tt = store.ticketTypes.find((t) => t.id === ticketTypeId);
    store.tickets.push({
      id: ticketId,
      tournament_id: tournamentId,
      ticket_type_id: ticketTypeId,
      purchaser_name: purchaserName,
      purchaser_email: purchaserEmail ?? null,
      qr_code_hash: hash,
      qr_payload: payload,
      status: 'valid',
      paid_flag: false,
      paid_amount_cents: tt?.price_cents ?? 0,
      valid_for_date: tt?.valid_for_date ?? null,
      match_id: tt?.match_id ?? null,
      scanned_at: null,
      scanned_by: null,
    });
    return { ok: true, id: ticketId, qrPayload: payload };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_tournament_tickets').insert({
    id: ticketId,
    tournament_id: tournamentId,
    ticket_type_id: ticketTypeId,
    purchaser_name: purchaserName,
    purchaser_email: purchaserEmail ?? null,
    qr_code_hash: hash,
    qr_payload: payload,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, id: ticketId, qrPayload: payload };
}

export async function validateTicketQr(
  gateToken: string,
  qrPayload: string
): Promise<TournamentActionState & { ticket?: TournamentTicket }> {
  {
    const store = getDemoTournamentsStore();
    if (gateToken === store.gateToken) {
      const ticket = store.tickets.find((t) => t.qr_payload === qrPayload);
      if (!ticket) return { ok: false, message: 'Entrada no válida' };
      if (ticket.status === 'used') return { ok: false, message: 'Entrada ya utilizada' };
      ticket.status = 'used';
      ticket.scanned_at = new Date().toISOString();
      return { ok: true, ticket, message: `Bienvenido/a, ${ticket.purchaser_name}` };
    }
  }

  const supabase = await createClient();
  const hash = generateQrHash(qrPayload);
  const { data: ticket } = await supabase
    .from('synq_tournament_tickets')
    .select('*')
    .eq('qr_code_hash', hash)
    .maybeSingle();
  if (!ticket) return { ok: false, message: 'Entrada no válida' };
  if (ticket.status === 'used') return { ok: false, message: 'Entrada ya utilizada' };

  await supabase
    .from('synq_tournament_tickets')
    .update({ status: 'used', scanned_at: new Date().toISOString() })
    .eq('id', ticket.id);

  return { ok: true, ticket: ticket as TournamentTicket, message: `Bienvenido/a, ${ticket.purchaser_name}` };
}

function parseSchedulingFromForm(formData: FormData): TournamentSchedulingConfig {
  const preset = String(formData.get('match_format_preset') ?? 'football_7') as TournamentSchedulingConfig['match_format_preset'];
  const raw: Partial<TournamentSchedulingConfig> = {
    match_format_preset: preset,
    periods: Number(formData.get('periods') ?? 2) as TournamentSchedulingConfig['periods'],
    period_minutes: Number(formData.get('period_minutes') ?? 20),
    break_minutes: Number(formData.get('break_minutes') ?? 5),
    turnover_minutes: Number(formData.get('turnover_minutes') ?? 8),
    min_rest_same_team_minutes: Number(formData.get('min_rest_same_team_minutes') ?? 60),
    day_start: String(formData.get('day_start') ?? '09:00'),
    day_end: String(formData.get('day_end') ?? '20:00'),
    lunch_break_enabled: formData.get('lunch_break_enabled') === 'on',
    lunch_start: String(formData.get('lunch_start') ?? '14:00'),
    lunch_end: String(formData.get('lunch_end') ?? '15:30'),
    group_strategy: String(formData.get('group_strategy') ?? 'group_alternate') as TournamentSchedulingConfig['group_strategy'],
    knockout_strategy: 'field_first',
  };
  return resolveSchedulingConfig(raw, preset);
}

export async function updateTournamentScheduling(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const scheduling = parseSchedulingFromForm(formData);

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    t.format_json = { ...t.format_json, scheduling };
    t.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: 'Planificación guardada' };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from('synq_tournaments').select('format_json').eq('id', tournamentId).maybeSingle();
  const formatJson = { ...((row?.format_json as Record<string, unknown>) ?? {}), scheduling };
  const { error } = await supabase
    .from('synq_tournaments')
    .update({ format_json: formatJson })
    .eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Planificación guardada' };
}

export async function updateTournamentFieldDivision(
  tournamentId: string,
  fieldId: string,
  divisionMode: FieldDivisionMode
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const field = store.fields.find((f) => f.id === fieldId && f.tournament_id === tournamentId);
    if (!field) return { ok: false, message: 'Campo no encontrado' };
    field.division_mode = divisionMode;
    revalidateTournaments();
    return { ok: true, message: 'División actualizada' };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from('synq_tournaments').select('format_json').eq('id', tournamentId).maybeSingle();
  const formatJson = { ...((row?.format_json as Record<string, unknown>) ?? {}) };
  const divisions = { ...((formatJson.field_divisions as Record<string, FieldDivisionMode>) ?? {}) };
  divisions[fieldId] = divisionMode;
  formatJson.field_divisions = divisions;
  const { error } = await supabase.from('synq_tournaments').update({ format_json: formatJson }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'División actualizada' };
}

export async function updateCategoryScheduling(
  tournamentId: string,
  categoryId: string,
  window: CategorySchedulingWindow
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (!window.day_date || !window.day_start || !window.day_end) {
    return { ok: false, message: 'Día y horario obligatorios' };
  }

  if (parseTimeMinutes(window.day_start) >= parseTimeMinutes(window.day_end)) {
    return { ok: false, message: 'La hora de fin debe ser posterior al inicio' };
  }

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    const category = store.categories.find((c) => c.id === categoryId);
    if (!tournament || !category) return { ok: false, message: 'Categoría no encontrada' };

    const scheduling = { ...getCategorySchedulingMap(tournament), [categoryId]: window };
    const validation = validateCategoryWindows(
      store.categories.filter((c) => c.tournament_id === tournamentId),
      scheduling
    );
    if (!validation.ok) {
      return { ok: false, message: validation.conflicts[0] ?? 'Ventanas solapadas' };
    }

    tournament.format_json = { ...tournament.format_json, category_scheduling: scheduling };
    tournament.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: `Ventana de ${category.name} guardada` };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from('synq_tournaments').select('format_json').eq('id', tournamentId).maybeSingle();
  const formatJson = { ...((row?.format_json as Record<string, unknown>) ?? {}) };
  const scheduling = { ...((formatJson.category_scheduling as Record<string, CategorySchedulingWindow>) ?? {}), [categoryId]: window };
  formatJson.category_scheduling = scheduling;
  const { error } = await supabase.from('synq_tournaments').update({ format_json: formatJson }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Ventana guardada' };
}

export async function suggestCategoryWindowsAction(tournamentId: string): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneo no encontrado' };

    const categories = store.categories.filter((c) => c.tournament_id === tournamentId);
    const fields = enrichFieldsWithDivisions(tournament, store.fields.filter((f) => f.tournament_id === tournamentId));
    const suggested = suggestCategoryWindows({ categories, tournament, fields });

    tournament.format_json = { ...tournament.format_json, category_scheduling: suggested };
    tournament.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: `Repartidas ${categories.length} ventanas sin solapamiento` };
  }

  const supabase = await createClient();
  const { data: tournamentRow } = await supabase.from('synq_tournaments').select('*').eq('id', tournamentId).maybeSingle();
  if (!tournamentRow) return { ok: false, message: 'Torneo no encontrado' };

  const tournament = mapTournament(tournamentRow as Record<string, unknown>);
  const [categoriesRes, fieldsRes] = await Promise.all([
    supabase.from('synq_tournament_categories').select('*').eq('tournament_id', tournamentId).order('sort_order'),
    supabase.from('synq_tournament_fields').select('*').eq('tournament_id', tournamentId).order('sort_order'),
  ]);

  const categories = (categoriesRes.data ?? []) as TournamentCategory[];
  const fields = enrichFieldsWithDivisions(tournament, (fieldsRes.data ?? []) as TournamentField[]);
  const suggested = suggestCategoryWindows({ categories, tournament, fields });

  const formatJson = { ...(tournament.format_json ?? {}), category_scheduling: suggested };
  const { error } = await supabase.from('synq_tournaments').update({ format_json: formatJson }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: `Repartidas ${categories.length} ventanas sin solapamiento` };
}

function parseTimeMinutes(time: string): number {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

function applyScheduleAssignments(
  store: ReturnType<typeof getDemoTournamentsStore>,
  tournamentId: string,
  assignments: ReturnType<typeof calculateTournamentSchedule>['assigned']
) {
  for (const a of assignments) {
    const match = store.matches.find((m) => m.id === a.match_id && m.tournament_id === tournamentId);
    if (!match || match.status === 'finished' || match.status === 'live') continue;
    match.field_id = a.field_id;
    match.scheduled_at = a.scheduled_at;
    match.metadata_json = {
      ...match.metadata_json,
      scheduling_division_key: a.division_key,
    };
  }
}

export async function calculateTournamentSchedules(
  tournamentId: string
): Promise<TournamentActionState & { capacitySummary?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const tournament = store.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneo no encontrado' };

    const fields = enrichFieldsWithDivisions(tournament, store.fields.filter((f) => f.tournament_id === tournamentId));
    const groups = store.groups.filter((g) => g.tournament_id === tournamentId);
    const matches = store.matches.filter((m) => m.tournament_id === tournamentId);
    const categories = store.categories.filter((c) => c.tournament_id === tournamentId);
    const result = calculateTournamentSchedule({
      tournament,
      fields,
      groups,
      matches,
      categories,
      onlyUnplayed: true,
    });

    applyScheduleAssignments(store, tournamentId, result.assigned);
    revalidateTournaments();
    return {
      ok: result.ok,
      message: result.message,
      capacitySummary: result.capacity.total_capacity.toString(),
    };
  }

  const supabase = await createClient();
  const { data: tournamentRow } = await supabase.from('synq_tournaments').select('*').eq('id', tournamentId).maybeSingle();
  if (!tournamentRow) return { ok: false, message: 'Torneo no encontrado' };

  const tournament = mapTournament(tournamentRow as Record<string, unknown>);
  const [fieldsRes, groupsRes, matchesRes, categoriesRes] = await Promise.all([
    supabase.from('synq_tournament_fields').select('*').eq('tournament_id', tournamentId).order('sort_order'),
    supabase.from('synq_tournament_groups').select('*').eq('tournament_id', tournamentId),
    supabase.from('synq_tournament_matches').select('*').eq('tournament_id', tournamentId),
    supabase.from('synq_tournament_categories').select('*').eq('tournament_id', tournamentId).order('sort_order'),
  ]);

  const fields = enrichFieldsWithDivisions(tournament, (fieldsRes.data ?? []) as TournamentField[]);
  const groups = (groupsRes.data ?? []) as TournamentBundle['groups'];
  const matches = (matchesRes.data ?? []) as TournamentMatch[];
  const categories = (categoriesRes.data ?? []) as TournamentCategory[];

  const result = calculateTournamentSchedule({ tournament, fields, groups, matches, categories, onlyUnplayed: true });

  for (const a of result.assigned) {
    const match = matches.find((m) => m.id === a.match_id);
    if (!match || match.status === 'finished' || match.status === 'live') continue;
    await supabase
      .from('synq_tournament_matches')
      .update({
        field_id: a.field_id,
        scheduled_at: a.scheduled_at,
        metadata_json: {
          ...(match.metadata_json ?? {}),
          scheduling_division_key: a.division_key,
        },
      })
      .eq('id', a.match_id);
  }

  revalidateTournaments();
  return { ok: result.ok, message: result.message };
}

export async function updateTournamentRevenueEstimates(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const estimates = {
    spectators: {
      count: Number(formData.get('spectators_count') ?? 0),
      unit_cents: Math.round(Number(formData.get('spectators_unit_eur') ?? 0) * 100),
    },
    bonos: {
      count: Number(formData.get('bonos_count') ?? 0),
      unit_cents: Math.round(Number(formData.get('bonos_unit_eur') ?? 0) * 100),
    },
    sponsorship: {
      total_cents: Math.round(Number(formData.get('sponsorship_total_eur') ?? 0) * 100),
    },
    signage: {
      impressions_per_day: Number(formData.get('signage_impressions') ?? 0),
      cpm_cents: Math.round(Number(formData.get('signage_cpm_eur') ?? 0) * 100),
    },
  };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    t.revenue_estimates_json = estimates;
    t.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: 'Estimación guardada' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_tournaments')
    .update({ revenue_estimates_json: estimates })
    .eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Estimación guardada' };
}

export async function updateTournamentTeamLogo(
  teamId: string,
  formData: FormData
): Promise<TournamentActionState & { url?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const file = formData.get('file');
  const logoUrlInput = String(formData.get('logo_url') ?? '').trim();
  let logoUrl: string | null = logoUrlInput || null;

  if (file instanceof File && file.size > 0) {
    if (await isDemoActive() || getDemoTournamentsStore().teams.some((t) => t.id === teamId)) {
      const buffer = Buffer.from(await file.arrayBuffer());
      logoUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    } else {
      const supabase = await createClient();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${clubId}/tournaments/teams/${teamId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('club-media').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });
      if (uploadError) return { ok: false, message: uploadError.message };
      const { data: urlData } = supabase.storage.from('club-media').getPublicUrl(path);
      logoUrl = urlData.publicUrl;
    }
  }

  if (await isDemoActive() || getDemoTournamentsStore().teams.some((t) => t.id === teamId)) {
    const store = getDemoTournamentsStore();
    const team = store.teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, message: 'Equipo no encontrado' };
    team.logo_url = logoUrl;
    revalidateTournaments();
    return { ok: true, url: logoUrl ?? undefined, message: 'Escudo actualizado' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_tournament_teams').update({ logo_url: logoUrl }).eq('id', teamId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, url: logoUrl ?? undefined, message: 'Escudo actualizado' };
}

export async function updateTeamStatus(
  teamId: string,
  status: TournamentTeam['status']
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const team = store.teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, message: 'Equipo no encontrado' };
    team.status = status;
    if (status === 'confirmed') team.confirmed_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, message: 'Estado actualizado' };
  }

  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === 'confirmed') patch.confirmed_at = new Date().toISOString();
  const { error } = await supabase.from('synq_tournament_teams').update(patch).eq('id', teamId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, message: 'Estado actualizado' };
}

export async function uploadTournamentMedia(
  tournamentId: string,
  formData: FormData
): Promise<TournamentActionState & { url?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  const file = formData.get('file');
  const kind = String(formData.get('kind') ?? 'gallery');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'Archivo no válido' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    if (kind === 'cover') {
      t.cover_image_url = base64;
    } else {
      t.venue_images_json = [...t.venue_images_json, base64];
    }
    t.updated_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true, url: base64, message: 'Imagen subida' };
  }

  const supabase = await createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${clubId}/tournaments/${tournamentId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
  if (uploadError) return { ok: false, message: uploadError.message };

  const { data: urlData } = supabase.storage.from('club-media').getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { data: row } = await supabase.from('synq_tournaments').select('cover_image_url, venue_images_json').eq('id', tournamentId).maybeSingle();
  const patch =
    kind === 'cover'
      ? { cover_image_url: publicUrl }
      : { venue_images_json: [...((row?.venue_images_json as string[]) ?? []), publicUrl] };

  const { error } = await supabase.from('synq_tournaments').update(patch).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true, url: publicUrl, message: 'Imagen subida' };
}

export async function removeTournamentGalleryImage(
  tournamentId: string,
  imageUrl: string
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive() || demoBundleById(tournamentId)) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.id === tournamentId);
    if (!t) return { ok: false, message: 'Torneo no encontrado' };
    t.venue_images_json = t.venue_images_json.filter((u) => u !== imageUrl);
    revalidateTournaments();
    return { ok: true };
  }

  const supabase = await createClient();
  const { data: row } = await supabase.from('synq_tournaments').select('venue_images_json').eq('id', tournamentId).maybeSingle();
  const next = ((row?.venue_images_json as string[]) ?? []).filter((u) => u !== imageUrl);
  const { error } = await supabase.from('synq_tournaments').update({ venue_images_json: next }).eq('id', tournamentId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true };
}
