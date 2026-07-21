'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { deleteExercise, updateExerciseDrawing } from '@/app/actions/methodology';
import { DrawingPreviewFrame } from '@/components/methodology/drawing/DrawingPreviewFrame';
import { ExerciseDrawingStudio } from '@/components/methodology/drawing/ExerciseDrawingStudio';
import { ExercisePreviewOverlay } from '@/components/methodology/ExercisePreviewOverlay';
import { PORTAL_ACTION_ICON_CLASS } from '@/components/portal/PortalActionIcon';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  drawingDocumentIsEmpty,
  parseExerciseDrawing,
} from '@/lib/exercise-drawing';
import {
  parseExerciseSheet,
  SHEET_FIELD_LABELS,
  TASK_TYPE_LABELS,
  type TaskType,
} from '@/lib/exercise-sheet';
import {
  isDemoExerciseId,
  readDemoDrawingOverrides,
  updateDemoExerciseDrawing,
} from '@/lib/demo-exercises-store';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { CLUB_PRACTICED_SPORT_SHORT } from '@/lib/club-practiced-sports';
import { appendSportParam, clubIsMultisport } from '@/lib/sport-context';
import { cn } from '@/lib/utils';

export type ExerciseListRecord = {
  id: string;
  title: string;
  task_type?: string | null;
  objectives?: string | null;
  notes?: string | null;
  sheet_json?: unknown;
  drawing_json?: unknown;
  duration_min?: number;
};

type Props = {
  exercises: ExerciseListRecord[];
  initialExerciseId?: string | null;
  demoMode?: boolean;
  activeSport?: ClubPracticedSport;
  practicedSports?: ClubPracticedSport[];
};

const listItemClass = (active: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
      : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
  );

const TYPE_FILTER_OPTIONS: { value: 'all' | TaskType; label: string }[] = [
  { value: 'all', label: 'Ver todos los ejercicios' },
  { value: 'warmup', label: 'Calentamiento' },
  { value: 'main', label: 'Parte principal' },
  { value: 'cooldown', label: 'Vuelta a la calma' },
];

const filterButtonClass = (active: boolean) =>
  cn(
    'min-w-0 rounded-lg border px-1.5 py-2 text-center text-[11px] leading-snug transition-colors sm:px-2 sm:text-xs',
    active
      ? 'border-primary/50 bg-primary/10 font-medium text-primary'
      : 'border-primary/25 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
  );

function ExerciseListIcon() {
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
      <BookOpen className="size-4 text-primary/80" strokeWidth={1.5} />
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{value}</p>
    </div>
  );
}

