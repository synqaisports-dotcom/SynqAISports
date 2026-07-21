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
import { buildMicrocycleSlotSeeds } from '@/lib/microcycle-sessions';
import type { MainTasksPerSession, SessionsPerMicro } from '@/lib/periodization';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  mergeMethodologyObjectives,
  type CategoryObjectives,
  type MethodologyObjectivesMap,
} from '@/lib/methodology-objectives';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { assertCanEditMethodology } from '@/lib/methodology-access-server';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { resolveActiveSport } from '@/lib/sport-context';
import { parsePracticedSports } from '@/lib/club-practiced-sports';

export type ActionState = { ok: boolean; message?: string; id?: string };

const ALLOWED_SPORTS = new Set<ClubPracticedSport>([
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'handball',
  'waterpolo',
]);

function parseSportValue(value: string | null | undefined): ClubPracticedSport {
  const sport = String(value ?? 'football').trim() as ClubPracticedSport;
  return ALLOWED_SPORTS.has(sport) ? sport : 'football';
}

async function clubPracticedSports(clubId: string): Promise<ClubPracticedSport[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_clubs')
    .select('practiced_sports')
    .eq('id', clubId)
    .maybeSingle();
  return parsePracticedSports(data?.practiced_sports);
}

async function resolveMethodologySport(
  clubId: string,
  requested?: string | null
): Promise<ClubPracticedSport> {
  const practiced = await clubPracticedSports(clubId);
  return resolveActiveSport(practiced, requested);
}

async function guardMethodologyWrite(): Promise<ActionState | null> {
  const access = await assertCanEditMethodology();
  if (!access.ok) return { ok: false, message: 'forbidden' };
  return null;
}

function slotInsertRows(
  microcycleId: string,
  sessionsPerMicro: SessionsPerMicro = 3,
  mainTasksPerSession: MainTasksPerSession = 3
) {
  return buildMicrocycleSlotSeeds(sessionsPerMicro, mainTasksPerSession).map((seed) => ({
    microcycle_id: microcycleId,
    session_index: seed.session_index,
    slot_type: seed.slot_type,
    order_index: seed.order_index,
    title: '',
    notes: '',
    sheet_json: emptyExerciseSheet(seed.slot_type),
  }));
}

async function insertMicrocycleSlots(
  supabase: Awaited<ReturnType<typeof createClient>>,
  microcycleId: string,
  sessionsPerMicro: SessionsPerMicro = 3,
  mainTasksPerSession: MainTasksPerSession = 3
) {
  const rows = slotInsertRows(microcycleId, sessionsPerMicro, mainTasksPerSession);
  const { error } = await supabase.from('synq_microcycle_slots').insert(rows);
  if (!error) return { ok: true as const };

  // Fallback sin session_index (BBDD sin migrar aún)
  const legacyRows = defaultSlotsTemplate().map((slot) => ({
    microcycle_id: microcycleId,
    slot_type: slot.slot_type,
    order_index: slot.order_index,
    title: '',
    notes: '',
    sheet_json: emptyExerciseSheet(slot.slot_type),
  }));
  const legacy = await supabase.from('synq_microcycle_slots').insert(legacyRows);
  if (legacy.error) {
    console.error('insertMicrocycleSlots', legacy.error);
    return { ok: false as const };
  }
  return { ok: true as const };
}

// ——— Ejercicios ———

export async function createExercise(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const sheet = sheetFromFormData(formData);
  if (!sheet.title) return { ok: false, message: 'validation' };

  const legacy = sheetToLegacyFields(sheet);
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');
  const categorySlug = String(formData.get('categorySlug') ?? '').trim();
  const returnTo = String(formData.get('returnTo') ?? '').trim();
  const sport = await resolveMethodologySport(
    clubId,
    String(formData.get('sport') ?? '').trim() || null
  );

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
      sport,
      title: legacy.title,
      objectives: legacy.objectives,
      duration_min: legacy.duration_min,
      materials: legacy.materials,
      notes: categorySlug ? `[cat:${categorySlug}] ${legacy.notes}`.trim() : legacy.notes,
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

  revalidatePath('/portal/metodologia/resumen');
  revalidatePath('/portal/metodologia/ejercicios');
  if (returnTo.startsWith('/portal/')) {
    revalidatePath(returnTo);
  }
  return { ok: true, id: data.id, message: returnTo || undefined };
}

