'use client';

import type { ExerciseTaskSheet, TaskType } from '@/lib/exercise-sheet';
import { SHEET_FIELD_LABELS, TASK_TYPE_LABELS } from '@/lib/exercise-sheet';
import { ExerciseDrawingTrigger } from '@/components/methodology/drawing/ExerciseDrawingTrigger';
import { ExerciseEditorLayout } from '@/components/methodology/ExerciseEditorLayout';
import { Input } from '@/components/ui/input';
import type { DrawingData } from '@/lib/methodology';
import { cn } from '@/lib/utils';

type Props = {
  sheet?: ExerciseTaskSheet;
  drawingJson?: DrawingData | unknown;
  showCanvas?: boolean;
  showTaskType?: boolean;
  layout?: 'stacked' | 'split';
};

const fieldClass = 'border-primary/30 bg-background/80';
const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

export function ExerciseSheetForm({
  sheet,
  drawingJson,
  showCanvas = true,
  showTaskType = true,
  layout = 'stacked',
}: Props) {
  const s = sheet;

  const identityFields = (
    <div className={sectionClass}>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
        Identificación
      </p>
      <div className="mt-3 space-y-4">
        {showTaskType ? (
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Tipo de tarea
            </label>
            <select
              name="taskType"
              defaultValue={s?.taskType ?? 'main'}
              className={cn(
                'flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                fieldClass
              )}
            >
              {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((key) => (
                <option key={key} value={key}>
                  {TASK_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <Field label={SHEET_FIELD_LABELS.title} name="title" defaultValue={s?.title} required />
        <Field
          label={SHEET_FIELD_LABELS.didacticStrategy}
          name="didacticStrategy"
          defaultValue={s?.didacticStrategy}
        />
        <TextArea
          label={SHEET_FIELD_LABELS.objectives}
          name="objectives"
          defaultValue={s?.objectives}
          rows={3}
        />
      </div>
    </div>
  );

  const conditionalFields = (
    <div className={cn(sectionClass, 'overflow-hidden p-0')}>
      <div className="border-b border-primary/10 bg-muted/10 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contenido condicional
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/80">
          Tiempo · Espacio · Situación · Coordinación
        </p>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field
          label={SHEET_FIELD_LABELS.conditionalContent}
          name="conditionalContent"
          defaultValue={s?.conditionalGrid.conditionalContent}
        />
        <Field
          label={SHEET_FIELD_LABELS.time}
          name="time"
          defaultValue={s?.conditionalGrid.time}
          placeholder="ej. 2 × 10 min"
        />
        <Field
          label={SHEET_FIELD_LABELS.space}
          name="space"
          defaultValue={s?.conditionalGrid.space}
          placeholder="Medio campo"
        />
        <Field
          label={SHEET_FIELD_LABELS.gameSituation}
          name="gameSituation"
          defaultValue={s?.conditionalGrid.gameSituation}
          placeholder="Sectorial"
        />
        <Field
          label={SHEET_FIELD_LABELS.coordination}
          name="coordination"
          defaultValue={s?.conditionalGrid.coordination}
          placeholder="Jugador – jugadores"
          className="sm:col-span-2"
        />
      </div>
    </div>
  );

  const actionFields = (
    <div className={sectionClass}>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
        Contenidos de acción
      </p>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        <TextArea
          label={SHEET_FIELD_LABELS.technicalAction}
          name="technicalAction"
          defaultValue={s?.technicalAction}
          rows={4}
        />
        <TextArea
          label={SHEET_FIELD_LABELS.tacticalAction}
          name="tacticalAction"
          defaultValue={s?.tacticalAction}
          rows={4}
        />
        <TextArea
          label={SHEET_FIELD_LABELS.collectiveContent}
          name="collectiveContent"
          defaultValue={s?.collectiveContent}
          rows={4}
        />
      </div>
    </div>
  );

  const detailFields = (
    <div className={sectionClass}>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
        Descripción y reglas
      </p>
      <div className="mt-3 space-y-4">
        <TextArea
          label={SHEET_FIELD_LABELS.description}
          name="description"
          defaultValue={s?.description}
          rows={5}
        />
        <TextArea label={SHEET_FIELD_LABELS.rules} name="rules" defaultValue={s?.rules} rows={4} />
        <TextArea
          label={SHEET_FIELD_LABELS.coachingCues}
          name="coachingCues"
          defaultValue={s?.coachingCues}
          rows={3}
        />
      </div>
    </div>
  );

  const fields = (
    <>
      {identityFields}
      {conditionalFields}
      {actionFields}
      {detailFields}
    </>
  );

  if (showCanvas && layout === 'split') {
    return (
      <ExerciseEditorLayout
        canvas={<ExerciseDrawingTrigger initialData={drawingJson} compact />}
        form={fields}
      />
    );
  }

  return (
    <div className="space-y-4">
      {fields}
      {showCanvas ? (
        <div className={sectionClass}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary/90">
            Esquema / pizarra
          </p>
          <ExerciseDrawingTrigger initialData={drawingJson} />
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      <Input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className={fieldClass}
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className={cn(
          'flex min-h-[5rem] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          fieldClass
        )}
      />
    </div>
  );
}
