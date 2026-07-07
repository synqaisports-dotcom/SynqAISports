'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause } from 'lucide-react';
import { togglePlayerActive } from '@/app/actions/cantera';
import { cn } from '@/lib/utils';

type Props = {
  playerId: string;
  playerName: string;
};

export function PlayerPauseButton({ playerId, playerName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={`Pausar a ${playerName}`}
      title="Pausar jugador (baja del equipo; conserva histórico)"
      onClick={() => {
        if (
          !window.confirm(
            `¿Pausar a ${playerName}? Dejará de aparecer en la plantilla activa, pero se conserva su historial.`
          )
        ) {
          return;
        }

        startTransition(async () => {
          await togglePlayerActive(playerId, false);
          router.refresh();
        });
      }}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors',
        'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
        'disabled:opacity-50'
      )}
    >
      <Pause className="size-4" />
    </button>
  );
}
