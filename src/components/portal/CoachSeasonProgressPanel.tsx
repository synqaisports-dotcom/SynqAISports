'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, ClipboardList, Percent } from 'lucide-react';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import type { ChangeRequestInboxRow } from '@/lib/change-requests';
import {
  COACH_CHANGE_REQUESTS_EVENT,
  loadCoachChangeRequests,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import type { CoachSeasonProgress } from '@/lib/coach-season-progress';
import { cn } from '@/lib/utils';

type Props = {
  teamId: string;
  progress: CoachSeasonProgress;
};

const sectionTitleClass =
  'text-[10px] font-semibold uppercase tracking-wider text-primary';

function coachToInboxRow(item: CoachChangeRequest): ChangeRequestInboxRow {
  return {
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
    requester_name: 'Entrenador (demo)',
    team_name: item.teamName,
    microcycle_title: item.mccLabel ?? null,
    exercise_title: null,
    source: 'coach-demo',
  };
}

function TotalStatLabel({ suffix }: { suffix: string }) {
  return (
    <p className={sectionTitleClass}>
      <span className="border-b border-primary">Total</span> {suffix}
    </p>
  );
}

function ProgressStatCard({
  suffix,
  value,
  icon: Icon,
}: {
  suffix: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="portal-section-surface flex min-h-[5.5rem] flex-col justify-between rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <TotalStatLabel suffix={suffix} />
        <Icon className="size-4 shrink-0 text-primary/70" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function formatResolvedDate(value: string | null): string {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusLabel(status: ChangeRequestInboxRow['status']): string {
  if (status === 'approved') return 'Aprobada';
  if (status === 'rejected') return 'Rechazada';
  return 'Pendiente';
}

function statusTone(status: ChangeRequestInboxRow['status']): string {
  if (status === 'approved') return 'text-emerald-300';
  if (status === 'rejected') return 'text-red-300';
  return 'text-amber-200';
}

export function CoachSeasonProgressPanel({ teamId, progress }: Props) {
  const [requests, setRequests] = useState<ChangeRequestInboxRow[]>([]);

  const refreshRequests = useCallback(async () => {
    try {
      const serverItems = await fetchChangeRequestInbox({
        limit: 20,
        status: 'all',
        mineOnly: true,
      });
      const coachItems = loadCoachChangeRequests().map(coachToInboxRow);
      const merged = [...coachItems, ...serverItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRequests(merged.filter((item) => item.team_id === teamId));
    } catch {
      const coachItems = loadCoachChangeRequests()
        .map(coachToInboxRow)
        .filter((item) => item.team_id === teamId);
      setRequests(coachItems);
    }
  }, [teamId]);

  useEffect(() => {
    void refreshRequests();
  }, [refreshRequests]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'synq-coach-change-requests') {
        void refreshRequests();
      }
    };
    const onLocalUpdate = () => {
      void refreshRequests();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener(COACH_CHANGE_REQUESTS_EVENT, onLocalUpdate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(COACH_CHANGE_REQUESTS_EVENT, onLocalUpdate);
    };
  }, [refreshRequests]);

  const resolvedRequests = useMemo(
    () =>
      requests.filter(
        (item) => item.status === 'approved' || item.status === 'rejected'
      ),
    [requests]
  );

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === 'pending').length,
    [requests]
  );

  const latestResolved = resolvedRequests[0] ?? null;

  return (
    <div className="grid gap-3 border-t border-primary/15 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
      <div className="portal-section-surface flex min-h-[5.5rem] flex-col rounded-xl p-4">
        <p className={sectionTitleClass}>Respuesta de solicitud de cambio</p>

        {latestResolved ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className={cn('font-semibold', statusTone(latestResolved.status))}>
                {statusLabel(latestResolved.status)}
              </span>
              {latestResolved.session_label ? (
                <span>· {latestResolved.session_label}</span>
              ) : null}
              {latestResolved.microcycle_title ? (
                <span>· {latestResolved.microcycle_title}</span>
              ) : null}
              {latestResolved.resolved_at ? (
                <span>· {formatResolvedDate(latestResolved.resolved_at)}</span>
              ) : null}
            </div>
            <p className="text-sm text-foreground">
              {latestResolved.resolution_note?.trim() ||
                latestResolved.reason ||
                'Sin nota del director.'}
            </p>
            {resolvedRequests.length > 1 ? (
              <p className="text-xs text-muted-foreground">
                +{resolvedRequests.length - 1} respuesta
                {resolvedRequests.length - 1 === 1 ? '' : 's'} anterior
                {resolvedRequests.length - 1 === 1 ? '' : 'es'}
              </p>
            ) : null}
          </div>
        ) : pendingCount > 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Tienes {pendingCount} solicitud{pendingCount === 1 ? '' : 'es'} en revisión. El
            director de metodología responderá aquí.
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Sin respuestas del director todavía.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ProgressStatCard
          suffix="MCC"
          value={`${progress.currentMcc} / ${progress.totalMcc}`}
          icon={ClipboardList}
        />
        <ProgressStatCard
          suffix="Sesiones"
          value={`${progress.completedSessions} / ${progress.totalSessions}`}
          icon={CalendarDays}
        />
        <ProgressStatCard
          suffix="Realizado"
          value={`${progress.completionPercent}%`}
          icon={Percent}
        />
      </div>
    </div>
  );
}
