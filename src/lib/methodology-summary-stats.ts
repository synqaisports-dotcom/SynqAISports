import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { CANTERA_CATEGORIES } from '@/lib/cantera-categories';
import type { PeriodizationPlan } from '@/lib/periodization';
import { applyPlanExclusions } from '@/lib/periodization-plan-utils';
import {
  buildPlanForVariant,
  getExcludedMccIds,
  getVariantState,
  type CategoryPeriodizationDocument,
  type RhythmVariant,
} from '@/lib/periodization-document';
import { defaultSeasonLabel } from '@/lib/team-season';

export type TeamSummaryRow = {
  id: string;
  name: string;
  categorySlug: CanteraCategorySlug | null;
  variantLabel: string | null;
  pendingMcc: number;
  totalMcc: number;
  pendingPercent: number;
  isComplete: boolean;
};

export type ChartBarRow = {
  name: string;
  confirmados: number;
  pendientes: number;
};

export type MicroWeekRow = {
  name: string;
  index: number;
  confirmados: number;
  pendientes: number;
};

export type SummaryPanelStats = {
  confirmados: number;
  pendientes: number;
  total: number;
};

export type MethodologySummaryStats = {
  seasonOptions: string[];
  activeSeason: string;
  teams: TeamSummaryRow[];
  globalPendingPercent: number;
  totalPlayers: number;
  totalCoaches: number;
  macros: {
    chart: ChartBarRow[];
    stats: SummaryPanelStats;
  };
  mesos: {
    chart: ChartBarRow[];
    stats: SummaryPanelStats;
  };
  micros: {
    chart: MicroWeekRow[];
    stats: SummaryPanelStats;
  };
  sessions: {
    chart: { name: string; value: number; key: 'confirmados' | 'pendientes' }[];
    stats: SummaryPanelStats;
  };
};

export type SummaryTeamInput = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
};

function variantForTeam(
  document: CategoryPeriodizationDocument,
  teamId: string
): RhythmVariant | null {
  return document.variants.find((variant) => variant.teamIds.includes(teamId)) ?? null;
}

function isMccConfirmed(
  document: CategoryPeriodizationDocument,
  variantId: string,
  mccId: string
): boolean {
  const links = getVariantState(document, variantId).mccLinks;
  return Boolean(links[mccId]);
}

function collectMccRows(
  document: CategoryPeriodizationDocument,
  variant: RhythmVariant,
  plan: PeriodizationPlan
) {
  const excluded = getExcludedMccIds(document, variant.id);
  const rows: {
    mccId: string;
    macroName: string;
    mesoLabel: string;
    microLabel: string;
    weekIndex: number;
    sessionsCount: number;
    confirmed: boolean;
  }[] = [];

  let weekIndex = 0;
  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      for (const micro of meso.microcycles) {
        if (excluded.has(micro.id)) continue;
        weekIndex += 1;
        rows.push({
          mccId: micro.id,
          macroName: macro.name,
          mesoLabel: meso.label,
          microLabel: micro.label,
          weekIndex,
          sessionsCount: micro.sessionsCount,
          confirmed: isMccConfirmed(document, variant.id, micro.id),
        });
      }
    }
  }

  return rows;
}

export type TeamChartsBundle = {
  macros: MethodologySummaryStats['macros'];
  mesos: MethodologySummaryStats['mesos'];
  micros: MethodologySummaryStats['micros'];
  sessions: MethodologySummaryStats['sessions'];
};

