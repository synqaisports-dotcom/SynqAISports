'use client';

import type { ChangeRequestInboxRow } from '@/lib/change-requests';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: ChangeRequestInboxRow[];
  activeRequestId: string | null;
  onSelectRequest: (requestId: string) => void;
};

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: ChangeRequestInboxRow['status']): string {
  if (status === 'approved') return 'Aprobada';
  if (status === 'rejected') return 'Rechazada';
  return 'En revisión';
}

function ChatBubble({
  align,
  author,
  body,
  time,
  tone = 'default',
}: {
  align: 'left' | 'right' | 'center';
  author: string;
  body: string;
  time: string;
  tone?: 'default' | 'system' | 'success' | 'danger';
}) {
  if (align === 'center') {
    return (
      <div className="flex justify-center py-1">
        <p className="rounded-full border border-primary/15 bg-background/50 px-3 py-1 text-[11px] text-muted-foreground">
          {body}
        </p>
      </div>
    );
  }

  const bubbleClass =
    tone === 'success'
      ? 'border-emerald-400/30 bg-emerald-500/10'
      : tone === 'danger'
        ? 'border-red-400/30 bg-red-500/10'
        : align === 'right'
          ? 'border-primary/30 bg-primary/10'
          : 'border-primary/15 bg-background/60';

  return (
    <div className={cn('flex', align === 'right' ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[88%] rounded-2xl border px-3 py-2', bubbleClass)}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">{author}</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{body}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

export function CoachChangeRequestChatSheet({
  open,
  onOpenChange,
  requests,
  activeRequestId,
  onSelectRequest,
}: Props) {
  const activeRequest =
    requests.find((item) => item.id === activeRequestId) ?? requests[0] ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-primary/20 bg-background/95 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>Conversación de solicitud</SheetTitle>
          <SheetDescription>
            Canal de comunicación con metodología. Base para mensajería del club.
          </SheetDescription>
        </SheetHeader>

        {requests.length > 1 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {requests.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRequest(item.id)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
                  item.id === activeRequest?.id
                    ? 'border-primary/45 bg-primary/10 text-primary'
                    : 'border-primary/15 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                )}
              >
                {item.session_label ?? 'Solicitud'} · {statusLabel(item.status)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {!activeRequest ? (
            <p className="text-sm text-muted-foreground">No hay conversaciones todavía.</p>
          ) : (
            <>
              <ChatBubble
                align="right"
                author="Tú"
                body={activeRequest.reason}
                time={formatMessageTime(activeRequest.created_at)}
              />

              {activeRequest.status === 'pending' ? (
                <ChatBubble
                  align="center"
                  author=""
                  body="Esperando respuesta del director de metodología…"
                  time=""
                  tone="system"
                />
              ) : (
                <ChatBubble
                  align="left"
                  author="Director de metodología"
                  body={
                    activeRequest.resolution_note?.trim() ||
                    'Solicitud resuelta sin nota adicional.'
                  }
                  time={formatMessageTime(
                    activeRequest.resolved_at ?? activeRequest.created_at
                  )}
                  tone={activeRequest.status === 'approved' ? 'success' : 'danger'}
                />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
