'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleTeamActive } from '@/app/actions/cantera';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
import { cn } from '@/lib/utils';

type Props = {
  teamId: string;
  teamName: string;
  active: boolean;
};

export function TeamPauseButton({ teamId, teamName, active }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await toggleTeamActive(teamId, !active);
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={active ? `Pausar ${teamName}` : `Reactivar ${teamName}`}
        title={
          active
            ? 'Pausar equipo (deja de mostrarse como activo; conserva datos e histórico)'
            : 'Reactivar equipo en la cantera'
        }
        onClick={() => setConfirmOpen(true)}
        className={cn(
          PORTAL_ACTION_ICON_CLASS,
          PORTAL_ACTION_ICON_DISABLED_CLASS,
          !active && 'text-muted-foreground'
        )}
      >
        {active ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>

      <PortalConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={active ? `¿Pausar ${teamName}?` : `¿Reactivar ${teamName}?`}
        description={
          active
            ? 'El equipo dejará de aparecer como activo en la cantera. Se conservan jugadores, staff asignado e histórico. Podrás reactivarlo cuando quieras.'
            : 'El equipo volverá a mostrarse como activo en listados, fichas y asignaciones de la cantera.'
        }
        confirmLabel={active ? 'Pausar equipo' : 'Reactivar equipo'}
        onConfirm={handleConfirm}
        pending={pending}
        destructive={active}
      />
    </>
  );
}
