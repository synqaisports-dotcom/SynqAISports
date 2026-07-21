'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, LayoutGrid, MessageSquarePlus } from 'lucide-react';
import { createChangeRequest, type ActionState } from '@/app/actions/methodology';
import { Button } from '@/components/ui/button';
import { CoachMacrocycleOverlay } from '@/components/portal/CoachMacrocycleOverlay';
import { CoachMicrocycleOverlay } from '@/components/portal/CoachMicrocycleOverlay';
import { CoachSeasonProgressPanel } from '@/components/portal/CoachSeasonProgressPanel';
import { CoachSessionSummaryPanel } from '@/components/portal/CoachSessionSummaryPanel';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
import {
  saveCoachChangeRequest,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import {
  MAX_SESSIONS_PER_MICRO_LAYOUT,
  resolveCoachMicrocycleId,
  type CoachWeekContext,
} from '@/lib/coach-periodization-context';
import type { CoachTeamContext } from '@/lib/coach-team-context';
import { computeCoachSeasonProgress } from '@/lib/coach-season-progress';
import { computeCoachSessionStats } from '@/lib/coach-team-context';
import { coachSessionLabels } from '@/lib/coach-session-labels';
import { exerciseDurationsForSession } from '@/lib/coach-session-metrics';
import type { CoachPortalTeam } from '@/lib/coach-portal-teams';
import type { MicrocycleWeek } from '@/lib/periodization';
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
  teamContext: CoachTeamContext | null;
};

const SESSION_ROW_HEIGHT_PX = 44;
const SESSION_ROW_GAP_PX = 6;

const sessionsBlockMinHeight =
  MAX_SESSIONS_PER_MICRO_LAYOUT * SESSION_ROW_HEIGHT_PX +
  (MAX_SESSIONS_PER_MICRO_LAYOUT - 1) * SESSION_ROW_GAP_PX;

const sessionButtonClass = (active: boolean) =>
  cn(
    'h-11 w-full rounded-lg border px-3 text-left text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
      : 'border-primary/15 bg-background/30 hover:border-primary/35 hover:bg-primary/5'
  );

