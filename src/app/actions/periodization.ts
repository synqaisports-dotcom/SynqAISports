'use server';

import { isDemoActive } from '@/lib/demo';
import { requireClubId } from '@/lib/auth-staff';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  parseCategoryDocument,
  type CategoryPeriodizationDocument,
} from '@/lib/periodization-document';
import { sessionSlotsForMainCount } from '@/lib/periodization';
import { emptyExerciseSheet } from '@/lib/exercise-sheet';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/app/actions/methodology';

export async function loadCategoryPeriodization(
  categorySlug: CanteraCategorySlug
): Promise<CategoryPeriodizationDocument | null> {
  const clubId = await requireClubId();
  if (!clubId) return null;

  if (await isDemoActive()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_periodization_plans')
    .select('plan_json')
    .eq('club_id', clubId)
    .eq('category_slug', categorySlug)
    .maybeSingle();

  return parseCategoryDocument(data?.plan_json);
}

export async function saveCategoryPeriodization(
  document: CategoryPeriodizationDocument
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_periodization_plans').upsert({
    club_id: clubId,
    category_slug: document.categorySlug,
    plan_json: document,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('saveCategoryPeriodization', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/ciclos');
  revalidatePath('/portal/metodologia/ciclos');
  return { ok: true };
}

export type CreateMccMicrocycleInput = {
  categorySlug: CanteraCategorySlug;
  variantId: string;
  variantName: string;
  mccId: string;
  mccLabel: string;
  weekStart: string;
  weekEnd: string;
  mainTasksPerSession: 2 | 3;
};

export async function createMicrocycleFromMcc(
  input: CreateMccMicrocycleInput
): Promise<ActionState & { microcycleId?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = `${input.mccLabel} — ${input.variantName}`;
  const weekLabel = `${input.weekStart.slice(5).replace('-', '/')} – ${input.weekEnd.slice(5).replace('-', '/')}`;

  if (await isDemoActive()) {
    const demoId = `demo-micro-${input.mccId}-${input.variantId}`;
    return { ok: true, id: demoId, microcycleId: demoId };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_microcycles')
    .insert({
      club_id: clubId,
      team_id: null,
      title,
      week_label: weekLabel,
      week_start: input.weekStart,
      week_number: null,
      category_slug: input.categorySlug,
      plan_mcc_id: input.mccId,
      plan_variant_id: input.variantId,
      week_end: input.weekEnd,
      is_template: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('createMicrocycleFromMcc', error);
    return { ok: false, message: 'error' };
  }

  const slots = sessionSlotsForMainCount(input.mainTasksPerSession);
  const { error: slotsError } = await supabase.from('synq_microcycle_slots').insert(
    slots.map((slot, index) => ({
      microcycle_id: data.id,
      slot_type: slot.slot_type,
      order_index: index,
      title: '',
      notes: '',
      sheet_json: emptyExerciseSheet(slot.slot_type),
    }))
  );

  if (slotsError) {
    console.error('createMicrocycleFromMcc slots', slotsError);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/microciclos');
  revalidatePath('/portal/metodologia/ciclos');
  return { ok: true, id: data.id, microcycleId: data.id };
}

export type ForkTeamMicrocycleInput = {
  templateMicrocycleId: string;
  teamId: string;
  teamName: string;
  mccId: string;
  variantId: string;
  mccLabel: string;
  weekStart: string;
  weekEnd: string;
  mainTasksPerSession: 2 | 3;
  categorySlug: CanteraCategorySlug;
};

export async function forkMicrocycleForTeam(
  input: ForkTeamMicrocycleInput
): Promise<ActionState & { microcycleId?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const demoId = `demo-micro-team-${input.teamId}-${input.mccId}`;
    return { ok: true, id: demoId, microcycleId: demoId };
  }

  const supabase = await createClient();
  const weekLabel = `${input.weekStart.slice(5).replace('-', '/')} – ${input.weekEnd.slice(5).replace('-', '/')}`;
  const title = `${input.mccLabel} — ${input.teamName}`;

  const { data: template } = await supabase
    .from('synq_microcycles')
    .select('id, title, week_label, week_start, week_end, category_slug, plan_mcc_id, plan_variant_id')
    .eq('id', input.templateMicrocycleId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!template) return { ok: false, message: 'validation' };

  const { data: existing } = await supabase
    .from('synq_microcycles')
    .select('id')
    .eq('club_id', clubId)
    .eq('team_id', input.teamId)
    .eq('plan_mcc_id', input.mccId)
    .eq('plan_variant_id', input.variantId)
    .maybeSingle();

  if (existing) {
    return { ok: true, id: existing.id, microcycleId: existing.id };
  }

  const { data: created, error } = await supabase
    .from('synq_microcycles')
    .insert({
      club_id: clubId,
      team_id: input.teamId,
      title,
      week_label: weekLabel,
      week_start: input.weekStart,
      week_end: input.weekEnd,
      week_number: null,
      category_slug: input.categorySlug,
      plan_mcc_id: input.mccId,
      plan_variant_id: input.variantId,
      template_microcycle_id: input.templateMicrocycleId,
      is_template: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('forkMicrocycleForTeam', error);
    return { ok: false, message: 'error' };
  }

  const { data: templateSlots } = await supabase
    .from('synq_microcycle_slots')
    .select('slot_type, order_index, title, notes, sheet_json, exercise_id, session_date')
    .eq('microcycle_id', input.templateMicrocycleId)
    .order('order_index');

  const slots =
    templateSlots && templateSlots.length > 0
      ? templateSlots
      : sessionSlotsForMainCount(input.mainTasksPerSession).map((slot, index) => ({
          slot_type: slot.slot_type,
          order_index: index,
          title: '',
          notes: '',
          sheet_json: emptyExerciseSheet(slot.slot_type),
          exercise_id: null,
          session_date: null,
        }));

  const { error: slotsError } = await supabase.from('synq_microcycle_slots').insert(
    slots.map((slot) => ({
      microcycle_id: created.id,
      slot_type: slot.slot_type,
      order_index: slot.order_index,
      title: slot.title ?? '',
      notes: slot.notes ?? '',
      sheet_json: slot.sheet_json ?? emptyExerciseSheet(slot.slot_type as 'warmup' | 'main' | 'cooldown'),
      exercise_id: slot.exercise_id ?? null,
      session_date: slot.session_date ?? null,
    }))
  );

  if (slotsError) {
    console.error('forkMicrocycleForTeam slots', slotsError);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/metodologia/microciclos');
  revalidatePath('/portal/entrenador');
  return { ok: true, id: created.id, microcycleId: created.id };
}

