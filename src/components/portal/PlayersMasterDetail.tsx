'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import { Camera, Pencil, Search, User, Users } from 'lucide-react';
import { updatePlayer, type ActionState } from '@/app/actions/cantera';
import { PlayerPauseButton } from '@/components/portal/PlayerPauseButton';
import { PlayerPhotoField } from '@/components/portal/PlayerPhotoField';
import { PlayerPositionsPicker } from '@/components/portal/PlayerPositionsPicker';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  playerFullName,
  playerSortKey,
  type PlayerProfile,
} from '@/lib/player-profile';
import {
  PLAYER_POSITIONS,
  playerHasPosition,
  positionShort,
  type PlayerPositionCode,
} from '@/lib/player-positions';
import { cn } from '@/lib/utils';

type SortDirection = 'asc' | 'desc';

type Props = {
  clubId: string;
  players: PlayerProfile[];
  initialPlayerId?: string | null;
  demoMode?: boolean;
};

const initial: ActionState = { ok: false };

function PlayerListPhoto({ player }: { player: PlayerProfile }) {
  const name = playerFullName(player);
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25 bg-muted/20">
      {player.photo_url ? (
        <Image src={player.photo_url} alt={name} fill className="object-cover" sizes="44px" />
      ) : (
        <Camera className="size-4 text-primary/70" strokeWidth={1.5} />
      )}
    </div>
  );
}

function PlayerDetailForm({
  clubId,
  player,
  demoMode,
  onSaved,
}: {
  clubId: string;
  player: PlayerProfile;
  demoMode?: boolean;
  onSaved?: () => void;
}) {
  const bound = updatePlayer.bind(null, player.id);
  const [state, action, pending] = useFormState(bound, initial);
  const [positions, setPositions] = useState(player.position ?? '');

  useEffect(() => {
    setPositions(player.position ?? '');
  }, [player.id, player.position]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Nombre
          </label>
          <Input
            name="firstName"
            defaultValue={player.first_name ?? player.display_name.split(' ')[0] ?? ''}
            required
            className="border-primary/30 bg-background/80"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Apellidos
          </label>
          <Input
            name="lastName"
            defaultValue={
              player.last_name ?? player.display_name.split(' ').slice(1).join(' ') ?? ''
            }
            className="border-primary/30 bg-background/80"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dorsal
          </label>
          <Input
            name="jerseyNumber"
            type="number"
            min={0}
            max={99}
            defaultValue={player.jersey_number ?? ''}
            className="border-primary/30 bg-background/80"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Posiciones
          </label>
          <PlayerPositionsPicker value={positions} onChange={setPositions} />
          <input type="hidden" name="position" value={positions} readOnly />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Puedes seleccionar varias posiciones. Pasa el ratón para ver el nombre completo.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Año de nacimiento
          </label>
          <Input
            name="birthYear"
            type="number"
            min={1990}
            max={2025}
            defaultValue={player.birth_year ?? ''}
            placeholder="Ej. 2012"
            className="border-primary/30 bg-background/80"
          />
        </div>
      </div>

      <PlayerPhotoField
        clubId={clubId}
        playerId={player.id}
        initialPhotoUrl={player.photo_url}
        playerName={playerFullName(player)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Ficha actualizada.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo guardar. Revisa permisos.</p>
        ) : null}
        {demoMode ? (
          <p className="text-xs text-muted-foreground">
            En demo el formulario es funcional; la persistencia depende de Supabase.
          </p>
        ) : null}
      </div>
    </form>
  );
}

