import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { getTrendVerdict } from '@/lib/trend-verdict';

export function groupCandidatesByVerdict(candidates: MarketplaceCandidate[]) {
  const comprar: MarketplaceCandidate[] = [];
  const vigilar: MarketplaceCandidate[] = [];
  const tarde: MarketplaceCandidate[] = [];
  const sin_datos: MarketplaceCandidate[] = [];

  for (const c of candidates) {
    const v = getTrendVerdict(c).verdict;
    if (v === 'comprar') comprar.push(c);
    else if (v === 'tarde') tarde.push(c);
    else if (v === 'sin_datos') sin_datos.push(c);
    else vigilar.push(c);
  }

  const byScore = (a: MarketplaceCandidate, b: MarketplaceCandidate) =>
    (b.prediction_score ?? b.origin_orders_total ?? 0) -
    (a.prediction_score ?? a.origin_orders_total ?? 0);

  comprar.sort(byScore);
  vigilar.sort(byScore);
  tarde.sort(byScore);

  return { comprar, vigilar, tarde, sin_datos };
}
