type RadarSetupStatus = {
  supabaseConnected: boolean;
  radarIsDemo: boolean;
  hasScrapeData: boolean;
};

export function RadarSetupBanner({ status }: { status: RadarSetupStatus }) {
  if (!status.supabaseConnected) return null;

  const needsRadarSql = status.radarIsDemo;
  const needsSecretKey = !status.hasScrapeData;

  if (!needsRadarSql && !needsSecretKey) return null;

  return (
    <div className="mb-6 space-y-3 rounded-xl border border-tp-amber/30 bg-tp-amber/5 px-4 py-4 text-sm text-slate-200">
      <p className="font-medium text-tp-amber">Configuración pendiente del radar</p>
      <ol className="list-decimal space-y-2 pl-5 text-slate-300">
        {needsRadarSql && (
          <li>
            <strong className="text-white">Crear tabla radar en Supabase</strong> — ejecuta en SQL
            Editor los archivos{' '}
            <code className="font-mono-data text-xs text-tp-cyan">
              20260624140000_trendpulse_phase2_radar.sql
            </code>
            , luego{' '}
            <code className="font-mono-data text-xs text-tp-cyan">
              20260625140000_trendpulse_radar_5_pilots.sql
            </code>
            . Hasta entonces verás la etiqueta &quot;Sin datos radar&quot;.
          </li>
        )}
        {needsSecretKey && (
          <li>
            <strong className="text-white">Guardar scrape en Vercel</strong> — añade{' '}
            <code className="font-mono-data text-xs text-tp-cyan">SUPABASE_SECRET_KEY</code>{' '}
            (Supabase → Settings → API → Secret key{' '}
            <code className="font-mono-data text-xs">sb_secret_...</code>) y haz{' '}
            <strong>Redeploy</strong>.
          </li>
        )}
      </ol>
      <p className="text-xs text-slate-500">
        Comprobar en Supabase:{' '}
        <code className="font-mono-data">SELECT count(*) FROM trend_live_signals;</code> → debe dar{' '}
        <strong>5</strong>.
      </p>
    </div>
  );
}
