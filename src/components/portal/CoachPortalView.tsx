'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MessageSquarePlus, Smartphone } from 'lucide-react';
import { createChangeRequest, type ActionState } from '@/app/actions/methodology';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import { ChangeRequestCard } from '@/components/methodology/ChangeRequestCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SynqSelect } from '@/components/portal/SynqSelect';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import type { ChangeRequestInboxRow } from '@/lib/change-requests';
import {
  loadCoachChangeRequests,
  saveCoachChangeRequest,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import { resolveCoachWeekContext } from '@/lib/coach-periodization-context';
import { sessionStructureSummary } from '@/lib/periodization';
import { cn } from '@/lib/utils';

export type CoachTeamOption = {
  id: string;
  name: string;
  category_slug: CanteraCategorySlug | null;
};

type Props = {
  teams: CoachTeamOption[];
};

const initial: ActionState = { ok: false };

export function CoachPortalView({ teams }: Props) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [requestingSession, setRequestingSession] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<ChangeRequestInboxRow[]>([]);

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
    <div className="mx-auto max-w-lg space-y-4 pb-8">
      <div className="flex items-center gap-2 text-primary">
        <Smartphone className="size-5" />
        <p className="text-sm font-medium">Vista entrenador · tablet / móvil</p>
      </div>

      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mi equipo</CardTitle>
          <CardDescription>Semana actual y sesiones planificadas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teams.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
              No hay equipos activos en el club. Crea un equipo en Cantera para usar esta vista.
            </p>
          ) : (
            <SynqSelect
              value={teamId}
              onChange={setTeamId}
              options={teams.map((item) => ({ value: item.id, label: item.name }))}
            />
          )}

          {weekContext ? (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-muted/10 p-4">
              {weekContext.seededDocument ? (
                <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary/90">
                  Plan de demostración cargado para esta categoría. El director puede afinarlo en{' '}
                  <Link href="/portal/metodologia/ciclos" className="underline">
                    Metodología → Ciclos
                  </Link>
                  .
                </p>
              ) : null}
              {weekContext.usedFallbackWeek ? (
                <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  Mostrando la primera semana del plan (las fechas de la temporada no coinciden con la
                  semana actual). Actualiza fechas en Ciclos para ver la semana en curso.
                </p>
              ) : null}

              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-4 text-primary" />
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
              </div>

              {weekContext.excluded ? (
                <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  Semana marcada como festivo / sin entreno.
                </p>
              ) : null}

              {weekContext.instance ? (
                <p className="text-xs text-emerald-300">
                  Instancia de equipo activa (fork desde plantilla de categoría).
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Aún no hay instancia de equipo para esta semana. El director puede hacer fork desde
                  Ciclos.
                </p>
              )}

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
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Ejercicios: pendiente de asignar
                        </p>
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
                          placeholder="Ej. No tengo conos suficientes, propongo rondo 4v4 en espacio reducido…"
                          className="w-full rounded-md border border-primary/25 bg-background/80 px-3 py-2 text-sm"
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          disabled={!reason.trim()}
                          onClick={() => void submitRequest(session.label)}
                        >
                          Enviar solicitud de cambio
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : teams.length > 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
              No se pudo cargar el plan de este equipo. Revisa la categoría en Cantera o configura la
              temporada en{' '}
              <Link href="/portal/metodologia/ciclos" className="text-primary underline">
                Metodología → Ciclos
              </Link>
              .
            </p>
          ) : null}

          {feedback ? <p className="text-sm text-primary">{feedback}</p> : null}
        </CardContent>
      </Card>

      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Mis solicitudes</CardTitle>
          <CardDescription>
            Estado de tus peticiones de cambio. También las verás en la campana del header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {myRequests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-6 text-center text-sm text-muted-foreground">
              Aún no has enviado solicitudes. Pulsa «Cambio» en una sesión para pedir un ajuste al
              director de metodología.
            </p>
          ) : (
            myRequests.map((item) => <ChangeRequestCard key={item.id} item={item} compact />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
