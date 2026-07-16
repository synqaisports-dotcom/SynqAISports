'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, ClipboardList, MessagesSquare, Percent } from 'lucide-react';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import type { ChangeRequestInboxRow } from '@/lib/change-requests';
import { CoachChangeRequestChatSheet } from '@/components/portal/CoachChangeRequestChatSheet';
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

const chatOpenButtonClass =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-background/40 text-primary/80 transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-primary';

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

function ProgressStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="portal-section-surface flex min-h-[5.5rem] flex-col justify-between rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <p className={sectionTitleClass}>{label}</p>
        <Icon className="size-4 shrink-0 text-primary/70" />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
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

function previewText(item: ChangeRequestInboxRow): string {
  if (item.status === 'pending') return item.reason;
  return item.resolution_note?.trim() || item.reason;
}

function pickFeaturedRequest(requests: ChangeRequestInboxRow[]): ChangeRequestInboxRow | null {
  const resolved = requests.find(
    (item) => item.status === 'approved' || item.status === 'rejected'
  );
  if (resolved) return resolved;
  return requests[0] ?? null;
}

export function CoachSeasonProgressPanel({ teamId, progress }: Props) {
  const [requests, setRequests] = useState<ChangeRequestInboxRow[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

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

  const featuredRequest = useMemo(() => pickFeaturedRequest(requests), [requests]);

  useEffect(() => {
    if (!featuredRequest) {
      setActiveRequestId(null);
      return;
    }
    setActiveRequestId((current) => current ?? featuredRequest.id);
  }, [featuredRequest]);

  const openChat = () => {
    if (featuredRequest) {
      setActiveRequestId(featuredRequest.id);
    }
    setChatOpen(true);
  };

  return (
    <>
      <div className="grid gap-3 border-t border-primary/15 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
        <div className="portal-section-surface flex min-h-[5.5rem] flex-col rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <p className={sectionTitleClass}>Respuesta de solicitud de cambio</p>
            <button
              type="button"
              className={chatOpenButtonClass}
              title="Abrir conversación"
              aria-label="Abrir conversación"
              onClick={openChat}
              disabled={requests.length === 0}
            >
              <MessagesSquare className="size-4" />
            </button>
          </div>

          {featuredRequest ? (
            <div className="mt-3 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className={cn('font-semibold', statusTone(featuredRequest.status))}>
                  {statusLabel(featuredRequest.status)}
                </span>
                {featuredRequest.session_label ? <span>· {featuredRequest.session_label}</span> : null}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-foreground">{previewText(featuredRequest)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Sin conversaciones todavía. Envía una solicitud para iniciar el chat con metodología.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ProgressStatCard
            label="Total MCC"
            value={`${progress.currentMcc} / ${progress.totalMcc}`}
            icon={ClipboardList}
          />
          <ProgressStatCard
            label="Total Sesiones"
            value={`${progress.completedSessions} / ${progress.totalSessions}`}
            icon={CalendarDays}
          />
          <ProgressStatCard
            label="Total Realizado"
            value={`${progress.completionPercent}%`}
            icon={Percent}
          />
        </div>
      </div>

      <CoachChangeRequestChatSheet
        open={chatOpen}
        onOpenChange={setChatOpen}
        requests={requests}
        activeRequestId={activeRequestId}
        onSelectRequest={setActiveRequestId}
      />
    </>
  );
}
