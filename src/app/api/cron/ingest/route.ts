import { NextResponse } from 'next/server';
import { persistIngestSignals } from '@/lib/radar';
import { runIngest } from '@/lib/ingest/run-ingest';
import { hasSupabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron Fase 2 — scraping Google News RSS + Reddit cada 48h.
 * Vercel: CRON_SECRET + SUPABASE_SECRET_KEY (service role) en env.
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runIngest();
  let persisted = false;
  let persistReason: string | undefined;

  if (hasSupabaseServiceRole()) {
    const p = await persistIngestSignals(result.signals, result.errors);
    persisted = p.ok;
    if (!p.ok) persistReason = p.reason;
  } else {
    persistReason = 'missing_SUPABASE_SECRET_KEY';
  }

  return NextResponse.json({
    ok: true,
    phase: result.phase,
    scraped_at: result.scraped_at,
    signals_found: result.signals.length,
    persisted,
    persist_reason: persistReason,
    errors: result.errors,
    signals: result.signals.map((s) => ({
      slug: s.slug,
      name: s.canonical_name,
      hits: s.scrape_hits,
      weighted: s.source_breakdown.weighted,
      breakdown: s.source_breakdown,
      status: s.status,
      source: s.signal_source,
    })),
  });
}

/** POST manual desde panel admin / prueba */
export async function POST(request: Request) {
  return GET(request);
}
