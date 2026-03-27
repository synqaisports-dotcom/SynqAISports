import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

/**
 * GET — Catálogo `synq_roles` con sesión del usuario (RLS: lectura para authenticated).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Falta sesión.' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const client = createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: authErr } = await client.auth.getUser(token);
  if (authErr || !userData.user) {
    return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
  }

  const { data, error } = await client
    .from('synq_roles')
    .select('key,label,description,is_system,permissions')
    .order('is_system', { ascending: false })
    .order('key');

  if (error) {
    return NextResponse.json(
      {
        roles: [],
        offline: true,
        error: error.message,
      },
      { status: 200 },
    );
  }

  return NextResponse.json({ roles: data ?? [] });
}
