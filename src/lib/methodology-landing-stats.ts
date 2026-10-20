import type { SupabaseClient } from '@supabase/supabase-js';
import { CANTERA_CATEGORIES, type CanteraCategorySlug } from '@/lib/cantera-categories';
import { isDemoActive } from '@/lib/demo';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import { applyPlanExclusions } from '@/lib/periodization-plan-utils';
import {
  buildPlanForVariant,
  defaultCategoryDocument,
  getExcludedMccIds,
  parseCategoryDocument,
  type CategoryPeriodizationDocument,
} from '@/lib/periodization-document';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';

export type MethodologyLandingStats = {
  totalMacrocycles: number;
  totalMesocycles: number;
  totalMicrocycles: number;
  totalSessions: number;
  totalExercises: number;
};

type CycleTotals = Pick<
  MethodologyLandingStats,
  'totalMacrocycles' | 'totalMesocycles' | 'totalMicrocycles' | 'totalSessions'
>;

const EMPTY_CYCLE_TOTALS: CycleTotals = {
  totalMacrocycles: 0,
  totalMesocycles: 0,
  totalMicrocycles: 0,
  totalSessions: 0,
};

function countDocumentCycles(document: CategoryPeriodizationDocument): CycleTotals {
  const variant =
    document.variants.find((item) => item.id === document.activeVariantId) ?? document.variants[0];
  if (!variant) return EMPTY_CYCLE_TOTALS;

  const rawPlan = buildPlanForVariant(document, variant.id);
  if (!rawPlan) return EMPTY_CYCLE_TOTALS;

  const plan = applyPlanExclusions(rawPlan, getExcludedMccIds(document, variant.id));

  let totalMacrocycles = 0;
  let totalMesocycles = 0;
  let totalMicrocycles = 0;
  let totalSessions = 0;

  for (const macro of plan.macrocycles) {
    totalMacrocycles += 1;
    for (const meso of macro.mesocycles) {
      totalMesocycles += 1;
      for (const micro of meso.microcycles) {
        totalMicrocycles += 1;
        totalSessions += micro.sessionsCount;
      }
    }
  }

  return { totalMacrocycles, totalMesocycles, totalMicrocycles, totalSessions };
}

function sumCycleTotals(totals: CycleTotals[]): CycleTotals {
  return totals.reduce(
    (acc, item) => ({
      totalMacrocycles: acc.totalMacrocycles + item.totalMacrocycles,
      totalMesocycles: acc.totalMesocycles + item.totalMesocycles,
      totalMicrocycles: acc.totalMicrocycles + item.totalMicrocycles,
      totalSessions: acc.totalSessions + item.totalSessions,
    }),
    EMPTY_CYCLE_TOTALS
  );
}

async function loadCategoryDocuments(
  supabase: SupabaseClient,
  clubId: string,
  categorySlugs: CanteraCategorySlug[]
): Promise<CategoryPeriodizationDocument[]> {
  const { data } = await supabase
    .from('synq_periodization_plans')
    .select('category_slug, plan_json')
    .eq('club_id', clubId)
    .in('category_slug', categorySlugs);

  const bySlug = new Map<CanteraCategorySlug, CategoryPeriodizationDocument>();
  for (const row of data ?? []) {
    const parsed = parseCategoryDocument(row.plan_json);
    if (parsed) bySlug.set(row.category_slug as CanteraCategorySlug, parsed);
  }

  return categorySlugs.map((slug) => {
    const saved = bySlug.get(slug);
    if (saved) return saved;
    const category = CANTERA_CATEGORIES.find((item) => item.slug === slug)!;
    return defaultCategoryDocument(slug, category.name);
  });
}

export async function loadMethodologyLandingStats(
  supabase: SupabaseClient,
  clubId: string,
  primarySport: ClubPracticedSport
): Promise<MethodologyLandingStats> {
  const demo = await isDemoActive();

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('category_slug')
    .eq('club_id', clubId)
    .eq('active', true);

  const categorySlugs = new Set<CanteraCategorySlug>();
  for (const team of teams ?? []) {
    if (team.category_slug) categorySlugs.add(team.category_slug as CanteraCategorySlug);
  }

  if (demo || categorySlugs.size === 0) {
    for (const category of CANTERA_CATEGORIES) {
      categorySlugs.add(category.slug);
    }
  }

  const slugs = [...categorySlugs];
  const [documents, exercises] = await Promise.all([
    loadCategoryDocuments(supabase, clubId, slugs),
    loadExerciseLibrary(supabase, clubId, primarySport),
  ]);

  const cycleTotals = sumCycleTotals(documents.map(countDocumentCycles));

  return {
    ...cycleTotals,
    totalExercises: exercises.length,
  };
}
