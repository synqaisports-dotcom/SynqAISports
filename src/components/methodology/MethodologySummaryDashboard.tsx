'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { loadCategoryPeriodization } from '@/app/actions/periodization';
import {
  MacroHistoryChart,
  MesoHistoryChart,
  MicroHistoryChart,
  SessionHistoryChart,
  SidebarMetricCard,
} from '@/components/methodology/MethodologySummaryCharts';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { CANTERA_CATEGORIES, type CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  computeMethodologySummary,
  cyclesUrlForTeam,
  type SummaryTeamInput,
} from '@/lib/methodology-summary-stats';
import {
  defaultCategoryDocument,
  loadDocumentFromStorage,
  type CategoryPeriodizationDocument,
} from '@/lib/periodization-document';
import { cn } from '@/lib/utils';

type Props = {
  teams: SummaryTeamInput[];
  totalPlayers: number;
  totalCoaches: number;
};

const teamButtonClass = (active: boolean, warning: boolean) =>
  cn(
    'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10'
      : warning
        ? 'border-amber-400/35 bg-amber-500/10 hover:border-amber-400/50'
        : 'border-primary/15 bg-background/30 hover:border-primary/35 hover:bg-primary/5'
  );

export function MethodologySummaryDashboard({ teams, totalPlayers, totalCoaches }: Props) {
  const [documents, setDocuments] = useState<
    Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>>
  >({});
  const [loading, setLoading] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const categorySlugs = useMemo(() => {
    const fromTeams = new Set(
      teams.map((team) => team.category_slug).filter((slug): slug is CanteraCategorySlug => Boolean(slug))
    );
    return CANTERA_CATEGORIES.map((category) => category.slug).filter((slug) => fromTeams.has(slug));
  }, [teams]);

  const hydrateDocuments = useCallback(async () => {
    setLoading(true);
    const next: Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>> = {};

    for (const slug of categorySlugs) {
      const category = CANTERA_CATEGORIES.find((item) => item.slug === slug)!;
      const fromStorage = loadDocumentFromStorage(slug);
      const fromServer = await loadCategoryPeriodization(slug);
      next[slug] = fromStorage ?? fromServer ?? defaultCategoryDocument(slug, category.name);
    }

    setDocuments(next);
    setLoading(false);
  }, [categorySlugs]);

  useEffect(() => {
    void hydrateDocuments();
  }, [hydrateDocuments]);

  const stats = useMemo(
    () =>
      computeMethodologySummary(teams, documents, {
        seasonFilter,
        totalPlayers,
        totalCoaches,
      }),
    [teams, documents, seasonFilter, totalPlayers, totalCoaches]
  );

  useEffect(() => {
    if (!seasonFilter && stats.seasonOptions[0]) {
      setSeasonFilter(stats.seasonOptions[0]);
    }
  }, [stats.seasonOptions, seasonFilter]);

  const pendingTeams = stats.teams.filter((team) => team.totalMcc > 0 && !team.isComplete);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2.15fr)] lg:items-start">
      <aside className="space-y-3 lg:sticky lg:top-4">
        <div className="portal-section-surface rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Selector de temporada
          </p>
          <div className="mt-2">
            <SynqSelect
              value={stats.activeSeason}
              onChange={setSeasonFilter}
              options={stats.seasonOptions.map((season) => ({
                value: season,
                label: season,
              }))}
            />
          </div>
        </div>

        <div className="portal-section-surface rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            Equipos pendientes
          </p>
          {loading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando planificación…
            </div>
          ) : pendingTeams.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Todos los equipos con plan tienen sus microciclos asignados.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {pendingTeams.map((team) => (
                <li key={team.id}>
                  <Link
                    href={cyclesUrlForTeam(team)}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={teamButtonClass(selectedTeamId === team.id, true)}
                  >
                    <span className="truncate">{team.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-amber-200">
                      <AlertCircle className="size-3.5" />
                      {team.pendingPercent}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && stats.teams.filter((team) => team.isComplete).length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-primary/10 pt-3">
              {stats.teams
                .filter((team) => team.isComplete && team.totalMcc > 0)
                .map((team) => (
                  <li key={team.id}>
                    <Link
                      href={cyclesUrlForTeam(team)}
                      className={teamButtonClass(false, false)}
                    >
                      <span className="truncate">{team.name}</span>
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                    </Link>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>

        <SidebarMetricCard
          label="% pendiente"
          value={`${stats.globalPendingPercent}%`}
          tone={stats.globalPendingPercent > 0 ? 'warning' : 'default'}
        />
        <SidebarMetricCard label="Jugadores totales" value={stats.totalPlayers} />
        <SidebarMetricCard label="Entrenadores totales" value={stats.totalCoaches} />
      </aside>

      <div className="grid gap-3 md:grid-cols-2">
        <MacroHistoryChart data={stats.macros.chart} stats={stats.macros.stats} />
        <MesoHistoryChart data={stats.mesos.chart} stats={stats.mesos.stats} />
        <MicroHistoryChart data={stats.micros.chart} stats={stats.micros.stats} />
        <SessionHistoryChart data={stats.sessions.chart} stats={stats.sessions.stats} />
      </div>
    </div>
  );
}
