import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifyClubSessionFromRequest } from '@/lib/verify-club-session';
import { guardClubModuleOr403 } from '@/lib/club-matrix-api-guard';
import {
  methodologyEntryToInsert,
  methodologyTaskRowToEntry,
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

/**
 * GET — Lista tareas de metodología del club (RLS). ?status=Draft|Official
 * POST — Crea tarea (club_id del perfil; superadmin puede enviar club_id en body)
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });
  }

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const matrixDenied = await guardClubModuleOr403(gate, token, 'exercises', 'view');
  if (matrixDenied) return matrixDenied;

  const userClient = clientForUser(token);
  if (!userClient) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let q = userClient.from('methodology_library_tasks').select('*').order('updated_at', { ascending: false });
  if (status === 'Draft' || status === 'Official') {
    q = q.eq('status', status);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    tasks: (data ?? []).map(methodologyTaskRowToEntry),
  });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) {
    return NextResponse.json({ error: 'Falta Authorization Bearer' }, { status: 401 });
  }

  const gate = await verifyClubSessionFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const matrixDeniedPost = await guardClubModuleOr403(gate, token, 'exercises', 'edit');
  if (matrixDeniedPost) return matrixDeniedPost;

  let body: MethodologyLibraryEntryInput;
  try {
    body = (await req.json()) as MethodologyLibraryEntryInput;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (!body.title?.trim() || !body.stage?.trim()) {
    return NextResponse.json({ error: 'title y stage requeridos' }, { status: 400 });
  }

  if (body.videoUrl !== undefined) {
    try {
      body.videoUrl = validateExerciseVideoUrl(body.videoUrl) ?? undefined;
    } catch (e: any) {
      return NextResponse.json({ error: String(e?.message ?? 'videoUrl inválida') }, { status: 400 });
    }
  }

  const isSuper = gate.role === 'superadmin';
  const clubId =
    gate.clubId ??
    (isSuper && typeof body.club_id === 'string' ? body.club_id : null);

  if (!clubId) {
    return NextResponse.json(
      { error: 'club_id requerido (perfil sin club: usa onboarding o envía club_id como superadmin)' },
      { status: 400 },
    );
  }

  if (!isSuper && gate.clubId && clubId !== gate.clubId) {
    return NextResponse.json({ error: 'club_id no coincide con tu perfil' }, { status: 403 });
  }

  const userClient = clientForUser(token);
  if (!userClient) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
  }

  const payload = methodologyEntryToInsert(clubId, gate.userId, {
    ...body,
    status: body.status ?? 'Draft',
    authorName: body.authorName ?? '',
  });

  const { data, error } = await userClient.from('methodology_library_tasks').insert(payload).select('*').single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, task: methodologyTaskRowToEntry(data) });
}