function PlayerDetailPanel({
  clubId,
  player,
  demoMode,
}: {
  clubId: string;
  player: PlayerProfile | null;
  demoMode?: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);

  if (!player) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Users className="size-10 text-primary/50" />
          <p className="text-sm font-medium text-foreground">Selecciona un jugador</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Elige un jugador del listado para ver su ficha y modificar sus datos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const name = playerFullName(player);
  const actionButtonClass =
    'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <CardTitle className="text-lg font-semibold tracking-tight">{name}</CardTitle>
          <span className="text-sm font-medium text-primary">{player.team_name}</span>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-stretch">
          <div className="relative mx-auto min-h-[12rem] w-full max-w-[10rem] overflow-hidden rounded-2xl border border-primary/30 bg-muted/20 shadow-[0_0_24px_hsl(183_100%_50%_/_0.08)] sm:mx-0 sm:h-full sm:max-w-none">
            {player.photo_url ? (
              <Image src={player.photo_url} alt={name} fill className="object-cover" sizes="(max-width: 640px) 10rem, 33vw" />
            ) : (
              <div className="flex h-full min-h-[12rem] items-center justify-center">
                <User className="size-12 text-primary/60" strokeWidth={1.25} />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-background/95 via-background/55 to-transparent px-2 pb-2 pt-8">
              <button
                type="button"
                className={actionButtonClass}
                aria-label="Modificar ficha"
                title="Modificar ficha"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
              </button>

              {player.team_id ? (
                <Link
                  href={`/portal/cantera/equipos/equipo/${player.team_id}`}
                  className={actionButtonClass}
                  aria-label="Ver equipo"
                  title="Ver equipo"
                >
                  <Users className="size-4" />
                </Link>
              ) : null}

              <PlayerPauseButton playerId={player.id} playerName={name} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-primary/15 bg-muted/5 p-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Categoría
              </p>
              <p className="mt-0.5 text-sm text-foreground">{player.team_category || '—'}</p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Posiciones
              </p>
              <div className="mt-2">
                <PlayerPositionsPicker value={player.position} readOnly />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Dorsal
                </p>
                <p className="mt-0.5 text-sm text-foreground">
                  {player.jersey_number != null ? `#${player.jersey_number}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Año nacimiento
                </p>
                <p className="mt-0.5 text-sm text-foreground">
                  {player.birth_year ? String(player.birth_year) : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-primary/20 sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Modificar ficha</SheetTitle>
              <SheetDescription>
                Actualiza los datos de {name}. Para cambiar de equipo, usa Cantera → Equipos.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6">
              <PlayerDetailForm
                key={player.id}
                clubId={clubId}
                player={player}
                demoMode={demoMode}
                onSaved={() => setEditOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}

export function PlayersMasterDetail({
  clubId,
  players,
  initialPlayerId,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPlayerId && players.some((player) => player.id === initialPlayerId)
      ? initialPlayerId
      : players[0]?.id ?? null
  );

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...players];

    if (query) {
      list = list.filter((player) => {
        const haystack = [
          player.first_name,
          player.last_name,
          player.display_name,
          player.team_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    if (positionFilter !== 'all') {
      list = list.filter((player) =>
        playerHasPosition(player.position, positionFilter as PlayerPositionCode)
      );
    }

    list.sort((a, b) => {
      const cmp = playerSortKey(a).localeCompare(playerSortKey(b), 'es');
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [players, search, positionFilter, sortDirection]);

  const selectedPlayer =
    players.find((player) => player.id === selectedId) ??
    filteredPlayers[0] ??
    null;

  useEffect(() => {
    if (selectedId && !players.some((player) => player.id === selectedId)) {
      setSelectedId(players[0]?.id ?? null);
    }
  }, [players, selectedId]);

  const handleSelect = (playerId: string) => {
    setSelectedId(playerId);
    router.replace(`/portal/cantera/jugadores?player=${playerId}`, { scroll: false });
  };

  const positionOptions = [
    { value: 'all', label: 'Todas las posiciones' },
    ...PLAYER_POSITIONS.map((item) => ({
      value: item.code,
      label: `${item.short} · ${item.label}`,
    })),
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div>
            <CardTitle className="text-base">Plantilla</CardTitle>
            <CardDescription>
              {filteredPlayers.length} de {players.length} jugadores
            </CardDescription>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o apellidos…"
                className="border-primary/30 bg-background/80 pl-9"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={positionFilter}
                onChange={setPositionFilter}
                options={positionOptions}
                placeholder="Posición"
              />
              <SynqSelect
                value={sortDirection}
                onChange={(value) => setSortDirection(value as SortDirection)}
                options={[
                  { value: 'asc', label: 'A → Z (apellidos)' },
                  { value: 'desc', label: 'Z → A (apellidos)' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredPlayers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay jugadores con esos filtros.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredPlayers.map((player) => {
                const active = selectedPlayer?.id === player.id;
                const firstName =
                  player.first_name ?? player.display_name.split(' ')[0] ?? player.display_name;
                const lastName =
                  player.last_name ?? player.display_name.split(' ').slice(1).join(' ') ?? '';

                return (
                  <li key={player.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(player.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(183_100%_50%)]'
                          : 'border-primary/15 bg-muted/5 hover:border-primary/30 hover:bg-primary/5'
                      )}
                    >
                      <PlayerListPhoto player={player} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {firstName}{' '}
                          <span className="font-medium text-muted-foreground">{lastName}</span>
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{player.team_name}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {player.jersey_number != null ? (
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {player.jersey_number}
                          </span>
                        ) : null}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {positionShort(player.position)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <PlayerDetailPanel
        clubId={clubId}
        player={selectedPlayer}
        demoMode={demoMode}
      />
    </div>
  );
}
