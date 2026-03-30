import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../verify-superadmin';

const LIMIT = 2000;

/**
 * GET — Lista ejercicios persistidos en Supabase (todos los clubs) para el almacén neural.
 * Requiere superadmin + SUPABASE_SERVICE_ROLE_KEY.
 */
export async function GET(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      {
        ok: false,
        offline: true,
        error: 'SUPABASE_SERVICE_ROLE_KEY requerida para el almacén neural en servidor.',
        remote: [],
      },
      { status: 501 },
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: exercises, error: exErr } = await admin
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(LIMIT);

    if (exErr) {
      console.warn('[SynqAI] neural-warehouse exercises:', exErr.message);
      return NextResponse.json({ error: exErr.message }, { status: 500 });
    }

    const rows = exercises ?? [];
    const clubIds = [...new Set(rows.map((e) => e.club_id))];
    let clubMap = new Map<
      string,
      { id: string; name: string; country: string; sport?: string | null }
    >();

    if (clubIds.length > 0) {
      const { data: clubs, error: cErr } = await admin
        .from('clubs')
        .select('id, name, country, sport')
        .in('id', clubIds);

      if (cErr) {
        console.warn('[SynqAI] neural-warehouse clubs:', cErr.message);
      } else {
        clubMap = new Map((clubs ?? []).map((c) => [c.id, c]));
      }
    }

    const remote = rows.map((e) => ({
      ...e,
      club: clubMap.get(e.club_id) ?? null,
    }));

    return NextResponse.json({ ok: true, remote, count: remote.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
