'use client';

import { useState, useTransition } from 'react';
import { confirmTeamAttendance } from '@/app/actions/tournaments';
import type { SquadPlayer, TournamentBundle, TournamentTeam } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

type Props = {
  team: TournamentTeam;
  bundle: TournamentBundle;
};

export function DelegatePortal({ team, bundle }: Props) {
  const [squad, setSquad] = useState<SquadPlayer[]>(team.squad_json.length ? team.squad_json : defaultSquad());
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(team.status === 'confirmed');

  function defaultSquad(): SquadPlayer[] {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `new-${i}`,
      name: '',
      dorsal: i + 1,
    }));
  }

  function handleConfirm() {
    if (!team.invite_token) return;
    startTransition(async () => {
      const filled = squad.filter((p) => p.name.trim());
      const res = await confirmTeamAttendance(team.invite_token!, filled);
      if (res.ok) setDone(true);
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-background p-4">
      <div className="portal-section-surface rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Portal delegado</p>
        <h1 className="mt-2 text-xl font-semibold">{bundle.tournament.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{team.name}</p>
      </div>

      {done ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-8 text-center">
          <Check className="size-10 text-cyan-300" />
          <p className="font-medium">Asistencia confirmada</p>
          <p className="text-sm text-muted-foreground">Gracias. Nos vemos en el torneo.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Confirma la asistencia y completa la plantilla con dorsales.
          </p>
          {squad.map((player, idx) => (
            <div key={player.id} className="flex gap-2">
              <input
                type="number"
                min={1}
                max={99}
                value={player.dorsal ?? ''}
                onChange={(e) => {
                  const next = [...squad];
                  next[idx] = { ...player, dorsal: Number(e.target.value) || null };
                  setSquad(next);
                }}
                className="w-16 rounded-lg border border-border bg-background/50 px-2 py-2 text-center text-sm"
              />
              <input
                value={player.name}
                onChange={(e) => {
                  const next = [...squad];
                  next[idx] = { ...player, name: e.target.value };
                  setSquad(next);
                }}
                placeholder="Nombre jugador"
                className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
              />
            </div>
          ))}
          <Button className="w-full" onClick={handleConfirm} disabled={pending}>
            Confirmar asistencia
          </Button>
        </div>
      )}
    </div>
  );
}
