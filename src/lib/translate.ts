/** Traducción gratuita para titulares scrape (CN/EN → ES). */
export async function translateToSpanish(text: string, from: 'zh' | 'en'): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (from === 'en' && /[áéíóúñÁÉÍÓÚÑ]/.test(trimmed)) return trimmed;

  const langpair = from === 'zh' ? 'zh-CN|es' : 'en|es';
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed.slice(0, 400))}&langpair=${langpair}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { 'User-Agent': 'TrendPulse/2b (Nexus Labs)' },
    });
    if (!res.ok) return trimmed;
    const json = (await res.json()) as { responseData?: { translatedText?: string } };
    const out = json.responseData?.translatedText?.trim();
    if (!out || out.toUpperCase() === trimmed.toUpperCase()) return trimmed;
    return out;
  } catch {
    return trimmed;
  }
}

export function needsTranslation(channel: string): 'zh' | 'en' | null {
  if (channel === 'google_news_cn') return 'zh';
  if (channel === 'google_news_us' || channel === 'google_news_pod') return 'en';
  return null;
}
