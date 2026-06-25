import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sun } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { getTrendVerdict, VERDICT_STYLES } from '@/lib/trend-verdict';

export function TendenciaCardCompact({
  candidate,
  rank,
}: {
  candidate: MarketplaceCandidate;
  rank: number;
}) {
  const verdict = getTrendVerdict(candidate);
  const styles = VERDICT_STYLES[verdict.verdict];
  const orders = candidate.origin_orders_total ?? 0;

  return (
    <Link
      href={`/tendencias/${candidate.slug}`}
      className={`group flex gap-3 rounded-xl border p-3 transition hover:border-tp-cyan/40 ${styles.border} ${styles.bg}`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
        <span className="absolute left-0.5 top-0.5 z-10 rounded bg-black/70 px-1 font-mono-data text-[9px] text-white">
          #{rank}
        </span>
        {candidate.image_url ? (
          <Image
            src={candidate.image_url}
            alt={candidate.canonical_name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-slate-600">?</div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-semibold ${styles.text}`}>
            {verdict.emoji} {verdict.title}
          </span>
          {candidate.summer_fit && (
            <span className="inline-flex items-center gap-0.5 rounded bg-amber-400/20 px-1 py-0.5 text-[9px] text-amber-300">
              <Sun className="h-2.5 w-2.5" /> Verano
            </span>
          )}
        </div>
        <h3 className="mt-0.5 truncate text-sm font-semibold text-white group-hover:text-tp-cyan">
          {candidate.canonical_name}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
          <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-300">
            🇨🇳 {candidate.signal_cn}
          </span>
          <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-300">
            🇺🇸 {candidate.signal_us}
          </span>
          <span
            className={`rounded px-1.5 py-0.5 ${
              candidate.signal_es >= 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'
            }`}
          >
            🇪🇸 {candidate.signal_es}
          </span>
          {orders > 0 && (
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
              📦 {orders.toLocaleString('es-ES')}+
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-tp-cyan" />
    </Link>
  );
}
