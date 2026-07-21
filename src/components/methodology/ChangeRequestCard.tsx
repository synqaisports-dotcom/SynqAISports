'use client';

import { useState } from 'react';
import {
  CHANGE_REQUEST_STATUS_LABELS,
  CHANGE_REQUEST_TYPE_LABELS,
  type ChangeRequestInboxRow,
} from '@/lib/change-requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
  item: ChangeRequestInboxRow;
  canApprove?: boolean;
  compact?: boolean;
  onResolve?: (status: 'approved' | 'rejected', resolutionNote?: string) => void;
};

const statusBadgeClass: Record<string, string> = {
  pending: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  approved: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-red-400/40 bg-red-500/10 text-red-300',
};

export function ChangeRequestCard({ item, canApprove, compact, onResolve }: Props) {
  const [note, setNote] = useState('');

  return (
    <article className={cn('portal-section-surface rounded-xl p-4', compact && 'p-3')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn('text-[10px]', statusBadgeClass[item.status])}>
            {CHANGE_REQUEST_STATUS_LABELS[item.status]}
          </Badge>
          <Badge variant="outline" className="border-primary/25 text-[10px] text-primary/80">
            {CHANGE_REQUEST_TYPE_LABELS[item.request_type]}
          </Badge>
          {item.source === 'coach-demo' ? (
            <Badge variant="outline" className="border-primary/20 text-[10px] text-muted-foreground">
              Vista entrenador
            </Badge>
          ) : null}
        </div>
        <time className="shrink-0 text-[10px] text-muted-foreground">
          {new Date(item.created_at).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>

      {(item.team_name || item.session_label || item.requester_name) && (
        <p className="mt-2 text-xs text-primary/80">
          {[
            item.requester_name,
            item.team_name,
            item.session_label,
            item.microcycle_title ? `· ${item.microcycle_title}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}

      <p className={cn('mt-2 whitespace-pre-wrap text-sm text-foreground', compact && 'line-clamp-4')}>
        {item.reason}
      </p>

      {item.exercise_title ? (
        <p className="mt-1 text-xs text-muted-foreground">Ejercicio: {item.exercise_title}</p>
      ) : null}

      {item.resolution_note ? (
        <p className="mt-2 rounded-lg border border-primary/15 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Resolución: </span>
          {item.resolution_note}
        </p>
      ) : null}

      {item.status === 'pending' && canApprove && onResolve ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Nota opcional para el entrenador…"
            className="w-full rounded-lg border border-primary/25 portal-field-surface px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onResolve('approved', note || undefined)}
            >
              Aprobar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 border-red-400/30 text-red-300 hover:bg-red-500/10"
              onClick={() => onResolve('rejected', note || undefined)}
            >
              Rechazar
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
