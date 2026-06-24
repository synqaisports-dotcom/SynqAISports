import Image from 'next/image';
import Link from 'next/link';
import { Sun, MapPin } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { WORLD_LABELS } from '@/lib/cycle-types';
import { PriceComparator } from './PriceComparator';
import { TopProductsList } from './TopProductsList';

export function TendenciaCard({
  candidate,
  rank,
}: {
  candidate: MarketplaceCandidate;
  rank: number;
}) {
  const isEcoEs = candidate.canonical_name.startsWith('[Eco ES]');
  const hasTop = (candidate.top_products?.length ?? 0) > 0;

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
                Tendencia
              </span>
            )}
            {hasTop && (
              <span className="mb-1 mr-2 inline-flex rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-emerald-300">
                Top {candidate.top_products!.length} ventas
              </span>
            )}
            {candidate.summer_fit && (
              <span className="mb-1 inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-amber-300">
                <Sun className="h-3 w-3" /> Ventana verano
              </span>
            )}
            <h3 className="font-medium text-white leading-snug">{candidate.canonical_name}</h3>
            {candidate.category_search && (
              <p className="text-[10px] font-mono-data text-slate-500">
                AliExpress · {candidate.category_search}
              </p>
            )}
            {candidate.signal_headline && (
              <p className="mt-1 text-[11px] leading-snug text-violet-300/90">
                Señal origen: {candidate.signal_headline}
              </p>
            )}
            {candidate.es_headline && (
              <p className="mt-0.5 flex items-start gap-1 text-[11px] leading-snug text-amber-300/90">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                Eco ES ({candidate.signal_es} ref.): {candidate.es_headline}
              </p>
            )}
            {!candidate.es_headline && candidate.signal_es === 0 && !isEcoEs && (
              <p className="mt-0.5 text-[10px] text-tp-green/90">
                Sin referencias en España — origen vendiendo, ES quieto
              </p>
            )}
            <p className="text-[11px] text-slate-400">{WORLD_LABELS[candidate.world]}</p>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px] font-mono-data">
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">CN {candidate.signal_cn}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">US {candidate.signal_us}</span>
            <span
              className={`rounded px-1.5 py-0.5 ${
                candidate.signal_es >= 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400'
              }`}
            >
              ES {candidate.signal_es}
            </span>
            {candidate.origin_orders_total != null && candidate.origin_orders_total > 0 && (
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
                {candidate.origin_orders_total.toLocaleString('es-ES')}+ pedidos origen
              </span>
            )}
          </div>

          {hasTop && <TopProductsList products={candidate.top_products!} />}

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
