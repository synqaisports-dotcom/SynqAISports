'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ClipboardList, MessageSquarePlus, Smartphone, Users } from 'lucide-react';
import { createChangeRequest, type ActionState } from '@/app/actions/methodology';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import { ChangeRequestCard } from '@/components/methodology/ChangeRequestCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChangeRequestInboxRow } from '@/lib/change-requests';
import {
  coachPortalRoleLabel,
  groupTeamsByCategory,
  type CoachPortalViewer,
} from '@/lib/coach-portal-teams';
import {
  loadCoachChangeRequests,
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
    'rounded-xl border px-3 py-2.5 text-left transition-colors',
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
  const [myRequests, setMyRequests] = useState<ChangeRequestInboxRow[]>([]);

  useEffect(() => {
    if (teams.length > 0 && !teams.some((team) => team.id === teamId)) {
      setTeamId(teams[0]!.id);
    }
  }, [teams, teamId]);

  useEffect(() => {
    const load = async () => {
      const server = await fetchChangeRequestInbox({ mineOnly: true, status: 'all', limit: 20 });
      const local = loadCoachChangeRequests().map(
        (item): ChangeRequestInboxRow => ({
          id: item.id,
          reason: item.reason,
          status: item.status,
          request_type: 'methodology',
          created_at: item.createdAt,
          resolved_at: item.resolvedAt ?? null,
          resolution_note: item.resolutionNote ?? null,
          session_label: item.sessionLabel ?? null,
          team_id: item.teamId,
          microcycle_id: item.microcycleId ?? null,
          requested_by: null,
          requester_name: null,
          team_name: item.teamName,
          microcycle_title: item.mccLabel ?? null,
          exercise_title: null,
          source: 'coach-demo',
        })
      );
      const merged = [...local, ...server].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMyRequests(merged.slice(0, 8));
    };
    void load();
  }, [feedback]);

  const team = teams.find((item) => item.id === teamId) ?? teams[0];
  const teamGroups = useMemo(() => groupTeamsByCategory(teams), [teams]);
  const pendingCount = myRequests.filter((item) => item.status === 'pending').length;

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
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <div className="portal-section-surface rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Smartphone className="size-5" />
              <p className="text-sm font-medium">Dashboard entrenador</p>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {viewer.displayName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{viewer.viewModeLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-primary/35 text-primary">
              {coachPortalRoleLabel(viewer.role)}
            </Badge>
            {pendingCount > 0 ? (
              <Badge variant="outline" className="border-amber-400/40 bg-amber-500/10 text-amber-200">
                {pendingCount} solicitud{pendingCount === 1 ? '' : 'es'} pendiente{pendingCount === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Vista web que anticipa la app Synq Club Coach: consulta la semana planificada y solicita
          cambios al director de metodología. En móvil/tablet nativo el entrenador verá solo sus
          equipos asignados.
        </p>
      </div>

      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <CardTitle className="text-base">Mis equipos</CardTitle>
          </div>
          <CardDescription>
            {viewer.viewMode === 'coordinator'
              ? 'Como coordinador de etapa ves todos los equipos de tu categoría.'
              : viewer.viewMode === 'supervisor'
                ? 'Vista de supervisión: todos los equipos del club.'
                : 'Selecciona el equipo con el que vas a entrenar esta semana.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teams.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
              No tienes equipos asignados. El club debe vincular tu ficha en Personas con los
              equipos o categorías correspondientes.
            </p>
          ) : (
            <div className="space-y-4">
              {teamGroups.map((group) => (
                <div key={group.category}>
                  {teamGroups.length > 1 ? (
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {group.category}
                    </p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.teams.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTeamId(item.id)}
                        className={teamCardClass(team?.id === item.id)}
                      >
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category_name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {team ? (
        <Card className="border border-primary/25">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <CardTitle className="text-base">Semana · {team.name}</CardTitle>
            </div>
            <CardDescription>Sesiones planificadas y solicitudes de cambio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekContext ? (
              <div className="space-y-3 rounded-xl border border-primary/20 bg-muted/10 p-4">
                {weekContext.seededDocument ? (
                  <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/90">
                    Plan de demostración cargado. El director puede afinarlo en{' '}
                    <Link href="/portal/metodologia/ciclos" className="underline">
                      Metodología → Ciclos
                    </Link>
                    .
                  </p>
                ) : null}
                {weekContext.usedFallbackWeek ? (
                  <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                    Primera semana del plan (fechas de temporada desactualizadas). Actualiza fechas
                    en Ciclos para la semana en curso.
                  </p>
                ) : null}

                <div>
                  <p className="font-semibold">
                    {weekContext.context.micro.label} · {weekContext.variant.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {weekContext.context.micro.weekStart} → {weekContext.context.micro.weekEnd}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
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
                        'rounded-lg border border-primary/15 p-3',
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
              <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
                No hay plan de ciclos para {team.name}. Configura la temporada en{' '}
                <Link href="/portal/metodologia/ciclos" className="text-primary underline">
                  Metodología → Ciclos
                </Link>
                .
              </p>
            )}

            {feedback ? <p className="text-sm text-primary">{feedback}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="size-4 text-primary" />
            <CardTitle className="text-base">Mis solicitudes</CardTitle>
          </div>
          <CardDescription>
            Historial de peticiones de cambio. También disponible en la campana del header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {myRequests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-6 text-center text-sm text-muted-foreground">
              Aún no has enviado solicitudes. Pulsa «Cambio» en una sesión para pedir un ajuste.
            </p>
          ) : (
            myRequests.map((item) => <ChangeRequestCard key={item.id} item={item} compact />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
