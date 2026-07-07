import Image from 'next/image';
import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import { playerDisplayName } from '@/lib/cantera-teams';
import { positionShort } from '@/lib/player-positions';
import type { TeamViewPlayer } from '@/components/portal/TeamViewSections';
import { Badge } from '@/components/ui/badge';

type Props = {
  teamId: string;
  teamName: string;
  players: TeamViewPlayer[];
};

export function TeamRosterList({ teamId, teamName, players }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Jugadores asignados a <span className="font-medium text-foreground">{teamName}</span>
        </p>
        <Badge variant="secondary">{players.length}</Badge>
      </div>

      {players.length === 0 ? (
        <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Sin jugadores en esta plantilla. Asígnalos desde la ficha de cada jugador o desde el alta
          rápida en Jugadores.
        </p>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => {
            const name = playerDisplayName(
              player.first_name,
              player.last_name,
              player.display_name
            );
            const firstName = player.first_name ?? player.display_name.split(' ')[0] ?? name;
            const lastName =
              player.last_name ?? player.display_name.split(' ').slice(1).join(' ') ?? '';

            return (
              <li key={player.id}>
                <Link
                  href={`/portal/cantera/jugadores?player=${player.id}`}
                  className="flex items-center gap-3 rounded-xl border border-primary/20 bg-muted/5 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-muted/20">
                    {player.photo_url ? (
                      <Image
                        src={player.photo_url}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <Camera className="size-5 text-primary/70" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {firstName}{' '}
                      <span className="font-medium text-muted-foreground">{lastName}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-primary/80">
                      {positionShort(player.position)}
                      {player.jersey_number != null ? ` · #${player.jersey_number}` : ''}
                    </p>
                  </div>
                  <User className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href={`/portal/cantera/jugadores?team=${teamId}`}
        className="block text-center text-xs text-primary hover:underline"
      >
        Abrir gestión completa en Jugadores
      </Link>
    </div>
  );
}
