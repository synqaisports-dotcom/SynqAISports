import { TendenciaCard } from '@/components/TendenciaCard';
import type { MarketplaceCandidate } from '@/lib/cycle-types';

export function TendenciaSection({
  title,
  subtitle,
  emoji,
  candidates,
  accent = 'text-tp-cyan',
}: {
  title: string;
  subtitle: string;
  emoji: string;
  candidates: MarketplaceCandidate[];
  accent?: string;
}) {
  if (!candidates.length) return null;

  return (
    <section className="mb-10">
      <h2 className={`mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${accent}`}>
        <span>{emoji}</span>
        {title} ({candidates.length})
      </h2>
      <p className="mb-4 text-xs text-slate-500">{subtitle}</p>
      <div className="grid gap-4">
        {candidates.map((c, i) => (
          <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
