import { getAdnPattern } from './adn-patterns';
import { addDaysIso, daysUntilSeptember, schoolYearStart } from './ingest/discovery-queries';

export type PurchaseLinks = {
  aliexpress: string;
  amazon_us: string;
};

export type PriceEstimate = {
  origin_price_eur: number;
  origin_price_us_eur: number;
  estimated_es_retail_low_eur: number;
  estimated_es_retail_high_eur: number;
  estimated_es_retail_mid_eur: number;
  margin_eur: number;
  margin_pct: number;
  adn_delay_days: number;
  estimated_arrival_es: string;
  adn_pattern_label: string;
  adn_example_case: string;
  adn_channel: string;
  purchase_links: PurchaseLinks;
  window_note: string;
  summer_fit: boolean;
  /** Días restantes de ventana antes de saturación ES estimada */
  window_days_left: number;
};

function inferOriginBase(title: string, patternSlug: string): number {
  const p = getAdnPattern(patternSlug);
  const t = title.toLowerCase();
  if (t.includes('blind') || t.includes('box')) return Math.max(p.origin_price_typical_eur, 5);
  if (t.includes('summer') || t.includes('water')) return 4.5;
  if (t.includes('charm') || t.includes('keychain')) return 1.8;
  return p.origin_price_typical_eur;
}

export function buildPurchaseLinks(keywords: string): PurchaseLinks {
  const q = encodeURIComponent(keywords);
  return {
    aliexpress: `https://www.aliexpress.com/w/wholesale-${q}.html`,
    amazon_us: `https://www.amazon.com/s?k=${q}`,
  };
}

export function buildPriceEstimate(input: {
  keywords: string;
  title: string;
  wave_pattern_slug: string;
  signal_cn: number;
  signal_us: number;
  signal_es: number;
  now?: Date;
}): PriceEstimate {
  const now = input.now ?? new Date();
  const pattern = getAdnPattern(input.wave_pattern_slug);
  const origin = inferOriginBase(input.title, input.wave_pattern_slug);
  const origin_us = origin * 1.15;

  const esLow = pattern.es_retail_low_eur;
  const esHigh = pattern.es_retail_high_eur;
  const esMid = (esLow + esHigh) / 2;
  const margin = esMid - origin;
  const margin_pct = origin > 0 ? Math.round((margin / origin) * 100) : 0;

  const delayFactor = input.signal_es <= 0 ? 0.35 : input.signal_es === 1 ? 0.5 : 0.7;
  const arrival = addDaysIso(now, Math.round(pattern.delay_days * delayFactor));
  const arrivalDate = new Date(arrival);
  const sept = schoolYearStart(now);
  const summer_fit = input.signal_es <= 1 && arrivalDate <= sept;

  const daysToSept = daysUntilSeptember(now);
  const window_days_left = Math.max(
    0,
    Math.min(daysToSept, Math.round(pattern.delay_days * delayFactor))
  );

  const window_note =
    input.signal_es >= 2
      ? 'Eco ES alto — ventana importación probablemente cerrada'
      : input.signal_es === 1
        ? `Ventana estrecha · ~${window_days_left}d antes de saturación`
        : `Ventana abierta · ~${window_days_left}d (patrón ${pattern.delay_days}d histórico)`;

  return {
    origin_price_eur: Math.round(origin * 100) / 100,
    origin_price_us_eur: Math.round(origin_us * 100) / 100,
    estimated_es_retail_low_eur: esLow,
    estimated_es_retail_high_eur: esHigh,
    estimated_es_retail_mid_eur: esMid,
    margin_eur: Math.round(margin * 100) / 100,
    margin_pct,
    adn_delay_days: pattern.delay_days,
    estimated_arrival_es: arrival,
    adn_pattern_label: pattern.label,
    adn_example_case: pattern.example_case,
    adn_channel: pattern.channel,
    purchase_links: buildPurchaseLinks(input.keywords),
    window_note,
    summer_fit,
    window_days_left,
  };
}

export function applyPriceEstimate<
  T extends {
    canonical_name: string;
    dna_match_slug: string | null;
    signal_cn: number;
    signal_us: number;
    signal_es: number;
    estimated_arrival_es?: string | null;
    summer_fit?: boolean;
    estimated_window_es?: string | null;
    origin_price_eur: number;
    purchase_url: string;
    origin_marketplace: string;
  },
>(candidate: T, keywords: string, now?: Date): T & PriceEstimate & { purchase_url: string } {
  const est = buildPriceEstimate({
    keywords,
    title: candidate.canonical_name,
    wave_pattern_slug: candidate.dna_match_slug ?? 'pop-it',
    signal_cn: candidate.signal_cn,
    signal_us: candidate.signal_us,
    signal_es: candidate.signal_es,
    now,
  });

  return {
    ...candidate,
    ...est,
    origin_price_eur: est.origin_price_eur,
    purchase_url: est.purchase_links.aliexpress,
    origin_marketplace: 'Origen · AliExpress / Amazon US',
    estimated_arrival_es: est.estimated_arrival_es,
    summer_fit: est.summer_fit,
    estimated_window_es: `${est.window_note} · Margen est. ${est.margin_eur.toFixed(2)}€ (${est.margin_pct}%) · Llegada ES ~${est.estimated_arrival_es}`,
  };
}
