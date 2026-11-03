'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { CLUB_PRACTICED_SPORT_LABELS } from '@/lib/club-practiced-sports';
import {
  COACH_FREE_MAX_EXERCISES,
  blankCoachFreeDrawing,
  coachFreeBoardReady,
  deleteExercise,
  loadExercises,
  saveExercise,
  type CoachFreeExercise,
} from '@/lib/coach-free-device';
import { CoachFreeSection } from '@/components/coach/CoachFreeSection';
import { CoachFreeSoon } from '@/components/coach/CoachFreeSoon';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const ExerciseDrawingStudio = dynamic(
  () =>
    import('@/components/methodology/drawing/ExerciseDrawingStudio').then(
      (mod) => mod.ExerciseDrawingStudio
    ),
  { ssr: false }
);

const fieldClass = 'rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white';

export function CoachFreeExercises() {
  const { sport, ready } = useCoachFreeSport();
  const [items, setItems] = useState<CoachFreeExercise[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState<CoachFreeExercise | null>(null);
  const [message, setMessage] = useState('');

  if (ready && !loaded) {
    setItems(loadExercises(sport));
    setLoaded(true);
  }

  const initialData = useMemo(() => {
    if (!editing) return null;
    return editing.drawing ?? blankCoachFreeDrawing(sport);
  }, [editing, sport]);

  if (!ready) return null;
  if (!coachFreeBoardReady(sport)) return <CoachFreeSoon sport={sport} title="Ejercicios" />;

  function refresh(next: CoachFreeExercise[]) {
    setItems(next);
  }

  function openNew() {
    const name = title.trim();
    if (name.length < 2) {
      setMessage('Pon un nombre al ejercicio.');
      return;
    }
    if (items.length >= COACH_FREE_MAX_EXERCISES) {
      setMessage(`Has llegado a ${COACH_FREE_MAX_EXERCISES} ejercicios en dos meses.`);
      return;
    }
    setMessage('');
    setEditing({
      id: crypto.randomUUID(),
      title: name,
      updatedAt: new Date().toISOString(),
      drawing: blankCoachFreeDrawing(sport),
    });
  }

  return (
    <>
      <CoachFreeSection
        title="Ejercicios"
        text={`${CLUB_PRACTICED_SPORT_LABELS[sport]} · ${items.length} de ${COACH_FREE_MAX_EXERCISES}. La pizarra es la de la plataforma y el dibujo se queda en este aparato.`}
      >
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            openNew();
          }}
        >
          <label className="grid min-w-56 flex-1 gap-1 text-xs text-synq-muted">
            Nombre
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} />
          </label>
          <button type="submit" className="synq-btn-primary">
            Dibujar ejercicio
          </button>
        </form>
        {message ? <p className="mt-3 text-sm text-red-300">{message}</p> : null}

        <div className="mt-6 grid gap-3">
          {items.length === 0 ? (
            <p className="text-sm text-synq-muted">Todavía no hay ejercicios en este deporte.</p>
          ) : (
            items.map((item) => (
              <article key={item.id} className="synq-card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <h2 className="font-semibold text-white">{item.title}</h2>
                  <p className="text-xs text-synq-muted">
                    {new Intl.DateTimeFormat('es-ES', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Europe/Madrid',
                    }).format(new Date(item.updatedAt))}{' '}
                    (Madrid)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="synq-btn-ghost" onClick={() => setEditing(item)}>
                    Abrir
                  </button>
                  <button
                    type="button"
                    className="synq-btn-ghost"
                    onClick={() => {
                      deleteExercise(sport, item.id);
                      refresh(loadExercises(sport));
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </CoachFreeSection>

      {editing && initialData ? (
        <ExerciseDrawingStudio
          open
          initialData={initialData}
          onClose={() => setEditing(null)}
          onSave={(json) => {
            let drawing: unknown = json;
            try {
              drawing = JSON.parse(json);
            } catch {
              drawing = json;
            }
            const error = saveExercise(sport, {
              ...editing,
              drawing,
              updatedAt: new Date().toISOString(),
            });
            setMessage(error ?? '');
            if (!error) {
              setTitle('');
              refresh(loadExercises(sport));
            }
          }}
        />
      ) : null}
    </>
  );
}
