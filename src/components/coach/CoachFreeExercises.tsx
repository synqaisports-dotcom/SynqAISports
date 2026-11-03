'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PORTAL_ACTION_ICON_CLASS } from '@/components/portal/PortalActionIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CLUB_PRACTICED_SPORT_LABELS } from '@/lib/club-practiced-sports';
import {
  COACH_FREE_MAX_EXERCISES,
  deleteExercise,
  loadExercises,
  type CoachFreeExercise,
} from '@/lib/coach-free-device';
import { TASK_TYPE_LABELS, type TaskType } from '@/lib/exercise-sheet';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

export function CoachFreeExercises() {
  const { sport, ready } = useCoachFreeSport();
  const [items, setItems] = useState<CoachFreeExercise[]>([]);

  useEffect(() => {
    if (!ready) return;
    setItems(loadExercises(sport));
  }, [ready, sport]);

  if (!ready) return null;

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link href="/coach/app" className="text-sm text-primary">
          Inicio
        </Link>
        <Card className="mt-4 border border-primary/25">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Biblioteca</CardTitle>
                <CardDescription>
                  {CLUB_PRACTICED_SPORT_LABELS[sport]} · {items.length} de {COACH_FREE_MAX_EXERCISES}. La ficha es la
                  de la plataforma y se guarda en este aparato.
                </CardDescription>
              </div>
              <Link
                href="/coach/app/ejercicios/nuevo"
                className={PORTAL_ACTION_ICON_CLASS}
                aria-label="Nuevo ejercicio"
                title="Nuevo ejercicio"
              >
                <Plus className="size-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay ejercicios. Crea la ficha con el icono de añadir.</p>
            ) : (
              items.map((item) => {
                const task = item.task_type;
                const taskLabel =
                  task === 'warmup' || task === 'main' || task === 'cooldown'
                    ? TASK_TYPE_LABELS[task as TaskType]
                    : 'Tarea';
                return (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 px-3 py-2.5">
                    <Link href={`/coach/app/ejercicios/${item.id}`} className="min-w-0">
                      <p className="truncate font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{taskLabel}</p>
                    </Link>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        deleteExercise(sport, item.id);
                        setItems(loadExercises(sport));
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
