'use server';

import { isDemoActive } from '@/lib/demo';
import { requireClubId, requireUserId } from '@/lib/auth-staff';
import {
  emptyExerciseSheet,
  parseExerciseSheet,
  sheetFromFormData,
  sheetToLegacyFields,
  type TaskType,
} from '@/lib/exercise-sheet';
import { defaultSlotsTemplate, parseDrawingJson } from '@/lib/methodology';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  mergeMethodologyObjectives,
  type CategoryObjectives,
  type MethodologyObjectivesMap,
} from '@/lib/methodology-objectives';
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

  const sheet = sheetFromFormData(formData);
  if (!sheet.title) return { ok: false, message: 'validation' };

  const legacy = sheetToLegacyFields(sheet);
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');

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
      title: legacy.title,
      objectives: legacy.objectives,
      duration_min: legacy.duration_min,
      materials: legacy.materials,
      notes: legacy.notes,
      drawing_json,
      sheet_json: sheet,
      task_type: sheet.taskType,
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

  const sheet = sheetFromFormData(formData);
  if (!sheet.title) return { ok: false, message: 'validation' };

  const legacy = sheetToLegacyFields(sheet);
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');

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
      title: legacy.title,
      objectives: legacy.objectives,
      duration_min: legacy.duration_min,
      materials: legacy.materials,
      notes: legacy.notes,
      drawing_json,
      sheet_json: sheet,
      task_type: sheet.taskType,
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
      sheet_json: emptyExerciseSheet(s.slot_type),
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
  const sessionDate = String(formData.get('sessionDate') ?? '').trim() || null;

  const supabase = await createClient();

  const { data: slot } = await supabase
    .from('synq_microcycle_slots')
    .select('microcycle_id, slot_type')
    .eq('id', slotId)
    .single();

  if (!slot) return { ok: false, message: 'unauthorized' };

  const slotTaskType = (slot.slot_type as TaskType) || 'main';
  let sheet = sheetFromFormData(formData, slotTaskType);

  if (exerciseId && !sheet.title) {
    const { data: ex } = await supabase
      .from('synq_exercises')
      .select('sheet_json, title, objectives, notes')
      .eq('id', exerciseId)
      .single();
    if (ex) {
      sheet = parseExerciseSheet(ex.sheet_json);
      sheet.taskType = slotTaskType;
      if (!sheet.title) sheet.title = ex.title;
      if (!sheet.objectives) sheet.objectives = ex.objectives;
      if (!sheet.description) sheet.description = ex.notes;
    }
  }

  const legacy = sheetToLegacyFields(sheet);

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
      title: legacy.title,
      notes: legacy.notes,
      sheet_json: sheet,
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

export async function loadMethodologyObjectives(
  clubId: string
): Promise<MethodologyObjectivesMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_methodology_objectives')
    .select('objectives_json')
    .eq('club_id', clubId)
    .maybeSingle();

  if (error) {
    console.error('loadMethodologyObjectives', error);
    return mergeMethodologyObjectives(null);
  }

  return mergeMethodologyObjectives(
    (data?.objectives_json as Partial<MethodologyObjectivesMap> | null) ?? null
  );
}

export async function updateCategoryObjectives(
  categorySlug: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const slug = categorySlug as CanteraCategorySlug;
  const dimensions: Partial<CategoryObjectives> = {};

  for (const key of ['technique', 'tactics', 'physical', 'psychological', 'rules'] as const) {
    dimensions[key] = {
      key,
      itemLabel: String(formData.get(`${key}Label`) ?? '').trim(),
      content: String(formData.get(`${key}Content`) ?? '').trim(),
    };
  }

  if (await isDemoActive()) {
    revalidatePath('/portal/metodologia/objetivos');
    return { ok: true };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('synq_methodology_objectives')
    .select('objectives_json')
    .eq('club_id', clubId)
    .maybeSingle();

  const current =
    (existing?.objectives_json as Partial<MethodologyObjectivesMap> | null) ?? {};
  const next = {
    ...current,
    [slug]: {
      ...(current[slug] ?? {}),
      ...dimensions,
    },
  };

  const { error } = await supabase.from('synq_methodology_objectives').upsert({
    club_id: clubId,
    objectives_json: next,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('updateCategoryObjectives', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/objetivos');
  return { ok: true };
}

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
  const teamId = String(formData.get('teamId') ?? '').trim() || null;
  const sessionLabel = String(formData.get('sessionLabel') ?? '').trim() || null;
  const microcycleId = String(formData.get('microcycleId') ?? '').trim() || null;

  if (!reason) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidatePath('/portal/metodologia/solicitudes');
    return { ok: true, id: `demo-request-${Date.now()}` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_change_requests').insert({
    club_id: clubId,
    exercise_id: exerciseId,
    microcycle_slot_id: slotId,
    team_id: teamId,
    session_label: sessionLabel,
    microcycle_id: microcycleId,
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
