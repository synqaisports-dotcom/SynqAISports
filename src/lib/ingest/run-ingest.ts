import type { SignalConfidence, SignalStatus } from '@/lib/radar-types';
import { WATCHLIST } from './watchlist';
import { scrapeGoogleNews } from './scrapers/google-news';
import { scrapeReddit } from './scrapers/reddit';

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
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function hitsToStatus(hits: number): SignalStatus {
  if (hits >= 12) return 'peak_es';
  if (hits >= 5) return 'emerging';
  if (hits >= 2) return 'watching';
  return 'watching';
}

function hitsToConfidence(hits: number): SignalConfidence {
  if (hits >= 10) return 'high';
  if (hits >= 4) return 'medium';
  return 'low';
}

function hitsToScore(hits: number): number {
  return Math.min(0.98, 0.45 + hits * 0.05);
}

export type IngestResult = {
  signals: IngestSignal[];
  errors: string[];
  scraped_at: string;
};

export async function runIngest(): Promise<IngestResult> {
  const errors: string[] = [];
  const signals: IngestSignal[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const watch of WATCHLIST) {
    try {
      const [news, reddit] = await Promise.all([
        scrapeGoogleNews(watch.googleQuery).catch((e) => {
          errors.push(`google:${watch.slug}:${String(e)}`);
          return [];
        }),
        scrapeReddit(watch.redditQuery).catch((e) => {
          errors.push(`reddit:${watch.slug}:${String(e)}`);
          return [];
        }),
      ]);

      const hits = news.length + reddit.length;

      const urls = [...news, ...reddit]
        .map((h) => h.link)
        .filter(Boolean)
        .slice(0, 5);

      const topTitles = [...news, ...reddit]
        .map((h) => h.title)
        .slice(0, 3)
        .join(' · ');

      const status = hits > 0 ? hitsToStatus(hits) : 'watching';
      const delay = watch.default_delay_days;
      const predictedPeak = addDays(today, Math.max(3, Math.round(delay * 0.3)));

      signals.push({
        slug: watch.slug,
        canonical_name: watch.canonical_name,
        status,
        origin_region: watch.origin_region,
        detected_at: new Date().toISOString(),
        origin_peak_date: today,
        predicted_es_peak_date: predictedPeak,
        predicted_delay_days: delay,
        dna_match_slug: watch.dna_match_slug,
        dna_match_score: hitsToScore(hits),
        confidence: hitsToConfidence(hits),
        signal_source:
          hits > 0
            ? `scrape:google_news+reddit (${hits} hits)`
            : 'scrape:google_news+reddit (sin menciones 14d)',
        notes:
          hits > 0
            ? `Scraping ${today}: ${hits} menciones recientes. ${topTitles}`
            : `Scraping ${today}: sin menciones recientes. Vigilancia activa.`,
        reference_urls: urls,
        scrape_hits: hits,
      });
    } catch (e) {
      errors.push(`watch:${watch.slug}:${String(e)}`);
    }
  }

  return { signals, errors, scraped_at: new Date().toISOString() };
}
