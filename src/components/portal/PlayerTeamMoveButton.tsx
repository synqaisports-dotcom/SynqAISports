'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft } from 'lucide-react';
import { movePlayerTeam } from '@/app/actions/cantera';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import { SynqSelect } from '@/components/portal/SynqSelect';
import type { PlayerTeamOption } from '@/lib/player-teams';
import { playerDisplayName } from '@/lib/cantera-teams';
import type { TeamViewPlayer } from '@/components/portal/TeamViewSections';
import { cn } from '@/lib/utils';

type Props = {
  player: TeamViewPlayer;
  currentTeamId: string;
  teams: PlayerTeamOption[];
};

export function PlayerTeamMoveButton({ player, currentTeamId, teams }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [pending, startTransition] = useTransition();

  const name = playerDisplayName(player.first_name, player.last_name, player.display_name);
  const options = teams
    .filter((team) => team.id !== currentTeamId)
    .map((team) => ({
      value: team.id,
      label: `${team.name} · ${team.category}`,
    }));
  const targetTeam = teams.find((team) => team.id === targetTeamId);

  const handleOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setTargetTeamId(options[0]?.value ?? '');
    setOpen(true);
  };

  const handleConfirm = () => {
    if (!targetTeamId) return;
    startTransition(async () => {
      const result = await movePlayerTeam(player.id, targetTeamId);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  if (options.length === 0) return null;

  return (
    <>
      <button
        type="button"
        className={cn(
          'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors',
          'hover:border-primary/30 hover:bg-primary/10 hover:text-primary'
        )}
        aria-label={`Cambiar equipo de ${name}`}
        title="Cambiar de equipo o ascender de categoría"
        onClick={handleOpen}
      >
        <ArrowRightLeft className="size-3.5" />
      </button>

      <PortalConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Mover a ${name}`}
        description="El movimiento quedará registrado en el histórico del jugador. Si el equipo destino es de otra categoría, se anotará como ascenso."
        confirmLabel="Confirmar movimiento"
        onConfirm={handleConfirm}
        pending={pending}
      >
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Equipo destino
        </label>
        <SynqSelect
          value={targetTeamId}
          onChange={setTargetTeamId}
          options={options}
          placeholder="Seleccionar equipo"
        />
        {targetTeam ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Destino: <span className="text-foreground">{targetTeam.name}</span>
          </p>
        ) : null}
      </PortalConfirmDialog>
    </>
  );
}