export function CoachWeekSessionsPanel({ team, weekContext, teamContext }: Props) {
  const sessions = useMemo<SessionItem[]>(() => {
    const count = weekContext.variant.sessionsPerMicro;
    const labels = coachSessionLabels(teamContext?.trainingDays, count);
    return Array.from({ length: count }, (_, index) => ({
      id: `session-${index + 1}`,
      label: labels[index] ?? `Sesión ${index + 1}`,
      index: index + 1,
    }));
  }, [weekContext.variant.sessionsPerMicro, teamContext?.trainingDays]);

  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id ?? '');
  const [requestingChange, setRequestingChange] = useState(false);
  const [macroOpen, setMacroOpen] = useState(false);
  const [microcycleOpen, setMicrocycleOpen] = useState(false);
  const [viewMccId, setViewMccId] = useState<string | null>(null);
  const [viewSessionIndex, setViewSessionIndex] = useState(1);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedSession = sessions.find((session) => session.id === selectedSessionId) ?? sessions[0] ?? null;
  const variantState = getVariantState(weekContext.document, weekContext.variant.id);
  const excludedMccIds = getExcludedMccIds(weekContext.document, weekContext.variant.id);
  const currentMccId = weekContext.context.micro.id;
  const currentMicrocycleId = resolveCoachMicrocycleId(weekContext, team.id, currentMccId);
  const viewMicrocycleId = viewMccId
    ? resolveCoachMicrocycleId(weekContext, team.id, viewMccId)
    : null;
  const emptySessionSlots = Math.max(0, MAX_SESSIONS_PER_MICRO_LAYOUT - sessions.length);

  const sessionStats = useMemo(() => {
    if (!selectedSession || !teamContext) return null;
    const durations = exerciseDurationsForSession(currentMicrocycleId, selectedSession.index);
    return computeCoachSessionStats(
      teamContext.playerCount,
      teamContext.trainingStart,
      teamContext.trainingEnd,
      durations
    );
  }, [
    selectedSession,
    teamContext,
    currentMicrocycleId,
  ]);

  const seasonProgress = useMemo(() => {
    if (!selectedSession) return null;
    return computeCoachSeasonProgress(
      weekContext.plan,
      currentMccId,
      selectedSession.index
    );
  }, [weekContext.plan, currentMccId, selectedSession]);

  useEffect(() => {
    setSelectedSessionId(sessions[0]?.id ?? '');
    setRequestingChange(false);
    setReason('');
    setFeedback(null);
    setViewMccId(null);
    setMicrocycleOpen(false);
  }, [team.id, currentMccId, sessions]);

  const openMicrocycle = (mccId: string, sessionIndex = 1) => {
    setViewMccId(mccId);
    setViewSessionIndex(sessionIndex);
    setMicrocycleOpen(true);
  };

  const handleMacroMccSelect = (micro: MicrocycleWeek) => {
    setMacroOpen(false);
    openMicrocycle(micro.id);
  };

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
      <div className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => openMicrocycle(currentMccId)}
            className="portal-section-surface w-full rounded-xl p-4 text-left transition-colors hover:border-primary/65"
            title="Ver microciclo de la semana"
          >
            <p className="font-semibold text-foreground">
              {weekContext.context.micro.label} · {weekContext.variant.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {weekContext.context.micro.weekStart} → {weekContext.context.micro.weekEnd}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{weekContext.document.seasonTitle}</p>
          </button>

          {weekContext.excluded ? (
            <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Semana festiva / sin entreno.
            </p>
          ) : null}

          <div className="flex flex-1 flex-col gap-1.5" style={{ minHeight: sessionsBlockMinHeight }}>
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
            {Array.from({ length: emptySessionSlots }, (_, index) => (
              <div
                key={`session-slot-${index}`}
                aria-hidden
                className="h-11 rounded-lg border border-transparent"
              />
            ))}
          </div>
        </div>

        <div
          className="portal-section-surface flex min-h-0 flex-col rounded-xl p-4"
          style={{ minHeight: sessionsBlockMinHeight }}
        >
          {selectedSession ? (
            <>
              <p className="text-sm font-semibold text-foreground">{selectedSession.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Acciones de la sesión</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(PORTAL_ACTION_ICON_CLASS, PORTAL_ACTION_ICON_DISABLED_CLASS)}
                  title="Solicitar modificación"
                  aria-label="Solicitar modificación"
                  disabled={weekContext.excluded}
                  onClick={() => setRequestingChange((value) => !value)}
                >
                  <MessageSquarePlus className="size-4" />
                </button>

                <button
                  type="button"
                  className={cn(PORTAL_ACTION_ICON_CLASS, PORTAL_ACTION_ICON_DISABLED_CLASS)}
                  title="Visualizar sesión"
                  aria-label="Visualizar sesión"
                  disabled={weekContext.excluded || !currentMicrocycleId}
                  onClick={() => openMicrocycle(currentMccId, selectedSession.index)}
                >
                  <Eye className="size-4" />
                </button>

                <button
                  type="button"
                  className={cn(PORTAL_ACTION_ICON_CLASS, PORTAL_ACTION_ICON_DISABLED_CLASS)}
                  title="Ver macrociclo completo"
                  aria-label="Ver macrociclo completo"
                  onClick={() => setMacroOpen(true)}
                >
                  <LayoutGrid className="size-4" />
                </button>
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col">
                {requestingChange ? (
                  <div className="space-y-2 border-t border-primary/10 pt-4">
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
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona una sesión.</p>
          )}
        </div>
      </div>

      {teamContext && sessionStats ? (
        <CoachSessionSummaryPanel teamContext={teamContext} stats={sessionStats} />
      ) : null}

      {seasonProgress ? (
        <CoachSeasonProgressPanel teamId={team.id} progress={seasonProgress} />
      ) : null}

      <CoachMacrocycleOverlay
        open={macroOpen}
        onOpenChange={setMacroOpen}
        macro={weekContext.context.macro}
        categorySlug={weekContext.document.categorySlug}
        mccLinks={variantState.mccLinks}
        mccOverrides={variantState.mccOverrides}
        excludedMccIds={excludedMccIds}
        currentMccId={currentMccId}
        onSelectMcc={handleMacroMccSelect}
      />

      {viewMccId ? (
        <CoachMicrocycleOverlay
          open={microcycleOpen}
          onOpenChange={setMicrocycleOpen}
          weekContext={weekContext}
          mccId={viewMccId}
          microcycleId={viewMicrocycleId}
          initialSessionIndex={viewSessionIndex}
        />
      ) : null}
    </>
  );
}
