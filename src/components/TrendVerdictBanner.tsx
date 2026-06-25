import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { getTrendVerdict, VERDICT_STYLES } from '@/lib/trend-verdict';

export function TrendVerdictBanner({ candidate }: { candidate: MarketplaceCandidate }) {
  const v = getTrendVerdict(candidate);
  const styles = VERDICT_STYLES[v.verdict];

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${styles.border} ${styles.bg}`}>
      <p className={`text-sm font-semibold ${styles.text}`}>
        {v.emoji} {v.title}
      </p>
      <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{v.subtitle}</p>
    </div>
  );
}
