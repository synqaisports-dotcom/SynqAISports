'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Eye, LayoutGrid, MessageSquarePlus } from 'lucide-react';
import { createChangeRequest, type ActionState } from '@/app/actions/methodology';
import { Button } from '@/components/ui/button';
import { CoachMacrocycleOverlay } from '@/components/portal/CoachMacrocycleOverlay';
import {
  saveCoachChangeRequest,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import type { CoachWeekContext } from '@/lib/coach-periodization-context';
import type { CoachPortalTeam } from '@/lib/coach-portal-teams';
import { getExcludedMccIds, getVariantState } from '@/lib/periodization-document';
import { cn } from '@/lib/utils';

type SessionItem = {
  id: string;
  label: string;
  index: number;
};

type Props = {
  team: CoachPortalTeam;
  weekContext: CoachWeekContext;
};

const actionIconClass =
  'inline-flex size-10 items-center justify-center rounded-lg border border-primary/25 bg-background/40 text-muted-foreground transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-40';

const sessionButtonClass = (active: boolean) =>
  cn(
    'w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
      : 'border-primary/15 bg-background/30 hover:border-primary/35 hover:bg-primary/5'
  );

export function CoachWeekSessionsPanel({ team, weekContext }: Props) {
  const sessions = useMemo<SessionItem[]>(() => {
    const count = weekContext.variant.sessionsPerMicro;
    return Array.from({ length: count }, (_, index) => ({
      id: `session-${index + 1}`,
      label: `Sesión ${index + 1}`,
      index: index + 1,
    }));
  }, [weekContext.variant.sessionsPerMicro]);

  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? '');
  const [requestingChange, setRequestingChange] = useState(false);
  const [macroOpen, setMacroOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null;
  const variantState = getVariantState(weekContext.document, weekContext.variant.id);
  const excludedMccIds = getExcludedMccIds(weekContext.document, weekContext.variant.id);
  const sessionViewHref = weekContext.instance?.microcycleId
    ? `/portal/metodologia/microciclos/${weekContext.instance.microcycleId}/sesiones/${selectedSession?.index ?? 1}`
    : null;

  useEffect(() => {
    setSelectedSessionId(sessions[0]?.id ?? '');
    setRequestingChange(false);
    setReason('');
    setFeedback(null);
  }, [team.id, weekContext.context.micro.id, sessions]);

  const submitRequest = async () => {
    if (!selectedSession || !reason.trim()) return;

    const request: CoachChangeRequest = {
      id: `coach-req-${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      reason: reason.trim(),
      microcycleId: weekContext.instance?.microcycleId,
      mccLabel: weekContext.context.micro.label ?? 'Semana planificada',
      sessionLabel: selectedSession.label,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    saveCoachChangeRequest(request);

    const formData = new FormData();
    formData.set('reason', `[${team.name} · ${selectedSession.label}] ${reason.trim()}`);
    formData.set('teamId', team.id);
    formData.set('sessionLabel', selectedSession.label);
    formData.set('requestType', 'methodology');
    if (weekContext.instance?.microcycleId) {
      formData.set('microcycleId', weekContext.instance.microcycleId);
    }

    await createChangeRequest({ ok: false } as ActionState, formData);

    setReason('');
    setRequestingChange(false);
    setFeedback('Solicitud enviada al director de metodología.');
  };

  return (
    <>
      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="space-y-3">
          <div className="portal-section-surface rounded-xl p-4">
            <p className="font-semibold text-foreground">
              {weekContext.context.micro.label} · {weekContext.variant.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {weekContext.context.micro.weekStart} → {weekContext.context.micro.weekEnd}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{weekContext.document.seasonTitle}</p>
          </div>

          {weekContext.excluded ? (
            <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Semana festiva / sin entreno.
            </p>
          ) : null}

          <div className="space-y-1.5">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                disabled={weekContext.excluded}
                onClick={() => {
                  setSelectedSessionId(session.id);
                  setRequestingChange(false);
                  setFeedback(null);
                }}
                className={sessionButtonClass(selectedSession?.id === session.id)}
              >
                {session.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-[12rem] flex-col rounded-xl border border-primary/15 bg-background/20 p-4">
          {selectedSession ? (
            <>
              <p className="text-sm font-semibold text-foreground">{selectedSession.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Acciones de la sesión</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={actionIconClass}
                  title="Solicitar modificación"
                  aria-label="Solicitar modificación"
                  disabled={weekContext.excluded}
                  onClick={() => setRequestingChange((value) => !value)}
                >
                  <MessageSquarePlus className="size-4" />
                </button>

                {sessionViewHref ? (
                  <Link
                    href={sessionViewHref}
                    className={actionIconClass}
                    title="Visualizar sesión"
                    aria-label="Visualizar sesión"
                  >
                    <Eye className="size-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={actionIconClass}
                    title="Sesión sin microciclo vinculado"
                    aria-label="Visualizar sesión"
                    disabled
                  >
                    <Eye className="size-4" />
                  </button>
                )}

                <button
                  type="button"
                  className={actionIconClass}
                  title="Ver macrociclo completo"
                  aria-label="Ver macrociclo completo"
                  onClick={() => setMacroOpen(true)}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              {requestingChange ? (
                <div className="mt-4 space-y-2 border-t border-primary/10 pt-4">
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    placeholder="Ej. No tengo conos suficientes, propongo rondo 4v4…"
                    className="w-full rounded-md border border-primary/25 bg-background/80 px-3 py-2 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    disabled={!reason.trim()}
                    onClick={() => void submitRequest()}
                  >
                    Enviar solicitud
                  </Button>
                </div>
              ) : null}

              {feedback ? <p className="mt-3 text-sm text-primary">{feedback}</p> : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona una sesión.</p>
          )}
        </div>
      </div>

      <CoachMacrocycleOverlay
        open={macroOpen}
        onOpenChange={setMacroOpen}
        macro={weekContext.context.macro}
        categorySlug={weekContext.document.categorySlug}
        mccLinks={variantState.mccLinks}
        mccOverrides={variantState.mccOverrides}
        excludedMccIds={excludedMccIds}
        currentMccId={weekContext.context.micro.id}
      />
    </>
  );
}
