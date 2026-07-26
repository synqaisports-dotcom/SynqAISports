import {
  sortSponsorsByTier,
  SPONSOR_WALL_ENTRANCES,
  type SignageSponsor,
  type SponsorTier,
  type SponsorWallEntrance,
} from '@/lib/signage';

export {
  SPONSOR_WALL_ENTRANCES,
  type SponsorWallEntrance,
} from '@/lib/signage';

export const SPONSOR_WALL_ENTRANCE_LABELS: Record<SponsorWallEntrance, string> = {
  'stagger-fade': 'Fundido escalonado',
  'stagger-up': 'Subida escalonada',
  'stagger-scale': 'Zoom escalonado',
  pop: 'Aparición pop',
  wave: 'Ola lateral',
};

export const SPONSOR_WALL_GRID_COLS = 6;

export const SPONSOR_TIER_GRID_SPAN: Record<SponsorTier, { cols: number; rows: number }> = {
  gold: { cols: 2, rows: 2 },
  silver: { cols: 2, rows: 1 },
  bronze: { cols: 1, rows: 1 },
};

/** Zonas verticales: oro arriba, plata centro, bronce abajo. */
export const SPONSOR_WALL_TIER_ZONES: SponsorTier[] = ['gold', 'silver', 'bronze'];

export type SponsorWallPlacement = {
  sponsor: SignageSponsor;
  zone: SponsorTier;
  col: number;
  row: number;
  cols: number;
  rows: number;
};

function sponsorsInTier(sponsors: SignageSponsor[], tier: SponsorTier): SignageSponsor[] {
  return sortSponsorsByTier(sponsors).filter((s) => s.tier === tier);
}

function layoutTierZone(sponsors: SignageSponsor[], tier: SponsorTier): SponsorWallPlacement[] {
  const tierSponsors = sponsorsInTier(sponsors, tier);
  if (tierSponsors.length === 0) return [];

  const span = SPONSOR_TIER_GRID_SPAN[tier];
  const blocksPerRow = Math.floor(SPONSOR_WALL_GRID_COLS / span.cols);
  const placements: SponsorWallPlacement[] = [];

  tierSponsors.forEach((sponsor, index) => {
    const blockRow = Math.floor(index / blocksPerRow);
    const blockCol = index % blocksPerRow;
    placements.push({
      sponsor,
      zone: tier,
      col: blockCol * span.cols,
      row: blockRow * span.rows,
      cols: span.cols,
      rows: span.rows,
    });
  });

  return placements;
}

export function layoutSponsorsOnWall(sponsors: SignageSponsor[]): SponsorWallPlacement[] {
  return SPONSOR_WALL_TIER_ZONES.flatMap((tier) => layoutTierZone(sponsors, tier));
}

export function zoneRowCount(placements: SponsorWallPlacement[], tier: SponsorTier): number {
  const zonePlacements = placements.filter((p) => p.zone === tier);
  if (zonePlacements.length === 0) return 0;
  const span = SPONSOR_TIER_GRID_SPAN[tier];
  const maxRow = Math.max(...zonePlacements.map((p) => p.row));
  return maxRow + span.rows;
}

export function zoneFlexWeight(placements: SponsorWallPlacement[], tier: SponsorTier): number {
  const rows = zoneRowCount(placements, tier);
  if (rows === 0) return 0;
  // Oro ocupa más altura por bloque 2×2
  return tier === 'gold' ? rows * 1.35 : tier === 'silver' ? rows * 1.1 : rows;
}

const TIER_ORDER: Record<SponsorTier, number> = { gold: 0, silver: 1, bronze: 2 };

/** Orden de aparición: oro → plata → bronce, un logo cada segundo. */
export function sponsorWallEntranceDelays(placements: SponsorWallPlacement[]): Map<string, number> {
  const sorted = [...placements].sort((a, b) => {
    const tierDiff = TIER_ORDER[a.sponsor.tier] - TIER_ORDER[b.sponsor.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.row - b.row || a.col - b.col;
  });
  const delays = new Map<string, number>();
  sorted.forEach((placement, index) => {
    delays.set(placement.sponsor.id, index * SPONSOR_WALL_STAGGER_MS);
  });
  return delays;
}

export function sponsorWallEntranceClass(entrance: SponsorWallEntrance): string {
  return {
    'stagger-fade': 'signage-wall-stagger-fade',
    'stagger-up': 'signage-wall-stagger-up',
    'stagger-scale': 'signage-wall-stagger-scale',
    pop: 'signage-wall-pop',
    wave: 'signage-wall-wave',
  }[entrance];
}

export function parseSponsorWallEntrance(value: unknown): SponsorWallEntrance {
  const v = String(value ?? 'stagger-fade');
  return SPONSOR_WALL_ENTRANCES.includes(v as SponsorWallEntrance) ? (v as SponsorWallEntrance) : 'stagger-fade';
}

/** Filas visibles estimadas en 1080p por zona (referencia para capacidad). */
const ESTIMATED_ZONE_ROWS_1080P: Record<SponsorTier, number> = {
  gold: 2,
  silver: 2,
  bronze: 2,
};

export const SPONSOR_WALL_MAX_BY_TIER: Record<SponsorTier, number> = {
  gold:
    Math.floor(SPONSOR_WALL_GRID_COLS / SPONSOR_TIER_GRID_SPAN.gold.cols) *
    Math.floor(ESTIMATED_ZONE_ROWS_1080P.gold / SPONSOR_TIER_GRID_SPAN.gold.rows),
  silver:
    Math.floor(SPONSOR_WALL_GRID_COLS / SPONSOR_TIER_GRID_SPAN.silver.cols) *
    ESTIMATED_ZONE_ROWS_1080P.silver,
  bronze: SPONSOR_WALL_GRID_COLS * ESTIMATED_ZONE_ROWS_1080P.bronze,
};

export type SponsorWallCapacityCounts = {
  gold: number;
  silver: number;
  bronze: number;
};

export type SponsorWallCapacitySummary = {
  maxByTier: Record<SponsorTier, number>;
  currentFit: SponsorWallCapacityCounts & { total: number };
};

export function summarizeSponsorWallCapacity(sponsors: SignageSponsor[]): SponsorWallCapacitySummary {
  const active = sponsors.filter((s) => s.active);
  const currentCounts: SponsorWallCapacityCounts = {
    gold: active.filter((s) => s.tier === 'gold').length,
    silver: active.filter((s) => s.tier === 'silver').length,
    bronze: active.filter((s) => s.tier === 'bronze').length,
  };

  return {
    maxByTier: SPONSOR_WALL_MAX_BY_TIER,
    currentFit: {
      ...currentCounts,
      total: currentCounts.gold + currentCounts.silver + currentCounts.bronze,
    },
  };
}

/** Un logo cada segundo; orden oro → plata → bronce. */
export const SPONSOR_WALL_STAGGER_MS = 1000;
