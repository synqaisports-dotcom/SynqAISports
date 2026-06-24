import { Radar, Sparkles, TrendingUp } from 'lucide-react';
import type { LiveSignalRow } from '@/lib/radar-types';
import { CONFIDENCE_LABELS, SIGNAL_STATUS_LABELS } from '@/lib/radar-types';
import { daysUntil } from '@/lib/radar';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function statusColor(status: LiveSignalRow['status']) {
  switch (status) {
    case 'watching':
      return 'border-slate-500/40 bg-slate-500/10 text-slate-300';
    case 'emerging':
      return 'border-tp-amber/40 bg-tp-amber/10 text-tp-amber';
    case 'peak_es':
      return 'border-tp-cyan/40 bg-tp-cyan/10 text-tp-cyan';
    case 'decline':
      return 'border-red-400/30 bg-red-400/10 text-red-300';
  }
}

export function RadarPanel({
  signals,
  isDemo,
}: {
  signals: LiveSignalRow[];
  isDemo?: boolean;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-tp-cyan" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              Radar Fase 2
            </h2>
            <p className="text-xs text-slate-500">
              Señales vivas · cruce ADN histórico · ingesta cada 48h (próximo)
            </p>
          </div>
        </div>
        {isDemo && (
          <span className="rounded border border-tp-amber/30 bg-tp-amber/5 px-2 py-1 text-[10px] font-mono-data uppercase text-tp-amber">
            Demo radar
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {signals.map((s) => {
          const daysToPeak = daysUntil(s.predicted_es_peak_date);
          const isFuture = s.slug.includes('predicted') || s.status === 'watching';
          const isReal = !s.slug.includes('predicted');

          return (
            <article
              key={s.id}
              className={`rounded-xl border p-4 ${
                isFuture
                  ? 'border-tp-cyan/30 bg-gradient-to-br from-tp-cyan/5 to-transparent'
                  : 'border-white/10 bg-tp-panel'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isReal ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono-data uppercase text-tp-green">
                        <TrendingUp className="h-3 w-3" /> Real
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-mono-data uppercase text-tp-cyan">
                        <Sparkles className="h-3 w-3" /> Predicción
                      </span>
                    )}
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-mono-data uppercase ${statusColor(s.status)}`}
                    >
                      {SIGNAL_STATUS_LABELS[s.status]}
                    </span>
                  </div>
                  <h3 className="mt-1 font-semibold text-white">{s.canonical_name}</h3>
                  <p className="text-xs text-slate-500">{s.signal_source}</p>
                </div>
                {s.dna_match_score != null && (
                  <div className="text-right">
                    <p className="font-mono-data text-lg font-bold text-tp-cyan">
                      {Math.round(s.dna_match_score * 100)}%
                    </p>
                    <p className="text-[10px] text-slate-500">match ADN</p>
                  </div>
                )}
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-black/20 px-2 py-1.5">
                  <p className="text-slate-500">Origen</p>
                  <p className="font-mono-data uppercase text-slate-300">{s.origin_region}</p>
                </div>
                <div className="rounded-lg bg-black/20 px-2 py-1.5">
                  <p className="text-slate-500">Delay est.</p>
                  <p className="font-mono-data text-tp-amber">
                    {s.predicted_delay_days != null ? `${s.predicted_delay_days}d` : '—'}
                  </p>
                </div>
                <div className="rounded-lg bg-black/20 px-2 py-1.5">
                  <p className="text-slate-500">Pico ES previsto</p>
                  <p className="font-mono-data text-white">
                    {formatDate(s.predicted_es_peak_date)}
                  </p>
                </div>
                <div className="rounded-lg bg-black/20 px-2 py-1.5">
                  <p className="text-slate-500">Confianza</p>
                  <p className="font-mono-data text-slate-300">
                    {CONFIDENCE_LABELS[s.confidence]}
                  </p>
                </div>
              </div>

              {s.dna_match_slug && (
                <p className="mb-2 text-[11px] text-slate-500">
                  ADN ref:{' '}
                  <code className="font-mono-data text-tp-cyan">{s.dna_match_slug}</code>
                </p>
              )}

              {daysToPeak != null && (
                <p className="mb-2 font-mono-data text-xs text-tp-cyan">
                  {daysToPeak > 0
                    ? `→ Pico ES en ~${daysToPeak} días`
                    : daysToPeak === 0
                      ? '→ Pico ES: hoy'
                      : `→ Pico ES hace ${Math.abs(daysToPeak)} días`}
                </p>
              )}

              {/* Mini timeline futuro */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${isFuture ? 'bg-tp-cyan/60' : 'bg-tp-amber/80'}`}
                  style={{
                    width: `${Math.min(95, Math.max(15, 100 - (daysToPeak != null && daysToPeak > 0 ? daysToPeak / 4 : 10)))}%`,
                  }}
                />
              </div>

              {s.notes && (
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{s.notes}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
