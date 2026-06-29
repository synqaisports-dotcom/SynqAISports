'use client';

import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { createTeam, type ActionState } from '@/app/actions/cantera';
import type { CanteraCategory } from '@/lib/cantera-categories';
import type { ClubFacility } from '@/lib/club-facilities';
import { formatTeamName, teamLetterOptions } from '@/lib/cantera-teams';
import type { TeamTrainingSlot } from '@/lib/team-setup';
import { TeamSetupFields } from '@/components/portal/TeamSetupFields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  category: CanteraCategory;
  usedLetters: string[];
  facilities: ClubFacility[];
  occupiedSlots: TeamTrainingSlot[];
};

export function TeamCreateForm({ category, usedLetters, facilities, occupiedSlots }: Props) {
  const bound = createTeam;
  const [state, action, pending] = useFormState(bound, initial);
  const [sport, setSport] = useState('football');
  const letterOptions = useMemo(() => teamLetterOptions(usedLetters), [usedLetters]);
  const [teamLetter, setTeamLetter] = useState(letterOptions[0]?.value ?? '');

  const previewName = teamLetter ? formatTeamName(category.name, teamLetter) : '';

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="categorySlug" value={category.slug} readOnly />
      <input type="hidden" name="category" value={category.name} readOnly />
      <input type="hidden" name="teamLetter" value={teamLetter} readOnly />

      <Card className={cn('w-full border', category.borderClass)}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Nuevo equipo — {category.name}</CardTitle>
            <Badge variant="outline" className={cn('text-[10px]', category.badgeClass)}>
              {category.international}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Letra del equipo
            </label>
            {letterOptions.length > 0 ? (
              <SynqSelect
                value={teamLetter}
                onChange={setTeamLetter}
                options={letterOptions}
                placeholder="Seleccionar letra"
              />
            ) : (
              <p className="text-sm text-destructive">
                No quedan letras libres en {category.name} (A–Z ocupadas).
              </p>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Solo puede existir un {category.name} A, un {category.name} B, etc.
            </p>
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
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Edades de la categoría
            </label>
            <Input value={category.ages} disabled className="bg-muted/20" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Equivalencia internacional
            </label>
            <Input value={category.international} disabled className="bg-muted/20" />
          </div>
        </CardContent>
      </Card>

      <TeamSetupFields
        facilities={facilities}
        occupiedSlots={occupiedSlots}
        teamName={previewName || 'Este equipo'}
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending || !teamLetter || letterOptions.length === 0}>
          {pending ? 'Creando…' : 'Crear equipo'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Equipo creado.</p> : null}
        {state.message === 'duplicate_letter' ? (
          <p className="text-sm text-destructive">Esa letra ya está en uso en esta categoría.</p>
        ) : null}
        {state.message === 'training_conflict' ? (
          <p className="text-sm text-destructive">
            El horario se solapa con otro equipo en la misma zona del campo.
          </p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al crear. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
