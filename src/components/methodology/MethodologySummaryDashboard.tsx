'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ExternalLink, Layers, Loader2, Users } from 'lucide-react';
import { loadCategoryPeriodization } from '@/app/actions/periodization';
import { MethodologyReadOnlyBanner } from '@/components/methodology/MethodologyReadOnlyBanner';
import {
  MacroHistoryChart,
  MesoHistoryChart,
  MicroHistoryChart,
  SessionHistoryChart,
} from '@/components/methodology/MethodologySummaryCharts';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CANTERA_CATEGORIES, type CanteraCategorySlug } from '@/lib/cantera-categories';
import { canEditMethodology } from '@/lib/methodology-access';
import {
  computeMethodologySummary,
  computeTeamCharts,
  cyclesUrlForTeam,
  groupTeamsByCategory,
  type SummaryTeamInput,
  type TeamSummaryRow,
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
  role: string;
};

const listItemClass = (active: boolean, warning: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
      : warning
        ? 'border-amber-400/30 bg-amber-500/5 hover:border-amber-400/45'
        : 'border-primary/15 bg-muted/5 hover:border-primary/30 hover:bg-primary/5'
  );

function TeamListItem({
  team,
  active,
  onSelect,
}: {
  team: TeamSummaryRow;
  active: boolean;
  onSelect: () => void;
}) {
  const warning = team.totalMcc > 0 && !team.isComplete;

  return (
    <button type="button" onClick={onSelect} className={listItemClass(active, warning)}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5 text-sm font-bold text-primary">
        {team.name.replace(/^.*\s([A-Z])$/i, '$1').slice(-1) || '—'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{team.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {team.variantLabel ?? 'Sin variante asignada'}
        </p>
      </div>
      {warning ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-amber-200">
          <AlertCircle className="size-3.5" />
          {team.pendingPercent}%
        </span>
      ) : team.totalMcc > 0 ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
      ) : null}
    </button>
  );
}

export function MethodologySummaryDashboard({ teams, totalPlayers, totalCoaches, role }: Props) {
  const canEdit = canEditMethodology(role);
  const [documents, setDocuments] = useState<
    Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>>
  >({});
  const [hydrating, setHydrating] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>(undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const categorySlugs = useMemo(() => {
    const fromTeams = new Set(
      teams
        .map((team) => team.category_slug)
        .filter((slug): slug is CanteraCategorySlug => Boolean(slug))
    );
    return CANTERA_CATEGORIES.map((category) => category.slug).filter((slug) => fromTeams.has(slug));
  }, [teams]);

  const hydrateDocuments = useCallback(async () => {
    const instant: Partial<Record<CanteraCategorySlug, CategoryPeriodizationDocument>> = {};
    for (const slug of categorySlugs) {
      const fromStorage = loadDocumentFromStorage(slug);
      if (fromStorage) instant[slug] = fromStorage;
    }
    if (Object.keys(instant).length > 0) {
      setDocuments(instant);
      setHydrating(false);
    }

    const results = await Promise.all(
      categorySlugs.map(async (slug) => {
        const category = CANTERA_CATEGORIES.find((item) => item.slug === slug)!;
        const fromStorage = loadDocumentFromStorage(slug);
        const fromServer = await loadCategoryPeriodization(slug);
        return [slug, fromStorage ?? fromServer ?? defaultCategoryDocument(slug, category.name)] as const;
      })
    );

    setDocuments(Object.fromEntries(results));
    setHydrating(false);
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

  const groupedTeams = useMemo(() => groupTeamsByCategory(stats.teams), [stats.teams]);

  const selectedTeam =
    stats.teams.find((team) => team.id === selectedTeamId) ?? null;

  const teamCharts = useMemo(() => {
    if (!selectedTeam) return null;
    return computeTeamCharts(selectedTeam.id, documents, seasonFilter);
  }, [selectedTeam, documents, seasonFilter]);

  const pendingTeamCount = stats.teams.filter((team) => team.totalMcc > 0 && !team.isComplete).length;

  return (
    <div className="space-y-4">
      <MethodologyReadOnlyBanner role={role} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border border-primary/25">
          <CardHeader className="pb-2">
            <CardDescription>% pendiente club</CardDescription>
            <CardTitle className="text-2xl">{stats.globalPendingPercent}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-primary/25">
          <CardHeader className="pb-2">
            <CardDescription>Equipos con tareas</CardDescription>
            <CardTitle className="text-2xl">{pendingTeamCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border border-primary/25">
          <CardHeader className="pb-2">
            <CardDescription>Temporada activa</CardDescription>
            <div className="mt-1">
              <SynqSelect
                value={stats.activeSeason}
                onChange={setSeasonFilter}
                options={stats.seasonOptions.map((season) => ({
                  value: season,
                  label: season,
                }))}
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
          <CardHeader className="space-y-1 pb-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-base">Equipos por categoría</CardTitle>
            </div>
            <CardDescription>
              Selecciona un equipo para revisar su planificación y pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
            {hydrating && groupedTeams.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/20 px-4 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Cargando planificación…
              </div>
            ) : groupedTeams.length === 0 ? (
              <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No hay equipos con categoría asignada.
              </p>
            ) : (
              <div className="space-y-4">
                {groupedTeams.map((group) => (
                  <section key={group.category.slug}>
                    <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
                      <Layers className="size-3.5 text-primary/80" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.category.name}
                      </p>
                      <Badge variant="outline" className={cn('text-[10px]', group.category.badgeClass)}>
                        {group.category.ages}
                      </Badge>
                    </div>
                    <ul className="space-y-1.5">
                      {group.teams.map((team) => (
                        <li key={team.id}>
                          <TeamListItem
                            team={team}
                            active={selectedTeam?.id === team.id}
                            onSelect={() => setSelectedTeamId(team.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[28rem] border border-primary/25">
          {!selectedTeam ? (
            <CardContent className="flex h-full min-h-[24rem] flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground">Selecciona un equipo</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                El director de metodología revisa primero los pendientes por categoría y luego
                profundiza en el macrociclo de cada equipo.
              </p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-3 border-b border-primary/10 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{selectedTeam.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedTeam.variantLabel ?? 'Sin variante de ritmo'}
                      {selectedTeam.totalMcc > 0
                        ? ` · ${selectedTeam.pendingMcc} MCC pendientes de ${selectedTeam.totalMcc}`
                        : ' · Genera el plan en Ciclos'}
                    </CardDescription>
                  </div>
                  {canEdit ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={cyclesUrlForTeam(selectedTeam)}>
                        <ExternalLink className="size-4" />
                        Editar en Ciclos
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={cyclesUrlForTeam(selectedTeam)}>Ver en Ciclos</Link>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {teamCharts ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <MacroHistoryChart data={teamCharts.macros.chart} stats={teamCharts.macros.stats} />
                    <MesoHistoryChart data={teamCharts.mesos.chart} stats={teamCharts.mesos.stats} />
                    <MicroHistoryChart data={teamCharts.micros.chart} stats={teamCharts.micros.stats} />
                    <SessionHistoryChart
                      data={teamCharts.sessions.chart}
                      stats={teamCharts.sessions.stats}
                    />
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                    Este equipo no tiene variante asignada en Ciclos. Asigna el ritmo (2 o 3 sesiones)
                    antes de ver el detalle.
                  </p>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
