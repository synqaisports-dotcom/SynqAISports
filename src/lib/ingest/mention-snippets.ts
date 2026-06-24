import type { MentionSnippet } from '@/lib/radar-types';
import type { ScrapedHit } from './scraper-types';
import { needsTranslation, translateToSpanish } from '@/lib/translate';

const CHANNEL_LABEL: Record<string, string> = {
  google_news_es: 'ES',
  google_news_us: 'US',
  google_news_cn: 'CN',
  google_news_latam: 'LAT',
  google_news_pod: 'POD',
  reddit: 'RD',
};

export async function buildMentionSnippets(hits: ScrapedHit[]): Promise<MentionSnippet[]> {
  const top = hits.slice(0, 5);
  const snippets: MentionSnippet[] = [];

  for (const hit of top) {
    const lang = needsTranslation(hit.channel);
    const title_es =
      lang != null ? await translateToSpanish(hit.title, lang) : hit.title;
    snippets.push({
      title: hit.title,
      title_es,
      link: hit.link,
      channel: CHANNEL_LABEL[hit.channel] ?? hit.channel,
    });
  }

  return snippets;
}
