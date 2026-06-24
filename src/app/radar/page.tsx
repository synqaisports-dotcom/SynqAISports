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
      />

      {data.supabaseConnected && (
        <p className="mt-4 text-center font-mono-data text-[10px] text-slate-600">
          radar DB: {data.radarIsDemo ? '0' : data.radarSignals.length} filas
          {data.secretKeyConfigured ? ' · secret OK' : ' · secret NO detectada'}
          {data.hasScrapeData ? ' · scrape OK' : ' · scrape pendiente'}
          {data.radarError ? ` · ${data.radarError}` : ''}
        </p>
      )}
    </TrendPulseShell>
  );
}
