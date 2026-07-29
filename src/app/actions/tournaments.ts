'use server';

import { requireClubId } from '@/lib/auth-staff';
import {
  DEMO_GATE_TOKEN,
  DEMO_TOURNAMENT_ID,
  DEMO_TOURNAMENTS_CLUB_ID,
  getDemoTournamentBundle,
  getDemoTournamentsStore,
} from '@/lib/demo-tournaments-store';
import { isDemoActive } from '@/lib/demo';
import { generateMultifinalCompetition } from '@/lib/tournament-brackets';
import {
  delegateUrl,
  gateUrl,
  generateAccessToken,
  generateInviteToken,
  generateQrHash,
  generateQrPayload,
  tokenExpiresAt,
} from '@/lib/tournament-access';
import {
  DEFAULT_PLACEMENT_BRACKETS,
  estimateTournamentRevenue,
  slugifyTournamentName,
  TOURNAMENT_SELECT,
  totalEstimatedRevenueCents,
  type FormatType,
  type Tournament,
  type TournamentBundle,
  type TournamentCategory,
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
import { revalidatePath } from 'next/cache';

export type TournamentActionState = { ok: boolean; message?: string; id?: string; slug?: string };

const TOURNAMENT_PATHS = ['/portal/torneos'];

function revalidateTournaments() {
  for (const path of TOURNAMENT_PATHS) revalidatePath(path, 'layout');
}

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
    return store.tournaments.filter((t) => t.club_id === clubId || clubId === DEMO_TOURNAMENTS_CLUB_ID);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_tournaments')
    .select(TOURNAMENT_SELECT)
    .eq('club_id', clubId)
    .order('starts_at', { ascending: false });
  return (data ?? []).map((r) => mapTournament(r as Record<string, unknown>));
}

export async function loadTournamentBundle(tournamentId: string): Promise<TournamentBundle | null> {
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

  return {
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
  };
}

export async function loadTournamentBySlug(slug: string): Promise<TournamentBundle | null> {
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const t = store.tournaments.find((x) => x.slug === slug);
    return t ? getDemoTournamentBundle(t.id) : null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from('synq_tournaments').select('id').eq('slug', slug).maybeSingle();
  if (!data) return null;
  return loadTournamentBundle(String(data.id));
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
    store.categories.push({
      id,
      tournament_id: tournamentId,
      name,
      sport_key: null,
      groups_count: groupsCount,
      teams_per_group: teamsPerGroup,
      format_type: formatType,
      placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= teamsPerGroup),
      sort_order: store.categories.filter((c) => c.tournament_id === tournamentId).length,
    });
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

export async function generateCompetitionStructure(
  tournamentId: string,
  categoryId: string
): Promise<TournamentActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'No autorizado' };

  if (await isDemoActive()) {
    return { ok: true, message: 'Estructura ya generada en demo' };
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
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const match = store.matches.find((m) => m.id === matchId);
    if (!match) return { ok: false, message: 'Partido no encontrado' };
    match.score_home = scoreHome;
    match.score_away = scoreAway;
    match.status = status;
    if (status === 'live') match.live_started_at = new Date().toISOString();
    if (status === 'finished') match.live_finished_at = new Date().toISOString();
    revalidateTournaments();
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_tournament_matches')
    .update({
      score_home: scoreHome,
      score_away: scoreAway,
      status,
      live_finished_at: status === 'finished' ? new Date().toISOString() : undefined,
    })
    .eq('id', matchId);
  if (error) return { ok: false, message: error.message };
  revalidateTournaments();
  return { ok: true };
}

export async function updateMatchScoreByMesaToken(
  token: string,
  scoreHome: number,
  scoreAway: number,
  status: TournamentMatch['status']
): Promise<TournamentActionState> {
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const match = store.matches.find((m) => m.mesa_token === token);
    if (!match) return { ok: false, message: 'Token inválido' };
    return updateMatchScore(match.id, scoreHome, scoreAway, status);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_tournament_matches')
    .select('id')
    .eq('mesa_token', token)
    .maybeSingle();
  if (!data) return { ok: false, message: 'Token inválido' };
  return updateMatchScore(String(data.id), scoreHome, scoreAway, status);
}

export async function loadMatchByMesaToken(token: string): Promise<{
  match: TournamentMatch;
  bundle: TournamentBundle;
} | null> {
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
  const bundle = await loadTournamentBundle(String(match.tournament_id));
  if (!bundle) return null;
  return { match: match as TournamentMatch, bundle };
}

export async function loadTeamByInviteToken(token: string): Promise<{
  team: TournamentTeam;
  bundle: TournamentBundle;
} | null> {
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
  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    const team = store.teams.find((t) => t.invite_token === inviteToken);
    if (!team) return { ok: false, message: 'Enlace inválido' };
    team.status = 'confirmed';
    team.squad_json = squadJson;
    team.confirmed_at = new Date().toISOString();
    return { ok: true, message: 'Asistencia confirmada' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_tournament_teams')
    .update({ status: 'confirmed', squad_json: squadJson, confirmed_at: new Date().toISOString() })
    .eq('invite_token', inviteToken);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Asistencia confirmada' };
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
    bundle.tournament.ticketing_config_json
  );

  if (await isDemoActive()) {
    bundle.tournament.revenue_estimates_json = estimates;
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
  if (await isDemoActive()) {
    if (tournamentId === DEMO_TOURNAMENT_ID) return gateUrl(DEMO_GATE_TOKEN);
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
  if (await isDemoActive()) {
    if (gateToken !== DEMO_GATE_TOKEN) return { ok: false, message: 'Taquilla no autorizada' };
    const store = getDemoTournamentsStore();
    const ticket = store.tickets.find((t) => t.qr_payload === qrPayload);
    if (!ticket) return { ok: false, message: 'Entrada no válida' };
    if (ticket.status === 'used') return { ok: false, message: 'Entrada ya utilizada' };
    ticket.status = 'used';
    ticket.scanned_at = new Date().toISOString();
    return { ok: true, ticket, message: `Bienvenido/a, ${ticket.purchaser_name}` };
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