export async function updateExercise(
  exerciseId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const sheet = sheetFromFormData(formData);
  if (!sheet.title) return { ok: false, message: 'validation' };

  const legacy = sheetToLegacyFields(sheet);
  const drawingRaw = String(formData.get('drawingJson') ?? '{"strokes":[]}');
  const sport = await resolveMethodologySport(
    clubId,
    String(formData.get('sport') ?? '').trim() || null
  );

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
      sport,
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

export async function updateExerciseDrawing(
  exerciseId: string,
  drawingRaw: string
): Promise<ActionState> {
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  let drawing_json;
  try {
    drawing_json = parseDrawingJson(JSON.parse(drawingRaw));
  } catch {
    return { ok: false, message: 'validation' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_exercises')
    .update({
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
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

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
  const sportParam = String(formData.get('sport') ?? '').trim() || null;

  if (!title) return { ok: false, message: 'validation' };

  const supabase = await createClient();

  let sport = await resolveMethodologySport(clubId, sportParam);
  if (teamId) {
    const { data: team } = await supabase
      .from('synq_teams')
      .select('sport')
      .eq('id', teamId)
      .eq('club_id', clubId)
      .maybeSingle();
    if (team?.sport) sport = parseSportValue(team.sport);
  }

  const { data, error } = await supabase
    .from('synq_microcycles')
    .insert({
      club_id: clubId,
      team_id: teamId,
      sport,
      title,
      week_label: weekLabel,
      week_start: weekStart,
      week_number: Number.isNaN(weekNumber) ? null : weekNumber,
      sessions_per_micro: 3,
      main_tasks_per_session: 3,
    })
    .select('id')
    .single();

  if (error) {
    console.error('create microcycle', error);
    return { ok: false, message: 'error' };
  }

  const slotsResult = await insertMicrocycleSlots(supabase, data.id, 3, 3);
  if (!slotsResult.ok) return { ok: false, message: 'error' };

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
    .select('microcycle_id, slot_type, session_index')
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

  const sessionIndex = slot.session_index ?? 1;
  revalidatePath(`/portal/metodologia/microciclos/${slot.microcycle_id}`);
  revalidatePath(`/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${sessionIndex}`);
  revalidatePath(
    `/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${sessionIndex}/slots/${slotId}`
  );
  return { ok: true };
}

export async function assignExerciseToSlot(
  slotId: string,
  exerciseId: string
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();

  const { data: slot } = await supabase
    .from('synq_microcycle_slots')
    .select('microcycle_id, slot_type, session_index')
    .eq('id', slotId)
    .single();

  if (!slot) return { ok: false, message: 'unauthorized' };

  const { data: micro } = await supabase
    .from('synq_microcycles')
    .select('club_id')
    .eq('id', slot.microcycle_id)
    .single();

  if (!micro || micro.club_id !== clubId) return { ok: false, message: 'unauthorized' };

  const { data: exercise } = await supabase
    .from('synq_exercises')
    .select('sheet_json, title, objectives, notes, drawing_json')
    .eq('id', exerciseId)
    .eq('club_id', clubId)
    .single();

  if (!exercise) return { ok: false, message: 'validation' };

  let sheet = parseExerciseSheet(exercise.sheet_json);
  sheet.taskType = (slot.slot_type as TaskType) || 'main';
  if (!sheet.title) sheet.title = exercise.title;
  if (!sheet.objectives) sheet.objectives = exercise.objectives;
  if (!sheet.description) sheet.description = exercise.notes;

  const legacy = sheetToLegacyFields(sheet);

  const { error } = await supabase
    .from('synq_microcycle_slots')
    .update({
      exercise_id: exerciseId,
      title: legacy.title,
      notes: legacy.notes,
      sheet_json: sheet,
    })
    .eq('id', slotId);

  if (error) return { ok: false, message: 'error' };

  const sessionIndex = slot.session_index ?? 1;
  revalidatePath(`/portal/metodologia/microciclos/${slot.microcycle_id}`);
  revalidatePath(
    `/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${sessionIndex}`
  );
  revalidatePath(
    `/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${sessionIndex}/slots/${slotId}`
  );
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
  clubId: string,
  sport?: string | null
): Promise<MethodologyObjectivesMap> {
  const activeSport = await resolveMethodologySport(clubId, sport);

  if (await isDemoActive()) {
    return mergeMethodologyObjectives(null);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_methodology_objectives')
    .select('objectives_json')
    .eq('club_id', clubId)
    .eq('sport', activeSport)
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
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const slug = categorySlug as CanteraCategorySlug;
  const sport = await resolveMethodologySport(
    clubId,
    String(formData.get('sport') ?? '').trim() || null
  );
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
    .eq('sport', sport)
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
    sport,
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
  const denied = await guardMethodologyWrite();
  if (denied) return denied;

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
  const requestTypeRaw = String(formData.get('requestType') ?? 'methodology').trim();
  const requestType =
    requestTypeRaw === 'cantera' || requestTypeRaw === 'mixed' ? requestTypeRaw : 'methodology';

  if (!reason) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidatePath('/portal/metodologia/solicitudes');
    revalidatePath('/portal/entrenador');
    return { ok: true, id: `demo-request-${Date.now()}` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_change_requests')
    .insert({
      club_id: clubId,
      exercise_id: exerciseId,
      microcycle_slot_id: slotId,
      team_id: teamId,
      session_label: sessionLabel,
      microcycle_id: microcycleId,
      requested_by: userId,
      reason,
      status: 'pending',
      request_type: requestType,
    })
    .select('id')
    .single();

  if (error) return { ok: false, message: 'error' };

  const { notifyApproversForRequest } = await import('@/app/actions/change-requests');
  const teamName = teamId
    ? (
        await supabase.from('synq_teams').select('name').eq('id', teamId).maybeSingle()
      ).data?.name
    : null;
  const title = teamName
    ? `Nueva solicitud · ${teamName}`
    : 'Nueva solicitud de cambio';
  const body = sessionLabel ? `${sessionLabel}: ${reason}` : reason;

  if (data?.id) {
    await notifyApproversForRequest(clubId, data.id, requestType, title, body);
  }

  revalidatePath('/portal/metodologia/solicitudes');
  revalidatePath('/portal/entrenador');
  revalidatePath('/portal/metodologia/resumen');
  return { ok: true, id: data?.id };
}

export async function resolveChangeRequest(
  requestId: string,
  status: 'approved' | 'rejected',
  resolutionNote?: string
): Promise<ActionState> {
  const { resolveChangeRequestWithNote } = await import('@/app/actions/change-requests');
  const result = await resolveChangeRequestWithNote(requestId, status, resolutionNote);
  return { ok: result.ok, message: result.message };
}
