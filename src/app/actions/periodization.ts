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
