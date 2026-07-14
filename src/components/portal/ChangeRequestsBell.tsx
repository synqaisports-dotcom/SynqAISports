'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  fetchChangeRequestInbox,
  fetchUnreadNotificationCount,
  markInboxNotificationsRead,
  resolveChangeRequestWithNote,
} from '@/app/actions/change-requests';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  canApproveChangeRequest,
  canViewChangeRequestInbox,
  type ChangeRequestInboxRow,
} from '@/lib/change-requests';
import {
  loadCoachChangeRequests,
  updateCoachChangeRequestStatus,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import { cn } from '@/lib/utils';
import { ChangeRequestCard } from '@/components/methodology/ChangeRequestCard';

type Props = {
  role: string;
  demoMode?: boolean;
};

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

export function ChangeRequestsBell({ role, demoMode }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ChangeRequestInboxRow[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const canOpen = canViewChangeRequestInbox(role) || role === 'coach';

  const refresh = useCallback(async () => {
    if (!canOpen) return;
    setLoading(true);
    try {
      const serverItems = await fetchChangeRequestInbox({
        limit: 12,
        status: 'all',
        mineOnly: role === 'coach',
      });
      const coachItems = demoMode || role === 'coach' ? loadCoachChangeRequests().map(coachToInboxRow) : [];
      const merged = [...coachItems, ...serverItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setItems(merged.slice(0, 12));
      const pending = merged.filter((item) => item.status === 'pending').length;
      if (!demoMode && role !== 'coach') {
        const unread = await fetchUnreadNotificationCount();
        setBadgeCount(Math.max(pending, unread));
      } else {
        setBadgeCount(pending);
      }
    } finally {
      setLoading(false);
    }
  }, [canOpen, demoMode, role]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const pendingItems = useMemo(
    () => items.filter((item) => item.status === 'pending'),
    [items]
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      void markInboxNotificationsRead();
      void refresh();
    }
  };

  const handleResolve = async (
    requestId: string,
    status: 'approved' | 'rejected',
    resolutionNote?: string
  ) => {
    if (requestId.startsWith('coach-req-')) {
      updateCoachChangeRequestStatus(requestId, status, resolutionNote);
      void refresh();
      return;
    }
    await resolveChangeRequestWithNote(requestId, status, resolutionNote);
    void refresh();
  };

  if (!canOpen) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative size-9 text-muted-foreground hover:text-primary"
        aria-label="Solicitudes y avisos"
        onClick={() => handleOpenChange(true)}
      >
        <Bell className="size-4" />
        {badgeCount > 0 ? (
          <span className="absolute right-1 top-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground shadow-[0_0_8px_hsl(var(--primary))]">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        ) : null}
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full border-primary/20 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Solicitudes</SheetTitle>
            <SheetDescription>
              {role === 'coach'
                ? 'Tus peticiones de cambio en la planificación.'
                : 'Avisos para metodología y cantera desde la app del entrenador.'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {pendingItems.length} pendiente{pendingItems.length === 1 ? '' : 's'}
            </p>
            {canViewChangeRequestInbox(role) ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/portal/metodologia/solicitudes" onClick={() => setOpen(false)}>
                  Gestionar todas
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
            {loading && items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : null}
            {!loading && items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No hay solicitudes todavía.
              </p>
            ) : null}
            {items.map((item) => (
              <ChangeRequestCard
                key={item.id}
                item={item}
                canApprove={canApproveChangeRequest(role, item.request_type)}
                compact
                onResolve={(status, note) => void handleResolve(item.id, status, note)}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