function buildChartsFromRows(
  allMccRows: ReturnType<typeof collectMccRows>
): TeamChartsBundle {
  const macroMap = new Map<string, { confirmados: number; pendientes: number }>();
  const mesoMap = new Map<string, { confirmados: number; pendientes: number }>();

  for (const row of allMccRows) {
    const macroEntry = macroMap.get(row.macroName) ?? { confirmados: 0, pendientes: 0 };
    if (row.confirmed) macroEntry.confirmados += 1;
    else macroEntry.pendientes += 1;
    macroMap.set(row.macroName, macroEntry);

    const mesoEntry = mesoMap.get(row.mesoLabel) ?? { confirmados: 0, pendientes: 0 };
    if (row.confirmed) mesoEntry.confirmados += 1;
    else mesoEntry.pendientes += 1;
    mesoMap.set(row.mesoLabel, mesoEntry);
  }

  const macroChart: ChartBarRow[] = Array.from(macroMap.entries()).map(([name, value]) => ({
    name,
    confirmados: value.confirmados,
    pendientes: value.pendientes,
  }));

  const mesoChart: ChartBarRow[] = Array.from(mesoMap.entries()).map(([name, value]) => ({
    name,
    confirmados: value.confirmados,
    pendientes: value.pendientes,
  }));

  const microChart: MicroWeekRow[] = allMccRows.map((row) => ({
    name: row.microLabel,
    index: row.weekIndex,
    confirmados: row.confirmed ? 1 : 0,
    pendientes: row.confirmed ? 0 : 1,
  }));

  const sessionStats = sessionPanelStats(allMccRows);

  return {
    macros: {
      chart: macroChart.length > 0 ? macroChart : [{ name: 'Sin datos', confirmados: 0, pendientes: 0 }],
      stats: panelStats(allMccRows),
    },
    mesos: {
      chart: mesoChart.length > 0 ? mesoChart : [{ name: '—', confirmados: 0, pendientes: 0 }],
      stats: panelStats(allMccRows),
    },
    micros: {
      chart:
        microChart.length > 0
          ? microChart
          : [{ name: '—', index: 0, confirmados: 0, pendientes: 0 }],
      stats: panelStats(allMccRows),
    },
    sessions: {
      chart: [
        { name: 'Confirmadas', value: sessionStats.confirmados, key: 'confirmados' },
        { name: 'Pendientes', value: sessionStats.pendientes, key: 'pendientes' },
      ],
      stats: sessionStats,
    },
  };
}

export function computeTeamCharts(
  teamId: string,
  documents: Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>>,
  seasonFilter?: string
): TeamChartsBundle | null {
  for (const [, document] of Object.entries(documents)) {
    if (!document) continue;
    if (seasonFilter && document.seasonTitle.trim() !== seasonFilter) continue;

    const variant = variantForTeam(document, teamId);
    if (!variant) continue;

    const rawPlan = buildPlanForVariant(document, variant.id);
    if (!rawPlan) return null;

    const plan = applyPlanExclusions(rawPlan, getExcludedMccIds(document, variant.id));
    const rows = collectMccRows(document, variant, plan);
    return buildChartsFromRows(rows);
  }

  return null;
}

export function groupTeamsByCategory(teams: TeamSummaryRow[]) {
  return CANTERA_CATEGORIES.map((category) => ({
    category,
    teams: teams.filter((team) => team.categorySlug === category.slug),
  })).filter((group) => group.teams.length > 0);
}

function panelStats(rows: { confirmed: boolean; sessionsCount?: number }[]): SummaryPanelStats {
  const confirmados = rows.filter((row) => row.confirmed).length;
  const total = rows.length;
  return {
    confirmados,
    pendientes: Math.max(total - confirmados, 0),
    total,
  };
}

function sessionPanelStats(
  rows: { confirmed: boolean; sessionsCount: number }[]
): SummaryPanelStats {
  const confirmados = rows
    .filter((row) => row.confirmed)
    .reduce((sum, row) => sum + row.sessionsCount, 0);
  const total = rows.reduce((sum, row) => sum + row.sessionsCount, 0);
  return {
    confirmados,
    pendientes: Math.max(total - confirmados, 0),
    total,
  };
}

function teamPending(
  document: CategoryPeriodizationDocument,
  variant: RhythmVariant,
  plan: PeriodizationPlan,
  teamId: string
) {
  const excluded = getExcludedMccIds(document, variant.id);
  const instances = getVariantState(document, variant.id).teamInstances[teamId] ?? {};
  let pending = 0;
  let total = 0;

  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      for (const micro of meso.microcycles) {
        if (excluded.has(micro.id)) continue;
        total += 1;
        if (!instances[micro.id]) pending += 1;
      }
    }
  }

  return { pending, total };
}

