import { RadarPanel } from '@/components/RadarPanel';
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

      {!data.hasScrapeData && data.supabaseConnected && (
        <div className="mb-6 rounded-xl border border-white/10 bg-tp-panel/80 px-4 py-3 text-sm text-slate-300">
          Para guardar resultados del scrape en Supabase, añade{' '}
          <code className="font-mono-data text-xs text-tp-cyan">SUPABASE_SECRET_KEY</code> en
          Vercel y redeploy. Sin ella verás los 5 pilotos base hasta el primer scrape.
        </div>
      )}

      <RadarPanel
        signals={data.radarSignals}
        isDemo={data.radarIsDemo}
        hasScrape={data.hasScrapeData}
      />
    </TrendPulseShell>
  );
}
