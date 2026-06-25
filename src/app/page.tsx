import Link from 'next/link';
import { Activity, ArrowRight, Radar, Timer } from 'lucide-react';
import { AppSuccessPanel } from '@/components/AppSuccessPanel';
import { RadarPanel } from '@/components/RadarPanel';
import { SetupBanner, TrendPulseShell } from '@/components/TrendPulseShell';
import { TimelineCaseCard } from '@/components/WaveTimeline';
import { fetchAppSuccessStats } from '@/lib/app-success-stats';
import { loadPredictionData } from '@/lib/cycle-data';
import { loadTrendPulseData } from '@/lib/trendpulse-data';
import { DEMO_SEED } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [data, market] = await Promise.all([loadTrendPulseData(), loadPredictionData()]);
  const successStats = await fetchAppSuccessStats(data.rows, market.candidates.length);

  return (
    <TrendPulseShell
      title="Dashboard"
      subtitle="Vista general · 5 pilotos ADN + radar"
      report={data.report}
    >
      <SetupBanner
        supabaseConnected={data.supabaseConnected}
        configured={data.configured}
        error={data.error}
        fromDbEmpty={data.configured && !data.error && data.rows.length === 0}
        demoCount={DEMO_SEED.length}
      />

      <AppSuccessPanel stats={successStats} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Activity, label: 'Casos ADN', value: String(data.rows.length) },
          { icon: Radar, label: 'Pilotos radar', value: String(data.radarSignals.length) },
          {
            icon: Timer,
            label: 'Delay medio → ES',
            value: data.avgDelay != null ? `${data.avgDelay}d` : '—',
          },
          {
            icon: Activity,
            label: 'Scraping',
            value: data.hasScrapeData ? 'Activo' : data.radarIsDemo ? 'Demo' : 'Pendiente',
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-white/5 bg-tp-panel p-5">
            <Icon className="mb-2 h-5 w-5 text-tp-cyan" />
            <p className="text-xs text-slate-400">{label}</p>
            <p className="font-mono-data mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-300">
              Tendencias patio · verano
            </h2>
            <p className="text-xs text-slate-500">Comprar y probar antes de septiembre</p>
          </div>
          <Link
            href="/tendencias"
            className="flex items-center gap-1 text-xs text-amber-300 hover:underline"
          >
            Ver tendencias nuevas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-slate-300">
          Tendencias <strong className="text-white">nuevas</strong> que aún no están en el radar — con
          productos más vendidos y semáforo 🟢🟡🔴 de si conviene comprar.
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              Ciclo patio
            </h2>
            <p className="text-xs text-slate-500">3 actuar + 3 observar esta quincena</p>
          </div>
          <Link
            href="/ciclo"
            className="flex items-center gap-1 text-xs text-tp-cyan hover:underline"
          >
            Ir al ciclo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="rounded-xl border border-tp-green/20 bg-tp-green/5 px-4 py-3 text-sm text-slate-300">
          Compra barato → hijos al cole → feedback. Observa otras tendencias sin gastar para
          calibrar predicciones.
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              Radar · resumen
            </h2>
            <p className="text-xs text-slate-500">5 productos en seguimiento con datos reales</p>
          </div>
          <Link
            href="/radar"
            className="flex items-center gap-1 text-xs text-tp-cyan hover:underline"
          >
            Ver radar completo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <RadarPanel
          signals={data.radarSignals.slice(0, 3)}
          isDemo={data.radarIsDemo}
          hasScrape={data.hasScrapeData}
          dailyHistory={data.radarDaily}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              ADN · 5 pilotos
            </h2>
            <p className="text-xs text-slate-500">Con referencia LATAM donde aplica</p>
          </div>
          <Link href="/adn" className="flex items-center gap-1 text-xs text-tp-cyan hover:underline">
            Ver ADN completo <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.pilotRows.map((r) => (
            <TimelineCaseCard key={r.id} row={r} corridor={data.corridorMap.get(r.slug)} />
          ))}
        </div>
      </section>
    </TrendPulseShell>
  );
}
