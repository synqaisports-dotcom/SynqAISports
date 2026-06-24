import type { SignalConfidence, SignalStatus } from '@/lib/radar-types';
import { WATCHLIST } from './watchlist';
import {
  scrapeGoogleNews,
  scrapeGoogleNewsLocale,
  scrapeGoogleNewsPod,
} from './scrapers/google-news';
import { scrapeReddit } from './scrapers/reddit';
import {
  breakdownFromHits,
  type ScrapedHit,
  type SourceBreakdown,
} from './scraper-types';

export type IngestSignal = {
  slug: string;
  canonical_name: string;
  status: SignalStatus;
  origin_region: string;
  detected_at: string;
  origin_peak_date: string | null;
  predicted_es_peak_date: string | null;
  predicted_delay_days: number;
  dna_match_slug: string;
  dna_match_score: number;
  confidence: SignalConfidence;
  signal_source: string;
  notes: string;
  reference_urls: string[];
  scrape_hits: number;
  source_breakdown: SourceBreakdown;
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function hitsToStatus(weighted: number): SignalStatus {
  if (weighted >= 12) return 'peak_es';
  if (weighted >= 5) return 'emerging';
  return 'watching';
}

function hitsToConfidence(weighted: number): SignalConfidence {
  if (weighted >= 10) return 'high';
  if (weighted >= 4) return 'medium';
  return 'low';
}

function hitsToScore(weighted: number): number {
  return Math.min(0.98, 0.45 + weighted * 0.05);
}

function formatSourceLabel(b: SourceBreakdown, total: number): string {
  if (total === 0) return 'scrape:2b (sin menciones 14d)';
  return `scrape:2b es:${b.es} us:${b.us} cn:${b.cn} pod:${b.pod} rd:${b.reddit} (${b.weighted}w)`;
}

function formatNotes(today: string, b: SourceBreakdown, titles: string): string {
  const corridors = [
    b.cn > 0 ? `CN ${b.cn}` : null,
    b.us > 0 ? `US ${b.us}` : null,
    b.pod > 0 ? `POD ${b.pod}` : null,
    b.es > 0 ? `ES ${b.es}` : null,
    b.reddit > 0 ? `RD ${b.reddit}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  if (b.weighted === 0) {
    return `Fase 2b ${today}: sin menciones en corredores ES/US/CN. Vigilancia activa.`;
  }
  return `Fase 2b ${today}: ${corridors}. ${titles}`;
}

async function scrapeWatchItem(watch: (typeof WATCHLIST)[0]): Promise<{
  hits: ScrapedHit[];
  errors: string[];
}> {
  const errors: string[] = [];
  const tasks: Promise<ScrapedHit[]>[] = [
    scrapeGoogleNews(watch.googleQuery).catch((e) => {
      errors.push(`google_es:${watch.slug}:${String(e)}`);
      return [];
    }),
    scrapeReddit(watch.redditQuery).catch((e) => {
      errors.push(`reddit:${watch.slug}:${String(e)}`);
      return [];
    }),
  ];

  if (watch.googleQueryUs) {
    tasks.push(
      scrapeGoogleNewsLocale(watch.googleQueryUs, 'us').catch((e) => {
        errors.push(`google_us:${watch.slug}:${String(e)}`);
        return [];
      })
    );
  }
  if (watch.googleQueryCn) {
    tasks.push(
      scrapeGoogleNewsLocale(watch.googleQueryCn, 'cn').catch((e) => {
        errors.push(`google_cn:${watch.slug}:${String(e)}`);
        return [];
      })
    );
  }
  if (watch.redditQueryUs) {
    tasks.push(
      scrapeReddit(watch.redditQueryUs).catch((e) => {
        errors.push(`reddit_us:${watch.slug}:${String(e)}`);
        return [];
      })
    );
  }
  if (watch.podQuery) {
    tasks.push(
      scrapeGoogleNewsPod(watch.podQuery).catch((e) => {
        errors.push(`pod:${watch.slug}:${String(e)}`);
        return [];
      })
    );
  }

  const batches = await Promise.all(tasks);
  return { hits: batches.flat(), errors };
}

export type IngestResult = {
  signals: IngestSignal[];
  errors: string[];
  scraped_at: string;
  phase: '2b';
};

export async function runIngest(): Promise<IngestResult> {
  const errors: string[] = [];
  const signals: IngestSignal[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const watch of WATCHLIST) {
    try {
      const { hits, errors: scrapeErrors } = await scrapeWatchItem(watch);
      errors.push(...scrapeErrors);

      const breakdown = breakdownFromHits(hits);
      const totalRaw = hits.length;
      const weighted = breakdown.weighted;

      const urls = hits
        .map((h) => h.link)
        .filter(Boolean)
        .slice(0, 6);

      const topTitles = hits
        .map((h) => h.title)
        .slice(0, 3)
        .join(' · ');

      const delay = watch.default_delay_days;
      const predictedPeak = addDays(today, Math.max(3, Math.round(delay * 0.3)));

      signals.push({
        slug: watch.slug,
        canonical_name: watch.canonical_name,
        status: weighted > 0 ? hitsToStatus(weighted) : 'watching',
        origin_region: watch.origin_region,
        detected_at: new Date().toISOString(),
        origin_peak_date: today,
        predicted_es_peak_date: predictedPeak,
        predicted_delay_days: delay,
        dna_match_slug: watch.dna_match_slug,
        dna_match_score: hitsToScore(weighted),
        confidence: hitsToConfidence(weighted),
        signal_source: formatSourceLabel(breakdown, totalRaw),
        notes: formatNotes(today, breakdown, topTitles),
        reference_urls: urls,
        scrape_hits: totalRaw,
        source_breakdown: breakdown,
      });
    } catch (e) {
      errors.push(`watch:${watch.slug}:${String(e)}`);
    }
  }

  return { signals, errors, scraped_at: new Date().toISOString(), phase: '2b' };
}
