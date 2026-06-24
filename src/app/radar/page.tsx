import { RadarPanel } from '@/components/RadarPanel';
import { RadarSetupBanner } from '@/components/RadarSetupBanner';
import { SetupBanner, TrendPulseShell } from '@/components/TrendPulseShell';
import { loadTrendPulseData } from '@/lib/trendpulse-data';
import { DEMO_SEED } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

export default async function RadarPage() {
  const data = await loadTrendPulseData();

  return (
    <TrendPulseShell
      title="Radar"
      subtitle="Seguimiento en vivo · Google News + Reddit cada 48h"
      report={data.report}
    >
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
          Prueba manual: abre{' '}
          <code className="font-mono-data text-tp-cyan">/api/cron/ingest</code> en tu dominio y
          mira si dice <code className="font-mono-data">persisted: true</code>
        </p>
      )}
    </TrendPulseShell>
  );
}
