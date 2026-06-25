import { RadarPanel } from '@/components/RadarPanel';
import { RadarSetupBanner } from '@/components/RadarSetupBanner';
import { HowToReadPanel } from '@/components/HowToReadPanel';
import { SetupBanner, TrendPulseShell } from '@/components/TrendPulseShell';
import { loadTrendPulseData } from '@/lib/trendpulse-data';
import { DEMO_SEED } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

export default async function RadarPage() {
  const data = await loadTrendPulseData();

  return (
    <TrendPulseShell
      title="Radar"
      subtitle="5 productos conocidos · noticias + ventas reales"
      report={data.report}
    >
      <HowToReadPanel variant="radar" />

      <SetupBanner
        supabaseConnected={data.supabaseConnected}
        configured={data.configured}
        error={data.error}
        demoCount={DEMO_SEED.length}
      />

      <RadarSetupBanner
        status={{
          supabaseConnected: data.supabaseConnected,
          radarIsDemo: data.radarIsDemo,
          hasScrapeData: data.hasScrapeData,
          secretKeyConfigured: data.secretKeyConfigured,
          radarError: data.radarError,
        }}
      />

      <RadarPanel
        signals={data.radarSignals}
        isDemo={data.radarIsDemo}
        hasScrape={data.hasScrapeData}
        secretConfigured={data.secretKeyConfigured}
        dailyHistory={data.radarDaily}
      />

      {data.scrapePersistReason && (
        <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-xs text-red-300">
          Error al guardar scrape: <code className="font-mono-data">{data.scrapePersistReason}</code>
          {data.scrapeErrors.length > 0 && (
            <span className="mt-1 block text-red-200/80">{data.scrapeErrors.join(' · ')}</span>
          )}
        </p>
      )}

      {data.supabaseConnected && (
        <p className="mt-4 text-center font-mono-data text-[10px] text-slate-600">
          radar DB: {data.radarIsDemo ? '0' : data.radarSignals.length} filas
          {data.secretKeyConfigured ? ' · secret OK' : ' · secret NO detectada'}
          {data.hasScrapeData ? ' · scrape OK' : ' · scrape pendiente'}
          {data.scrapePersistReason ? ` · ${data.scrapePersistReason}` : ''}
        </p>
      )}

      {data.secretKeyConfigured && !data.hasScrapeData && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Diagnóstico: abre{' '}
          <code className="font-mono-data text-tp-cyan">/api/radar/status</code> y{' '}
          <code className="font-mono-data text-tp-cyan">/api/cron/ingest</code>
        </p>
      )}

      {!data.secretKeyConfigured && data.supabaseConnected && (
        <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-4 text-sm text-red-200">
          <p className="font-medium text-red-300">Vercel no ve SUPABASE_SECRET_KEY en este deploy</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-red-100/90">
            <li>
              Nombre exacto de la variable:{' '}
              <code className="font-mono-data">SUPABASE_SECRET_KEY</code>
            </li>
            <li>Valor: Supabase → Settings → API → <strong>Secret key</strong> (sb_secret_...)</li>
            <li>Entorno: <strong>Production</strong> marcado</li>
            <li>
              <strong>Save</strong> y luego <strong>Deployments → Redeploy</strong> (commit reciente
              en main, no un deploy viejo)
            </li>
            <li>
              Comprueba: <code className="font-mono-data">/api/radar/status</code> debe decir{' '}
              <code className="font-mono-data">secretKey: true</code>
            </li>
          </ol>
        </div>
      )}
    </TrendPulseShell>
  );
}
