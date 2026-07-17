'use client';

import { CANTERA_CATEGORIES } from '@/lib/cantera-categories';
import { findMccInPlan } from '@/lib/periodization';
import {
  buildPlanForVariant,
  getVariant,
  getVariantState,
  loadDocumentFromStorage,
  type CategoryPeriodizationDocument,
} from '@/lib/periodization-document';
import { demoTemplateMicrocycleId } from '@/lib/periodization-client';
import {
  forkDemoMicrocycleFromTemplate,
  loadDemoMicrocycle,
  saveDemoMicrocycle,
  type DemoMicrocycleRecord,
} from '@/lib/demo-microcycles-store';

function removeDemoMicrocycle(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem('synq-demo-microcycles');
    if (!raw) return;
    const store = JSON.parse(raw) as Record<string, DemoMicrocycleRecord>;
    delete store[id];
    window.localStorage.setItem('synq-demo-microcycles', JSON.stringify(store));
  } catch {
    // ignore
  }
}

export function parseDemoTemplateMicrocycleId(
  id: string
): { mccId: string; variantId: string } | null {
  if (!id.startsWith('demo-micro-') || id.startsWith('demo-micro-team-')) return null;
  const rest = id.slice('demo-micro-'.length);
  if (rest.endsWith('-variant-3')) {
    return { mccId: rest.slice(0, -'-variant-3'.length), variantId: 'variant-3' };
  }
  if (rest.endsWith('-variant-2')) {
    return { mccId: rest.slice(0, -'-variant-2'.length), variantId: 'variant-2' };
  }
  return null;
}

export function parseDemoTeamMicrocycleId(
  id: string
): { teamId: string; mccId: string } | null {
  if (!id.startsWith('demo-micro-team-')) return null;
  const rest = id.slice('demo-micro-team-'.length);
  const match = rest.match(/-(mcc-.+)$/);
  if (!match || match.index === undefined) return null;
  const mccId = match[1];
  const teamId = rest.slice(0, match.index);
  if (!teamId || !mccId) return null;
  return { teamId, mccId };
}

type LinkContext = {
  document: CategoryPeriodizationDocument;
  variantId: string;
  mccId: string;
  teamId?: string;
  templateMicrocycleId?: string;
};

function findContextForMicrocycleId(microcycleId: string): LinkContext | null {
  for (const category of CANTERA_CATEGORIES) {
    const document = loadDocumentFromStorage(category.slug);
    if (!document) continue;

    for (const variant of document.variants) {
      const state = getVariantState(document, variant.id);

      for (const [mccId, link] of Object.entries(state.mccLinks)) {
        if (link.microcycleId === microcycleId) {
          return { document, variantId: variant.id, mccId };
        }
      }

      for (const [teamId, mccMap] of Object.entries(state.teamInstances)) {
        for (const [mccId, instance] of Object.entries(mccMap)) {
          if (instance.microcycleId === microcycleId) {
            return {
              document,
              variantId: variant.id,
              mccId,
              teamId,
              templateMicrocycleId: instance.templateMicrocycleId,
            };
          }
        }
      }
    }
  }
  return null;
}

function findVariantIdForTeam(
  document: CategoryPeriodizationDocument,
  teamId: string
): string | null {
  return document.variants.find((variant) => variant.teamIds.includes(teamId))?.id ?? null;
}

function findContextByTeamMcc(teamId: string, mccId: string): LinkContext | null {
  for (const category of CANTERA_CATEGORIES) {
    const document = loadDocumentFromStorage(category.slug);
    if (!document) continue;

    const variantId = findVariantIdForTeam(document, teamId);
    if (!variantId) continue;

    const state = getVariantState(document, variantId);
    const instance = state.teamInstances[teamId]?.[mccId];
    if (instance?.microcycleId) {
      return {
        document,
        variantId,
        mccId,
        teamId,
        templateMicrocycleId: instance.templateMicrocycleId,
      };
    }

    const link = state.mccLinks[mccId];
    if (link) {
      return { document, variantId, mccId, teamId };
    }

    const plan = buildPlanForVariant(document, variantId);
    if (plan && findMccInPlan(plan, mccId)) {
      return { document, variantId, mccId, teamId };
    }
  }
  return null;
}

function findContextByMccVariant(mccId: string, variantId: string): LinkContext | null {
  for (const category of CANTERA_CATEGORIES) {
    const document = loadDocumentFromStorage(category.slug);
    if (!document) continue;
    if (!getVariant(document, variantId)) continue;
    const link = getVariantState(document, variantId).mccLinks[mccId];
    if (link) {
      return { document, variantId, mccId };
    }
    const plan = buildPlanForVariant(document, variantId);
    if (plan && findMccInPlan(plan, mccId)) {
      return { document, variantId, mccId };
    }
  }
  return null;
}

function weekLabelFromDates(weekStart: string, weekEnd: string): string {
  return `${weekStart.slice(5).replace('-', '/')} – ${weekEnd.slice(5).replace('-', '/')}`;
}

