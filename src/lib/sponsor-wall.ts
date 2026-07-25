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
export const SPONSOR_WALL_GRID_ROWS = 4;

export const SPONSOR_TIER_GRID_SPAN: Record<SponsorTier, { cols: number; rows: number }> = {
  gold: { cols: 2, rows: 2 },
  silver: { cols: 2, rows: 1 },
  bronze: { cols: 1, rows: 1 },
};

export type SponsorWallPlacement = {
  sponsor: SignageSponsor;
  col: number;
  row: number;
  cols: number;
  rows: number;
};

function canPlace(
  occupied: boolean[][],
  col: number,
  row: number,
  cols: number,
  rows: number
): boolean {
  for (let r = row; r < row + rows; r += 1) {
    for (let c = col; c < col + cols; c += 1) {
      if (occupied[r]?.[c]) return false;
    }
  }
  return true;
}

function markPlace(
  occupied: boolean[][],
  col: number,
  row: number,
  cols: number,
  rows: number
) {
  for (let r = row; r < row + rows; r += 1) {
    for (let c = col; c < col + cols; c += 1) {
      if (occupied[r]) occupied[r][c] = true;
    }
  }
}

export function layoutSponsorsOnWall(sponsors: SignageSponsor[]): SponsorWallPlacement[] {
  const occupied = Array.from({ length: SPONSOR_WALL_GRID_ROWS }, () =>
    Array.from({ length: SPONSOR_WALL_GRID_COLS }, () => false)
  );
  const placements: SponsorWallPlacement[] = [];

  for (const sponsor of sortSponsorsByTier(sponsors)) {
    const span = SPONSOR_TIER_GRID_SPAN[sponsor.tier];
    let placed = false;
    for (let row = 0; row <= SPONSOR_WALL_GRID_ROWS - span.rows && !placed; row += 1) {
      for (let col = 0; col <= SPONSOR_WALL_GRID_COLS - span.cols; col += 1) {
        if (canPlace(occupied, col, row, span.cols, span.rows)) {
          markPlace(occupied, col, row, span.cols, span.rows);
          placements.push({ sponsor, col, row, cols: span.cols, rows: span.rows });
          placed = true;
          break;
        }
      }
    }
  }

  return placements;
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
