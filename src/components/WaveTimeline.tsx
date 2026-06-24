import type { CorridorDelayRow, HistoricalDnaRow } from '@/lib/types';
import { WAVE_PROFILE_LABELS } from '@/lib/types';
import {
  buildTimelineModel,
  corridorRelationLabel,
  daysBetweenCorridorAndEs,
  formatShortDate,
} from '@/lib/timeline';

function isValidated(row: HistoricalDnaRow): boolean {
  return row.dna_features?.validated != null || (row.notes?.includes('Validado') ?? false);
}

function corridorBadge(corridor: CorridorDelayRow, esPeak: string | null): string | null {
  const relation = corridorRelationLabel(corridor.relation_to_es);
  if (!relation) return null;
  if (corridor.relation_to_es === 'parallel') return `LATAM · ${relation}`;
  if (!esPeak || !corridor.reference_date) return `LATAM · ${relation}`;
  const delta = daysBetweenCorridorAndEs(corridor, esPeak);
  if (delta == null) return `LATAM · ${relation}`;
  const abs = Math.abs(delta);
  if (corridor.relation_to_es === 'before') return `LATAM · ${abs}d antes de ES`;
  return `LATAM · ${abs}d después de ES`;
}

export function WaveTimeline({
  row,
  corridor,
}: {
  row: HistoricalDnaRow;
  corridor?: CorridorDelayRow | null;
}) {
  const model = buildTimelineModel(row, corridor);

  if (!model) {
    return (
      <p className="text-xs text-slate-500 font-mono-data">Sin fechas suficientes para timeline</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        {model.segments.map((seg) => (
          <div
            key={seg.id}
            className={`${seg.colorClass} h-full transition-all`}
            style={{ width: `${seg.widthPct}%` }}
            title={`${seg.label} · ${Math.round(seg.widthPct)}%`}
          />
        ))}
        {model.corridor?.reference_date && (
          <div
            className="absolute top-1/2 z-10 h-4 w-0.5 -translate-y-1/2 bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]"
            style={{
              left: `${model.markers.find((m) => m.kind === 'corridor')?.pct ?? 0}%`,
            }}
            title={`${model.corridor.target_market} · ${formatShortDate(model.corridor.reference_date)}`}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data uppercase tracking-wide text-slate-500">
        <span>
          {row.origin_region} → {row.target_market}
          {model.corridor && (
            <span className="ml-2 text-violet-400/90">· ref. {model.corridor.target_market}</span>
          )}
        </span>
        {model.delayDays != null && (
          <span className="text-tp-cyan">
            delay {model.delayDays}d · ciclo {model.totalDays}d
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
        {model.markers.map((m) => (
          <span key={`${m.label}-${m.date}`}>
            <span
              className={
                m.kind === 'corridor' ? 'text-violet-400/90' : 'text-slate-500'
              }
            >
              {m.label}
              {m.kind === 'corridor' && m.relationToEs && (
                <span className="ml-1 text-[10px] normal-case">
                  ({corridorRelationLabel(m.relationToEs)})
                </span>
              )}
            </span>{' '}
            {formatShortDate(m.date)}
          </span>
        ))}
      </div>

      {model.corridor?.notes && (
        <p className="text-[10px] leading-relaxed text-slate-500">{model.corridor.notes}</p>
      )}
    </div>
  );
}

export function TimelineCaseCard({
  row,
  corridor,
}: {
  row: HistoricalDnaRow;
  corridor?: CorridorDelayRow | null;
}) {
  const validated = isValidated(row);
  const latamBadge =
    corridor && row.target_peak_date
      ? corridorBadge(corridor, row.target_peak_date)
      : null;

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
            {latamBadge && (
              <span className="ml-2 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-mono-data uppercase text-violet-300">
                {latamBadge}
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
      <WaveTimeline row={row} corridor={corridor} />
    </article>
  );
}

export function TimelineLegend() {
  const items = [
    { color: 'bg-cyan-500/80', label: 'Subida origen' },
    { color: 'bg-amber-400/90', label: 'Delay → ES' },
    { color: 'bg-emerald-400/80', label: 'Meseta ES' },
    { color: 'bg-slate-500/70', label: 'Caída' },
    { color: 'bg-violet-400', label: 'Referencia LATAM', line: true },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-400">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.line ? (
            <span className="h-3 w-0.5 rounded-sm bg-violet-400" />
          ) : (
            <span className={`h-2.5 w-6 rounded-sm ${item.color}`} />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
