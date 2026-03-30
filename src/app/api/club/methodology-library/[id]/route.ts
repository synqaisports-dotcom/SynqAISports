import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifyClubSessionFromRequest } from '@/lib/verify-club-session';
import { guardClubModuleOr403 } from '@/lib/club-matrix-api-guard';
import {
  methodologyEntryToUpdate,
  methodologyTaskRowToEntry,
  isUuid,
  validateExerciseVideoUrl,
  type MethodologyLibraryEntryInput,
} from '@/lib/methodology-library-db';

function clientForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function isAllowedVideoUrl(input: string): boolean {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    return (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'vimeo.com' ||
      host === 'player.vimeo.com'
    );
  } catch {
    return false;
  }
}

/** PATCH — actualiza tarea. DELETE — borra (RLS). */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id || !isUuid(id)) {
    return NextResponse.json({ error: 'id uuid inválido' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });
  }

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const deniedPatch = await guardClubModuleOr403(gate, token, 'exercises', 'edit');
  if (deniedPatch) return deniedPatch;

  let body: Partial<MethodologyLibraryEntryInput>;
  try {
    body = (await req.json()) as Partial<MethodologyLibraryEntryInput>;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.videoUrl !== undefined) {
    try {
      validateExerciseVideoUrl(body.videoUrl);
    } catch (e: any) {
      return NextResponse.json(
        { error: String(e?.message ?? 'videoUrl inválida') },
        { status: 400 },
      );
    }
  }

  const patch = methodologyEntryToUpdate(body);
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  const userClient = clientForUser(token);
  if (!userClient) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const { data, error } = await userClient
    .from('methodology_library_tasks')
    .update(patch as Database['public']['Tables']['methodology_library_tasks']['Update'])
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, task: methodologyTaskRowToEntry(data) });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id || !isUuid(id)) {
    return NextResponse.json({ error: 'id uuid inválido' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });
  }

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const deniedDel = await guardClubModuleOr403(gate, token, 'exercises', 'delete');
  if (deniedDel) return deniedDel;

  const userClient = clientForUser(token);
  if (!userClient) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const { error } = await userClient.from('methodology_library_tasks').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
