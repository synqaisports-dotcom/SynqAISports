'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
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
  active: boolean;
};

export function PlayerPauseButton({ playerId, playerName, active }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [localActive, setLocalActive] = useState(active);

  useEffect(() => {
    setLocalActive(active);
  }, [active, playerId]);

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await togglePlayerActive(playerId, !localActive);
      if (result.ok) {
        setLocalActive(!localActive);
        setConfirmOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={localActive ? `Pausar a ${playerName}` : `Reactivar a ${playerName}`}
        title={
          localActive
            ? 'Pausar jugador (baja de la plantilla activa; conserva histórico)'
            : 'Reactivar jugador en la cantera'
        }
        onClick={() => setConfirmOpen(true)}
        className={cn(
          PORTAL_ACTION_ICON_CLASS,
          PORTAL_ACTION_ICON_DISABLED_CLASS,
          !localActive && 'text-muted-foreground'
        )}
      >
        {localActive ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>

      <PortalConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={localActive ? `¿Pausar a ${playerName}?` : `¿Reactivar a ${playerName}?`}
        description={
          localActive
            ? 'Dejará de aparecer en la plantilla activa del club. Se conserva su historial, ficha y datos.'
            : 'El jugador volverá a mostrarse como activo en listados y fichas de la cantera.'
        }
        confirmLabel={localActive ? 'Pausar jugador' : 'Reactivar jugador'}
        onConfirm={handleConfirm}
        pending={pending}
        destructive={localActive}
      />
    </>
  );
}
