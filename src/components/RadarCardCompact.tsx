import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LiveSignalRow } from '@/lib/radar-types';
import { SIGNAL_STATUS_LABELS } from '@/lib/radar-types';
import { getRadarVerdict, VERDICT_STYLES } from '@/lib/trend-verdict';
import { daysUntil } from '@/lib/radar';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function RadarCardCompact({ signal }: { signal: LiveSignalRow }) {
  const verdict = getRadarVerdict(signal);
  const styles = VERDICT_STYLES[verdict.verdict];
  const daysToPeak = daysUntil(signal.predicted_es_peak_date);
  const weighted = signal.source_breakdown?.weighted ?? 0;
  const orders = signal.origin_orders_total ?? 0;

  return (
    <Link
      href={`/radar/${signal.slug}`}
      className={`group flex gap-3 rounded-xl border p-3 transition hover:border-tp-cyan/40 ${styles.border} ${styles.bg}`}
    >
      {signal.lead_image_url && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/30 ring-1 ring-white/10">
          <Image
            src={signal.lead_image_url}
            alt={signal.canonical_name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-semibold ${styles.text}`}>
            {verdict.emoji} {verdict.title}
          </span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-slate-400">
            {SIGNAL_STATUS_LABELS[signal.status]}
          </span>
        </div>
        <h3 className="mt-0.5 truncate text-sm font-semibold text-white group-hover:text-tp-cyan">
          {signal.canonical_name}
        </h3>
        <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-slate-400">
          {signal.predicted_delay_days != null && (
            <span className="rounded bg-black/20 px-1.5 py-0.5">
              Delay {signal.predicted_delay_days}d
            </span>
          )}
          <span className="rounded bg-black/20 px-1.5 py-0.5">
            Pico {formatDate(signal.predicted_es_peak_date)}
          </span>
          {weighted > 0 && (
            <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300">
              {weighted}w noticias
            </span>
          )}
          {orders > 0 && (
            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">
              {orders.toLocaleString('es-ES')}+ pedidos
            </span>
          )}
          {daysToPeak != null && daysToPeak > 0 && (
            <span className="rounded bg-tp-cyan/10 px-1.5 py-0.5 text-tp-cyan">
              ~{daysToPeak}d al pico
            </span>
          )}
        </div>
      </div>

      <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-tp-cyan" />
    </Link>
  );
}
