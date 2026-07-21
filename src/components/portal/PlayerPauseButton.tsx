'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause } from 'lucide-react';
import { togglePlayerActive } from '@/app/actions/cantera';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
import { cn } from '@/lib/utils';

type Props = {
  playerId: string;
  playerName: string;
};

export function PlayerPauseButton({ playerId, playerName }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await togglePlayerActive(playerId, false);
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={`Pausar a ${playerName}`}
        title="Pausar jugador (baja del equipo; conserva histórico)"
        onClick={() => setConfirmOpen(true)}
        className={cn(PORTAL_ACTION_ICON_CLASS, PORTAL_ACTION_ICON_DISABLED_CLASS)}
      >
        <Pause className="size-4" />
      </button>

      <PortalConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`¿Pausar a ${playerName}?`}
        description="Dejará de aparecer en la plantilla activa del club. Se conserva su historial, ficha y datos. La acción que se ejecutará es pausar al jugador."
        confirmLabel="Pausar jugador"
        onConfirm={handleConfirm}
        pending={pending}
        destructive
      />
    </>
  );
}
