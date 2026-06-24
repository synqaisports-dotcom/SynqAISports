export type ScrapedHit = {
  title: string;
  link: string;
  publishedAt: Date | null;
  source: 'reddit';
};

type RedditSearchResponse = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        permalink?: string;
        created_utc?: number;
        score?: number;
      };
    }>;
  };
};

export async function scrapeReddit(query: string, limit = 8): Promise<ScrapedHit[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TrendPulse/1.0 (Nexus Labs radar)' },
    next: { revalidate: 0 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as RedditSearchResponse;
  const cutoff = Date.now() - 14 * 86_400_000;

  return (json.data?.children ?? [])
    .map((c) => c.data)
    .filter(Boolean)
    .map((d) => ({
      title: d!.title ?? '',
      link: d!.permalink ? `https://www.reddit.com${d!.permalink}` : '',
      publishedAt: d!.created_utc ? new Date(d!.created_utc * 1000) : null,
      source: 'reddit' as const,
    }))
    .filter((h) => h.title && (!h.publishedAt || h.publishedAt.getTime() >= cutoff));
}
