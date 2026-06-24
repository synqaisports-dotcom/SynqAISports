import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ExternalLink, Sun } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { WORLD_LABELS } from '@/lib/cycle-types';

export function TendenciaCard({
  candidate,
  rank,
}: {
  candidate: MarketplaceCandidate;
  rank: number;
}) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        candidate.summer_fit
          ? 'border-amber-400/40 bg-amber-400/5'
          : 'border-white/10 bg-tp-panel/80'
      }`}
    >
      <div className="flex gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
          <span className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 font-mono-data text-[10px] text-white">
            #{rank}
          </span>
          <Image
            src={candidate.image_url}
            alt={candidate.canonical_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {candidate.summer_fit && (
                <span className="mb-1 inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-amber-300">
                  <Sun className="h-3 w-3" /> Verano · antes de sept
                </span>
              )}
              <h3 className="font-medium text-white leading-snug">{candidate.canonical_name}</h3>
              <p className="text-[11px] text-slate-400">
                {WORLD_LABELS[candidate.world]} · {candidate.origin_marketplace}
              </p>
            </div>
            <p className="font-mono-data text-xl font-semibold text-tp-cyan">
              {candidate.origin_price_eur.toFixed(2)} €
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono-data">
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">CN {candidate.signal_cn}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">US {candidate.signal_us}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">ES {candidate.signal_es}</span>
            {candidate.weighted_score != null && candidate.weighted_score > 0 && (
              <span className="rounded bg-tp-cyan/10 px-1.5 py-0.5 text-tp-cyan">
                {candidate.weighted_score.toFixed(1)}w
              </span>
            )}
          </div>

          {candidate.estimated_window_es && (
            <p className="text-[11px] leading-relaxed text-slate-300">{candidate.estimated_window_es}</p>
          )}

          {candidate.estimated_arrival_es && (
            <p className="flex items-center gap-1 text-[10px] text-slate-500">
              <Calendar className="h-3 w-3" />
              Llegada est. {candidate.estimated_arrival_es}
              {candidate.dna_match_slug && ` · ADN ${candidate.dna_match_slug}`}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={candidate.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-tp-cyan/15 px-3 py-1.5 text-xs font-medium text-tp-cyan hover:bg-tp-cyan/25"
            >
              Comprar / ver precio <ExternalLink className="h-3 w-3" />
            </Link>
            <Link href="/ciclo" className="text-xs text-slate-400 hover:text-white">
              Ir al ciclo patio →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