function ExerciseDetailPanel({
  exercise,
  onDeleted,
  onDrawingSave,
}: {
  exercise: ExerciseListRecord | null;
  onDeleted: () => void;
  onDrawingSave: (json: string) => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);

  useEffect(() => {
    setStudioOpen(false);
  }, [exercise?.id]);

  if (!exercise) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <BookOpen className="size-10 text-primary/50" />
          <p className="text-sm font-medium text-foreground">Selecciona un ejercicio</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Elige un ejercicio del listado o crea uno nuevo con el icono de añadir.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sheet = parseExerciseSheet(exercise.sheet_json);
  const durationMin =
    typeof exercise.duration_min === 'number' ? exercise.duration_min : 15;
  const taskType = (exercise.task_type as TaskType | undefined) ?? sheet.taskType;
  const taskLabel = TASK_TYPE_LABELS[taskType] ?? 'Tarea principal';
  const drawingDoc = parseExerciseDrawing(exercise.drawing_json);
  const hasDrawing = !drawingDocumentIsEmpty(drawingDoc);

  const handleDeleteConfirm = async () => {
    if (!exercise) return;
    setDeleting(true);
    await deleteExercise(exercise.id);
    setDeleting(false);
    setDeleteOpen(false);
    onDeleted();
    router.refresh();
  };

  const handlePrint = () => {
    if (!exercise) return;
    if (isDemoExerciseId(exercise.id) && typeof window !== 'undefined') {
      sessionStorage.setItem(
        `synq-print-drawing-${exercise.id}`,
        JSON.stringify(exercise.drawing_json ?? null)
      );
    }
    window.open(`/print/ficha/ejercicio/${exercise.id}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Card className="flex h-full min-h-[28rem] flex-col overflow-hidden border border-primary/25 bg-transparent p-0 shadow-none hover:border-primary/25 hover:shadow-none">
        <div className="exercise-detail-panel flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{exercise.title}</h2>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                {taskLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-primary/75">
              {sheet.conditionalGrid.time || `${durationMin} min`}
              {sheet.didacticStrategy ? ` · ${sheet.didacticStrategy}` : ''}
            </p>
          </div>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
          <div className="relative w-full">
            <div className="exercise-field-pitch">
              {hasDrawing ? (
                <DrawingPreviewFrame
                  document={drawingDoc}
                  orientation="horizontal"
                  className="w-full rounded-none"
                />
              ) : (
                <div
                  className="flex w-full items-center justify-center bg-[#060a12] text-xs text-muted-foreground"
                  style={{ aspectRatio: '105 / 68', maxHeight: '16rem' }}
                >
                  Sin esquema en pizarra
                </div>
              )}
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-1 bg-gradient-to-t from-[hsl(212_42%_4%_/_0.95)] via-[hsl(212_42%_4%_/_0.55)] to-transparent px-2 pb-2 pt-8">
              <button
                type="button"
                onClick={() => setStudioOpen(true)}
                className={PORTAL_ACTION_ICON_CLASS}
                aria-label="Modificar dibujo"
                title="Modificar dibujo"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className={PORTAL_ACTION_ICON_CLASS}
                aria-label="Previsualizar ejercicio"
                title="Previsualizar"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className={PORTAL_ACTION_ICON_CLASS}
                aria-label="Imprimir o guardar PDF"
                title="Imprimir / PDF"
              >
                <Printer className="size-4" />
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(true)}
                className={cn(PORTAL_ACTION_ICON_CLASS, 'hover:text-destructive')}
                aria-label="Eliminar ejercicio"
                title="Eliminar ejercicio"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <DataRow label={SHEET_FIELD_LABELS.objectives} value={sheet.objectives || exercise.objectives || ''} />
            <DataRow label={SHEET_FIELD_LABELS.didacticStrategy} value={sheet.didacticStrategy} />

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contenido condicional
              </p>
              <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                <DataRow label="Tiempo" value={sheet.conditionalGrid.time} />
                <DataRow label="Espacio" value={sheet.conditionalGrid.space} />
                <DataRow label="Situación" value={sheet.conditionalGrid.gameSituation} />
                <DataRow label="Coordinación" value={sheet.conditionalGrid.coordination} />
              </div>
            </div>
          </div>
        </CardContent>
        </div>
      </Card>

      <ExercisePreviewOverlay
        exercise={exercise}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <PortalConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar ejercicio"
        description={`¿Eliminar el ejercicio «${exercise.title}»? Se quitará del catálogo del club y no podrás recuperarlo.`}
        confirmLabel="Eliminar"
        destructive
        pending={deleting}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <ExerciseDrawingStudio
        open={studioOpen}
        initialData={exercise.drawing_json}
        onClose={() => setStudioOpen(false)}
        onSave={(next) => {
          onDrawingSave(next);
          setStudioOpen(false);
        }}
      />
    </>
  );
}

export function ExercisesMasterDetail({
  exercises,
  initialExerciseId,
  demoMode = false,
  activeSport = 'football',
  practicedSports = ['football'],
}: Props) {
  const router = useRouter();
  const [drawingOverrides, setDrawingOverrides] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (demoMode) {
      setDrawingOverrides(readDemoDrawingOverrides());
    }
  }, [demoMode]);

  const resolvedExercises = useMemo(
    () =>
      exercises.map((exercise) => ({
        ...exercise,
        drawing_json: drawingOverrides[exercise.id] ?? exercise.drawing_json,
      })),
    [exercises, drawingOverrides]
  );

  const handleDrawingSave = (exerciseId: string, json: string) => {
    const parsed = JSON.parse(json) as unknown;
    setDrawingOverrides((current) => ({ ...current, [exerciseId]: parsed }));
    if (isDemoExerciseId(exerciseId)) {
      updateDemoExerciseDrawing(exerciseId, parsed);
      return;
    }
    void updateExerciseDrawing(exerciseId, json).then(() => router.refresh());
  };
  const [search, setSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | TaskType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialExerciseId && exercises.some((item) => item.id === initialExerciseId)
      ? initialExerciseId
      : exercises[0]?.id ?? null
  );

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...resolvedExercises];

    if (taskFilter !== 'all') {
      list = list.filter((exercise) => {
        const sheet = parseExerciseSheet(exercise.sheet_json);
        const type = (exercise.task_type as TaskType | undefined) ?? sheet.taskType;
        return type === taskFilter;
      });
    }

    if (query) {
      list = list.filter((exercise) => {
        const sheet = parseExerciseSheet(exercise.sheet_json);
        const haystack = [exercise.title, exercise.objectives, sheet.didacticStrategy, sheet.objectives]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    list.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
    return list;
  }, [resolvedExercises, search, taskFilter]);

  const selectedExercise =
    resolvedExercises.find((exercise) => exercise.id === selectedId) ?? filteredExercises[0] ?? null;

  useEffect(() => {
    if (initialExerciseId && resolvedExercises.some((exercise) => exercise.id === initialExerciseId)) {
      setSelectedId(initialExerciseId);
    }
  }, [initialExerciseId, resolvedExercises]);

  useEffect(() => {
    if (selectedId && !resolvedExercises.some((exercise) => exercise.id === selectedId)) {
      setSelectedId(resolvedExercises[0]?.id ?? null);
    }
  }, [resolvedExercises, selectedId]);

  useEffect(() => {
    if (selectedId && !filteredExercises.some((exercise) => exercise.id === selectedId)) {
      setSelectedId(filteredExercises[0]?.id ?? null);
    }
  }, [filteredExercises, selectedId]);

  const handleSelect = (exerciseId: string) => {
    setSelectedId(exerciseId);
    const path = appendSportParam(`/portal/metodologia/ejercicios?exercise=${exerciseId}`, activeSport);
    router.replace(path, { scroll: false });
  };

  const nuevoHref = appendSportParam('/portal/metodologia/ejercicios/nuevo', activeSport);
  const showSportFilter = clubIsMultisport(practicedSports);

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">Biblioteca</CardTitle>
              <CardDescription>
                {filteredExercises.length} de {resolvedExercises.length} ejercicios
              </CardDescription>
            </div>
            <Link
              href={nuevoHref}
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Nuevo ejercicio"
              title="Nuevo ejercicio"
            >
              <Plus className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {showSportFilter ? (
              <div className="flex flex-wrap gap-1.5">
                {practicedSports.map((sport) => (
                  <Link
                    key={sport}
                    href={appendSportParam('/portal/metodologia/ejercicios', sport)}
                    className={filterButtonClass(activeSport === sport)}
                  >
                    {CLUB_PRACTICED_SPORT_SHORT[sport]}
                  </Link>
                ))}
              </div>
            ) : null}
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar por título u objetivos…"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {TYPE_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTaskFilter(option.value)}
                  className={filterButtonClass(taskFilter === option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredExercises.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              {resolvedExercises.length === 0
                ? 'No hay ejercicios todavía. Pulsa + para crear el primero.'
                : 'No hay ejercicios con esos filtros.'}
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredExercises.map((exercise) => {
                const sheet = parseExerciseSheet(exercise.sheet_json);
                const taskType = (exercise.task_type as TaskType | undefined) ?? sheet.taskType;
                const active = selectedExercise?.id === exercise.id;
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(exercise.id)}
                      className={listItemClass(active)}
                    >
                      <ExerciseListIcon />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{exercise.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {TASK_TYPE_LABELS[taskType]}
                          {sheet.conditionalGrid.time
                            ? ` · ${sheet.conditionalGrid.time}`
                            : typeof exercise.duration_min === 'number'
                              ? ` · ${exercise.duration_min} min`
                              : ''}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ExerciseDetailPanel
        exercise={selectedExercise}
        onDeleted={() => {
          setSelectedId(null);
          router.replace('/portal/metodologia/ejercicios', { scroll: false });
        }}
        onDrawingSave={(json) => {
          if (selectedExercise) handleDrawingSave(selectedExercise.id, json);
        }}
      />
    </div>
  );
}