export function computeMethodologySummary(
  teams: SummaryTeamInput[],
  documents: Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>>,
  options: {
    seasonFilter?: string;
    totalPlayers?: number;
    totalCoaches?: number;
  } = {}
): MethodologySummaryStats {
  const seasonOptions = Array.from(
    new Set(
      Object.values(documents)
        .filter((doc): doc is CategoryPeriodizationDocument => Boolean(doc))
        .map((doc) => doc.seasonTitle.trim())
        .filter(Boolean)
    )
  );

  if (seasonOptions.length === 0) {
    seasonOptions.push(defaultSeasonLabel());
  }

  const activeSeason = options.seasonFilter ?? seasonOptions[0] ?? defaultSeasonLabel();

  const filteredDocuments = Object.entries(documents).filter(([, doc]) => {
    if (!doc) return false;
    if (!options.seasonFilter) return true;
    return doc.seasonTitle.trim() === options.seasonFilter;
  }) as [CanteraCategorySlug, CategoryPeriodizationDocument][];

  const allMccRows: ReturnType<typeof collectMccRows> = [];

  for (const [, document] of filteredDocuments) {
    for (const variant of document.variants) {
      if (variant.teamIds.length === 0) continue;
      const rawPlan = buildPlanForVariant(document, variant.id);
      if (!rawPlan) continue;
      const plan = applyPlanExclusions(rawPlan, getExcludedMccIds(document, variant.id));
      allMccRows.push(...collectMccRows(document, variant, plan));
    }
  }

  const charts = buildChartsFromRows(allMccRows);

  const teamRows: TeamSummaryRow[] = teams
    .filter((team) => team.category_slug)
    .map((team) => {
      const document = documents[team.category_slug!];
      if (!document) {
        return {
          id: team.id,
          name: team.name,
          categorySlug: team.category_slug,
          variantLabel: null,
          pendingMcc: 0,
          totalMcc: 0,
          pendingPercent: 0,
          isComplete: true,
        };
      }

      const variant = variantForTeam(document, team.id);
      if (!variant) {
        return {
          id: team.id,
          name: team.name,
          categorySlug: team.category_slug,
          variantLabel: null,
          pendingMcc: 0,
          totalMcc: 0,
          pendingPercent: 100,
          isComplete: false,
        };
      }

      const rawPlan = buildPlanForVariant(document, variant.id);
      if (!rawPlan) {
        return {
          id: team.id,
          name: team.name,
          categorySlug: team.category_slug,
          variantLabel: variant.name,
          pendingMcc: 0,
          totalMcc: 0,
          pendingPercent: 100,
          isComplete: false,
        };
      }

      const plan = applyPlanExclusions(rawPlan, getExcludedMccIds(document, variant.id));
      const { pending, total } = teamPending(document, variant, plan, team.id);
      const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

      return {
        id: team.id,
        name: team.name,
        categorySlug: team.category_slug,
        variantLabel: variant.name,
        pendingMcc: pending,
        totalMcc: total,
        pendingPercent,
        isComplete: total > 0 && pending === 0,
      };
    })
    .sort((a, b) => {
      const orderA = CANTERA_CATEGORIES.findIndex((item) => item.slug === a.categorySlug);
      const orderB = CANTERA_CATEGORIES.findIndex((item) => item.slug === b.categorySlug);
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name, 'es');
    });

  const pendingTeams = teamRows.filter((team) => team.totalMcc > 0 && !team.isComplete);
  const globalPendingPercent =
    pendingTeams.length === 0
      ? 0
      : Math.round(
          pendingTeams.reduce((sum, team) => sum + team.pendingPercent, 0) / pendingTeams.length
        );

  return {
    seasonOptions,
    activeSeason,
    teams: teamRows,
    globalPendingPercent,
    totalPlayers: options.totalPlayers ?? 0,
    totalCoaches: options.totalCoaches ?? 0,
    macros: charts.macros,
    mesos: charts.mesos,
    micros: charts.micros,
    sessions: charts.sessions,
  };
}

export function cyclesUrlForTeam(team: TeamSummaryRow, macroIndex = 1): string {
  const params = new URLSearchParams();
  if (team.categorySlug) params.set('category', team.categorySlug);
  params.set('team', team.id);
  params.set('macro', String(macroIndex));
  return `/portal/metodologia/ciclos?${params.toString()}`;
}
