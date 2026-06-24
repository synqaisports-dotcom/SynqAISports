import type { HistoricalDnaRow } from '@/lib/types';
import { WAVE_PROFILE_LABELS } from '@/lib/types';
import { buildTimelineModel, formatShortDate } from '@/lib/timeline';

function isValidated(row: HistoricalDnaRow): boolean {
  return row.dna_features?.validated != null || (row.notes?.includes('Validado') ?? false);
}

export function WaveTimeline({ row }: { row: HistoricalDnaRow }) {
  const model = buildTimelineModel(row);

  if (!model) {
    return (
      <p className="text-xs text-slate-500 font-mono-data">Sin fechas suficientes para timeline</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        {model.segments.map((seg) => (
          <div
            key={seg.id}
            className={`${seg.colorClass} h-full transition-all`}
            style={{ width: `${seg.widthPct}%` }}
            title={`${seg.label} · ${Math.round(seg.widthPct)}%`}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data uppercase tracking-wide text-slate-500">
        <span>{row.origin_region} → {row.target_market}</span>
        {model.delayDays != null && (
          <span className="text-tp-cyan">
            delay {model.delayDays}d · ciclo {model.totalDays}d
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        {model.markers.map((m) => (
          <span key={m.label}>
            <span className="text-slate-500">{m.label}</span>{' '}
            {formatShortDate(m.date)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TimelineCaseCard({ row }: { row: HistoricalDnaRow }) {
  const validated = isValidated(row);

  return (
    <article className="rounded-xl border border-white/5 bg-tp-panel/80 p-4 transition-colors hover:border-tp-cyan/20">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-white">{row.canonical_name}</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {WAVE_PROFILE_LABELS[row.wave_profile]}
            {validated && (
              <span className="ml-2 rounded bg-tp-green/10 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-tp-green">
                Validado
              </span>
            )}
          </p>
        </div>
        {row.delay_days_to_target != null && (
          <span className="font-mono-data text-lg font-semibold text-tp-cyan">
            {row.delay_days_to_target}d
          </span>
        )}
      </div>
      <WaveTimeline row={row} />
    </article>
  );
}

export function TimelineLegend() {
  const items = [
    { color: 'bg-cyan-500/80', label: 'Subida origen' },
    { color: 'bg-amber-400/90', label: 'Delay → ES' },
    { color: 'bg-emerald-400/80', label: 'Meseta ES' },
    { color: 'bg-slate-500/70', label: 'Caída' },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-400">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-6 rounded-sm ${item.color}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
