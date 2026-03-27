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
 * GET — estado Warehouse (installations/stores/materials + teams) de este club.
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
    .from('methodology_warehouse_state')
    .select('payload')
    .eq('club_id', gate.clubId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const raw = data?.payload;
  const payload =
    raw !== null && typeof raw === 'object'
      ? (raw as { state?: unknown; teams?: unknown })
      : {};
  const state =
    payload.state !== undefined && typeof payload.state === 'object' && payload.state !== null
      ? (payload.state as Record<string, unknown>)
      : { installations: [], stores: [], materials: [] };
  const teams = Array.isArray(payload.teams) ? payload.teams : [];

  return NextResponse.json({
    ok: true,
    payload: { state, teams },
  });
}

/**
 * PUT — Persistir el estado Warehouse en JSONB.
 * Body: { payload: { state: WarehouseState, teams: WarehouseTeam[] } }
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

  const deniedWhPut = await guardClubModuleOr403(gate, token, 'planner', 'edit');
  if (deniedWhPut) return deniedWhPut;

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
    .from('methodology_warehouse_state')
    .upsert({ club_id: gate.clubId, payload })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

