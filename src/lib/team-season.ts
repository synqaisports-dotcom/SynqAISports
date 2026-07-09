import {
  CANTERA_CATEGORIES,
  getCanteraCategory,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import { formatTeamName } from '@/lib/cantera-teams';
import type { TeamClubHistoryEvent, TeamClubHistoryKind } from '@/lib/team-club-history';
import {
  buildTeamMoveHistoryEvent,
  type PlayerClubHistoryEvent,
} from '@/lib/player-club-history';

/** Rangos orientativos de año de nacimiento por categoría (temporada tipo 25/26). */
export const CATEGORY_BIRTH_YEAR_HINTS: Record<
  CanteraCategorySlug,
  { idealMin: number; idealMax: number }
> = {
  debutantes: { idealMin: 2020, idealMax: 2021 },
  prebenjamin: { idealMin: 2018, idealMax: 2020 },
  benjamin: { idealMin: 2016, idealMax: 2017 },
  alevin: { idealMin: 2014, idealMax: 2015 },
  infantil: { idealMin: 2012, idealMax: 2013 },
  cadete: { idealMin: 2010, idealMax: 2011 },
  juvenil: { idealMin: 2007, idealMax: 2009 },
};

export type PlayerSeasonRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  birth_year: number | null;
};

export type PlayerSeasonWarning = {
  playerId: string;
  message: string;
};

export type PlayerSeasonDecision = {
  playerId: string;
  action: 'promote' | 'unassign' | 'move';
  targetTeamId?: string | null;
};

export function defaultSeasonLabel(reference = new Date()): string {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const start = month >= 6 ? year : year - 1;
  const endShort = String(start + 1).slice(-2);
  return `${start}/${endShort}`;
}

export function getNextCategorySlug(
  slug: CanteraCategorySlug
): CanteraCategorySlug | null {
  const index = CANTERA_CATEGORIES.findIndex((item) => item.slug === slug);
  if (index < 0 || index >= CANTERA_CATEGORIES.length - 1) return null;
  return CANTERA_CATEGORIES[index + 1]!.slug;
}

export function suggestPromotionTarget(team: {
  category_slug: CanteraCategorySlug | null;
  team_letter: string | null;
}): {
  categorySlug: CanteraCategorySlug | null;
  teamLetter: string;
} | null {
  if (!team.category_slug) return null;
  const next = getNextCategorySlug(team.category_slug);
  if (!next) return null;
  return {
    categorySlug: next,
    teamLetter: team.team_letter ?? 'A',
  };
}

export function previewTeamName(
  categorySlug: CanteraCategorySlug,
  teamLetter: string
): string {
  const category = getCanteraCategory(categorySlug);
  return formatTeamName(category?.name ?? categorySlug, teamLetter);
}

export function birthYearWarningsForCategory(
  players: PlayerSeasonRow[],
  categorySlug: CanteraCategorySlug
): PlayerSeasonWarning[] {
  const hints = CATEGORY_BIRTH_YEAR_HINTS[categorySlug];
  const warnings: PlayerSeasonWarning[] = [];

  for (const player of players) {
    if (!player.birth_year) {
      warnings.push({
        playerId: player.id,
        message: 'Sin año de nacimiento — revisa si encaja en la categoría destino.',
      });
      continue;
    }
    if (player.birth_year < hints.idealMin || player.birth_year > hints.idealMax) {
      warnings.push({
        playerId: player.id,
        message: `Año ${player.birth_year} fuera del rango habitual (${hints.idealMin}–${hints.idealMax}) para esta categoría.`,
      });
    }
  }

  return warnings;
}

export function buildTeamSeasonHistoryEvent(input: {
  kind: TeamClubHistoryKind;
  fromLabel: string;
  toLabel: string;
  seasonLabel?: string;
  playerCount?: number;
  extraDetail?: string;
}): TeamClubHistoryEvent {
  const occurredAt = new Date().toISOString();
  const titles: Record<TeamClubHistoryKind, string> = {
    season_promotion: 'Ascenso de temporada',
    letter_change: 'Cambio de letra',
    category_bulk: 'Cierre de temporada por categoría',
    roster_merge: 'Fusión de plantillas',
    paused: 'Equipo pausado',
    reactivated: 'Equipo reactivado',
  };

  const detailParts = [`${input.fromLabel} → ${input.toLabel}`];
  if (input.extraDetail) detailParts.push(input.extraDetail);
  if (input.playerCount != null) detailParts.push(`${input.playerCount} jugadores`);

  return {
    id: `team-season-${occurredAt}`,
    kind: input.kind,
    title: titles[input.kind],
    detail: detailParts.join(' · '),
    occurredAt,
    seasonLabel: input.seasonLabel,
    playerCount: input.playerCount,
  };
}

export function buildPlayerPromotionHistoryEvents(input: {
  fromTeam: { name: string; category_slug: string | null; category: string };
  toTeam: { name: string; category_slug: string | null; category: string };
  seasonLabel?: string;
}): PlayerClubHistoryEvent {
  const event = buildTeamMoveHistoryEvent({
    fromTeam: input.fromTeam,
    toTeam: input.toTeam,
  });
  if (input.seasonLabel) {
    return {
      ...event,
      detail: `${event.detail} · Temporada ${input.seasonLabel}`,
    };
  }
  return event;
}

export function parsePlayerSeasonDecisions(raw: string): PlayerSeasonDecision[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as PlayerSeasonDecision[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item.playerId && item.action);
  } catch {
    return [];
  }
}
