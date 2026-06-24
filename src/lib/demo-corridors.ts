import type { CorridorDelayRow } from './types';

/** Corredor LATAM — espejo de la migración SQL (demo offline). */
export const DEMO_CORRIDORS: CorridorDelayRow[] = [
  {
    id: 'demo-corridor-labubu',
    dna_id: 'demo-labubu',
    slug: 'labubu',
    origin_region: 'asia',
    target_market: 'LATAM',
    reference_date: '2024-10-15',
    delay_days: 46,
    relation_to_es: 'before',
    notes:
      'Estimado: México/BR TikTok coleccionistas e importaciones ~6 sem antes del pico ES (pop-up Barcelona).',
  },
  {
    id: 'demo-corridor-pop-it',
    dna_id: 'demo-pop-it',
    slug: 'pop-it',
    origin_region: 'usa',
    target_market: 'LATAM',
    reference_date: '2021-04-10',
    delay_days: 35,
    relation_to_es: 'before',
    notes:
      'Validado orientativo: viral TikTok US/LATAM ~4 sem antes del pico en colegios ES (mayo 2021).',
  },
  {
    id: 'demo-corridor-pokemon',
    dna_id: 'demo-pokemon-tcg-sv',
    slug: 'pokemon-tcg-sv',
    origin_region: 'asia',
    target_market: 'LATAM',
    reference_date: '2023-04-25',
    delay_days: 25,
    relation_to_es: 'after',
    notes:
      'Estimado: lanzamiento EU 31-mar-2023; pico demanda MX/retail LATAM ~3-4 sem después.',
  },
  {
    id: 'demo-corridor-fifa',
    dna_id: 'demo-fifa-stickers-2022',
    slug: 'fifa-stickers-2022',
    origin_region: 'global',
    target_market: 'LATAM',
    reference_date: '2022-11-20',
    delay_days: 0,
    relation_to_es: 'parallel',
    notes:
      'Mundial Qatar: pico álbum Panini simultáneo en ES y mercados LATAM (sem 1 torneo).',
  },
  {
    id: 'demo-corridor-squishmallows',
    dna_id: 'demo-squishmallows',
    slug: 'squishmallows',
    origin_region: 'usa',
    target_market: 'LATAM',
    reference_date: '2021-11-15',
    delay_days: 520,
    relation_to_es: 'before',
    notes:
      'Validado orientativo: MX/BR fenómeno ventas 2021 (NPD global). Pico retail ES/Iberia abr-2023 — LATAM ~18 meses antes.',
  },
];

export function corridorsBySlug(
  rows: CorridorDelayRow[]
): Map<string, CorridorDelayRow> {
  const map = new Map<string, CorridorDelayRow>();
  for (const row of rows) {
    if (row.slug) map.set(row.slug, row);
  }
  return map;
}
