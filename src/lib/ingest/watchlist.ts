/** Consultas que el scraper monitoriza cada 48h. */
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
    slug: 'scrape-labubu',
    canonical_name: 'Labubu / Pop Mart',
    googleQuery: 'Labubu Pop Mart blind box España',
    redditQuery: 'labubu pop mart',
    dna_match_slug: 'labubu',
    origin_region: 'asia',
    default_delay_days: 121,
  },
  {
    slug: 'scrape-dumplings',
    canonical_name: 'Dumpling Squishy Steamer',
    googleQuery: 'dumpling squishy steamer viral juguete',
    redditQuery: 'squishy dumpling toy',
    dna_match_slug: 'dumplings-squishy',
    origin_region: 'usa',
    default_delay_days: 22,
  },
  {
    slug: 'scrape-fifa-2026',
    canonical_name: 'Mundial 2026 Cromos Panini',
    googleQuery: 'cromos Panini Mundial 2026 España agotado',
    redditQuery: 'panini world cup 2026 stickers',
    dna_match_slug: 'fifa-stickers-2022',
    origin_region: 'global',
    default_delay_days: 7,
  },
  {
    slug: 'scrape-pokemon-tcg',
    canonical_name: 'Pokémon TCG hype',
    googleQuery: 'cartas Pokémon vending agotado España',
    redditQuery: 'pokemon tcg vending',
    dna_match_slug: 'pokemon-tcg-sv',
    origin_region: 'japan',
    default_delay_days: 75,
  },
  {
    slug: 'scrape-one-piece-tcg',
    canonical_name: 'One Piece Card Game',
    googleQuery: 'One Piece cartas OP agotado España',
    redditQuery: 'one piece card game',
    dna_match_slug: 'one-piece-op01',
    origin_region: 'japan',
    default_delay_days: 120,
  },
  {
    slug: 'scrape-blind-box-kids',
    canonical_name: 'Blind box patio / colegio',
    googleQuery: 'blind box coleccionable patio colegio viral',
    redditQuery: 'blind box collectible trend',
    dna_match_slug: 'sonny-angel',
    origin_region: 'asia',
    default_delay_days: 90,
  },
];
