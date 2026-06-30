import type { ExerciseTaskSheet } from '@/lib/exercise-sheet';
import { SHEET_FIELD_LABELS, TASK_TYPE_LABELS } from '@/lib/exercise-sheet';
import { ExerciseDrawingPreview } from '@/components/methodology/drawing/ExerciseDrawingTrigger';

type Props = {
  sheet: ExerciseTaskSheet;
  drawingJson?: unknown;
  clubName?: string;
  sessionLabel?: string;
  id?: string;
};

/** Documento A4 blanco — plantilla UEFA para impresión y PDF. */
export function ExerciseSheetPrintDocument({
  sheet,
  drawingJson,
  clubName,
  sessionLabel,
  id = 'exercise-sheet-print',
}: Props) {
  const taskLabel = TASK_TYPE_LABELS[sheet.taskType].toUpperCase();

  return (
    <div
      id={id}
      className="exercise-sheet-print mx-auto bg-white text-black shadow-lg print:shadow-none"
      style={{ width: '210mm', minHeight: '297mm', padding: '12mm 14mm' }}
    >
      {sessionLabel && (
        <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
          {sessionLabel}
        </p>
      )}

      <div className="border-2 border-black text-center py-1 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider">Plantilla de tarea</p>
        <p className="text-[10px] font-semibold uppercase">{taskLabel}</p>
      </div>

      <PrintField label={SHEET_FIELD_LABELS.title} value={sheet.title} prominent />

      <PrintField label={SHEET_FIELD_LABELS.didacticStrategy} value={sheet.didacticStrategy} />
      <PrintField label={SHEET_FIELD_LABELS.objectives} value={sheet.objectives} />

      <table className="my-3 w-full border-collapse border border-black text-[9px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1.5 text-left font-bold">Contenido condicional</th>
            <th className="border border-black p-1.5 text-left font-bold">Tiempo</th>
            <th className="border border-black p-1.5 text-left font-bold">Espacio</th>
            <th className="border border-black p-1.5 text-left font-bold">Situación de juego</th>
            <th className="border border-black p-1.5 text-left font-bold">Coordinación</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-1.5 align-top min-h-[2rem]">
              {sheet.conditionalGrid.conditionalContent || ' '}
            </td>
            <td className="border border-black p-1.5 align-top">
              {sheet.conditionalGrid.time || ' '}
            </td>
            <td className="border border-black p-1.5 align-top">
              {sheet.conditionalGrid.space || ' '}
            </td>
            <td className="border border-black p-1.5 align-top">
              {sheet.conditionalGrid.gameSituation || ' '}
            </td>
            <td className="border border-black p-1.5 align-top">
              {sheet.conditionalGrid.coordination || ' '}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <PrintBox label={SHEET_FIELD_LABELS.technicalAction} value={sheet.technicalAction} />
        <PrintBox label={SHEET_FIELD_LABELS.tacticalAction} value={sheet.tacticalAction} />
        <PrintBox label={SHEET_FIELD_LABELS.collectiveContent} value={sheet.collectiveContent} />
      </div>

      <PrintBlock label={SHEET_FIELD_LABELS.description} value={sheet.description} minHeight="80px" />
      <PrintBlock label={SHEET_FIELD_LABELS.rules} value={sheet.rules} minHeight="60px" />
      <PrintBlock label={SHEET_FIELD_LABELS.coachingCues} value={sheet.coachingCues} minHeight="40px" />

      {drawingJson != null && (
        <div className="mt-3 border border-black p-2">
          <p className="mb-2 text-[9px] font-bold uppercase">Esquema / pizarra</p>
          <div className="flex justify-center bg-slate-900 print:bg-slate-900">
            <ExerciseDrawingPreview data={drawingJson} className="mx-auto w-full max-w-md" />
          </div>
        </div>
      )}

      <footer className="mt-6 flex justify-between border-t border-gray-300 pt-2 text-[8px] text-gray-500">
        <span>{clubName ?? 'SynqAI Sports'}</span>
        <span>Generado {new Date().toLocaleDateString('es-ES')}</span>
      </footer>
    </div>
  );
}

function PrintField({
  label,
  value,
  prominent,
}: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <div className="mb-2">
      <p className="text-[9px] font-bold uppercase text-gray-700">{label}</p>
      <p
        className={`whitespace-pre-wrap border-b border-gray-300 pb-1 ${
          prominent ? 'text-base font-bold' : 'text-[11px]'
        }`}
      >
        {value || ' '}
      </p>
    </div>
  );
}

function PrintBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black p-1.5 min-h-[4rem]">
      <p className="text-[8px] font-bold leading-tight mb-1">{label}</p>
      <p className="text-[9px] whitespace-pre-wrap">{value || ' '}</p>
    </div>
  );
}

function PrintBlock({
  label,
  value,
  minHeight,
}: {
  label: string;
  value: string;
  minHeight: string;
}) {
  return (
    <div className="mb-2 border border-black p-2" style={{ minHeight }}>
      <p className="text-[9px] font-bold uppercase mb-1">{label}</p>
      <p className="text-[10px] whitespace-pre-wrap">{value || ' '}</p>
    </div>
  );
}
