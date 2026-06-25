'use server';

import { requireClubId, requireUserId } from '@/lib/auth-staff';
import { defaultSlotsTemplate, parseDrawingJson } from '@/lib/methodology';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = { ok: boolean; message?: string; id?: string };

// ——— Ejercicios ———

export async function createExercise(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = String(formData.get('title') ?? '').trim();
  const objectives = String(formData.get('objectives') ?? '').trim();
  const durationMin = parseInt(String(formData.get('durationMin') ?? '15'), 10);
  const materials = String(formData.get('materials') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');

  if (!title) return { ok: false, message: 'validation' };

  let drawing_json;
  try {
    drawing_json = parseDrawingJson(JSON.parse(drawingRaw));
  } catch {
    drawing_json = { strokes: [] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_exercises')
    .insert({
      club_id: clubId,
      title,
      objectives,
      duration_min: Number.isNaN(durationMin) ? 15 : durationMin,
      materials,
      notes,
      drawing_json,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('create exercise', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia');
  revalidatePath('/portal/metodologia/ejercicios');
  return { ok: true, id: data.id };
}

export async function updateExercise(
  exerciseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = String(formData.get('title') ?? '').trim();
  const objectives = String(formData.get('objectives') ?? '').trim();
  const durationMin = parseInt(String(formData.get('durationMin') ?? '15'), 10);
  const materials = String(formData.get('materials') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');

  if (!title) return { ok: false, message: 'validation' };

  let drawing_json;
  try {
    drawing_json = parseDrawingJson(JSON.parse(drawingRaw));
  } catch {
    drawing_json = { strokes: [] };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_exercises')
    .update({
      title,
      objectives,
      duration_min: Number.isNaN(durationMin) ? 15 : durationMin,
      materials,
      notes,
      drawing_json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', exerciseId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/metodologia/ejercicios');
  revalidatePath(`/portal/metodologia/ejercicios/${exerciseId}`);
  return { ok: true };
}

export async function deleteExercise(exerciseId: string): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/metodologia/ejercicios');
  return { ok: true };
}

// ——— Microciclos ———

export async function createMicrocycle(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = String(formData.get('title') ?? '').trim();
  const weekLabel = String(formData.get('weekLabel') ?? '').trim();
  const teamId = String(formData.get('teamId') ?? '').trim() || null;
  const weekStart = String(formData.get('weekStart') ?? '').trim() || null;
  const weekNumber = parseInt(String(formData.get('weekNumber') ?? ''), 10);

  if (!title) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_microcycles')
    .insert({
      club_id: clubId,
      team_id: teamId,
      title,
      week_label: weekLabel,
      week_start: weekStart,
      week_number: Number.isNaN(weekNumber) ? null : weekNumber,
    })
    .select('id')
    .single();

  if (error) {
    console.error('create microcycle', error);
    return { ok: false, message: 'error' };
  }

  const slots = defaultSlotsTemplate();
  const { error: slotsError } = await supabase.from('synq_microcycle_slots').insert(
    slots.map((s) => ({
      microcycle_id: data.id,
      slot_type: s.slot_type,
      order_index: s.order_index,
      title: '',
      notes: '',
    }))
  );

  if (slotsError) {
    console.error('create slots', slotsError);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/microciclos');
  return { ok: true, id: data.id };
}

export async function updateMicrocycleSlot(
  slotId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const exerciseId = String(formData.get('exerciseId') ?? '').trim() || null;
  const title = String(formData.get('title') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const sessionDate = String(formData.get('sessionDate') ?? '').trim() || null;

  const supabase = await createClient();

  const { data: slot } = await supabase
    .from('synq_microcycle_slots')
    .select('microcycle_id')
    .eq('id', slotId)
    .single();

  if (!slot) return { ok: false, message: 'unauthorized' };

  const { data: micro } = await supabase
    .from('synq_microcycles')
    .select('club_id')
    .eq('id', slot.microcycle_id)
    .single();

  if (!micro || micro.club_id !== clubId) {
    return { ok: false, message: 'unauthorized' };
  }

  const { error } = await supabase
    .from('synq_microcycle_slots')
    .update({
      exercise_id: exerciseId,
      title,
      notes,
      session_date: sessionDate,
    })
    .eq('id', slotId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath(`/portal/metodologia/microciclos/${slot.microcycle_id}`);
  return { ok: true };
}

export async function deleteMicrocycle(microcycleId: string): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_microcycles')
    .delete()
    .eq('id', microcycleId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/metodologia/microciclos');
  return { ok: true };
}

// ——— Objetivos por categoría ———

export async function upsertCategoryGoal(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const category = String(formData.get('category') ?? '').trim();
  const season = String(formData.get('season') ?? '').trim();
  const goalsText = String(formData.get('goalsText') ?? '').trim();

  if (!category || !season) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { error } = await supabase.from('synq_category_goals').upsert(
    {
      club_id: clubId,
      category,
      season,
      goals_text: goalsText,
    },
    { onConflict: 'club_id,category,season' }
  );

  if (error) {
    console.error('category goal', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/objetivos');
  return { ok: true };
}

// ——— Solicitudes de cambio ———

export async function createChangeRequest(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId) return { ok: false, message: 'unauthorized' };

  const reason = String(formData.get('reason') ?? '').trim();
  const exerciseId = String(formData.get('exerciseId') ?? '').trim() || null;
  const slotId = String(formData.get('slotId') ?? '').trim() || null;

  if (!reason) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { error } = await supabase.from('synq_change_requests').insert({
    club_id: clubId,
    exercise_id: exerciseId,
    microcycle_slot_id: slotId,
    requested_by: userId,
    reason,
    status: 'pending',
  });

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/metodologia/solicitudes');
  return { ok: true };
}

export async function resolveChangeRequest(
  requestId: string,
  status: 'approved' | 'rejected'
): Promise<ActionState> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_change_requests')
    .update({ status, resolved_by: userId })
    .eq('id', requestId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/metodologia/solicitudes');
  return { ok: true };
}
