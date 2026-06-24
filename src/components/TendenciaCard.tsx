import Image from 'next/image';
import Link from 'next/link';
import { Sun } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { WORLD_LABELS } from '@/lib/cycle-types';
import { PriceComparator } from './PriceComparator';

export function TendenciaCard({
  candidate,
  rank,
}: {
  candidate: MarketplaceCandidate;
  rank: number;
}) {
  const isEcoEs = candidate.canonical_name.startsWith('[Eco ES]');

  return (
    <article
      className={`rounded-xl border p-4 ${
        candidate.summer_fit
          ? 'border-amber-400/40 bg-amber-400/5'
          : isEcoEs
            ? 'border-slate-600/40 bg-slate-800/20'
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

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            {candidate.is_predicted && (
              <span className="mb-1 mr-2 inline-flex rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-violet-300">
                Predicción
              </span>
            )}
            {candidate.aliexpress_item_id && (
              <span className="mb-1 mr-2 inline-flex rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-emerald-300">
                Producto real
              </span>
            )}
            {candidate.summer_fit && (
              <span className="mb-1 inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-amber-300">
                <Sun className="h-3 w-3" /> Ventana verano
              </span>
            )}
            <h3 className="font-medium text-white leading-snug">{candidate.canonical_name}</h3>
            {candidate.signal_headline && (
              <p className="mt-1 text-[11px] leading-snug text-violet-300/90">
                Señal: {candidate.signal_headline}
              </p>
            )}
            <p className="text-[11px] text-slate-400">{WORLD_LABELS[candidate.world]}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono-data">
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">CN {candidate.signal_cn}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">US {candidate.signal_us}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">ES {candidate.signal_es}</span>
          </div>

          <PriceComparator item={candidate} />

          {candidate.evidence_urls && candidate.evidence_urls.length > 0 && (
            <Link
              href={candidate.evidence_urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-slate-500 hover:text-tp-cyan"
            >
              Fuente señal (noticia) →
            </Link>
          )}

          <Link href="/ciclo" className="text-xs text-slate-400 hover:text-white">
            Ir al ciclo patio →
          </Link>
        </div>
      </div>
    </article>
  );
}
