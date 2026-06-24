import { NextResponse } from 'next/server';
import { getSupabaseServiceRole } from '@/lib/supabase';
import type { CycleFeedbackType } from '@/lib/cycle-types';

const VALID: CycleFeedbackType[] = [
  'playground_viral',
  'arrived_es',
  'no_show',
  'false_positive',
];

export async function POST(req: Request) {
  let body: { slot_id?: string; feedback_type?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const slot_id = body.slot_id?.trim();
  const feedback_type = body.feedback_type as CycleFeedbackType;

  if (!slot_id || !VALID.includes(feedback_type)) {
    return NextResponse.json({ ok: false, error: 'Parámetros inválidos' }, { status: 400 });
  }

  if (slot_id.startsWith('demo-slot-')) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message: 'Feedback registrado en modo demo (ejecuta SQL ciclo patio para persistir en Supabase).',
    });
  }

  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message: 'Sin SUPABASE_SECRET_KEY — feedback solo en sesión.',
    });
  }

  const { error } = await supabase.from('trend_cycle_feedback').insert({
    slot_id,
    feedback_type,
    notes: body.notes ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
