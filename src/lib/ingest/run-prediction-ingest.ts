import type { MarketplaceCandidate } from '../cycle-types';
import { candidateFromTrendCategory } from './aliexpress-enricher';
import { searchAliExpressTopSellers } from './aliexpress-search';
import type { ScrapedHit } from './scraper-types';
import {
  DISCOVERY_QUERIES,
  EXCLUDED_HEADLINE_TERMS,
  daysUntilSeptember,
  type DiscoveryQuery,
} from './discovery-queries';
import { scrapeGoogleNewsLocale } from './scrapers/google-news';
import { scrapeReddit } from './scrapers/reddit';

export type PredictionIngestResult = {
  phase: '3-prediction';
  scraped_at: string;
  predictions: MarketplaceCandidate[];
  errors: string[];
  days_until_september: number;
};

const TOP_PRODUCTS_PER_CATEGORY = 3;

const CATEGORY_LABELS: Record<string, string> = {
  'viral-toy-tiktok': 'Juguete viral · TikTok / patio',
  'new-fidget': 'Nuevo fidget · antistress',
  'squish-collectible': 'Squishy / mochi coleccionable',
  'mystery-blind-kids': 'Mystery blind box niños',
  'summer-playground': 'Verano · patio / agua',
  'aliexpress-trend-kids': 'Trending AliExpress niños',
  'cn-toy-export': 'Exportación juguete China',
  'backpack-charm-trend': 'Charm mochila / llavero',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s*[-–|]\s*[^-–|]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 72);
}

function isExcludedTitle(title: string): boolean {
  const t = title.toLowerCase();
  return EXCLUDED_HEADLINE_TERMS.some((term) => t.includes(term));
}

function pickSignalHeadline(hits: ScrapedHit[]): string | undefined {
  for (const hit of hits) {
    const title = cleanTitle(hit.title);
    if (title.length >= 12 && !isExcludedTitle(title)) return title;
  }
  return undefined;
}

function categoryLabel(dq: DiscoveryQuery): string {
  return CATEGORY_LABELS[dq.id] ?? dq.aliexpress_search;
}

async function signalsForQuery(dq: DiscoveryQuery) {
  const errors: string[] = [];
  const [cn, us, es, lat, rd] = await Promise.all([
    scrapeGoogleNewsLocale(dq.news_query, 'cn', 21).catch((e) => {
      errors.push(`${dq.id}:cn`);
      return [];
    }),
    scrapeGoogleNewsLocale(dq.news_query, 'us', 21).catch(() => []),
    scrapeGoogleNewsLocale(dq.news_query, 'es', 21).catch(() => []),
    scrapeGoogleNewsLocale(dq.news_query, 'latam', 21).catch(() => []),
    scrapeReddit(dq.reddit_query, 8).catch(() => []),
  ]);
  return {
    cn,
    us,
    es,
    lat,
    reddit: rd,
    counts: { cn: cn.length, us: us.length, es: es.length, lat: lat.length, reddit: rd.length },
    errors,
  };
}

