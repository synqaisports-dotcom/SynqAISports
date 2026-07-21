'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleFacilityActive } from '@/app/actions/club-facilities';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
import { cn } from '@/lib/utils';

type Props = {
  facilityId: string;
  active: boolean;
};

export function FacilityPauseButton({ facilityId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={active ? 'Pausar instalación' : 'Reactivar instalación'}
      title={
        active
          ? 'Pausar (no aparece al asignar equipos; conserva histórico)'
          : 'Reactivar instalación'
      }
      onClick={() => {
        startTransition(async () => {
          await toggleFacilityActive(facilityId, !active);
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
  );
}
