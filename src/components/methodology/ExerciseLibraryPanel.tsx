'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Search } from 'lucide-react';
import { assignExerciseToSlot } from '@/app/actions/methodology';
import { Button } from '@/components/ui/button';
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
    <div className="flex h-full flex-col rounded-xl border border-primary/25 bg-muted/5">
      <div className="border-b border-primary/20 px-4 py-3">
        <h2 className="text-sm font-semibold">Biblioteca de ejercicios</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {categorySlug ? `Categoría: ${categorySlug}` : 'Todo el club'}
          {activeSlotType ? ` · filtro: ${activeSlotType}` : ''}
        </p>
      </div>

      <div className="space-y-2 border-b border-primary/15 p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ejercicio…"
            className="border-primary/25 bg-background/80 pl-9"
          />
        </div>
        <Button type="button" variant="outline" size="sm" className="w-full gap-2" asChild>
          <Link href={addExerciseHref}>
            <Plus className="size-4" />
            Añadir ejercicio
          </Link>
        </Button>
      </div>

      {error ? (
        <p className="mx-3 mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {!activeSlotId ? (
        <p className="p-4 text-xs text-muted-foreground">
          Elige un slot a la izquierda (calentamiento, principal o vuelta calma) para asignar un
          ejercicio.
        </p>
      ) : null}

      <ul className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <li className="py-6 text-center text-xs text-muted-foreground">Sin ejercicios.</li>
        ) : (
          filtered.map((exercise) => {
            const isPending = pendingId === exercise.id;
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  disabled={!activeSlotId || isPending}
                  onClick={() => void handleAssign(exercise)}
                  className={cn(
                    'w-full rounded-lg border border-primary/15 px-3 py-2 text-left text-sm transition-colors hover:border-primary/35 hover:bg-primary/5 disabled:opacity-50',
                    !activeSlotId && 'cursor-not-allowed'
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{exercise.title}</span>
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  </span>
                  {exercise.objectives ? (
                    <span className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {exercise.objectives}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
