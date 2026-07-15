'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { CoachWeekSessionsPanel } from '@/components/portal/CoachWeekSessionsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { groupTeamsByCategory, type CoachPortalViewer } from '@/lib/coach-portal-teams';
import type { CoachTeamContext } from '@/lib/coach-team-context';
import { resolveCoachWeekContext } from '@/lib/coach-periodization-context';
import { cn } from '@/lib/utils';

type Props = {
  viewer: CoachPortalViewer;
  teamContexts: Record<string, CoachTeamContext>;
};

const teamCardClass = (active: boolean) =>
  cn(
    'rounded-lg border px-2 py-2 text-center text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
      : 'border-primary/20 bg-background/40 hover:border-primary/35 hover:bg-primary/5'
  );

export function CoachPortalView({ viewer, teamContexts }: Props) {
  const teams = viewer.teams;
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');

  const team = teams.find((item) => item.id === teamId) ?? teams[0];
  const teamContext = team ? teamContexts[team.id] ?? null : null;
  const teamGroups = useMemo(() => groupTeamsByCategory(teams), [teams]);

  const weekContext = useMemo(() => {
    if (!team) return null;
    return resolveCoachWeekContext(team);
  }, [team]);

  return (
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col pb-4">
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,7fr)_minmax(0,13fr)] lg:items-stretch">
        <Card className="flex min-h-[18rem] flex-col border border-primary/25 lg:min-h-0 lg:max-h-[calc(100vh-5.5rem)]">
          <CardHeader className="shrink-0 p-4 pb-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle className="text-base">Mis equipos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pt-0">
            {teams.length === 0 ? (
              <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
                No tienes equipos asignados.
              </p>
            ) : (
              teamGroups.map((group) => (
                <div key={group.category}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {group.category}
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {group.teams.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTeamId(item.id)}
                        className={teamCardClass(team?.id === item.id)}
                        title={item.name}
                      >
                        <span className="block truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="flex min-h-[20rem] flex-col border border-primary/25 lg:min-h-0">
          <CardHeader className="shrink-0 space-y-1 p-4 pb-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <CardTitle className="text-base">
                {team ? `Semana en curso · ${team.name}` : 'Semana en curso'}
              </CardTitle>
            </div>
            <CardDescription>Sesiones planificadas de la semana.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pt-0">
            {!team ? (
              <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
                Selecciona un equipo para ver su planificación.
              </p>
            ) : weekContext ? (
              <>
                {weekContext.seededDocument ? (
                  <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/90">
                    Plan de demostración. Ajustable en{' '}
                    <Link href="/portal/metodologia/ciclos" className="underline">
                      Metodología → Ciclos
                    </Link>
                    .
                  </p>
                ) : null}
                {weekContext.usedFallbackWeek ? (
                  <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                    Primera semana del plan (fechas desactualizadas).
                  </p>
                ) : null}

                <CoachWeekSessionsPanel
                  team={team}
                  weekContext={weekContext}
                  teamContext={teamContext}
                />
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
                No hay plan de ciclos para {team.name}. Configura la temporada en{' '}
                <Link href="/portal/metodologia/ciclos" className="text-primary underline">
                  Metodología → Ciclos
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
