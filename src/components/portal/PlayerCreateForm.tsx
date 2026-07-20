'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { createPlayer, type ActionState } from '@/app/actions/cantera';
import { PlayerPositionsPicker } from '@/components/portal/PlayerPositionsPicker';
import { SynqNumericStepper } from '@/components/portal/SynqNumericStepper';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { playerBirthYearOptions } from '@/lib/player-form';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import type { PlayerTeamOption } from '@/lib/player-teams';

const initial: ActionState = { ok: false };

type Props = {
  teams: PlayerTeamOption[];
  fixedTeamId?: string | null;
  demoMode?: boolean;
  onCreated?: (playerId: string) => void;
};

export function PlayerCreateForm({ teams, fixedTeamId, demoMode, onCreated }: Props) {
  const [state, action, pending] = useFormState(createPlayer, initial);
  const [jerseyNumber, setJerseyNumber] = useState<number | null>(null);
  const [birthYear, setBirthYear] = useState('');
  const [teamId, setTeamId] = useState(fixedTeamId ?? '');
  const [positions, setPositions] = useState('');

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === (fixedTeamId ?? teamId)) ?? null,
    [teams, fixedTeamId, teamId]
  );
  const sport: ClubPracticedSport = selectedTeam?.sport ?? 'football';

  const birthYearOptions = useMemo(() => playerBirthYearOptions(), []);
  const teamOptions = useMemo(
    () => [
      { value: '', label: 'Sin asignar por ahora' },
      ...teams.map((team) => ({
        value: team.id,
        label: `${team.name} · ${team.category}`,
      })),
    ],
    [teams]
  );

  const lockedTeam = fixedTeamId
    ? teams.find((team) => team.id === fixedTeamId) ?? null
    : null;

  useEffect(() => {
    if (state.ok && state.playerId) onCreated?.(state.playerId);
  }, [state.ok, state.playerId, onCreated]);

  return (
    <form action={action} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Alta rápida con los datos principales. Después podrás completar foto, médico y tutores en la
        ficha.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Nombre
          </label>
          <Input name="firstName" required className="border-primary/30 bg-background/80" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Apellidos
          </label>
          <Input name="lastName" className="border-primary/30 bg-background/80" />
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
        {lockedTeam ? (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Equipo
            </label>
            <div className="flex h-9 items-center rounded-md border border-primary/20 bg-muted/10 px-3 text-sm text-foreground">
              {lockedTeam.name} · {lockedTeam.category}
            </div>
            <input type="hidden" name="teamId" value={fixedTeamId ?? ''} readOnly />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Equipo
            </label>
            <SynqSelect
              value={teamId}
              onChange={setTeamId}
              options={teamOptions}
              placeholder="Sin asignar por ahora"
            />
            <input type="hidden" name="teamId" value={teamId} readOnly />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Posiciones
          </label>
          <PlayerPositionsPicker value={positions} onChange={setPositions} sport={sport} />
          <input type="hidden" name="position" value={positions} readOnly />
          <p className="mt-1.5 text-xs text-muted-foreground">Opcional. Puedes ajustarlas después.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creando…' : 'Crear jugador'}
        </Button>
        {state.ok ? (
          <p className="text-sm font-medium text-primary">Jugador creado. Abriendo ficha…</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo crear. Revisa permisos.</p>
        ) : null}
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">
            Revisa nombre, año de nacimiento y dorsal (0–99).
          </p>
        ) : null}
        {state.message === 'demo' ? (
          <p className="text-sm text-muted-foreground">
            En demo el alta no persiste en el listado; con Supabase se abrirá la ficha del nuevo jugador.
          </p>
        ) : null}
        {demoMode && state.message !== 'demo' ? (
          <p className="text-xs text-muted-foreground">
            En demo el formulario es funcional; la persistencia depende de Supabase.
          </p>
        ) : null}
      </div>
    </form>
  );
}
