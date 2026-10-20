'use client';

import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { updateCategoryObjectives, type ActionState } from '@/app/actions/methodology';
import { getCanteraCategory, type CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  OBJECTIVE_DIMENSION_META,
  type MethodologyObjectivesMap,
} from '@/lib/methodology-objectives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  categorySlug: CanteraCategorySlug;
  objectives: MethodologyObjectivesMap;
  canEdit: boolean;
  demoMode?: boolean;
  onSaved?: () => void;
  compact?: boolean;
  activeSport?: ClubPracticedSport;
};

export function CategoryObjectivesForm({
  categorySlug,
  objectives,
  canEdit,
  demoMode,
  onSaved,
  compact,
  activeSport = 'football',
}: Props) {
  const bound = updateCategoryObjectives.bind(null, categorySlug);
  const [state, action, pending] = useFormState(bound, initial);
  const rows = objectives[categorySlug];
  const category = getCanteraCategory(categorySlug);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  if (!canEdit) {
    return (
      <p className="text-sm text-muted-foreground">
        Solo el personal con permisos de metodología puede editar estos objetivos.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="sport" value={activeSport} readOnly />
      {!compact ? (
        <p className="text-sm text-muted-foreground">
          Objetivos formativos de <span className="font-medium text-foreground">{category?.name}</span>
          {category ? ` (${category.ages})` : ''}.
        </p>
      ) : null}

      {OBJECTIVE_DIMENSION_META.map((dimension) => {
        const cell = rows[dimension.key];
        return (
          <div
            key={dimension.key}
            className="rounded-xl border border-primary/15 bg-muted/5 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
              {dimension.label}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-muted-foreground">
                  Enfoque / subtítulo
                </label>
                <Input
                  name={`${dimension.key}Label`}
                  defaultValue={cell.itemLabel}
                  className="portal-field-surface"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-muted-foreground">Contenido</label>
                <textarea
                  name={`${dimension.key}Content`}
                  rows={3}
                  defaultValue={cell.content}
                  className={cn(
                    'w-full rounded-md border portal-field-surface px-3 py-2 text-sm text-foreground',
                    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar categoría'}
        </Button>
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo guardar.</p>
        ) : null}
        {demoMode ? (
          <p className="text-xs text-muted-foreground">
            En demo los cambios se confirman al guardar si Supabase está conectado.
          </p>
        ) : null}
      </div>
    </form>
  );
}
