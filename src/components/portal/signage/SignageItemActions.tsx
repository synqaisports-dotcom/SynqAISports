'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play, Trash2 } from 'lucide-react';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
import { cn } from '@/lib/utils';

type Props = {
  active: boolean;
  onToggle: () => Promise<unknown>;
  onDelete?: () => Promise<unknown>;
  pauseLabel?: string;
  resumeLabel?: string;
  deleteLabel?: string;
};

export function SignageItemActions({
  active,
  onToggle,
  onDelete,
  pauseLabel = 'Pausar',
  resumeLabel = 'Reactivar',
  deleteLabel = 'Eliminar',
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label={active ? pauseLabel : resumeLabel}
        title={active ? pauseLabel : resumeLabel}
        onClick={() => {
          startTransition(async () => {
            await onToggle();
            router.refresh();
          });
        }}
        className={cn(
          PORTAL_ACTION_ICON_CLASS,
          PORTAL_ACTION_ICON_DISABLED_CLASS,
          !active && 'text-muted-foreground'
        )}
      >
        {active ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      {onDelete ? (
        <button
          type="button"
          disabled={pending}
          aria-label={deleteLabel}
          title={deleteLabel}
          onClick={() => {
            if (!window.confirm('¿Eliminar permanentemente? Esta acción no se puede deshacer.')) return;
            startTransition(async () => {
              await onDelete();
              router.refresh();
            });
          }}
          className={cn(
            PORTAL_ACTION_ICON_CLASS,
            PORTAL_ACTION_ICON_DISABLED_CLASS,
            'hover:bg-destructive/10 hover:text-destructive'
          )}
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
