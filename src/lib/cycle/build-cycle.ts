import type { LiveSignalRow } from '../radar-types';
import type { CycleSlotMode, CycleSlotRow, MarketplaceCandidate, TrendCycleRow } from '../cycle-types';

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

function isEcoEs(c: MarketplaceCandidate): boolean {
  return c.canonical_name.startsWith('[Eco ES]') || (c.signal_es >= 2 && c.signal_es > c.signal_us + c.signal_cn);
}

function scoreAct(c: MarketplaceCandidate): number {
  if (isEcoEs(c)) return -1;
  const pred = c.prediction_score ?? c.weighted_score ?? 0;
  const originSignal = c.signal_cn * 1.5 + c.signal_us * 1.3;
  const esQuiet = Math.max(0, 3 - c.signal_es);
  const summerBonus = c.summer_fit ? 6 : 0;
  const predBonus = c.is_predicted ? pred * 2 : 0;
  return predBonus + originSignal + esQuiet + summerBonus;
}

function scoreObserve(c: MarketplaceCandidate): number {
  if (isEcoEs(c)) return 100 + (c.prediction_score ?? 0);
  const pred = c.prediction_score ?? 0;
  return pred + c.signal_es + c.signal_cn + c.signal_us;
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
  _radarSignals: LiveSignalRow[] = [],
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
    notes: '3 actuar + 3 observar · predicciones desde señales (no catálogo fijo).',
  };

  const pool = dedupe([...marketplaceCandidates]);

  const actPool = [...pool].sort((a, b) => scoreAct(b) - scoreAct(a));
  const actSlugs = new Set<string>();
  const act: MarketplaceCandidate[] = [];
  for (const c of actPool) {
    if (act.length >= ACT_COUNT) break;
    if (scoreAct(c) < 0) continue;
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

  return {
    cycle,
    slots: [
      ...act.map((c, i) => toSlot(c, 'act', i)),
      ...observe.map((c, i) => toSlot(c, 'observe', ACT_COUNT + i)),
    ],
  };
}
