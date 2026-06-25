import Image from 'next/image';
import Link from 'next/link';
import { Sun, MapPin, ChevronDown } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import { PriceComparator } from './PriceComparator';
import { TopProductsList } from './TopProductsList';
import { TrendVerdictBanner } from './TrendVerdictBanner';

export function TendenciaCard({
  candidate,
  rank,
}: {
  candidate: MarketplaceCandidate;
  rank: number;
}) {
  const isEcoEs = candidate.canonical_name.startsWith('[Eco ES]');
  const hasTop =
    (candidate.top_products?.length ?? 0) > 0 ||
    Object.values(candidate.top_by_marketplace ?? {}).some((arr) => (arr?.length ?? 0) > 0);

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-tp-panel/80">
      <div className="border-b border-white/5 p-4">
        <TrendVerdictBanner candidate={candidate} />
      </div>

      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
          <span className="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 font-mono-data text-[10px] text-white">
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
            <div className="flex h-full items-center justify-center text-[10px] text-slate-600">?</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {candidate.summer_fit && (
              <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-amber-300">
                <Sun className="h-3 w-3" /> Verano
              </span>
            )}
          </div>
          <h3 className="mt-1 text-base font-semibold text-white leading-snug">
            {candidate.canonical_name}
          </h3>
          {candidate.signal_headline && (
            <p className="mt-1 text-xs leading-snug text-violet-300/90">
              Noticia origen: «{candidate.signal_headline}»
            </p>
          )}
          {candidate.es_headline && (
            <p className="mt-0.5 flex items-start gap-1 text-xs leading-snug text-amber-300/90">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              Ya en España: «{candidate.es_headline}»
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/20 px-4 py-3">
        <p className="mb-2 text-[10px] font-mono-data uppercase tracking-widest text-slate-500">
          Noticias detectadas (últimas 2 semanas)
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-rose-500/10 px-2 py-1 text-rose-300" title="Menciones en prensa china">
            🇨🇳 China <strong>{candidate.signal_cn}</strong>
          </span>
          <span className="rounded-md bg-sky-500/10 px-2 py-1 text-sky-300" title="Menciones en prensa USA">
            🇺🇸 USA <strong>{candidate.signal_us}</strong>
          </span>
          <span
            className={`rounded-md px-2 py-1 ${
              candidate.signal_es >= 2
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/10 text-emerald-300'
            }`}
            title="Menciones en prensa española"
          >
            🇪🇸 España <strong>{candidate.signal_es}</strong>
            {candidate.signal_es === 0 && !isEcoEs && (
              <span className="ml-1 text-[10px] opacity-80">· quieto ✓</span>
            )}
          </span>
          {(candidate.origin_orders_total ?? 0) > 0 && (
            <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-300">
              📦 <strong>{candidate.origin_orders_total!.toLocaleString('es-ES')}+</strong> pedidos en origen
            </span>
          )}
        </div>
      </div>

      {hasTop && (
        <div className="border-t border-white/5 p-4">
          <p className="mb-3 flex items-center gap-1 text-[10px] font-mono-data uppercase tracking-widest text-emerald-400">
            <ChevronDown className="h-3 w-3" />
            Productos más vendidos ahora
          </p>
          <TopProductsList
            products={candidate.top_products}
            topByMarketplace={candidate.top_by_marketplace}
          />
        </div>
      )}

      {!hasTop && (
        <div className="border-t border-white/5 px-4 py-3 text-xs text-slate-500">
          Productos en carga — se mostrarán en el próximo scan.
        </div>
      )}

      <div className="border-t border-white/5 p-4">
        <PriceComparator item={candidate} />
      </div>

      {candidate.evidence_urls && candidate.evidence_urls.length > 0 && (
        <div className="border-t border-white/5 px-4 py-2">
          <Link
            href={candidate.evidence_urls[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-tp-cyan"
          >
            Ver noticia fuente →
          </Link>
        </div>
      )}
    </article>
  );
}
