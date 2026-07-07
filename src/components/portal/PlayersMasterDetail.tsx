'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import { Camera, FileText, Pencil, Search, User, UserPlus, Users } from 'lucide-react';
import { updatePlayer, type ActionState } from '@/app/actions/cantera';
import { PlayerClubHistorySection } from '@/components/portal/PlayerClubHistorySection';
import { PlayerCreateForm } from '@/components/portal/PlayerCreateForm';
import { PlayerDocumentsForm } from '@/components/portal/PlayerDocumentsForm';
import { PlayerGuardiansForm } from '@/components/portal/PlayerGuardiansForm';
import { PlayerGuardiansSummary } from '@/components/portal/PlayerGuardiansSummary';
import { PlayerMedicalBadge } from '@/components/portal/PlayerMedicalBadge';
import { PlayerPauseButton } from '@/components/portal/PlayerPauseButton';
import { PlayerPhotoField } from '@/components/portal/PlayerPhotoField';
import { PlayerPositionsPicker } from '@/components/portal/PlayerPositionsPicker';
import { SynqNumericStepper } from '@/components/portal/SynqNumericStepper';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  comparePlayersForList,
  playerFullName,
  type PlayerListSortMode,
  type PlayerProfile,
} from '@/lib/player-profile';
import { playerBirthYearOptions } from '@/lib/player-form';
import { emptyPlayerGuardian } from '@/lib/player-guardians';
import type { PlayerTeamOption } from '@/lib/player-teams';
import {
  PLAYER_POSITIONS,
  playerHasPosition,
  positionShort,
  type PlayerPositionCode,
} from '@/lib/player-positions';
import { cn } from '@/lib/utils';

