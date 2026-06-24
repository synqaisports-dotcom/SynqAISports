import Parser from 'rss-parser';
import type { ScrapeChannel, ScrapedHit } from '../scraper-types';

const parser = new Parser({
  timeout: 12_000,
  headers: {
    'User-Agent': 'TrendPulse/2b (Nexus Labs; trend radar ingest)',
  },
});

type NewsLocale = {
  hl: string;
  gl: string;
  ceid: string;
  channel: ScrapeChannel;
};

const LOCALES: Record<'es' | 'us' | 'cn', NewsLocale> = {
  es: { hl: 'es', gl: 'ES', ceid: 'ES:es', channel: 'google_news_es' },
  us: { hl: 'en', gl: 'US', ceid: 'US:en', channel: 'google_news_us' },
  cn: { hl: 'zh-CN', gl: 'CN', ceid: 'CN:zh-Hans', channel: 'google_news_cn' },
};

export async function scrapeGoogleNewsLocale(
  query: string,
  locale: keyof typeof LOCALES,
  maxAgeDays = 14
): Promise<ScrapedHit[]> {
  const cfg = LOCALES[locale];
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${cfg.hl}&gl=${cfg.gl}&ceid=${cfg.ceid}`;
  const feed = await parser.parseURL(url);
  const cutoff = Date.now() - maxAgeDays * 86_400_000;

  return (feed.items ?? [])
    .map((item) => {
      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        publishedAt,
        channel: cfg.channel,
      };
    })
    .filter((h) => h.title && (!h.publishedAt || h.publishedAt.getTime() >= cutoff));
}

/** España (retrocompat) */
export async function scrapeGoogleNews(query: string, maxAgeDays = 14): Promise<ScrapedHit[]> {
  return scrapeGoogleNewsLocale(query, 'es', maxAgeDays);
}

/** Proxy POD: búsqueda en Google News de menciones Redbubble/TeePublic */
export async function scrapeGoogleNewsPod(query: string, maxAgeDays = 14): Promise<ScrapedHit[]> {
  const podQuery = `(site:redbubble.com OR site:teepublic.com) ${query}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(podQuery)}&hl=en&gl=US&ceid=US:en`;
  const feed = await parser.parseURL(url);
  const cutoff = Date.now() - maxAgeDays * 86_400_000;

  return (feed.items ?? [])
    .map((item) => {
      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        publishedAt,
        channel: 'google_news_pod' as const,
      };
    })
    .filter((h) => h.title && (!h.publishedAt || h.publishedAt.getTime() >= cutoff));
}
