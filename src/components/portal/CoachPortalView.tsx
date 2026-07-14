'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, MessageSquarePlus, Users } from 'lucide-react';
import { createChangeRequest, type ActionState } from '@/app/actions/methodology';
import { Button } from '@/components/ui/button';
import { groupTeamsByCategory, type CoachPortalViewer } from '@/lib/coach-portal-teams';
import {
  saveCoachChangeRequest,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import { resolveCoachWeekContext } from '@/lib/coach-periodization-context';
import { sessionStructureSummary } from '@/lib/periodization';
import { cn } from '@/lib/utils';

type Props = {
  viewer: CoachPortalViewer;
};

const initial: ActionState = { ok: false };

const teamCardClass = (active: boolean) =>
  cn(
    'w-full rounded-xl border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-primary/55 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
      : 'border-primary/20 bg-background/40 hover:border-primary/35 hover:bg-primary/5'
  );

export function CoachPortalView({ viewer }: Props) {
  const teams = viewer.teams;
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [requestingSession, setRequestingSession] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const team = teams.find((item) => item.id === teamId) ?? teams[0];
  const teamGroups = useMemo(() => groupTeamsByCategory(teams), [teams]);

  const weekContext = useMemo(() => {
    if (!team) return null;
    return resolveCoachWeekContext(team);
  }, [team]);

  const sessions = useMemo(() => {
    if (!weekContext) return [];
    const count = weekContext.variant.sessionsPerMicro;
    const structure = sessionStructureSummary(weekContext.variant.mainTasksPerSession);
    return Array.from({ length: count }, (_, index) => ({
      id: `session-${index + 1}`,
      label: `Sesión ${index + 1}`,
      structure,
    }));
  }, [weekContext]);

  const submitRequest = async (sessionLabel: string) => {
    if (!team || !reason.trim()) return;

    const request: CoachChangeRequest = {
      id: `coach-req-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      reason: reason.trim(),
      microcycleId: weekContext?.instance?.microcycleId,
      mccLabel: weekContext?.context.micro.label ?? 'Semana planificada',
      sessionLabel,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveCoachChangeRequest(request);

    const formData = new FormData();
    formData.set('reason', `[${team.name} · ${sessionLabel}] ${reason.trim()}`);
    formData.set('teamId', team.id);
    formData.set('sessionLabel', sessionLabel);
    formData.set('requestType', 'methodology');
    if (weekContext?.instance?.microcycleId) {
      formData.set('microcycleId', weekContext.instance.microcycleId);
    }

    await createChangeRequest({ ok: false } as ActionState, formData);

    setReason('');
    setRequestingSession(null);
    setFeedback('Solicitud enviada al director de metodología.');
  };

  return (
    <div className="grid min-h-[calc(100vh-7rem)] pb-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-primary/15 pb-4 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
        <header className="mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Mis equipos</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {viewer.viewMode === 'coordinator'
              ? 'Equipos de tu categoría.'
              : viewer.viewMode === 'supervisor'
                ? 'Todos los equipos del club.'
                : 'Selecciona un equipo.'}
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-4">
          {teams.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
              No tienes equipos asignados.
            </p>
          ) : (
            teamGroups.map((group) => (
              <div key={group.category}>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {group.category}
                </p>
                <div className="space-y-1.5">
                  {group.teams.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setTeamId(item.id);
                        setFeedback(null);
                        setRequestingSession(null);
                      }}
                      className={teamCardClass(team?.id === item.id)}
                    >
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category_name}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-[24rem] flex-col pt-4 lg:min-h-0 lg:pl-5 lg:pt-0">
        <header className="mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {team ? `Semana en curso · ${team.name}` : 'Semana en curso'}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Sesiones planificadas de la semana.</p>
        </header>

        <div className="min-h-0 flex-1 space-y-4">
          {!team ? (
            <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
              Selecciona un equipo para ver su planificación.
            </p>
          ) : weekContext ? (
            <div className="space-y-3">
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

              <div className="portal-section-surface rounded-xl p-4">
                <p className="font-semibold text-foreground">
                  {weekContext.context.micro.label} · {weekContext.variant.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {weekContext.context.micro.weekStart} → {weekContext.context.micro.weekEnd}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {weekContext.document.seasonTitle}
                </p>
              </div>

              {weekContext.excluded ? (
                <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Semana festiva / sin entreno.
                </p>
              ) : null}

              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'rounded-xl border border-primary/15 p-3',
                      weekContext.excluded && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{session.label}</p>
                        <p className="text-[11px] text-muted-foreground">{session.structure}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1 text-xs"
                        disabled={weekContext.excluded}
                        onClick={() =>
                          setRequestingSession(
                            requestingSession === session.label ? null : session.label
                          )
                        }
                      >
                        <MessageSquarePlus className="size-3.5" />
                        Cambio
                      </Button>
                    </div>

                    {requestingSession === session.label ? (
                      <div className="mt-3 space-y-2 border-t border-primary/10 pt-3">
                        <textarea
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          rows={3}
                          placeholder="Ej. No tengo conos suficientes, propongo rondo 4v4…"
                          className="w-full rounded-md border border-primary/25 bg-background/80 px-3 py-2 text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          disabled={!reason.trim()}
                          onClick={() => void submitRequest(session.label)}
                        >
                          Enviar solicitud
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
              No hay plan de ciclos para {team.name}. Configura la temporada en{' '}
              <Link href="/portal/metodologia/ciclos" className="text-primary underline">
                Metodología → Ciclos
              </Link>
              .
            </p>
          )}

          {feedback ? <p className="text-sm text-primary">{feedback}</p> : null}
        </div>
      </section>
    </div>
  );
}
