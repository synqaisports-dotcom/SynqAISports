'use client';

import type { ExerciseTaskSheet, TaskType } from '@/lib/exercise-sheet';
import { SHEET_FIELD_LABELS, TASK_TYPE_LABELS } from '@/lib/exercise-sheet';
import { ExerciseCanvas } from '@/components/methodology/ExerciseCanvas';
import { ExerciseEditorLayout } from '@/components/methodology/ExerciseEditorLayout';
import type { DrawingData } from '@/lib/methodology';

type Props = {
  sheet?: ExerciseTaskSheet;
  drawingJson?: DrawingData | unknown;
  showCanvas?: boolean;
  showTaskType?: boolean;
  layout?: 'stacked' | 'split';
};

export function ExerciseSheetForm({
  sheet,
  drawingJson,
  showCanvas = true,
  showTaskType = true,
  layout = 'stacked',
}: Props) {
  const s = sheet;

  const fields = (
    <>
      <div className="rounded-xl border border-synq-accent/20 bg-synq-slate/20 px-4 py-2 text-center text-xs font-semibold uppercase tracking-widest text-synq-accent">
        Plantilla de tarea
      </div>

      {showTaskType && (
        <div>
          <label className="mb-1 block text-xs text-synq-muted">Tipo de tarea</label>
          <select
            name="taskType"
            defaultValue={s?.taskType ?? 'main'}
            className="w-full max-w-xs rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          >
            {(Object.keys(TASK_TYPE_LABELS) as TaskType[]).map((key) => (
              <option key={key} value={key}>
                {TASK_TYPE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      )}

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
        rows={2}
      />

      <section className="rounded-xl border border-white/10 overflow-hidden">
        <div className="bg-synq-slate/50 px-3 py-2 text-xs font-semibold text-synq-muted">
          Contenido condicional · Tiempo · Espacio · Situación · Coordinación
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field
            label={SHEET_FIELD_LABELS.conditionalContent}
            name="conditionalContent"
            defaultValue={s?.conditionalGrid.conditionalContent}
          />
          <Field
            label={SHEET_FIELD_LABELS.time}
            name="time"
            defaultValue={s?.conditionalGrid.time}
            placeholder="ej. 2 x 10 minutos"
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
            placeholder="Jugador - Jugadores"
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <TextArea
          label={SHEET_FIELD_LABELS.technicalAction}
          name="technicalAction"
          defaultValue={s?.technicalAction}
          rows={3}
        />
        <TextArea
          label={SHEET_FIELD_LABELS.tacticalAction}
          name="tacticalAction"
          defaultValue={s?.tacticalAction}
          rows={3}
        />
        <TextArea
          label={SHEET_FIELD_LABELS.collectiveContent}
          name="collectiveContent"
          defaultValue={s?.collectiveContent}
          rows={3}
        />
      </div>

      <TextArea
        label={SHEET_FIELD_LABELS.description}
        name="description"
        defaultValue={s?.description}
        rows={6}
      />

      <TextArea label={SHEET_FIELD_LABELS.rules} name="rules" defaultValue={s?.rules} rows={5} />

      <TextArea
        label={SHEET_FIELD_LABELS.coachingCues}
        name="coachingCues"
        defaultValue={s?.coachingCues}
        rows={3}
      />
    </>
  );

  if (showCanvas && layout === 'split') {
    return (
      <ExerciseEditorLayout
        canvas={<ExerciseCanvas initialData={drawingJson} />}
        form={fields}
      />
    );
  }

  return (
    <div className="space-y-6">
      {fields}
      {showCanvas && (
        <div>
          <label className="mb-1 block text-xs text-synq-muted">Esquema / pizarra (boceto)</label>
          <ExerciseCanvas initialData={drawingJson} />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white placeholder:text-synq-muted/50"
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
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
