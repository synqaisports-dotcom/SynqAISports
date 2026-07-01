'use client';

import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { updateTeam, type ActionState } from '@/app/actions/cantera';
import type { CanteraCategory } from '@/lib/cantera-categories';
import type { ClubFacility } from '@/lib/club-facilities';
import { formatTeamName, teamLetterOptions } from '@/lib/cantera-teams';
import type { TeamSetupData, TeamTrainingSlot } from '@/lib/team-setup';
import { TeamSetupFields } from '@/components/portal/TeamSetupFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  teamId: string;
  teamLetter: string;
  sport: string;
  category: CanteraCategory | null;
  usedLetters: string[];
  facilities: ClubFacility[];
  occupiedSlots: TeamTrainingSlot[];
  initialSetup: TeamSetupData;
  readOnly?: boolean;
};

export function TeamEditForm({
  teamId,
  teamLetter: initialLetter,
  sport: initialSport,
  category,
  usedLetters,
  facilities,
  occupiedSlots,
  initialSetup,
  readOnly,
}: Props) {
  const bound = updateTeam.bind(null, teamId);
  const [state, action, pending] = useFormState(bound, initial);
  const [sport, setSport] = useState(initialSport === 'futsal' ? 'futsal' : 'football');
  const availableLetters = useMemo(() => {
    const opts = teamLetterOptions(usedLetters);
    if (initialLetter && !opts.find((o) => o.value === initialLetter)) {
      return [{ value: initialLetter, label: initialLetter }, ...opts];
    }
    return opts.length > 0
      ? opts
      : initialLetter
        ? [{ value: initialLetter, label: initialLetter }]
        : [];
  }, [usedLetters, initialLetter]);

  const [teamLetter, setTeamLetter] = useState(initialLetter || availableLetters[0]?.value || '');
  const previewName =
    category && teamLetter ? formatTeamName(category.name, teamLetter) : '';

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="teamLetter" value={teamLetter} readOnly />

      <Card className={cn('w-full border', category?.borderClass ?? 'border-primary/25')}>
        <CardHeader>
          <CardTitle className="text-base">Editar equipo</CardTitle>
          {category ? (
            <Badge variant="outline" className={cn('w-fit text-[10px]', category.badgeClass)}>
              {category.name} · {category.international}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Letra del equipo
            </label>
            <SynqSelect
              value={teamLetter}
              onChange={setTeamLetter}
              options={availableLetters}
              placeholder="Seleccionar letra"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre generado
            </label>
            <Input value={previewName} disabled className="bg-muted/20 font-medium" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deporte
            </label>
            <SynqSelect
              value={sport}
              onChange={setSport}
              options={[
                { value: 'football', label: 'Fútbol' },
                { value: 'futsal', label: 'Fútbol sala' },
              ]}
            />
            <input type="hidden" name="sport" value={sport} readOnly />
          </div>
          {category ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Edades
              </label>
              <Input value={category.ages} disabled className="bg-muted/20" />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <TeamSetupFields
        facilities={facilities}
        occupiedSlots={occupiedSlots}
        initial={initialSetup}
        excludeTeamId={teamId}
        teamName={previewName || 'Este equipo'}
        disabled={readOnly}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending || !teamLetter || readOnly}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Equipo actualizado.</p> : null}
        {state.message === 'duplicate_letter' ? (
          <p className="text-sm text-destructive">Esa letra ya está en uso en esta categoría.</p>
        ) : null}
        {state.message === 'training_conflict' ? (
          <p className="text-sm text-destructive">
            El horario se solapa con otro equipo en la misma zona del campo.
          </p>
        ) : null}
      </div>
    </form>
  );
}
