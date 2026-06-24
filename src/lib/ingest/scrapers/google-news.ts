import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 12_000,
  headers: {
    'User-Agent': 'TrendPulse/1.0 (Nexus Labs; trend radar ingest)',
  },
});

export type ScrapedHit = {
  title: string;
  link: string;
  publishedAt: Date | null;
  source: 'google_news';
};

export async function scrapeGoogleNews(query: string, maxAgeDays = 14): Promise<ScrapedHit[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es&gl=ES&ceid=ES:es`;
  const feed = await parser.parseURL(url);
  const cutoff = Date.now() - maxAgeDays * 86_400_000;

  return (feed.items ?? [])
    .map((item) => {
      const publishedAt = item.pubDate ? new Date(item.pubDate) : null;
      return {
        title: item.title ?? '',
        link: item.link ?? '',
        publishedAt,
        source: 'google_news' as const,
      };
    })
    .filter((h) => h.title && (!h.publishedAt || h.publishedAt.getTime() >= cutoff));
}
