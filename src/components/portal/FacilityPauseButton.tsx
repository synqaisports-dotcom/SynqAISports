'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleFacilityActive } from '@/app/actions/club-facilities';
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
        'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors',
        'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
        'disabled:opacity-50'
      )}
    >
      {active ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}
