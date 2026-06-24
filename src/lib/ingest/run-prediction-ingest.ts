import type { MarketplaceCandidate } from '../cycle-types';
import { candidateFromAliExpressProduct } from './aliexpress-enricher';
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
    const signalHeadline = pickSignalHeadline(originHits);
    const prediction_score = origin * 1.2 - counts.es * 0.8;

    const { products, error: searchErr, fromCache } = await searchAliExpressTopSellers(
      dq.aliexpress_search,
      TOP_PRODUCTS_PER_CATEGORY
    );
    if (searchErr) errors.push(`${dq.id}:ae:${searchErr}`);

    for (const product of products) {
      const slug = `ae-${dq.id}-${product.item_id}`;
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const base: MarketplaceCandidate = {
        slug,
        canonical_name: product.title.slice(0, 120),
        world: 'playground',
        image_url: product.image_url,
        origin_price_eur: product.price_eur,
        origin_marketplace: 'AliExpress · más vendidos',
        purchase_url: '',
        units_sold_label: product.orders_label ?? `${product.orders_count}+ vendidos`,
        signal_cn: counts.cn,
        signal_us: counts.us,
        signal_es: counts.es,
        signal_latam: counts.lat,
        dna_match_slug: dq.wave_pattern_slug,
        estimated_window_es: null,
        estimated_arrival_es: null,
        summer_fit: false,
        weighted_score: prediction_score + product.orders_count / 1000,
        source_type: 'prediction',
        is_predicted: true,
        prediction_score: prediction_score + product.orders_count / 500,
        evidence_urls: originHits.slice(0, 2).map((h) => h.link).filter(Boolean),
        notes: [
          signalHeadline ? `Señal: «${signalHeadline}»` : null,
          `Categoría ${dq.id} · búsqueda «${dq.aliexpress_search}»`,
          fromCache ? 'Productos desde caché AliExpress' : 'Productos en vivo AliExpress',
        ]
          .filter(Boolean)
          .join(' · '),
      };

      predictions.push(
        candidateFromAliExpressProduct(base, product, {
          signalHeadline,
          keywords: dq.aliexpress_search,
        })
      );
    }

    if (counts.es > 0 && counts.us + counts.cn <= counts.es) {
      for (const hit of es.slice(0, 1)) {
        const title = cleanTitle(hit.title);
        if (title.length < 12) continue;
        const slug = `pred-es-echo-${slugify(title)}`;
        if (seenSlugs.has(slug)) continue;
        seenSlugs.add(slug);
        predictions.push({
          slug,
          canonical_name: `[Eco ES] ${title}`,
          world: 'playground',
          image_url: `https://placehold.co/400x400/1a1f2e/94a3b8?text=Eco+ES`,
          origin_price_eur: 0,
          origin_marketplace: 'Solo observación — sin compra ES',
          purchase_url: '',
          units_sold_label: `Eco ES ${counts.es} menciones`,
          signal_cn: counts.cn,
          signal_us: counts.us,
          signal_es: counts.es,
          dna_match_slug: dq.wave_pattern_slug,
          estimated_window_es: 'Mercado ES ya activo — margen importación cerrado. Solo aprender.',
          estimated_arrival_es: null,
          summer_fit: false,
          weighted_score: counts.es,
          source_type: 'prediction',
          is_predicted: true,
          prediction_score: counts.es,
          evidence_urls: [hit.link],
          notes: 'Confirmación tardía. No enlaces de compra en España.',
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