function buildDemoFromContext(
  microcycleId: string,
  context: LinkContext,
  options: { isTemplate: boolean; teamId: string | null; titleSuffix?: string }
): DemoMicrocycleRecord | null {
  const variant = getVariant(context.document, context.variantId);
  if (!variant) return null;

  const plan = buildPlanForVariant(context.document, context.variantId);
  const mccContext = plan ? findMccInPlan(plan, context.mccId) : null;
  if (!mccContext) return null;

  const override = getVariantState(context.document, context.variantId).mccOverrides[context.mccId];
  const mccLabel = override?.label?.trim() || mccContext.micro.label;
  const title = options.titleSuffix
    ? `${mccLabel} — ${options.titleSuffix}`
    : `${mccLabel} — ${variant.name}`;

  return saveDemoMicrocycle({
    id: microcycleId,
    title,
    week_label: weekLabelFromDates(mccContext.micro.weekStart, mccContext.micro.weekEnd),
    week_start: mccContext.micro.weekStart,
    week_end: mccContext.micro.weekEnd,
    category_slug: context.document.categorySlug,
    plan_variant_id: context.variantId,
    plan_mcc_id: context.mccId,
    sessions_per_micro: variant.sessionsPerMicro,
    main_tasks_per_session: variant.mainTasksPerSession,
    is_template: options.isTemplate,
    team_id: options.teamId,
  });
}

export function hydrateDemoMicrocycle(microcycleId: string): DemoMicrocycleRecord | null {
  const teamParsed = parseDemoTeamMicrocycleId(microcycleId);
  const existing = loadDemoMicrocycle(microcycleId);

  if (existing && teamParsed) {
    const teamContext = findContextByTeamMcc(teamParsed.teamId, teamParsed.mccId);
    const variant = teamContext ? getVariant(teamContext.document, teamContext.variantId) : null;
    if (variant && existing.sessions_per_micro !== variant.sessionsPerMicro) {
      removeDemoMicrocycle(microcycleId);
    } else {
      return existing;
    }
  } else if (existing) {
    return existing;
  }

  let context = findContextForMicrocycleId(microcycleId);

  const templateParsed = parseDemoTemplateMicrocycleId(microcycleId);
  if (!context && templateParsed) {
    context = findContextByMccVariant(templateParsed.mccId, templateParsed.variantId);
  }

  if (!context && teamParsed) {
    for (const category of CANTERA_CATEGORIES) {
      const document = loadDocumentFromStorage(category.slug);
      if (!document) continue;
      for (const variant of document.variants) {
        const instance = getVariantState(document, variant.id).teamInstances[teamParsed.teamId]?.[
          teamParsed.mccId
        ];
        if (instance?.microcycleId === microcycleId) {
          context = {
            document,
            variantId: variant.id,
            mccId: teamParsed.mccId,
            teamId: teamParsed.teamId,
            templateMicrocycleId: instance.templateMicrocycleId,
          };
          break;
        }
      }
      if (context) break;
    }
    if (!context) {
      context = findContextByTeamMcc(teamParsed.teamId, teamParsed.mccId);
    }
  }

  if (!context) return null;

  if (teamParsed || context.teamId) {
    const teamId = context.teamId ?? teamParsed!.teamId;
    const templateId =
      context.templateMicrocycleId ?? demoTemplateMicrocycleId(context.mccId, context.variantId);
    hydrateDemoMicrocycle(templateId);

    const variant = getVariant(context.document, context.variantId);
    const plan = buildPlanForVariant(context.document, context.variantId);
    const mccContext = plan ? findMccInPlan(plan, context.mccId) : null;
    if (!variant || !mccContext) return null;

    const teamName = teamId.replace('demo-team-', '').replace(/-/g, ' ');
    const override = getVariantState(context.document, context.variantId).mccOverrides[context.mccId];
    const mccLabel = override?.label?.trim() || mccContext.micro.label;

    return (
      forkDemoMicrocycleFromTemplate({
        templateId,
        id: microcycleId,
        title: `${mccLabel} — ${teamName}`,
        team_id: teamId,
      }) ??
      buildDemoFromContext(microcycleId, context, {
        isTemplate: false,
        teamId,
        titleSuffix: teamName,
      })
    );
  }

  return buildDemoFromContext(microcycleId, context, {
    isTemplate: true,
    teamId: null,
  });
}

/** Crea en localStorage los microciclos demo enlazados que falten en el store. */
export function syncDemoMicrocyclesFromDocument(document: CategoryPeriodizationDocument): void {
  for (const variant of document.variants) {
    const state = getVariantState(document, variant.id);

    for (const link of Object.values(state.mccLinks)) {
      if (link.microcycleId.startsWith('demo-micro-')) {
        hydrateDemoMicrocycle(link.microcycleId);
      }
    }

    for (const mccMap of Object.values(state.teamInstances)) {
      for (const instance of Object.values(mccMap)) {
        if (instance.microcycleId.startsWith('demo-micro-')) {
          hydrateDemoMicrocycle(instance.microcycleId);
        }
        if (instance.templateMicrocycleId.startsWith('demo-micro-')) {
          hydrateDemoMicrocycle(instance.templateMicrocycleId);
        }
      }
    }
  }
}

export function loadOrHydrateDemoMicrocycle(microcycleId: string): DemoMicrocycleRecord | null {
  return hydrateDemoMicrocycle(microcycleId);
}
