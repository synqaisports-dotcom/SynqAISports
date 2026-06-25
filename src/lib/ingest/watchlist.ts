/** Consultas Fase 2b — corredores ES + USA + China (+ POD proxy USA). */
export type WatchItem = {
  slug: string;
  canonical_name: string;
  /** Google News España */
  googleQuery: string;
  redditQuery: string;
  /** Google News USA (inglés) */
  googleQueryUs?: string;
  /** Google News China (zh) — señal temprana Asia */
  googleQueryCn?: string;
  /** Google News LATAM (México proxy) */
  googleQueryLatam?: string;
  /** Reddit USA / global inglés */
  redditQueryUs?: string;
  /** Proxy POD: Redbubble/TeePublic vía Google News US */
  podQuery?: string;
  dna_match_slug: string;
  origin_region: string;
  default_delay_days: number;
  /** Búsqueda top ventas en marketplaces (AliExpress, Amazon, Temu) */
  marketplace_search: string;
};

export const WATCHLIST: WatchItem[] = [
  {
    slug: 'radar-labubu',
    canonical_name: 'Labubu / Pop Mart',
    googleQuery: 'Labubu Pop Mart blind box tendencia España',
    googleQueryUs: 'Labubu Pop Mart blind box trending sold out',
    googleQueryCn: 'Labubu Pop Mart 盲盒 预售 潮玩',
    googleQueryLatam: 'Labubu Pop Mart juguete tendencia México',
    redditQuery: 'labubu pop mart',
    redditQueryUs: 'labubu pop mart blind box',
    dna_match_slug: 'labubu',
    origin_region: 'asia',
    default_delay_days: 121,
    marketplace_search: 'labubu pop mart blind box',
  },
  {
    slug: 'radar-pop-it',
    canonical_name: 'Pop It Fidget',
    googleQuery: 'Pop It fidget viral colegio juguete España',
    googleQueryUs: 'Pop It fidget toy viral TikTok trending',
    googleQueryLatam: 'Pop It juguete viral México colegio',
    redditQuery: 'pop it fidget toy',
    redditQueryUs: 'pop it fidget viral',
    podQuery: 'pop it fidget toy',
    dna_match_slug: 'pop-it',
    origin_region: 'usa',
    default_delay_days: 44,
    marketplace_search: 'pop it fidget toy kids',
  },
  {
    slug: 'radar-pokemon-sv',
    canonical_name: 'Pokémon TCG Escarlata y Púrpura',
    googleQuery: 'cartas Pokémon TCG agotado España vending',
    googleQueryUs: 'Pokemon TCG Scarlet Violet restock sold out',
    googleQueryCn: '宝可梦 卡牌 预售 缺货',
    googleQueryLatam: 'cartas Pokémon agotado México',
    redditQuery: 'pokemon tcg scarlet violet',
    redditQueryUs: 'pokemon tcg vending restock',
    dna_match_slug: 'pokemon-tcg-sv',
    origin_region: 'asia',
    default_delay_days: 75,
    marketplace_search: 'pokemon tcg scarlet violet booster',
  },
  {
    slug: 'radar-fifa-2026',
    canonical_name: 'Cromos Mundial 2026 — Panini',
    googleQuery: 'cromos Panini Mundial 2026 agotado España',
    googleQueryUs: 'Panini World Cup 2026 stickers sold out',
    googleQueryLatam: 'cromos Panini Mundial 2026 México agotado',
    redditQuery: 'panini world cup 2026 stickers',
    redditQueryUs: 'panini fifa 2026 album',
    dna_match_slug: 'fifa-stickers-2022',
    origin_region: 'global',
    default_delay_days: 7,
    marketplace_search: 'panini world cup 2026 stickers album',
  },
  {
    slug: 'radar-squishmallows',
    canonical_name: 'Squishmallows',
    googleQuery: 'Squishmallows coleccionable viral agotado España',
    googleQueryUs: 'Squishmallows restock trending collectible',
    googleQueryLatam: 'Squishmallows coleccionable México',
    redditQuery: 'squishmallows trend',
    redditQueryUs: 'squishmallows hunt restock',
    podQuery: 'squishmallows plush',
    dna_match_slug: 'squishmallows',
    origin_region: 'usa',
    default_delay_days: 45,
    marketplace_search: 'squishmallows plush collectible',
  },
];

export const PILOT_DNA_SLUGS = WATCHLIST.map((w) => w.dna_match_slug);

export const PHASE_2B_SOURCES = [
  'google_news_es',
  'google_news_us',
  'google_news_cn',
  'google_news_latam',
  'google_news_pod',
  'reddit',
] as const;
