import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * POST — Registra un escaneo / apertura de magic link (anon key, RPC `record_promo_scan`).
 */
export async function POST(req: Request) {
  let body: { token?: string };
  try {
    body = (await req.json()) as { token?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!token) {
    return NextResponse.json({ ok: false, error: 'empty_token' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: 'supabase_unconfigured' }, { status: 503 });
  }

  const supabase = createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.rpc('record_promo_scan', { p_token: token });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? { ok: false, error: 'no_payload' });
}
