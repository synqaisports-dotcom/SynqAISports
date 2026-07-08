import { getDemoExercises } from '@/lib/demo-exercises';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { isDemoMicrocycleId } from '@/lib/microcycle-sessions';

export async function loadMicrocycleBundle(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubId: string,
  microcycleId: string
) {
  const { data: micro } = await supabase
    .from('synq_microcycles')
    .select(
      'id, title, week_label, week_start, week_end, category_slug, plan_variant_id, plan_mcc_id, sessions_per_micro, main_tasks_per_session, is_template, team_id'
    )
    .eq('id', microcycleId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!micro) return null;

  const { data: slots } = await supabase
    .from('synq_microcycle_slots')
    .select(
      'id, session_index, slot_type, order_index, title, notes, exercise_id, sheet_json, session_date, synq_exercises(id, title, drawing_json)'
    )
    .eq('microcycle_id', microcycleId)
    .order('session_index')
    .order('order_index');

  return {
    micro,
    slots: (slots ?? []).map((slot) => ({
      ...slot,
      session_index: slot.session_index ?? 1,
    })),
  };
}

export async function loadExerciseLibrary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubId: string
) {
  if (await isDemoActive()) {
    return getDemoExercises();
  }

  const { data } = await supabase
    .from('synq_exercises')
    .select('id, title, task_type, objectives, notes, sheet_json, drawing_json, duration_min')
    .eq('club_id', clubId)
    .order('title');
  return data ?? [];
}

export function parseSessionIndex(raw: string): number | null {
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 1) return null;
  return value;
}

export { isDemoMicrocycleId };
