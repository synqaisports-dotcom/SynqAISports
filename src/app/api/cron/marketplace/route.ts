import { NextResponse } from 'next/server';
import { runMarketplaceIngest } from '@/lib/ingest/run-marketplace-ingest';
import { persistMarketplaceCandidates } from '@/lib/marketplace';
import { hasSupabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/** Cron Fase 2c — señales marketplace por producto (News + Reddit). */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runMarketplaceIngest();
  let persisted = false;
  let persistReason: string | undefined;

  if (hasSupabaseServiceRole()) {
    const p = await persistMarketplaceCandidates(result);
    persisted = p.ok;
    if (!p.ok) persistReason = p.reason;
  } else {
    persistReason = 'missing_SUPABASE_SECRET_KEY';
  }

  const summer = result.candidates.filter((c) => c.summer_fit);

  return NextResponse.json({
    ok: true,
    phase: result.phase,
    scraped_at: result.scraped_at,
    days_until_september: result.days_until_september,
    candidates: result.candidates.length,
    summer_fit_count: summer.length,
    persisted,
    persist_reason: persistReason,
    errors: result.errors.slice(0, 20),
    top: result.candidates.slice(0, 6).map((c) => ({
      slug: c.slug,
      name: c.canonical_name,
      summer_fit: c.summer_fit,
      weighted: c.weighted_score,
      signals: `CN${c.signal_cn} US${c.signal_us} ES${c.signal_es}`,
      arrival: c.estimated_arrival_es,
    })),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
