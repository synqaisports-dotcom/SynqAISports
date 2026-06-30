import Image from 'next/image';
import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import type { CanteraCategory } from '@/lib/cantera-categories';
import { playerDisplayName } from '@/lib/cantera-teams';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type TeamViewPlayer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  position: string | null;
  photo_url: string | null;
  jersey_number: number | null;
};

type TeamData = {
  id: string;
  name: string;
  team_letter: string | null;
  sport: string;
  active: boolean;
  categoryName: string;
  teamPurpose?: string;
  trainingSummary?: string;
  matchVenueSummary?: string;
  externalVenueAddress?: string | null;
};

type Props = {
  team: TeamData;
  category: CanteraCategory | null;
  players: TeamViewPlayer[];
};

export function TeamViewSections({ team, category, players }: Props) {
  const sportLabel = team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';

  return (
    <div className="grid w-full gap-6 lg:grid-cols-2">
      <Card
        className={cn(
          'h-fit border',
          category?.borderClass ?? 'border-primary/25',
          category?.ringClass
        )}
      >
        <CardHeader>
          <CardTitle className="text-base">Datos del equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <DataRow label="Nombre" value={team.name} />
          <DataRow label="Categoría" value={category?.name ?? team.categoryName} />
          <DataRow label="Letra" value={team.team_letter ?? '—'} />
          <DataRow label="Edades" value={category?.ages ?? '—'} />
          <DataRow label="Equivalencia" value={category?.international ?? '—'} />
          <DataRow label="Deporte" value={sportLabel} />
          <DataRow label="Tipo" value={team.teamPurpose ?? '—'} />
          <DataRow label="Entrenamiento" value={team.trainingSummary ?? 'Sin asignar'} />
          <DataRow label="Sede partidos" value={team.matchVenueSummary ?? '—'} />
          {team.externalVenueAddress ? (
            <DataRow label="Dirección sede" value={team.externalVenueAddress} />
          ) : null}
          <DataRow label="Estado" value={team.active ? 'Activo' : 'Pausado'} />
          {category ? (
            <p className="rounded-lg border border-primary/15 bg-muted/10 p-3 text-xs leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="h-fit border border-primary/25">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Jugadores</CardTitle>
          <Badge variant="secondary">{players.length}</Badge>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Sin jugadores asignados. Asígnalos desde la ficha de cada jugador en Cantera.
            </p>
          ) : (
            <ul className="space-y-3">
              {players.map((player) => (
                <li key={player.id}>
                  <Link
                    href={`/portal/cantera/jugadores?player=${player.id}`}
                    className="flex items-center gap-3 rounded-xl border border-primary/20 bg-muted/5 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-muted/20">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={playerDisplayName(
                            player.first_name,
                            player.last_name,
                            player.display_name
                          )}
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
                        {player.first_name ?? player.display_name.split(' ')[0]}
                      </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {player.last_name ??
                              (player.display_name.split(' ').slice(1).join(' ') || '—')}
                          </p>
                      <p className="mt-0.5 text-xs text-primary/80">
                        {player.position ?? 'Sin demarcación'}
                        {player.jersey_number != null ? ` · #${player.jersey_number}` : ''}
                      </p>
                    </div>
                    <User className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-primary/10 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  );
}
