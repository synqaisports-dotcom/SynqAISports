import type { LiveSignalRow } from '../radar-types';
import type { CycleSlotMode, CycleSlotRow, MarketplaceCandidate, TrendCycleRow } from '../cycle-types';
import { DEMO_MARKETPLACE } from '../demo-marketplace';

const MAX_ACT_PRICE_EUR = 8;
const ACT_COUNT = 3;
const OBSERVE_COUNT = 3;

function weekSlug(d = new Date()): string {
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const y = start.getFullYear();
  const onejan = new Date(y, 0, 1);
  const week = Math.ceil(((start.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7);
  return `${y}-w${String(week).padStart(2, '0')}`;
}

function radarToCandidate(s: LiveSignalRow): MarketplaceCandidate | null {
  const b = s.source_breakdown;
  if (!b) return null;
  const weighted = b.weighted ?? 0;
  if (weighted <= 0 && (b.cn ?? 0) + (b.us ?? 0) === 0) return null;

  const priceGuess =
    s.dna_match_slug === 'labubu' ? 12.9 : s.dna_match_slug === 'fifa-stickers-2022' ? 4.5 : 4.0;

  return {
    slug: `radar-${s.slug}`,
    canonical_name: s.canonical_name,
    world:
      s.dna_match_slug === 'fifa-stickers-2022' || s.dna_match_slug === 'pokemon-tcg-sv'
        ? 'collector'
        : s.dna_match_slug === 'labubu'
          ? 'adult'
          : 'playground',
    image_url: `https://placehold.co/400x400/1a1f2e/22d3ee?text=${encodeURIComponent(s.canonical_name.slice(0, 12))}`,
    origin_price_eur: priceGuess,
    origin_marketplace: 'Radar TrendPulse',
    purchase_url: s.reference_urls[0] ?? `/radar/${s.slug}`,
    units_sold_label: s.signal_source ?? null,
    signal_cn: b.cn ?? 0,
    signal_us: b.us ?? 0,
    signal_es: b.es ?? 0,
    dna_match_slug: s.dna_match_slug,
    estimated_window_es: s.predicted_es_peak_date
      ? `Pico estimado ${s.predicted_es_peak_date}`
      : s.predicted_delay_days
        ? `~${s.predicted_delay_days}d desde origen`
        : null,
    source_type: 'radar',
    notes: s.notes,
  };
}

function scoreAct(c: MarketplaceCandidate): number {
  const originSignal = c.signal_cn * 1.5 + c.signal_us * 1.3;
  const esQuiet = Math.max(0, 3 - c.signal_es);
  const priceOk = c.origin_price_eur <= MAX_ACT_PRICE_EUR ? 4 : 0;
  const patioBonus = c.world === 'playground' ? 2 : 0;
  const summerBonus = c.summer_fit ? 5 : 0;
  const liveBonus = c.source_type === 'marketplace_2c' ? 1 : 0;
  return originSignal + esQuiet + priceOk + patioBonus + summerBonus + liveBonus;
}

function scoreObserve(c: MarketplaceCandidate): number {
  const originSignal = c.signal_cn + c.signal_us;
  const interesting = c.world !== 'playground' || c.origin_price_eur > MAX_ACT_PRICE_EUR ? 2 : 0;
  return originSignal + interesting + (c.signal_es <= 1 ? 1 : 0);
}

function dedupe(candidates: MarketplaceCandidate[]): MarketplaceCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });
}

export function buildDemoCycle(
  radarSignals: LiveSignalRow[] = [],
  marketplaceCandidates: MarketplaceCandidate[] = []
): { cycle: TrendCycleRow; slots: CycleSlotRow[] } {
  const slug = weekSlug();
  const now = new Date();
  const ends = new Date(now);
  ends.setDate(ends.getDate() + 14);

  const cycle: TrendCycleRow = {
    id: `demo-cycle-${slug}`,
    slug,
    title: `Ciclo patio · ${slug}`,
    starts_at: now.toISOString().slice(0, 10),
    ends_at: ends.toISOString().slice(0, 10),
    status: 'active',
    notes:
      '3 actuar (≤8€, señal origen) + 3 observar. Fuentes: marketplace 2c + radar.',
  };

  const fromRadar = radarSignals
    .map(radarToCandidate)
    .filter((c): c is MarketplaceCandidate => c != null);

  const pool = dedupe([
    ...marketplaceCandidates,
    ...fromRadar,
    ...(marketplaceCandidates.length === 0 ? DEMO_MARKETPLACE : []),
  ]);

  const actPool = [...pool].sort((a, b) => scoreAct(b) - scoreAct(a));
  const actSlugs = new Set<string>();
  const act: MarketplaceCandidate[] = [];
  for (const c of actPool) {
    if (act.length >= ACT_COUNT) break;
    if (c.origin_price_eur > MAX_ACT_PRICE_EUR) continue;
    act.push(c);
    actSlugs.add(c.slug);
  }

  const observePool = pool
    .filter((c) => !actSlugs.has(c.slug))
    .sort((a, b) => scoreObserve(b) - scoreObserve(a));
  const observe = observePool.slice(0, OBSERVE_COUNT);

  const toSlot = (c: MarketplaceCandidate, mode: CycleSlotMode, order: number): CycleSlotRow => ({
    ...c,
    id: `demo-slot-${mode}-${c.slug}`,
    cycle_id: cycle.id,
    mode,
    sort_order: order,
    feedback: null,
  });

  const slots: CycleSlotRow[] = [
    ...act.map((c, i) => toSlot(c, 'act', i)),
    ...observe.map((c, i) => toSlot(c, 'observe', ACT_COUNT + i)),
  ];

  return { cycle, slots };
}
