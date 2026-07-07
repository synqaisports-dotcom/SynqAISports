'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2, Plus, Search } from 'lucide-react';
import { assignExerciseToSlot } from '@/app/actions/methodology';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { assignExerciseToDemoSlot } from '@/lib/demo-microcycles-store';
import { isDemoMicrocycleId } from '@/lib/microcycle-sessions';
import type { SlotType } from '@/lib/methodology';
import { cn } from '@/lib/utils';

export type ExerciseLibraryItem = {
  id: string;
  title: string;
  task_type?: string | null;
  objectives?: string | null;
  notes?: string | null;
  sheet_json?: unknown;
  drawing_json?: unknown;
};

type Props = {
  exercises: ExerciseLibraryItem[];
  categorySlug: string | null;
  activeSlotId: string | null;
  activeSlotType: SlotType | null;
  microcycleId: string;
  sessionIndex: number;
  onAssigned: () => void;
};

const listItemClass = (active: boolean, disabled: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors',
    disabled && 'cursor-not-allowed opacity-50',
    !disabled && active && 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]',
    !disabled && !active && 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
  );

export function ExerciseLibraryPanel({
  exercises,
  categorySlug,
  activeSlotId,
  activeSlotType,
  microcycleId,
  sessionIndex,
  onAssigned,
}: Props) {
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (activeSlotType && exercise.task_type && exercise.task_type !== activeSlotType) {
        return false;
      }
      if (!q) return true;
      return exercise.title.toLowerCase().includes(q);
    });
  }, [exercises, query, activeSlotType]);

  const addExerciseHref = useMemo(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.set('categorySlug', categorySlug);
    if (activeSlotType) params.set('taskType', activeSlotType);
    if (activeSlotId) {
      params.set(
        'returnTo',
        `/portal/metodologia/microciclos/${microcycleId}/sesiones/${sessionIndex}`
      );
    }
    const qs = params.toString();
    return `/portal/metodologia/ejercicios/nuevo${qs ? `?${qs}` : ''}`;
  }, [activeSlotId, activeSlotType, categorySlug, microcycleId, sessionIndex]);

  const handleAssign = async (exercise: ExerciseLibraryItem) => {
    if (!activeSlotId) {
      setError('Selecciona primero un slot en la estructura de la sesión.');
      return;
    }

    setPendingId(exercise.id);
    setError(null);

    if (isDemoMicrocycleId(microcycleId)) {
      const ok = assignExerciseToDemoSlot(microcycleId, activeSlotId, {
        id: exercise.id,
        title: exercise.title,
        sheet_json: exercise.sheet_json,
        objectives: exercise.objectives ?? undefined,
        notes: exercise.notes ?? undefined,
        drawing_json: exercise.drawing_json,
      });
      setPendingId(null);
      if (!ok) {
        setError('No se pudo asignar en modo demo.');
        return;
      }
      onAssigned();
      return;
    }

    const result = await assignExerciseToSlot(activeSlotId, exercise.id);
    setPendingId(null);
    if (!result.ok) {
      setError('No se pudo asignar el ejercicio al slot.');
      return;
    }
    onAssigned();
  };

  return (
    <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
      <CardHeader className="space-y-3 pb-3">
        <div>
          <CardTitle className="text-base">Biblioteca de ejercicios</CardTitle>
          <CardDescription>
            {categorySlug ? `Categoría: ${categorySlug}` : 'Todo el club'}
            {activeSlotType ? ` · filtro: ${activeSlotType}` : ''}
            {' · '}
            {filtered.length} de {exercises.length}
          </CardDescription>
        </div>
        <p className="text-xs text-muted-foreground">
          Misma biblioteca que en{' '}
          <Link href="/portal/metodologia/ejercicios" className="text-primary hover:underline">
            Ejercicios
          </Link>
          {activeSlotType ? ', filtrada para el slot activo' : ''}.
        </p>
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ejercicio…"
              className="border-primary/30 bg-background/80 pl-9"
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full gap-2" asChild>
            <Link href={addExerciseHref}>
              <Plus className="size-4" />
              Añadir ejercicio
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
        {error ? (
          <p className="mb-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {!activeSlotId ? (
          <p className="mb-3 rounded-lg border border-dashed border-primary/20 px-4 py-6 text-center text-xs text-muted-foreground">
            Elige un slot a la izquierda (calentamiento, principal o vuelta a la calma) para asignar
            un ejercicio.
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
            Sin ejercicios.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filtered.map((exercise) => {
              const isPending = pendingId === exercise.id;
              const disabled = !activeSlotId || isPending;

              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => void handleAssign(exercise)}
                    className={listItemClass(false, disabled)}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
                      <BookOpen className="size-4 text-primary/80" strokeWidth={1.5} />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {exercise.title}
                    </span>
                    {isPending ? <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
