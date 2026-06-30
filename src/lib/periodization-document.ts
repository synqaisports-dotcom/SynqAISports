import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  buildPeriodizationPlan,
  defaultPeriodizationConfig,
  type MacroCount,
  type MainTasksPerSession,
  type PeriodizationPlan,
  type SessionsPerMicro,
} from '@/lib/periodization';

export const PERIODIZATION_DOC_VERSION = 1 as const;

export type MccLinkStatus = 'draft' | 'linked' | 'complete';

export type MccLink = {
  microcycleId: string;
  variantId: string;
  status: MccLinkStatus;
  createdAt: string;
};

export type MccOverride = {
  label?: string;
  note?: string;
};

export type RhythmVariant = {
  id: string;
  name: string;
  sessionsPerMicro: SessionsPerMicro;
  mainTasksPerSession: MainTasksPerSession;
  teamIds: string[];
};

export type VariantState = {
  mccLinks: Record<string, MccLink>;
  mccOverrides: Record<string, MccOverride>;
};

export type CategoryPeriodizationDocument = {
  version: typeof PERIODIZATION_DOC_VERSION;
  categorySlug: CanteraCategorySlug;
  seasonTitle: string;
  startDate: string;
  endDate: string;
  macroCount: MacroCount;
  macroNames: string[];
  variants: RhythmVariant[];
  activeVariantId: string;
  variantState: Record<string, VariantState>;
  updatedAt: string;
};

export function defaultRhythmVariants(): RhythmVariant[] {
  return [
    {
      id: 'variant-3',
      name: '3 sesiones / microciclo',
      sessionsPerMicro: 3,
      mainTasksPerSession: 3,
      teamIds: [],
    },
    {
      id: 'variant-2',
      name: '2 sesiones / microciclo',
      sessionsPerMicro: 2,
      mainTasksPerSession: 3,
      teamIds: [],
    },
  ];
}

export function emptyVariantState(): VariantState {
  return { mccLinks: {}, mccOverrides: {} };
}

export function defaultCategoryDocument(
  categorySlug: CanteraCategorySlug,
  categoryName: string
): CategoryPeriodizationDocument {
  const base = defaultPeriodizationConfig(categorySlug, categoryName);
  const variants = defaultRhythmVariants();

  if (categorySlug === 'alevin') {
    variants[0].teamIds = ['demo-team-alevin-a'];
    variants[1].teamIds = ['demo-team-alevin-b'];
  }

  return {
    version: PERIODIZATION_DOC_VERSION,
    categorySlug,
    seasonTitle: base.seasonTitle,
    startDate: base.startDate,
    endDate: base.endDate,
    macroCount: base.macroCount,
    macroNames: base.macroNames,
    variants,
    activeVariantId: variants[0].id,
    variantState: Object.fromEntries(variants.map((variant) => [variant.id, emptyVariantState()])),
    updatedAt: new Date().toISOString(),
  };
}

export function getVariant(document: CategoryPeriodizationDocument, variantId: string): RhythmVariant | null {
  return document.variants.find((variant) => variant.id === variantId) ?? null;
}

export function getVariantState(document: CategoryPeriodizationDocument, variantId: string): VariantState {
  return document.variantState[variantId] ?? emptyVariantState();
}

export function buildPlanForVariant(
  document: CategoryPeriodizationDocument,
  variantId: string
): PeriodizationPlan | null {
  const variant = getVariant(document, variantId);
  if (!variant) return null;

  try {
    return buildPeriodizationPlan({
      categorySlug: document.categorySlug,
      seasonTitle: document.seasonTitle,
      startDate: document.startDate,
      endDate: document.endDate,
      macroCount: document.macroCount,
      macroNames: document.macroNames,
      sessionsPerMicro: variant.sessionsPerMicro,
      mainTasksPerSession: variant.mainTasksPerSession,
    });
  } catch {
    return null;
  }
}

export function variantTotals(plan: PeriodizationPlan) {
  return {
    microcycles: plan.totalMicrocycles,
    sessions: plan.totalSessions,
    tasks: plan.totalTasks,
  };
}

export function documentStorageKey(categorySlug: string): string {
  return `synq-periodization-${categorySlug}`;
}

export function loadDocumentFromStorage(categorySlug: CanteraCategorySlug): CategoryPeriodizationDocument | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(documentStorageKey(categorySlug));
    if (!raw) return null;
    return parseCategoryDocument(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveDocumentToStorage(document: CategoryPeriodizationDocument): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(documentStorageKey(document.categorySlug), JSON.stringify(document));
}

export function parseCategoryDocument(raw: unknown): CategoryPeriodizationDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Partial<CategoryPeriodizationDocument>;
  if (obj.version !== PERIODIZATION_DOC_VERSION || !obj.categorySlug) return null;
  if (!Array.isArray(obj.variants) || obj.variants.length === 0) return null;

  return {
    version: PERIODIZATION_DOC_VERSION,
    categorySlug: obj.categorySlug,
    seasonTitle: obj.seasonTitle ?? '',
    startDate: obj.startDate ?? '2018-09-01',
    endDate: obj.endDate ?? '2019-01-31',
    macroCount: (obj.macroCount ?? 1) as MacroCount,
    macroNames: obj.macroNames ?? ['Macrociclo 1'],
    variants: obj.variants,
    activeVariantId: obj.activeVariantId ?? obj.variants[0].id,
    variantState: obj.variantState ?? {},
    updatedAt: obj.updatedAt ?? new Date().toISOString(),
  };
}

export function touchDocument(document: CategoryPeriodizationDocument): CategoryPeriodizationDocument {
  return { ...document, updatedAt: new Date().toISOString() };
}

export function setMccLink(
  document: CategoryPeriodizationDocument,
  variantId: string,
  mccId: string,
  link: MccLink
): CategoryPeriodizationDocument {
  const state = getVariantState(document, variantId);
  return touchDocument({
    ...document,
    variantState: {
      ...document.variantState,
      [variantId]: {
        ...state,
        mccLinks: { ...state.mccLinks, [mccId]: link },
      },
    },
  });
}

export function setMccOverride(
  document: CategoryPeriodizationDocument,
  variantId: string,
  mccId: string,
  override: MccOverride
): CategoryPeriodizationDocument {
  const state = getVariantState(document, variantId);
  return touchDocument({
    ...document,
    variantState: {
      ...document.variantState,
      [variantId]: {
        ...state,
        mccOverrides: { ...state.mccOverrides, [mccId]: override },
      },
    },
  });
}

export function countLinkedMcc(document: CategoryPeriodizationDocument, variantId: string): number {
  const links = getVariantState(document, variantId).mccLinks;
  return Object.keys(links).length;
}
