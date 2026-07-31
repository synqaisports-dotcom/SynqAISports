import { getDemoTournamentBundle, getDemoTournamentsStore } from '@/lib/demo-tournaments-store';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  TOURNAMENT_SELECT,
  type FieldDivisionMode,
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

function demoBundleBySlug(slug: string): TournamentBundle | null {
  const store = getDemoTournamentsStore();
  const normalized = slug.trim().toLowerCase();
  const t = store.tournaments.find((x) => x.slug.toLowerCase() === normalized);
  const bundle = t ? getDemoTournamentBundle(t.id) : null;
  return bundle ? enrichBundle(bundle) : null;
}

function demoBundleById(tournamentId: string): TournamentBundle | null {
  const bundle = getDemoTournamentBundle(tournamentId);
  return bundle ? enrichBundle(bundle) : null;
}

/** Serializa el bundle para pasarlo a Client Components (evita errores RSC). */
export function serializeTournamentBundle(bundle: TournamentBundle): TournamentBundle {
  return JSON.parse(JSON.stringify(bundle)) as TournamentBundle;
}

export async function loadTournamentBundleFromStore(tournamentId: string): Promise<TournamentBundle | null> {
  const demo = demoBundleById(tournamentId);
  if (demo) return demo;

  if (await isDemoActive()) {
    const bundle = getDemoTournamentBundle(tournamentId);
    return bundle ? enrichBundle(bundle) : null;
  }

  if (!isSupabaseConfigured()) return null;

  try {
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
  } catch (error) {
    console.error('[torneos] loadTournamentBundleFromStore:', error);
    return null;
  }
}

/** Carga pública por slug — nunca lanza: demo primero, Supabase con try/catch. */
export async function loadPublicTournamentBySlug(slug: string): Promise<TournamentBundle | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const demo = demoBundleBySlug(normalized);
  if (demo?.tournament.public_enabled) return demo;

  if (!isSupabaseConfigured()) return demo;

  try {
    const supabase = await createClient();
    const { data } = await supabase.from('synq_tournaments').select('id').eq('slug', normalized).maybeSingle();
    if (!data) return demo;
    return loadTournamentBundleFromStore(String(data.id));
  } catch (error) {
    console.error('[torneos] loadPublicTournamentBySlug:', error);
    return demo;
  }
}
