import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../../verify-superadmin';

type Ctx = { params: Promise<{ key: string }> };

/**
 * PATCH — Actualiza label / description / permissions (solo roles no sistema).
 * DELETE — Elimina rol custom si no está en uso.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const { key: rawKey } = await ctx.params;
  const key = decodeURIComponent(rawKey);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY requerida.', offline: true },
      { status: 501 },
    );
  }

  let body: { label?: string; description?: string | null; permissions?: Record<string, unknown> };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: row, error: selErr } = await admin
    .from('synq_roles')
    .select('key,is_system')
    .eq('key', key)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'Rol no encontrado.' }, { status: 404 });
  }
  if (row.is_system) {
    return NextResponse.json({ error: 'No se pueden editar roles de sistema.' }, { status: 403 });
  }

  const patch: Database['public']['Tables']['synq_roles']['Update'] = {
    updated_at: new Date().toISOString(),
  };
  if (body.label !== undefined) {
    const label = String(body.label).trim();
    if (!label) {
      return NextResponse.json({ error: 'label no puede estar vacío.' }, { status: 400 });
    }
    patch.label = label;
  }
  if (body.description !== undefined) {
    patch.description = body.description;
  }
  if (body.permissions !== undefined && typeof body.permissions === 'object') {
    patch.permissions = body.permissions;
  }

  const { data, error } = await admin.from('synq_roles').update(patch).eq('key', key).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ role: data });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const { key: rawKey } = await ctx.params;
  const key = decodeURIComponent(rawKey);

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

  const { data: row, error: selErr } = await admin
    .from('synq_roles')
    .select('key,is_system')
    .eq('key', key)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ error: 'Rol no encontrado.' }, { status: 404 });
  }
  if (row.is_system) {
    return NextResponse.json({ error: 'No se pueden eliminar roles de sistema.' }, { status: 403 });
  }

  const { count: usedProfiles, error: cErr } = await admin
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', key);

  if (cErr) {
    return NextResponse.json({ error: cErr.message }, { status: 500 });
  }
  if ((usedProfiles ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Hay perfiles con este rol; reasigna antes de borrar.' },
      { status: 409 },
    );
  }

  const { count: usedM2m, error: mErr } = await admin
    .from('profile_roles')
    .select('profile_id', { count: 'exact', head: true })
    .eq('role_key', key);

  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }
  if ((usedM2m ?? 0) > 0) {
    return NextResponse.json(
      { error: 'El rol está vinculado en profile_roles; desvincula antes de borrar.' },
      { status: 409 },
    );
  }

  const { error: delErr } = await admin.from('synq_roles').delete().eq('key', key);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
