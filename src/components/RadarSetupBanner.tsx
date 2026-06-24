type RadarSetupStatus = {
  supabaseConnected: boolean;
  radarIsDemo: boolean;
  hasScrapeData: boolean;
  radarError?: string | null;
};

export function RadarSetupBanner({ status }: { status: RadarSetupStatus }) {
  if (!status.supabaseConnected) return null;

  const needsRadarSql = status.radarIsDemo;
  const needsSecretKey = !status.hasScrapeData && !status.radarIsDemo;
  const needsRedeploy = needsSecretKey;
  const needsScrapeSql = Boolean(status.radarError?.includes('last_scraped_at'));

  if (!needsRadarSql && !needsSecretKey && !needsScrapeSql && !status.radarError) return null;

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-tp-amber/30 bg-tp-amber/5 px-4 py-4 text-sm text-slate-200">
      <p className="font-medium text-tp-amber">Configuración pendiente del radar</p>
      <ol className="list-decimal space-y-2 pl-5 text-slate-300">
        {needsRadarSql && (
          <li>
            <strong className="text-white">Tabla radar vacía o no legible</strong> — en Supabase
            ejecuta{' '}
            <code className="font-mono-data text-xs text-tp-cyan">
              20260625140000_trendpulse_radar_5_pilots.sql
            </code>
            . Comprueba:{' '}
            <code className="font-mono-data text-xs">SELECT count(*) FROM trend_live_signals;</code>{' '}
            → 5.
          </li>
        )}
        {needsScrapeSql && (
          <li>
            <strong className="text-white">Columnas de scrape</strong> — ejecuta también{' '}
            <code className="font-mono-data text-xs text-tp-cyan">
              20260624160000_trendpulse_scrape_columns.sql
            </code>
            .
          </li>
        )}
        {needsSecretKey && (
          <li>
            <strong className="text-white">Secret key en Vercel</strong> — variable{' '}
            <code className="font-mono-data text-xs text-tp-cyan">SUPABASE_SECRET_KEY</code>{' '}
            (<code className="font-mono-data text-xs">sb_secret_...</code>).
          </li>
        )}
        {needsRedeploy && (
          <li>
            <strong className="text-white">Redeploy obligatorio</strong> — Vercel → Deployments →
            Redeploy. Sin redeploy la clave nueva no se aplica.
          </li>
        )}
      </ol>
      {status.radarError && (
        <p className="text-xs text-red-300/90">
          Error lectura radar: <code className="font-mono-data">{status.radarError}</code>
        </p>
      )}
    </div>
  );
}
