import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../verify-superadmin';

const KEY_RE = /^[a-z][a-z0-9_]*$/;

/**
 * GET — Lista completa `synq_roles` (superadmin + service role).
 * POST — Crea rol custom (`is_system: false`).
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
      { error: 'SUPABASE_SERVICE_ROLE_KEY requerida.', offline: true },
      { status: 501 },
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('synq_roles')
    .select('*')
    .order('is_system', { ascending: false })
    .order('key');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roles: data ?? [] });
}

export async function POST(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY requerida.', offline: true },
      { status: 501 },
    );
  }

  let body: { key?: string; label?: string; description?: string | null; permissions?: Record<string, unknown> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const key = String(body.key ?? '').trim().toLowerCase();
  const label = String(body.label ?? '').trim();
  if (!KEY_RE.test(key)) {
    return NextResponse.json(
      { error: 'key debe ser snake_case: letra minúscula y [a-z0-9_].' },
      { status: 400 },
    );
  }
  if (!label) {
    return NextResponse.json({ error: 'label es obligatorio.' }, { status: 400 });
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('synq_roles')
    .insert({
      key,
      label,
      description: body.description ?? null,
      is_system: false,
      permissions: body.permissions && typeof body.permissions === 'object' ? body.permissions : {},
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un rol con esa clave.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ role: data }, { status: 201 });
}
