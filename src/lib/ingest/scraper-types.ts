export type ScrapeChannel =
  | 'google_news_es'
  | 'google_news_us'
  | 'google_news_cn'
  | 'google_news_pod'
  | 'reddit';

export type ScrapedHit = {
  title: string;
  link: string;
  publishedAt: Date | null;
  channel: ScrapeChannel;
};

export type SourceBreakdown = {
  es: number;
  us: number;
  cn: number;
  pod: number;
  reddit: number;
  weighted: number;
};

export const CHANNEL_WEIGHTS: Record<keyof Omit<SourceBreakdown, 'weighted'>, number> = {
  cn: 1.5,
  us: 1.3,
  pod: 1.2,
  es: 1.0,
  reddit: 1.0,
};

export function breakdownFromHits(hits: ScrapedHit[]): SourceBreakdown {
  const counts = { es: 0, us: 0, cn: 0, pod: 0, reddit: 0 };
  for (const hit of hits) {
    if (hit.channel === 'google_news_es') counts.es += 1;
    else if (hit.channel === 'google_news_us') counts.us += 1;
    else if (hit.channel === 'google_news_cn') counts.cn += 1;
    else if (hit.channel === 'google_news_pod') counts.pod += 1;
    else if (hit.channel === 'reddit') counts.reddit += 1;
  }
  const weighted =
    counts.es * CHANNEL_WEIGHTS.es +
    counts.us * CHANNEL_WEIGHTS.us +
    counts.cn * CHANNEL_WEIGHTS.cn +
    counts.pod * CHANNEL_WEIGHTS.pod +
    counts.reddit * CHANNEL_WEIGHTS.reddit;
  return { ...counts, weighted: Math.round(weighted * 10) / 10 };
}
