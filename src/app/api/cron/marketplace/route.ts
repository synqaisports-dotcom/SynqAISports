import { NextResponse } from 'next/server';
import { runPredictionIngest } from '@/lib/ingest/run-prediction-ingest';
import { persistMarketplaceCandidates } from '@/lib/marketplace';
import { hasSupabaseServiceRole } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/** Cron Fase 3 — predicciones desde titulares (no catálogo). */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runPredictionIngest();
  let persisted = false;
  let persistReason: string | undefined;

  if (hasSupabaseServiceRole()) {
    const p = await persistMarketplaceCandidates({
      scraped_at: result.scraped_at,
      candidates: result.predictions,
    });
    persisted = p.ok;
    if (!p.ok) persistReason = p.reason;
  } else {
    persistReason = 'missing_SUPABASE_SECRET_KEY';
  }

  return NextResponse.json({
    ok: true,
    phase: result.phase,
    scraped_at: result.scraped_at,
    predictions: result.predictions.length,
    summer_fit: result.predictions.filter((p) => p.summer_fit).length,
    persisted,
    persist_reason: persistReason,
    top: result.predictions.slice(0, 5).map((p) => ({
      name: p.canonical_name,
      score: p.prediction_score,
      summer: p.summer_fit,
    })),
  });
}

export async function POST(request: Request) {
  return GET(request);
}
