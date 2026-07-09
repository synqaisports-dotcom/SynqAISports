'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import {
  mergeTeamRosters,
  promoteTeamSeason,
  type SeasonActionState,
} from '@/app/actions/team-season';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CANTERA_CATEGORIES,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import { playerDisplayName } from '@/lib/cantera-teams';
import type { PlayerTeamOption } from '@/lib/player-teams';
import type { TeamProfile } from '@/lib/team-profile';
import {
  birthYearWarningsForCategory,
  defaultSeasonLabel,
  getNextCategorySlug,
  previewTeamName,
  suggestPromotionTarget,
  type PlayerSeasonDecision,
} from '@/lib/team-season';
import { usedTeamLettersInCategory } from '@/lib/team-profile';
import { cn } from '@/lib/utils';

type Mode = 'promote' | 'letter' | 'merge';

type Props = {
  team: TeamProfile;
  teams: TeamProfile[];
  teamOptions: PlayerTeamOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initial: SeasonActionState = { ok: false };

export function TeamSeasonPromoteSheet({
  team,
  teams,
  teamOptions,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const promoteBound = promoteTeamSeason;
  const mergeBound = mergeTeamRosters;
  const [promoteState, promoteAction, promotePending] = useFormState(promoteBound, initial);
  const [mergeState, mergeAction, mergePending] = useFormState(mergeBound, initial);

  const suggestion = useMemo(() => suggestPromotionTarget(team), [team]);
  const [mode, setMode] = useState<Mode>('promote');
  const [seasonLabel, setSeasonLabel] = useState(defaultSeasonLabel());
  const [targetCategorySlug, setTargetCategorySlug] = useState<CanteraCategorySlug>(
    suggestion?.categorySlug ?? team.category_slug ?? 'alevin'
  );
  const [targetTeamLetter, setTargetTeamLetter] = useState(
    suggestion?.teamLetter ?? team.team_letter ?? 'A'
  );
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [pauseSource, setPauseSource] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, PlayerSeasonDecision>>({});

  const usedLetters = usedTeamLettersInCategory(teams, targetCategorySlug, team.id);
  const letterOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
    value: letter,
    label: letter,
    disabled: usedLetters.includes(letter) && letter !== targetTeamLetter,
  }));

  const playerRows = useMemo(
    () =>
      team.players.map((player) => ({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        display_name: player.display_name,
        birth_year: player.birth_year ?? null,
      })),
    [team.players]
  );

  const warnings = useMemo(
    () =>
      mode === 'merge'
        ? []
        : birthYearWarningsForCategory(playerRows, targetCategorySlug),
    [mode, playerRows, targetCategorySlug]
  );

  const previewName = previewTeamName(targetCategorySlug, targetTeamLetter);
  const pending = promotePending || mergePending;
  const state = mode === 'merge' ? mergeState : promoteState;

  useEffect(() => {
    if (!open) return;
    const next = suggestPromotionTarget(team);
    setMode('promote');
    setSeasonLabel(defaultSeasonLabel());
    setTargetCategorySlug(next?.categorySlug ?? team.category_slug ?? 'alevin');
    setTargetTeamLetter(next?.teamLetter ?? team.team_letter ?? 'A');
    setMergeTargetId('');
    setDecisions({});
  }, [open, team]);

  useEffect(() => {
    if (state.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state.ok, onOpenChange, router]);

  const playerDecisionsJson = JSON.stringify(
    Object.values(decisions).filter((item) => item.action !== 'promote')
  );

  const setPlayerAction = (
    playerId: string,
    action: PlayerSeasonDecision['action'],
    targetTeamId?: string
  ) => {
    setDecisions((prev) => ({
      ...prev,
      [playerId]: { playerId, action, targetTeamId },
    }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cierre de temporada · {team.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ['promote', 'Ascenso categoría'],
                ['letter', 'Cambio letra'],
                ['merge', 'Fusionar'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setMode(value);
                  if (value === 'letter' && team.category_slug) {
                    setTargetCategorySlug(team.category_slug);
                  }
                }}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                  mode === value
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-primary/15 text-muted-foreground hover:border-primary/30'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Temporada
            </label>
            <Input
              value={seasonLabel}
              onChange={(event) => setSeasonLabel(event.target.value)}
              placeholder="2025/26"
              className="border-primary/30 bg-background/80"
            />
          </div>

          {mode === 'merge' ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Fusionar plantilla en
                </label>
                <SynqSelect
                  value={mergeTargetId}
                  onChange={setMergeTargetId}
                  options={teamOptions
                    .filter((item) => item.id !== team.id)
                    .map((item) => ({
                      value: item.id,
                      label: `${item.name} · ${item.category}`,
                    }))}
                  placeholder="Seleccionar equipo destino"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={pauseSource}
                  onChange={(event) => setPauseSource(event.target.checked)}
                  className="size-4 rounded border-primary/40"
                />
                Pausar {team.name} tras la fusión
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Categoría destino
                  </label>
                  <SynqSelect
                    value={targetCategorySlug}
                    onChange={(value) => setTargetCategorySlug(value as CanteraCategorySlug)}
                    options={CANTERA_CATEGORIES.map((category) => ({
                      value: category.slug,
                      label: category.name,
                    }))}
                    disabled={mode === 'letter'}
                  />
                  {mode === 'promote' && team.category_slug ? (
                    <button
                      type="button"
                      className="mt-1 text-xs text-primary hover:underline"
                      onClick={() => {
                        const next = getNextCategorySlug(team.category_slug!);
                        if (next) setTargetCategorySlug(next);
                      }}
                    >
                      Usar categoría siguiente
                    </button>
                  ) : null}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Letra
                  </label>
                  <SynqSelect
                    value={targetTeamLetter}
                    onChange={setTargetTeamLetter}
                    options={letterOptions}
                  />
                </div>
              </div>
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Vista previa: </span>
                <span className="font-medium text-foreground">
                  {team.name} → {previewName}
                </span>
              </p>
            </>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Jugadores ({team.players.length})
            </p>
            {team.players.length === 0 ? (
              <p className="text-sm text-muted-foreground">Plantilla vacía.</p>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {team.players.map((player) => {
                  const name = playerDisplayName(
                    player.first_name,
                    player.last_name,
                    player.display_name
                  );
                  const warning = warnings.find((item) => item.playerId === player.id);
                  const decision = decisions[player.id];

                  return (
                    <li
                      key={player.id}
                      className="rounded-lg border border-primary/15 bg-muted/5 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{name}</span>
                        {player.birth_year ? (
                          <span className="text-xs text-muted-foreground">
                            {player.birth_year}
                          </span>
                        ) : null}
                      </div>
                      {warning ? (
                        <p className="mt-1 text-xs text-amber-400/90">{warning.message}</p>
                      ) : null}
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <SynqSelect
                          value={decision?.action ?? 'promote'}
                          onChange={(value) =>
                            setPlayerAction(
                              player.id,
                              value as PlayerSeasonDecision['action'],
                              decision?.targetTeamId ?? undefined
                            )
                          }
                          options={[
                            { value: 'promote', label: 'Asciende con el equipo' },
                            { value: 'unassign', label: 'Sin equipo' },
                            { value: 'move', label: 'Otro equipo' },
                          ]}
                        />
                        {decision?.action === 'move' ? (
                          <SynqSelect
                            value={decision.targetTeamId ?? ''}
                            onChange={(value) =>
                              setPlayerAction(player.id, 'move', value)
                            }
                            options={teamOptions
                              .filter((item) => item.id !== team.id)
                              .map((item) => ({
                                value: item.id,
                                label: item.name,
                              }))}
                            placeholder="Equipo destino"
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {mode === 'merge' ? (
            <form action={mergeAction} className="space-y-3">
              <input type="hidden" name="sourceTeamId" value={team.id} readOnly />
              <input type="hidden" name="targetTeamId" value={mergeTargetId} readOnly />
              <input type="hidden" name="pauseSource" value={pauseSource ? 'true' : 'false'} readOnly />
              <input type="hidden" name="seasonLabel" value={seasonLabel} readOnly />
              <input type="hidden" name="playerDecisionsJson" value={playerDecisionsJson} readOnly />
              <Button type="submit" disabled={pending || !mergeTargetId}>
                {pending ? 'Procesando…' : 'Confirmar fusión'}
              </Button>
            </form>
          ) : (
            <form action={promoteAction} className="space-y-3">
              <input type="hidden" name="teamId" value={team.id} readOnly />
              <input type="hidden" name="targetCategorySlug" value={targetCategorySlug} readOnly />
              <input type="hidden" name="targetTeamLetter" value={targetTeamLetter} readOnly />
              <input type="hidden" name="seasonLabel" value={seasonLabel} readOnly />
              <input type="hidden" name="playerDecisionsJson" value={playerDecisionsJson} readOnly />
              <Button type="submit" disabled={pending}>
                {pending ? 'Procesando…' : 'Confirmar cierre de temporada'}
              </Button>
            </form>
          )}

          {state.ok && state.report ? (
            <p className="text-sm font-medium text-primary">{state.report}</p>
          ) : null}
          {state.message === 'duplicate_letter' ? (
            <p className="text-sm text-destructive">
              Esa letra ya está ocupada en la categoría destino.
            </p>
          ) : null}
          {state.message === 'demo' ? (
            <p className="text-sm text-muted-foreground">
              En demo la operación es simulada; con Supabase se guardará en equipos y jugadores.
            </p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
