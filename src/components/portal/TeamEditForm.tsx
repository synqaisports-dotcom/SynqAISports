'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { updateTeam, type ActionState } from '@/app/actions/cantera';
import type { CanteraCategory } from '@/lib/cantera-categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  teamId: string;
  name: string;
  sport: string;
  category: CanteraCategory | null;
};

export function TeamEditForm({ teamId, name, sport: initialSport, category }: Props) {
  const bound = updateTeam.bind(null, teamId);
  const [state, action, pending] = useFormState(bound, initial);
  const [sport, setSport] = useState(initialSport === 'futsal' ? 'futsal' : 'football');

  return (
    <form action={action} className="w-full space-y-6">
      <Card
        className={cn('w-full border', category?.borderClass ?? 'border-primary/25')}
      >
        <CardHeader>
          <CardTitle className="text-base">Editar equipo</CardTitle>
          {category ? (
            <Badge variant="outline" className={cn('w-fit text-[10px]', category.badgeClass)}>
              {category.name} · {category.international}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre del equipo
            </label>
            <Input
              name="name"
              defaultValue={name}
              required
              className="border-primary/30 bg-background/80"
            />
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Equipo actualizado.</p> : null}
      </div>
    </form>
  );
}
