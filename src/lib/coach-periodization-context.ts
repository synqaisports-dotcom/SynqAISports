import { getCanteraCategory, type CanteraCategorySlug } from '@/lib/cantera-categories';
import { findMccInPlan, type PeriodizationPlan } from '@/lib/periodization';
import { demoTeamMicrocycleId } from '@/lib/periodization-client';
import { applyPlanExclusions, findCurrentMccId } from '@/lib/periodization-plan-utils';
import {
  buildPlanForVariant,
  defaultCategoryDocument,
  getExcludedMccIds,
  getTeamInstance,
  getVariant,
  getVariantState,
  loadDocumentFromStorage,
  saveDocumentToStorage,
  touchDocument,
  type CategoryPeriodizationDocument,
  type RhythmVariant,
  type TeamMccInstance,
} from '@/lib/periodization-document';

export const MAX_SESSIONS_PER_MICRO_LAYOUT = 5;

export type CoachTeamRef = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
};

export type CoachWeekContext = {
  document: CategoryPeriodizationDocument;
  variant: RhythmVariant;
  plan: PeriodizationPlan;
  context: NonNullable<ReturnType<typeof findMccInPlan>>;
  instance: TeamMccInstance | null;
  excluded: boolean;
  seededDocument: boolean;
  usedFallbackWeek: boolean;
};

function firstMicrocycleId(plan: PeriodizationPlan): string | null {
  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      const micro = meso.microcycles[0];
      if (micro) return micro.id;
    }
  }
  return null;
}

function resolveMccId(plan: PeriodizationPlan): { mccId: string; usedFallbackWeek: boolean } | null {
  const current = findCurrentMccId(plan);
  if (current) return { mccId: current, usedFallbackWeek: false };
  const fallback = firstMicrocycleId(plan);
  if (!fallback) return null;
  return { mccId: fallback, usedFallbackWeek: true };
}

function ensureTeamInVariant(
  document: CategoryPeriodizationDocument,
  teamId: string
): { document: CategoryPeriodizationDocument; variant: RhythmVariant; changed: boolean } {
  const existing = document.variants.find((variant) => variant.teamIds.includes(teamId));
  if (existing) return { document, variant: existing, changed: false };

  const variant =
    getVariant(document, document.activeVariantId) ?? document.variants[0] ?? null;
  if (!variant) throw new Error('No rhythm variant');

  if (variant.teamIds.includes(teamId)) {
    return { document, variant, changed: false };
  }

  const next = touchDocument({
    ...document,
    variants: document.variants.map((item) =>
      item.id === variant.id ? { ...item, teamIds: [...item.teamIds, teamId] } : item
    ),
  });

  return {
    document: next,
    variant: next.variants.find((item) => item.id === variant.id) ?? variant,
    changed: true,
  };
}

/** Carga o crea el documento de ciclos y resuelve la semana visible para la vista entrenador. */
export function resolveCoachWeekContext(team: CoachTeamRef): CoachWeekContext | null {
  if (!team.category_slug) return null;

  const category = getCanteraCategory(team.category_slug);
  if (!category) return null;

  let document = loadDocumentFromStorage(team.category_slug);
  let seededDocument = false;

  if (!document) {
    document = defaultCategoryDocument(team.category_slug, category.name);
    seededDocument = true;
  }

  const assigned = ensureTeamInVariant(document, team.id);
  document = assigned.document;
  if (assigned.changed) seededDocument = true;

  const rawPlan = buildPlanForVariant(document, assigned.variant.id);
  if (!rawPlan) return null;

  const plan = applyPlanExclusions(rawPlan, getExcludedMccIds(document, assigned.variant.id));
  const mccResolved = resolveMccId(plan);
  if (!mccResolved) return null;

  const context = findMccInPlan(plan, mccResolved.mccId);
  if (!context) return null;

  if (seededDocument || assigned.changed) {
    saveDocumentToStorage(document);
  }

  const instance = getTeamInstance(document, assigned.variant.id, team.id, mccResolved.mccId);
  const excluded = getExcludedMccIds(document, assigned.variant.id).has(mccResolved.mccId);

  return {
    document,
    variant: assigned.variant,
    plan,
    context,
    instance,
    excluded,
    seededDocument,
    usedFallbackWeek: mccResolved.usedFallbackWeek,
  };
}

/** Resuelve el microciclo visible para un MCC concreto (plantilla, equipo o demo). */
export function resolveCoachMicrocycleId(
  weekContext: CoachWeekContext,
  teamId: string,
  mccId: string
): string | null {
  const state = getVariantState(weekContext.document, weekContext.variant.id);
  const teamInstance = state.teamInstances[teamId]?.[mccId];
  if (teamInstance?.microcycleId) return teamInstance.microcycleId;

  const linked = state.mccLinks[mccId]?.microcycleId;
  if (linked) return linked;

  return demoTeamMicrocycleId(teamId, mccId);
}
