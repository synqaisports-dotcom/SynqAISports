import {
  analyzeCategoryCapacity,
  formatCategoryWindowLabel,
  getCategoryWindow,
} from '@/lib/tournament-category-scheduling';
import { getSchedulingConfig, FIELD_DIVISION_MODE_LABELS } from '@/lib/tournament-scheduling';
import {
  FORMAT_TYPE_LABELS,
  TOURNAMENT_SPORT_LABELS,
  type TournamentBundle,
  type TournamentDossierConfig,
  type TournamentTeam,
} from '@/lib/tournaments';

export type DossierParticipantGroup = {
  group_code: string;
  teams: { name: string; club: string | null; status: string }[];
};

export type DossierCategorySection = {
  id: string;
  name: string;
  groups_count: number;
  teams_per_group: number;
  format_label: string;
  window_label: string;
  match_count: number;
  participants: DossierParticipantGroup[];
};

export type DossierTicketLine = {
  name: string;
  description: string | null;
  price_label: string;
  scope_label: string;
};

export type DossierFieldSection = {
  label: string;
  notes: string | null;
  division_label: string;
  map_url: string | null;
};

export type DossierSponsorLine = {
  id: string;
  name: string;
  logo_url: string | null;
  tier: string;
};

export type TournamentDossierViewModel = {
  title: string;
  sport_label: string;
  venue_name: string | null;
  venue_map_url: string | null;
  date_range_label: string;
  cover_image_url: string | null;
  gallery_urls: string[];
  description: string | null;
  rules_text: string | null;
  welcome_message: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  categories: DossierCategorySection[];
  tickets: DossierTicketLine[];
  fields: DossierFieldSection[];
  sponsors: DossierSponsorLine[];
  total_teams: number;
  generated_at: string;
  completeness: { label: string; ok: boolean }[];
};

function formatDateRange(starts: string | null, ends: string | null): string {
  if (!starts) return 'Fechas por confirmar';
  const start = new Date(starts);
  const end = ends ? new Date(ends) : start;
  const opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const startStr = start.toLocaleDateString('es-ES', opts);
  if (start.toDateString() === end.toDateString()) return startStr;
  const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(cents / 100);
}

const TICKET_SCOPE_LABELS: Record<string, string> = {
  match: 'Por partido',
  day: 'Día completo',
  tournament: 'Fin de semana / torneo',
};

function groupParticipants(teams: TournamentTeam[]): DossierParticipantGroup[] {
  const map = new Map<string, DossierParticipantGroup['teams']>();
  for (const t of teams) {
    const code = t.group_code ?? '—';
    const list = map.get(code) ?? [];
    list.push({
      name: t.name,
      club: t.external_club_name,
      status: t.status,
    });
    map.set(code, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group_code, teamList]) => ({
      group_code,
      teams: teamList.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function getDossierConfig(bundle: TournamentBundle): TournamentDossierConfig {
  const raw = bundle.tournament.format_json?.dossier;
  if (!raw || typeof raw !== 'object') return {};
  return raw as TournamentDossierConfig;
}

export function buildTournamentDossier(bundle: TournamentBundle): TournamentDossierViewModel {
  const { tournament } = bundle;
  const config = getDossierConfig(bundle);
  const schedulingConfig = getSchedulingConfig(tournament);

  const categories: DossierCategorySection[] = bundle.categories.map((cat) => {
    const catTeams = bundle.teams.filter((t) => t.category_id === cat.id);
    const analysis = analyzeCategoryCapacity({
      category: cat,
      tournament,
      fields: bundle.fields,
      teamsRegistered: catTeams.length,
      config: schedulingConfig,
    });
    const window = getCategoryWindow(cat.id, tournament, schedulingConfig);

    return {
      id: cat.id,
      name: cat.name,
      groups_count: cat.groups_count,
      teams_per_group: cat.teams_per_group,
      format_label: FORMAT_TYPE_LABELS[cat.format_type],
      window_label: window ? formatCategoryWindowLabel(window) : analysis.window_label,
      match_count: analysis.match_count,
      participants: groupParticipants(catTeams),
    };
  });

  const tickets: DossierTicketLine[] = bundle.ticketTypes
    .filter((t) => t.active && t.price_cents > 0)
    .map((t) => ({
      name: t.name,
      description: t.description,
      price_label: formatPrice(t.price_cents, t.currency),
      scope_label: TICKET_SCOPE_LABELS[t.ticket_scope] ?? t.ticket_scope,
    }));

  const fields: DossierFieldSection[] = bundle.fields.map((f) => ({
    label: f.label,
    notes: f.notes,
    division_label: f.division_mode ? FIELD_DIVISION_MODE_LABELS[f.division_mode] : 'Campo completo',
    map_url: f.map_url,
  }));

  const sponsors: DossierSponsorLine[] = bundle.sponsors
    .filter((s) => s.active)
    .sort((a, b) => {
      const order = { gold: 0, silver: 1, bronze: 2 } as const;
      const tierDiff = (order[a.tier] ?? 9) - (order[b.tier] ?? 9);
      return tierDiff !== 0 ? tierDiff : a.sort_order - b.sort_order;
    })
    .map((s) => ({ id: s.id, name: s.name, logo_url: s.logo_url, tier: s.tier }));

  const completeness = [
    { label: 'Portada del torneo', ok: !!tournament.cover_image_url },
    { label: 'Normas y reglamento', ok: !!tournament.rules_text?.trim() },
    { label: 'Al menos una categoría', ok: bundle.categories.length > 0 },
    { label: 'Equipos inscritos', ok: bundle.teams.length > 0 },
    { label: 'Campos / instalación', ok: bundle.fields.length > 0 },
    { label: 'Plano o mapa de acceso', ok: !!(tournament.venue_map_url || fields.some((f) => f.map_url)) },
    { label: 'Precios de taquilla', ok: tickets.length > 0 || config.hide_ticketing !== true },
    {
      label: 'Logos de patrocinadores',
      ok: sponsors.length === 0 || sponsors.every((s) => !!s.logo_url),
    },
  ];

  return {
    title: tournament.name,
    sport_label: TOURNAMENT_SPORT_LABELS[tournament.sport_key],
    venue_name: tournament.venue_name,
    venue_map_url: tournament.venue_map_url,
    date_range_label: formatDateRange(tournament.starts_at, tournament.ends_at),
    cover_image_url: tournament.cover_image_url,
    gallery_urls: tournament.venue_images_json,
    description: tournament.description,
    rules_text: tournament.rules_text,
    welcome_message: config.welcome_message ?? null,
    contact_email: config.contact_email ?? null,
    contact_phone: config.contact_phone ?? null,
    categories,
    tickets,
    fields,
    sponsors: config.include_sponsors === false ? [] : sponsors,
    total_teams: bundle.teams.length,
    generated_at: new Date().toISOString(),
    completeness,
  };
}
