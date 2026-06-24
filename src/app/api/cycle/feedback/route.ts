import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';
import type { CycleFeedbackType } from '@/lib/cycle-types';

const VALID: CycleFeedbackType[] = [
  'playground_viral',
  'arrived_es',
  'no_show',
  'false_positive',
];

type Body = {
  slot_id?: string;
  feedback_type?: string;
  notes?: string | null;
};

function parseBody(body: Body) {
  const slot_id = body.slot_id?.trim();
  const feedback_type = body.feedback_type as CycleFeedbackType;
  if (!slot_id || !VALID.includes(feedback_type)) return null;
  return { slot_id, feedback_type, notes: body.notes ?? null };
}

async function upsertFeedback(slot_id: string, feedback_type: CycleFeedbackType, notes: string | null) {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return { ok: true as const, demo: true };

  const { data: existing } = await supabase
    .from('trend_cycle_feedback')
    .select('id')
    .eq('slot_id', slot_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('trend_cycle_feedback')
      .update({ feedback_type, notes, recorded_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, updated: true };
  }

  const { error } = await supabase.from('trend_cycle_feedback').insert({
    slot_id,
    feedback_type,
    notes,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, created: true };
}

export async function GET(req: Request) {
  const slot_id = new URL(req.url).searchParams.get('slot_id');
  if (!slot_id) {
    return NextResponse.json({ ok: false, error: 'slot_id requerido' }, { status: 400 });
  }

  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return NextResponse.json({ ok: true, feedback: null, demo: true });
  }

  const { data, error } = await supabase
    .from('trend_cycle_feedback')
    .select('*')
    .eq('slot_id', slot_id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, feedback: data });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = parseBody(body);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
  }

  const result = await upsertFeedback(parsed.slot_id, parsed.feedback_type, parsed.notes);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function PUT(req: Request) {
  return POST(req);
}