type Props = {
  clubId: string;
  players: PlayerProfile[];
  teams: PlayerTeamOption[];
  initialPlayerId?: string | null;
  initialTeamFilter?: string | null;
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
  const [jerseyNumber, setJerseyNumber] = useState<number | null>(player.jersey_number);
  const [birthYear, setBirthYear] = useState(player.birth_year ? String(player.birth_year) : '');
  const [isMinor, setIsMinor] = useState(player.is_minor);
  const [showSecondGuardian, setShowSecondGuardian] = useState(player.guardians.length > 1);
  const birthYearOptions = useMemo(
    () => [{ value: '', label: 'Sin especificar' }, ...playerBirthYearOptions()],
    []
  );
  const tutor1 = player.guardians[0] ?? emptyPlayerGuardian();
  const tutor2 = player.guardians[1] ?? emptyPlayerGuardian();

  useEffect(() => {
    setPositions(player.position ?? '');
    setJerseyNumber(player.jersey_number);
    setBirthYear(player.birth_year ? String(player.birth_year) : '');
    setIsMinor(player.is_minor);
    setShowSecondGuardian(player.guardians.length > 1);
  }, [player.id, player.position, player.jersey_number, player.birth_year, player.is_minor, player.guardians.length]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  return (
    <form action={action} className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-primary/25 bg-muted/5 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isMinor}
          onChange={(event) => {
            setIsMinor(event.target.checked);
            if (!event.target.checked) setShowSecondGuardian(false);
          }}
          className="size-4 rounded border-primary/40 bg-background/80 text-primary focus:ring-primary"
        />
        <span className="text-sm font-medium text-foreground">Es menor de edad</span>
      </label>
      <input type="hidden" name="isMinor" value={isMinor ? 'true' : 'false'} readOnly />

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
          <SynqNumericStepper
            name="jerseyNumber"
            value={jerseyNumber}
            onChange={setJerseyNumber}
            min={0}
            max={99}
            placeholder="Sin dorsal"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Año de nacimiento
          </label>
          <SynqSelect
            value={birthYear}
            onChange={setBirthYear}
            options={birthYearOptions}
            placeholder="Seleccionar año"
          />
          <input type="hidden" name="birthYear" value={birthYear} readOnly />
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
      </div>

      <PlayerPhotoField
        clubId={clubId}
        playerId={player.id}
        initialPhotoUrl={player.photo_url}
        playerName={playerFullName(player)}
      />

      {isMinor ? (
        <PlayerGuardiansForm
          key={`${player.id}-${showSecondGuardian ? '2' : '1'}`}
          tutor1={tutor1}
          tutor2={tutor2}
          showSecond={showSecondGuardian}
          onAddSecond={() => setShowSecondGuardian(true)}
          onRemoveSecond={() => setShowSecondGuardian(false)}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Ficha actualizada.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo guardar. Revisa permisos.</p>
        ) : null}
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">
            Revisa los datos: nombre obligatorio, dorsal, año, y tutores completos si es menor.
          </p>
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
  const [docsOpen, setDocsOpen] = useState(false);

  if (!player) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Users className="size-10 text-primary/50" />
          <p className="text-sm font-medium text-foreground">Selecciona un jugador</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Elige un jugador del listado o crea uno nuevo con el icono de añadir.
          </p>
        </CardContent>
      </Card>
    );
  }

  const name = playerFullName(player);
  const actionButtonClass =
    'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';
  const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <CardTitle className="text-lg font-semibold tracking-tight">{name}</CardTitle>
          <span className="text-sm font-medium text-primary">{player.team_name}</span>
          <PlayerMedicalBadge player={player} />
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

              <button
                type="button"
                className={actionButtonClass}
                aria-label="Documentación del jugador"
                title="Documentación"
                onClick={() => setDocsOpen(true)}
              >
                <FileText className="size-4" />
              </button>

              {player.team_id ? (
                <Link
                  href={`/portal/cantera/equipos?team=${player.team_id}`}
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

          <div className={`${sectionClass} space-y-4`}>
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

        <PlayerGuardiansSummary player={player} />

        <PlayerClubHistorySection player={player} />

        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-primary/20 sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Modificar ficha</SheetTitle>
            </SheetHeader>

            <div className="mt-4">
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

        <Sheet open={docsOpen} onOpenChange={setDocsOpen}>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-primary/20 sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle>Documentación</SheetTitle>
            </SheetHeader>

            <div className="mt-4">
              <PlayerDocumentsForm
                key={player.id}
                clubId={clubId}
                player={player}
                demoMode={demoMode}
                onSaved={() => setDocsOpen(false)}
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
  teams,
  initialPlayerId,
  initialTeamFilter,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState(initialTeamFilter ?? 'all');
  const [sortMode, setSortMode] = useState<PlayerListSortMode>('category');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPlayerId && players.some((player) => player.id === initialPlayerId)
      ? initialPlayerId
      : players[0]?.id ?? null
  );
  const rosterActionClass =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

  useEffect(() => {
    if (initialTeamFilter) setTeamFilter(initialTeamFilter);
  }, [initialTeamFilter]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...players];

    if (teamFilter !== 'all') {
      list = list.filter((player) => player.team_id === teamFilter);
    }

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

    list.sort((a, b) => comparePlayersForList(a, b, sortMode));

    return list;
  }, [players, search, positionFilter, teamFilter, sortMode]);

  const teamFilterLabel = useMemo(() => {
    if (teamFilter === 'all') return null;
    return teams.find((team) => team.id === teamFilter)?.name ?? null;
  }, [teamFilter, teams]);

  const selectedPlayer =
    players.find((player) => player.id === selectedId) ??
    filteredPlayers[0] ??
    null;

  useEffect(() => {
    if (initialPlayerId && players.some((player) => player.id === initialPlayerId)) {
      setSelectedId(initialPlayerId);
    }
  }, [initialPlayerId, players]);

  useEffect(() => {
    if (selectedId && !players.some((player) => player.id === selectedId)) {
      setSelectedId(players[0]?.id ?? null);
    }
  }, [players, selectedId]);

  const handleSelect = (playerId: string) => {
    setSelectedId(playerId);
    router.replace(`/portal/cantera/jugadores?player=${playerId}`, { scroll: false });
  };

  const handlePlayerCreated = (playerId: string) => {
    setCreateOpen(false);
    setSelectedId(playerId);
    router.replace(`/portal/cantera/jugadores?player=${playerId}`, { scroll: false });
    router.refresh();
  };

  const teamFilterOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos los equipos' },
      ...teams.map((team) => ({
        value: team.id,
        label: `${team.name} · ${team.category}`,
      })),
    ],
    [teams]
  );

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
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Plantilla</CardTitle>
              <CardDescription>
                {filteredPlayers.length} de {players.length} jugadores
                {teamFilterLabel ? ` · ${teamFilterLabel}` : ''}
              </CardDescription>
            </div>
            <button
              type="button"
              className={rosterActionClass}
              aria-label="Nuevo jugador"
              title="Nuevo jugador"
              onClick={() => setCreateOpen(true)}
            >
              <UserPlus className="size-4" />
            </button>
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
                value={teamFilter}
                onChange={setTeamFilter}
                options={teamFilterOptions}
                placeholder="Equipo"
              />
              <SynqSelect
                value={positionFilter}
                onChange={setPositionFilter}
                options={positionOptions}
                placeholder="Posición"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <SynqSelect
                value={sortMode}
                onChange={(value) => setSortMode(value as PlayerListSortMode)}
                options={[
                  { value: 'category', label: 'Por categoría' },
                  { value: 'name-asc', label: 'A → Z (apellidos)' },
                  { value: 'name-desc', label: 'Z → A (apellidos)' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredPlayers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {players.length === 0
                ? 'No hay jugadores todavía. Pulsa + para crear el primero.'
                : 'No hay jugadores con esos filtros.'}
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {firstName}{' '}
                            <span className="font-medium text-muted-foreground">{lastName}</span>
                          </p>
                          <PlayerMedicalBadge player={player} />
                        </div>
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

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Nuevo jugador</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <PlayerCreateForm
              teams={teams}
              demoMode={demoMode}
              onCreated={handlePlayerCreated}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
