import type { ExerciseTaskSheet } from '@/lib/exercise-sheet';
import { SHEET_FIELD_LABELS, TASK_TYPE_LABELS } from '@/lib/exercise-sheet';
import { ExerciseCanvasPreview } from '@/components/methodology/ExerciseCanvas';

type Props = {
  sheet: ExerciseTaskSheet;
  drawingJson?: unknown;
  compact?: boolean;
};

export function ExerciseSheetView({ sheet, drawingJson, compact }: Props) {
  return (
    <article className="rounded-2xl border border-white/10 bg-synq-navy/40 overflow-hidden">
      <header className="border-b border-white/10 bg-synq-slate/50 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-synq-accent">
          Plantilla de tarea · {TASK_TYPE_LABELS[sheet.taskType]}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{sheet.title || 'Sin título'}</h3>
      </header>

      <div className="space-y-4 p-4 text-sm">
        <Row label={SHEET_FIELD_LABELS.didacticStrategy} value={sheet.didacticStrategy} />
        <Row label={SHEET_FIELD_LABELS.objectives} value={sheet.objectives} />

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-synq-muted">
              <th className="py-2 pr-2 text-left font-medium">Condicional</th>
              <th className="py-2 pr-2 text-left font-medium">Tiempo</th>
              <th className="py-2 pr-2 text-left font-medium">Espacio</th>
              <th className="py-2 pr-2 text-left font-medium">Situación</th>
              <th className="py-2 text-left font-medium">Coordinación</th>
            </tr>
          </thead>
          <tbody className="text-white">
            <tr>
              <td className="py-2 pr-2 align-top">{sheet.conditionalGrid.conditionalContent || '—'}</td>
              <td className="py-2 pr-2 align-top">{sheet.conditionalGrid.time || '—'}</td>
              <td className="py-2 pr-2 align-top">{sheet.conditionalGrid.space || '—'}</td>
              <td className="py-2 pr-2 align-top">{sheet.conditionalGrid.gameSituation || '—'}</td>
              <td className="py-2 align-top">{sheet.conditionalGrid.coordination || '—'}</td>
            </tr>
          </tbody>
        </table>

        {!compact && (
          <div className="grid gap-3 lg:grid-cols-3">
            <Block label={SHEET_FIELD_LABELS.technicalAction} value={sheet.technicalAction} />
            <Block label={SHEET_FIELD_LABELS.tacticalAction} value={sheet.tacticalAction} />
            <Block label={SHEET_FIELD_LABELS.collectiveContent} value={sheet.collectiveContent} />
          </div>
        )}

        <Block label={SHEET_FIELD_LABELS.description} value={sheet.description} />
        <Block label={SHEET_FIELD_LABELS.rules} value={sheet.rules} />
        <Block label={SHEET_FIELD_LABELS.coachingCues} value={sheet.coachingCues} />

        {drawingJson != null && (
          <div>
            <p className="mb-2 text-xs text-synq-muted">Esquema</p>
            <ExerciseCanvasPreview data={drawingJson} height={compact ? 100 : 160} />
          </div>
        )}
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-synq-muted">{label}: </span>
      <span className="text-white">{value}</span>
    </p>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-white/5 bg-synq-slate/20 p-3">
      <p className="text-xs font-medium text-synq-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-white">{value}</p>
    </div>
  );
}