export async function runPredictionIngest(): Promise<PredictionIngestResult> {
  const now = new Date();
  const errors: string[] = [];
  const predictions: MarketplaceCandidate[] = [];
  const seenSlugs = new Set<string>();

  const signalBatch = await Promise.all(DISCOVERY_QUERIES.map((dq) => signalsForQuery(dq)));

  for (let i = 0; i < DISCOVERY_QUERIES.length; i++) {
    const dq = DISCOVERY_QUERIES[i];
    const { cn, us, es, lat, reddit, counts, errors: eq } = signalBatch[i];
    errors.push(...eq);

    const origin = counts.cn + counts.us + counts.lat + counts.reddit;
    if (origin < 1) continue;

    const originHits = [...us, ...cn, ...lat, ...reddit].sort(
      (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    );
    const esHits = [...es].sort(
      (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
    );
    const signalHeadline = pickSignalHeadline(originHits);
    const esHeadline = pickSignalHeadline(esHits);
    const prediction_score = origin * 1.2 - counts.es * 0.8;

    const { products, error: searchErr, fromCache } = await searchAliExpressTopSellers(
      dq.aliexpress_search,
      TOP_PRODUCTS_PER_CATEGORY
    );
    if (searchErr) errors.push(`${dq.id}:ae:${searchErr}`);
    if (products.length === 0) continue;

    const slug = `trend-${dq.id}`;
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    const lead = products[0];
    const ordersTotal = products.reduce((s, p) => s + p.orders_count, 0);

    const base: MarketplaceCandidate = {
      slug,
      canonical_name: categoryLabel(dq),
      world: 'playground',
      image_url: lead.image_url,
      origin_price_eur: lead.price_eur,
      origin_marketplace: 'AliExpress · top ventas origen',
      purchase_url: '',
      units_sold_label: `${ordersTotal.toLocaleString('es-ES')}+ pedidos (top 3)`,
      signal_cn: counts.cn,
      signal_us: counts.us,
      signal_es: counts.es,
      signal_latam: counts.lat,
      dna_match_slug: dq.wave_pattern_slug,
      estimated_window_es: null,
      estimated_arrival_es: null,
      summer_fit: false,
      weighted_score: prediction_score + ordersTotal / 2000,
      source_type: 'prediction',
      is_predicted: true,
      prediction_score: prediction_score + ordersTotal / 1000,
      category_id: dq.id,
      category_search: dq.aliexpress_search,
      origin_orders_total: ordersTotal,
      evidence_urls: [
        ...originHits.slice(0, 2).map((h) => h.link),
        ...esHits.slice(0, 1).map((h) => h.link),
      ].filter(Boolean),
      signal_headline: signalHeadline,
      es_headline: esHeadline,
      notes: [
        `Búsqueda «${dq.aliexpress_search}»`,
        fromCache ? 'Productos desde caché AliExpress' : 'Productos en vivo AliExpress',
      ].join(' · '),
    };

    predictions.push(
      candidateFromTrendCategory(base, products, {
        signalHeadline,
        esHeadline,
        keywords: dq.aliexpress_search,
        wavePatternSlug: dq.wave_pattern_slug,
        signals: { cn: counts.cn, us: counts.us, es: counts.es },
      })
    );

    if (counts.es > 0 && counts.us + counts.cn <= counts.es && esHeadline) {
      const ecoSlug = `pred-es-echo-${dq.id}`;
      if (!seenSlugs.has(ecoSlug)) {
        seenSlugs.add(ecoSlug);
        predictions.push({
          slug: ecoSlug,
          canonical_name: `[Eco ES] ${categoryLabel(dq)}`,
          world: 'playground',
          image_url: lead.image_url,
          origin_price_eur: 0,
          origin_marketplace: 'Solo observación — sin compra ES',
          purchase_url: '',
          units_sold_label: `Eco ES ${counts.es} menciones`,
          signal_cn: counts.cn,
          signal_us: counts.us,
          signal_es: counts.es,
          dna_match_slug: dq.wave_pattern_slug,
          category_id: dq.id,
          es_headline: esHeadline,
          estimated_window_es: 'Mercado ES ya activo — margen importación cerrado. Solo aprender.',
          estimated_arrival_es: null,
          summer_fit: false,
          weighted_score: counts.es,
          source_type: 'prediction',
          is_predicted: true,
          prediction_score: counts.es,
          evidence_urls: esHits.slice(0, 1).map((h) => h.link),
          notes: `Confirmación tardía en España: «${esHeadline}». Origen top ventas: ${ordersTotal}+ pedidos.`,
        });
      }
    }
  }

  predictions.sort((a, b) => (b.prediction_score ?? 0) - (a.prediction_score ?? 0));

  return {
    phase: '3-prediction',
    scraped_at: now.toISOString(),
    predictions,
    errors,
    days_until_september: daysUntilSeptember(now),
  };
}
