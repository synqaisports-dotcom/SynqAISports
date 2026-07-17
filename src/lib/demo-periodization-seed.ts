'use client';

import { getDemoExerciseById } from '@/lib/demo-exercises';
import { assignExerciseToDemoSlot, forkDemoMicrocycleFromTemplate, loadDemoMicrocycle, saveDemoMicrocycle } from '@/lib/demo-microcycles-store';
import { syncDemoMicrocyclesFromDocument } from '@/lib/demo-microcycle-hydrate';
import { findMccInPlan } from '@/lib/periodization';
import { demoTeamMicrocycleId, demoTemplateMicrocycleId } from '@/lib/periodization-client';
import {
  buildPlanForVariant,
  countTeamInstances,
  getTeamInstance,
  getVariantState,
  setMccLink,
  setTeamMccInstance,
  touchDocument,
  type CategoryPeriodizationDocument,
} from '@/lib/periodization-document';

const DEMO_EXERCISE_BY_SLOT: Record<string, string> = {
  warmup: 'demo-exercise-warmup-activacion',
  main: 'demo-exercise-main-rondo-4v2',
  cooldown: 'demo-exercise-cooldown-estiramientos',
};

function weekLabelFromDates(weekStart: string, weekEnd: string): string {
  return `${weekStart.slice(5).replace('-', '/')} – ${weekEnd.slice(5).replace('-', '/')}`;
}

function assignDemoExercisesToMicrocycle(microcycleId: string): void {
  const record = loadDemoMicrocycle(microcycleId);
  if (!record) return;

  const mainExercises = ['demo-exercise-main-rondo-4v2', 'demo-exercise-main-transicion'];
  let mainIndex = 0;

  for (const slot of record.slots) {
    if (slot.exercise_id || slot.title?.trim()) continue;

    let exerciseId = DEMO_EXERCISE_BY_SLOT[slot.slot_type];
    if (slot.slot_type === 'main') {
      exerciseId = mainExercises[mainIndex % mainExercises.length];
      mainIndex += 1;
    }
    if (!exerciseId) continue;

    const exercise = getDemoExerciseById(exerciseId);
    if (!exercise) continue;
    assignExerciseToDemoSlot(microcycleId, slot.id, exercise);
  }
}

function ensureTemplateForMcc(
  document: CategoryPeriodizationDocument,
  variantId: string,
  mccId: string
): CategoryPeriodizationDocument {
  const variant = document.variants.find((item) => item.id === variantId);
  if (!variant) return document;

  const state = getVariantState(document, variantId);
  if (state.mccLinks[mccId]?.microcycleId) return document;

  const plan = buildPlanForVariant(document, variantId);
  const mccContext = plan ? findMccInPlan(plan, mccId) : null;
  if (!mccContext) return document;

  const override = state.mccOverrides[mccId];
  const mccLabel = override?.label?.trim() || mccContext.micro.label;
  const templateId = demoTemplateMicrocycleId(mccId, variantId);

  saveDemoMicrocycle({
    id: templateId,
    title: `${mccLabel} — ${variant.name}`,
    week_label: weekLabelFromDates(mccContext.micro.weekStart, mccContext.micro.weekEnd),
    week_start: mccContext.micro.weekStart,
    week_end: mccContext.micro.weekEnd,
    category_slug: document.categorySlug,
    plan_variant_id: variantId,
    plan_mcc_id: mccId,
    sessions_per_micro: variant.sessionsPerMicro,
    main_tasks_per_session: variant.mainTasksPerSession,
    is_template: true,
    team_id: null,
  });

  assignDemoExercisesToMicrocycle(templateId);

  return setMccLink(document, variantId, mccId, {
    microcycleId: templateId,
    variantId,
    status: 'linked',
    createdAt: new Date().toISOString(),
  });
}

function ensureTeamForkForMcc(
  document: CategoryPeriodizationDocument,
  variantId: string,
  teamId: string,
  teamName: string,
  mccId: string
): CategoryPeriodizationDocument {
  if (getTeamInstance(document, variantId, teamId, mccId)) return document;

  const link = getVariantState(document, variantId).mccLinks[mccId];
  if (!link?.microcycleId) return document;

  const plan = buildPlanForVariant(document, variantId);
  const mccContext = plan ? findMccInPlan(plan, mccId) : null;
  if (!mccContext) return document;

  const override = getVariantState(document, variantId).mccOverrides[mccId];
  const mccLabel = override?.label?.trim() || mccContext.micro.label;
  const teamMicrocycleId = demoTeamMicrocycleId(teamId, mccId);

  forkDemoMicrocycleFromTemplate({
    templateId: link.microcycleId,
    id: teamMicrocycleId,
    title: `${mccLabel} — ${teamName}`,
    team_id: teamId,
  });

  return setTeamMccInstance(document, variantId, {
    microcycleId: teamMicrocycleId,
    templateMicrocycleId: link.microcycleId,
    teamId,
    mccId,
    forkedAt: new Date().toISOString(),
  });
}

/** Restaura asignaciones demo A→variant-3, B→variant-2 si se perdieron en localStorage. */
export function restoreDemoTeamVariantAssignments(
  document: CategoryPeriodizationDocument,
  defaults: CategoryPeriodizationDocument
): { document: CategoryPeriodizationDocument; changed: boolean } {
  let next = document;
  let changed = false;

  for (const defaultVariant of defaults.variants) {
    for (const teamId of defaultVariant.teamIds) {
      const holder = next.variants.find((variant) => variant.teamIds.includes(teamId));
      if (holder?.id === defaultVariant.id) continue;

      next = touchDocument({
        ...next,
        variants: next.variants.map((variant) => {
          const withoutTeam = variant.teamIds.filter((id) => id !== teamId);
          if (variant.id === defaultVariant.id) {
            return { ...variant, teamIds: [...withoutTeam, teamId] };
          }
          return { ...variant, teamIds: withoutTeam };
        }),
      });
      changed = true;
    }
  }

  return { document: next, changed };
}

/**
 * Crea plantillas variant-2/3, forks por equipo y ejercicios demo para que el entrenador
 * del equipo B (2 sesiones) tenga contenido operativo sin pasar por Ciclos.
 */
export function ensureDemoCoachPeriodization(
  document: CategoryPeriodizationDocument,
  teamNames: Record<string, string> = {}
): { document: CategoryPeriodizationDocument; changed: boolean } {
  let next = document;
  let changed = false;

  for (const variant of next.variants) {
    if (variant.teamIds.length === 0) continue;

    const plan = buildPlanForVariant(next, variant.id);
    if (!plan) continue;

    for (const macro of plan.macrocycles) {
      for (const meso of macro.mesocycles) {
        for (const micro of meso.microcycles) {
          const beforeLinks = Object.keys(getVariantState(next, variant.id).mccLinks).length;
          const beforeInstances = countTeamInstances(next, variant.id);

          next = ensureTemplateForMcc(next, variant.id, micro.id);

          for (const teamId of variant.teamIds) {
            const teamName = teamNames[teamId] ?? teamId.replace('demo-team-', '').replace(/-/g, ' ');
            next = ensureTeamForkForMcc(next, variant.id, teamId, teamName, micro.id);
          }

          const afterLinks = Object.keys(getVariantState(next, variant.id).mccLinks).length;
          const afterInstances = countTeamInstances(next, variant.id);
          if (afterLinks > beforeLinks || afterInstances > beforeInstances) {
            changed = true;
          }
        }
      }
    }
  }

  if (changed) {
    syncDemoMicrocyclesFromDocument(next);
  }

  return { document: next, changed };
}
