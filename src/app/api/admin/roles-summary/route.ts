import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../verify-superadmin';

const PAGE = 1000;
const MAX_PAGES = 50;

/**
 * GET — Recuenta perfiles por `profiles.role` (superadmin + service role).
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
        error: 'SUPABASE_SERVICE_ROLE_KEY requerida para el resumen de roles.',
        counts: {} as Record<string, number>,
        total: 0,
      },
      { status: 501 },
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const rows: { role: string | null }[] = [];
    let from = 0;
    for (let page = 0; page < MAX_PAGES; page++) {
      const { data, error } = await admin
        .from('profiles')
        .select('role')
        .range(from, from + PAGE - 1);
      if (error) {
        console.warn('[SynqAI] roles-summary:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const chunk = data ?? [];
      rows.push(...chunk);
      if (chunk.length < PAGE) break;
      from += PAGE;
    }

    const counts: Record<string, number> = {};
    for (const r of rows) {
      const key = (r.role ?? 'sin_rol').trim() || 'sin_rol';
      counts[key] = (counts[key] ?? 0) + 1;
    }

    const total = rows.length;

    return NextResponse.json({
      ok: true,
      counts,
      total,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
