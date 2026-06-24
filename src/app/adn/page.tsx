import { SetupBanner, TrendPulseShell } from '@/components/TrendPulseShell';
import { TimelineCaseCard, TimelineLegend } from '@/components/WaveTimeline';
import { loadTrendPulseData, formatTrendDate } from '@/lib/trendpulse-data';
import { WAVE_PROFILE_LABELS } from '@/lib/types';
import { DEMO_SEED } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

export default async function AdnPage() {
  const data = await loadTrendPulseData({ refreshScrape: false });

  return (
    <TrendPulseShell
      title="ADN histórico"
      subtitle={`${data.rows.length} casos · timelines y tabla de referencia`}
      report={data.report}
    >
      <SetupBanner
        supabaseConnected={data.supabaseConnected}
        configured={data.configured}
        error={data.error}
        demoCount={DEMO_SEED.length}
      />

      <section className="mb-10">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
            5 pilotos · con LATAM
          </h2>
          <p className="text-xs text-slate-500">
            Misma selección que el radar activo · línea violeta = referencia LATAM
          </p>
        </div>
        <TimelineLegend />
        <div className="grid gap-3 sm:grid-cols-2">
          {data.pilotRows.map((r) => (
            <TimelineCaseCard key={r.id} row={r} corridor={data.corridorMap.get(r.slug)} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Todos los casos ({data.rows.length})
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-tp-panel">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Pico origen</th>
                <th className="px-4 py-3">Pico ES</th>
                <th className="px-4 py-3 text-tp-cyan">Delay</th>
                <th className="px-4 py-3">LATAM</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const corridor = data.corridorMap.get(r.slug);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-medium text-white">{r.canonical_name}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {WAVE_PROFILE_LABELS[r.wave_profile]}
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs uppercase text-slate-400">
                      {r.origin_region}
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs">
                      {formatTrendDate(r.origin_peak_date)}
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs">
                      {formatTrendDate(r.target_peak_date)}
                    </td>
                    <td className="px-4 py-3 font-mono-data font-semibold text-tp-cyan">
                      {r.delay_days_to_target != null ? `${r.delay_days_to_target}d` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs text-violet-300">
                      {corridor?.relation_to_es
                        ? `${formatTrendDate(corridor.reference_date)} · ${corridor.relation_to_es}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </TrendPulseShell>
  );
}
