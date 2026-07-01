'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleTeamActive } from '@/app/actions/cantera';
import { cn } from '@/lib/utils';

type Props = {
  teamId: string;
  active: boolean;
};

export function TeamPauseButton({ teamId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={active ? 'Pausar equipo' : 'Reactivar equipo'}
      title={
        active
          ? 'Pausar (conserva histórico, no elimina datos)'
          : 'Reactivar equipo'
      }
      onClick={() => {
        startTransition(async () => {
          await toggleTeamActive(teamId, !active);
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
