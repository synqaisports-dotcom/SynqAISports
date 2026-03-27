import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifyClubSessionFromRequest } from '@/lib/verify-club-session';
import { guardClubModuleOr403 } from '@/lib/club-matrix-api-guard';
import { isUuidLike } from '@/lib/operativa-sync';

function clientForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/**
 * GET — estado Academy/Cantera (categorías/equipos/days) de este club.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  if (!gate.clubId || !isUuidLike(gate.clubId)) {
    return NextResponse.json({ error: 'club_id inválido' }, { status: 400 });
  }

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });

  const { data, error } = await userClient
    .from('methodology_academy_state')
    .select('payload')
    .eq('club_id', gate.clubId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const payload = data?.payload;
  return NextResponse.json({ ok: true, payload: Array.isArray(payload) ? payload : [] });
}

/**
 * PUT — Persistir el estado Academy/Cantera (guardar el árbol de categorías como JSONB).
 * Body: { payload: any[] }
 */
export async function PUT(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  if (!gate.clubId || !isUuidLike(gate.clubId)) {
    return NextResponse.json({ error: 'club_id inválido' }, { status: 400 });
  }

  const deniedAcadPut = await guardClubModuleOr403(gate, token, 'academy', 'edit');
  if (deniedAcadPut) return deniedAcadPut;

  let body: { payload?: unknown } = {};
  try {
    body = (await req.json()) as { payload?: unknown };
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const payload = body.payload;
  if (payload === undefined) {
    return NextResponse.json({ error: 'payload requerido' }, { status: 400 });
  }

  const userClient = clientForUser(token);
  if (!userClient) return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });

  const { error } = await userClient
    .from('methodology_academy_state')
    .upsert({ club_id: gate.clubId, payload })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

