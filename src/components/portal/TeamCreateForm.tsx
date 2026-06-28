'use client';

import { useFormState } from 'react-dom';
import { createTeam, type ActionState } from '@/app/actions/cantera';
import type { CanteraCategory } from '@/lib/cantera-categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  category: CanteraCategory;
};

export function TeamCreateForm({ category }: Props) {
  const bound = createTeam;
  const [state, action, pending] = useFormState(bound, initial);
  const [sport, setSport] = useState('football');

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="categorySlug" value={category.slug} readOnly />
      <input type="hidden" name="category" value={category.name} readOnly />

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
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre del equipo
            </label>
            <Input
              name="name"
              required
              placeholder={`${category.name} A`}
              className="border-primary/30 bg-background/80"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Ejemplo: letra (A, B), color o nombre propio del club en esa categoría.
            </p>
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
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creando…' : 'Crear equipo'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Equipo creado.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al crear. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
