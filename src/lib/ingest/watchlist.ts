/** Consultas que el scraper monitoriza cada 48h — 5 pilotos alineados con ADN/LATAM. */
export type WatchItem = {
  slug: string;
  canonical_name: string;
  googleQuery: string;
  redditQuery: string;
  dna_match_slug: string;
  origin_region: string;
  default_delay_days: number;
};

export const WATCHLIST: WatchItem[] = [
  {
    slug: 'radar-labubu',
    canonical_name: 'Labubu / Pop Mart',
    googleQuery: 'Labubu Pop Mart blind box tendencia',
    redditQuery: 'labubu pop mart',
    dna_match_slug: 'labubu',
    origin_region: 'asia',
    default_delay_days: 121,
  },
  {
    slug: 'radar-pop-it',
    canonical_name: 'Pop It Fidget',
    googleQuery: 'Pop It fidget viral colegio juguete',
    redditQuery: 'pop it fidget toy trend',
    dna_match_slug: 'pop-it',
    origin_region: 'usa',
    default_delay_days: 30,
  },
  {
    slug: 'radar-pokemon-sv',
    canonical_name: 'Pokémon TCG Escarlata y Púrpura',
    googleQuery: 'cartas Pokémon TCG agotado España vending',
    redditQuery: 'pokemon tcg scarlet violet',
    dna_match_slug: 'pokemon-tcg-sv',
    origin_region: 'asia',
    default_delay_days: 75,
  },
  {
    slug: 'radar-fifa-2026',
    canonical_name: 'Cromos Mundial 2026 — Panini',
    googleQuery: 'cromos Panini Mundial 2026 agotado España',
    redditQuery: 'panini world cup 2026 stickers',
    dna_match_slug: 'fifa-stickers-2022',
    origin_region: 'global',
    default_delay_days: 7,
  },
  {
    slug: 'radar-squishmallows',
    canonical_name: 'Squishmallows',
    googleQuery: 'Squishmallows coleccionable viral agotado',
    redditQuery: 'squishmallows trend',
    dna_match_slug: 'squishmallows',
    origin_region: 'usa',
    default_delay_days: 45,
  },
];

export const PILOT_DNA_SLUGS = WATCHLIST.map((w) => w.dna_match_slug);
