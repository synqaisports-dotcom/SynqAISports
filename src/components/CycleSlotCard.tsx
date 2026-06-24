import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { CycleSlotRow } from '@/lib/cycle-types';
import { MODE_LABELS, WORLD_LABELS } from '@/lib/cycle-types';
import { CycleFeedbackForm } from './CycleFeedbackForm';
import { PriceComparator } from './PriceComparator';

export function CycleSlotCard({ slot }: { slot: CycleSlotRow }) {
  const isAct = slot.mode === 'act';

  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${
        isAct
          ? 'border-tp-green/30 bg-tp-green/5 hover:border-tp-green/50'
          : 'border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40'
      }`}
    >
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
          <Image
            src={slot.image_url}
            alt={slot.canonical_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {slot.is_predicted && (
                <span className="mb-1 mr-2 inline-flex rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-violet-300">
                  Predicción
                </span>
              )}
              {slot.summer_fit && (
                <span className="mb-1 mr-2 inline-flex rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-amber-300">
                  Verano · antes sept
                </span>
              )}
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-mono-data uppercase ${
                  isAct ? 'bg-tp-green/20 text-tp-green' : 'bg-violet-500/20 text-violet-300'
                }`}
              >
                {MODE_LABELS[slot.mode]}
              </span>
              <h3 className="mt-1 font-medium text-white leading-snug">{slot.canonical_name}</h3>
              {slot.signal_headline && (
                <p className="text-[11px] leading-snug text-violet-300/90">
                  Señal: {slot.signal_headline}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                {WORLD_LABELS[slot.world]} · {slot.origin_marketplace}
              </p>
            </div>
            <p className="font-mono-data text-lg font-semibold text-tp-cyan">
              {slot.origin_price_eur.toFixed(2)} €
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-[10px] font-mono-data text-slate-500">
            <span>CN {slot.signal_cn}</span>
            <span>US {slot.signal_us}</span>
            <span>ES {slot.signal_es}</span>
            {slot.units_sold_label && (
              <span className="text-slate-400">{slot.units_sold_label}</span>
            )}
          </div>

          {slot.estimated_window_es && (
            <p className="text-[11px] text-slate-400">{slot.estimated_window_es}</p>
          )}

          <PriceComparator item={slot} />

          {slot.dna_match_slug && !slot.canonical_name.startsWith('[Eco ES]') && (
            <p className="text-[10px] text-violet-300/80">Patrón ola · {slot.dna_match_slug}</p>
          )}

          {isAct && (
            <p className="text-[11px] leading-relaxed text-tp-green/90">
              Compra → hijos al cole → anota si otros niños lo piden. Diles dónde se compró.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {slot.purchase_links?.aliexpress && (
              <a
                href={slot.purchase_links.aliexpress}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
              >
                {slot.aliexpress_item_id ? 'AliExpress · producto directo' : 'AliExpress'}{' '}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <CycleFeedbackForm slot={slot} />
        </div>
      </div>
    </article>
  );
}
