'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, Pencil, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { deleteExercise, updateExerciseDrawing } from '@/app/actions/methodology';
import { DrawingPreviewFrame } from '@/components/methodology/drawing/DrawingPreviewFrame';
import { ExerciseDrawingStudio } from '@/components/methodology/drawing/ExerciseDrawingStudio';
import { ExercisePreviewOverlay } from '@/components/methodology/ExercisePreviewOverlay';
import { PortalConfirmDialog } from '@/components/portal/PortalConfirmDialog';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
};

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

const listItemClass = (active: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
      : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
  );

const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

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
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg font-semibold tracking-tight">{exercise.title}</CardTitle>
          <Badge variant="outline" className="border-primary/25 text-[10px]">
            {taskLabel}
          </Badge>
        </div>
        <CardDescription>
          {sheet.conditionalGrid.time || `${durationMin} min`}
          {sheet.didacticStrategy ? ` · ${sheet.didacticStrategy}` : ''}
        </CardDescription>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)] lg:items-start">
          <div className="relative mx-auto w-full max-w-full overflow-hidden rounded-2xl border border-primary/30 bg-[#060a12] shadow-[0_0_24px_hsl(183_100%_50%_/_0.08)]">
            {hasDrawing ? (
              <DrawingPreviewFrame
                document={drawingDoc}
                orientation="horizontal"
                className="w-full max-h-[min(14rem,36vw)]"
              />
            ) : (
              <div
                className="flex w-full items-center justify-center bg-[#060a12] text-xs text-muted-foreground"
                style={{ aspectRatio: '105 / 68', maxHeight: '14rem' }}
              >
                Sin esquema en pizarra
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-background/95 via-background/55 to-transparent px-2 pb-2 pt-8">
              <button
                type="button"
                onClick={() => setStudioOpen(true)}
                className={actionButtonClass}
                aria-label="Modificar dibujo"
                title="Modificar dibujo"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className={actionButtonClass}
                aria-label="Previsualizar ejercicio"
                title="Previsualizar"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className={actionButtonClass}
                aria-label="Imprimir o guardar PDF"
                title="Imprimir / PDF"
              >
                <Printer className="size-4" />
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteOpen(true)}
                className={cn(actionButtonClass, 'hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive')}
                aria-label="Eliminar ejercicio"
                title="Eliminar ejercicio"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <div className={`${sectionClass} space-y-4`}>
            <DataRow label={SHEET_FIELD_LABELS.objectives} value={sheet.objectives || exercise.objectives || ''} />
            <DataRow label={SHEET_FIELD_LABELS.didacticStrategy} value={sheet.didacticStrategy} />

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contenido condicional
              </p>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <DataRow label="Tiempo" value={sheet.conditionalGrid.time} />
                <DataRow label="Espacio" value={sheet.conditionalGrid.space} />
                <DataRow label="Situación" value={sheet.conditionalGrid.gameSituation} />
                <DataRow label="Coordinación" value={sheet.conditionalGrid.coordination} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <DataRow label={SHEET_FIELD_LABELS.technicalAction} value={sheet.technicalAction} />
          <DataRow label={SHEET_FIELD_LABELS.tacticalAction} value={sheet.tacticalAction} />
          <DataRow label={SHEET_FIELD_LABELS.collectiveContent} value={sheet.collectiveContent} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={sectionClass}>
            <DataRow label={SHEET_FIELD_LABELS.description} value={sheet.description} />
          </div>
          <div className={sectionClass}>
            <DataRow label={SHEET_FIELD_LABELS.rules} value={sheet.rules} />
            <div className="mt-3">
              <DataRow label={SHEET_FIELD_LABELS.coachingCues} value={sheet.coachingCues} />
            </div>
          </div>
        </div>
      </CardContent>
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

export function ExercisesMasterDetail({ exercises, initialExerciseId, demoMode = false }: Props) {
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
    router.replace(`/portal/metodologia/ejercicios?exercise=${exerciseId}`, { scroll: false });
  };

  const taskOptions = [
    { value: 'all', label: 'Todos los tipos' },
    ...(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((key) => ({
      value: key,
      label: TASK_TYPE_LABELS[key],
    })),
  ];

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
              href="/portal/metodologia/ejercicios/nuevo"
              className={actionButtonClass}
              aria-label="Nuevo ejercicio"
              title="Nuevo ejercicio"
            >
              <Plus className="size-4" />
            </Link>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título u objetivos…"
                className="border-primary/30 bg-background/80 pl-9"
              />
            </div>
            <SynqSelect
              value={taskFilter}
              onChange={(value) => setTaskFilter(value as 'all' | TaskType)}
              options={taskOptions}
            />
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
