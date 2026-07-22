/**
 * Materiales de pizarra — PNG de alta calidad en /public/drawing-materials/.
 * Los jugadores usan sprite base + etiqueta dinámica en Konva.
 */

export type MaterialKind =
  | 'player-own'
  | 'player-rival'
  | 'player-neutral'
  | 'cone'
  | 'cone-pole'
  | 'seta'
  | 'ball'
  | 'goal'
  | 'hurdle'
  | 'ladder';

const CACHE_VERSION = 3;
const cache = new Map<string, HTMLImageElement>();

const MATERIAL_ASSET_PATH: Record<MaterialKind, string> = {
  'player-own': '/drawing-materials/player-own.png',
  'player-rival': '/drawing-materials/player-rival.png',
  'player-neutral': '/drawing-materials/player-neutral.png',
  cone: '/drawing-materials/cone.png',
  'cone-pole': '/drawing-materials/cone-pole.png',
  seta: '/drawing-materials/seta.png',
  ball: '/drawing-materials/ball.png',
  goal: '/drawing-materials/goal.png',
  hurdle: '/drawing-materials/hurdle.png',
  ladder: '/drawing-materials/ladder.png',
};

function cacheKey(kind: MaterialKind): string {
  return `${CACHE_VERSION}:${kind}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function isPlayerMaterial(kind: MaterialKind): boolean {
  return kind === 'player-own' || kind === 'player-rival' || kind === 'player-neutral';
}

export function playerLabelForKind(kind: MaterialKind): string {
  if (kind === 'player-rival') return 'X';
  if (kind === 'player-neutral') return 'N';
  return '1';
}

export function playerLabelFontSize(materialScale: number): number {
  return Math.max(11, materialScale * 0.36);
}

export async function getMaterialImage(kind: MaterialKind): Promise<HTMLImageElement> {
  if (typeof document === 'undefined') {
    throw new Error('Material assets require browser');
  }
  const key = cacheKey(kind);
  const cached = cache.get(key);
  if (cached) return cached;

  const img = await loadImage(MATERIAL_ASSET_PATH[kind]);
  cache.set(key, img);
  return img;
}

export const MATERIAL_CATALOG: { kind: MaterialKind; label: string }[] = [
  { kind: 'player-own', label: 'Jugador' },
  { kind: 'player-rival', label: 'Rival' },
  { kind: 'player-neutral', label: 'Neutro' },
  { kind: 'cone', label: 'Cono' },
  { kind: 'cone-pole', label: 'Pica' },
  { kind: 'seta', label: 'Seta' },
  { kind: 'ball', label: 'Balón' },
  { kind: 'goal', label: 'Portería' },
  { kind: 'hurdle', label: 'Valla' },
  { kind: 'ladder', label: 'Escalera' },
];
