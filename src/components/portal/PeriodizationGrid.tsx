'use client';

import type { MacrocycleBlock } from '@/lib/periodization';
import { CATEGORY_PLAN_STYLES, getMccDisplayLabel, type MicrocycleWeek } from '@/lib/periodization';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import type { MccLink, MccOverride } from '@/lib/periodization-document';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';

type Props = {
  macro: MacrocycleBlock;
  categorySlug: CanteraCategorySlug;
  mccLinks: Record<string, MccLink>;
  mccOverrides: Record<string, MccOverride>;
  excludedMccIds: Set<string>;
  selectedMccId: string | null;
  onSelectMcc?: (micro: MicrocycleWeek) => void;
  readOnly?: boolean;
};

export function PeriodizationGrid({
  macro,
  categorySlug,
  mccLinks,
  mccOverrides,
  excludedMccIds,
  selectedMccId,
  onSelectMcc,
  readOnly = false,
}: Props) {
  const styles = CATEGORY_PLAN_STYLES[categorySlug];

  if (macro.mesocycles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
        No hay semanas en este macrociclo para el rango de fechas seleccionado.
      </p>
    );
  }

  const maxMicros = Math.max(...macro.mesocycles.map((meso) => meso.microcycles.length));
  const labelCell =
    'w-[5.5rem] min-w-[5.5rem] border border-primary/15 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground align-middle';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
        <span className={cn('rounded-md border px-2.5 py-1', styles.macro)}>Macrociclos</span>
        <span className={cn('rounded-md border px-2.5 py-1', styles.meso)}>Mesociclos</span>
        <span className={cn('rounded-md border px-2.5 py-1', styles.micro)}>Microciclos</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-primary/20">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className={labelCell}>Macrociclo</th>
              <th
                colSpan={macro.mesocycles.length}
                className={cn(
                  'border-b px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide',
                  styles.macro
                )}
              >
                {macro.name}
                <span className="mt-0.5 block text-[10px] font-normal normal-case text-muted-foreground">
                  {macro.startDate} → {macro.endDate}
                </span>
              </th>
            </tr>
            <tr>
              <th className={labelCell}>Mesociclos</th>
              {macro.mesocycles.map((meso) => (
                <th
                  key={meso.id}
                  className={cn(
                    'border border-primary/15 px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide',
                    styles.meso
                  )}
                >
                  {meso.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxMicros }).map((_, rowIndex) => (
              <tr key={`micro-row-${rowIndex}`}>
                {rowIndex === 0 ? (
                  <td rowSpan={maxMicros} className={cn(labelCell, 'align-middle text-center')}>
                    Microciclos
                  </td>
                ) : null}
                {macro.mesocycles.map((meso) => {
                  const micro = meso.microcycles[rowIndex];
                  if (!micro) {
                    return (
                      <td key={`${meso.id}-${rowIndex}`} className="border border-primary/10 p-1">
                        <div className="h-[3.5rem] rounded-md border border-transparent" />
                      </td>
                    );
                  }

                  const linked = Boolean(mccLinks[micro.id]);
                  const excluded = excludedMccIds.has(micro.id);
                  const active = selectedMccId === micro.id;
                  const displayLabel = getMccDisplayLabel(micro, mccOverrides[micro.id]);
                  const cellClass = cn(
                    'w-full rounded-md border px-1.5 py-1.5 text-center transition-colors',
                    styles.micro,
                    active && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                    linked && 'shadow-[inset_0_0_0_1px_hsl(142_76%_45%_/_0.45)]',
                    excluded && 'opacity-40 line-through',
                    !readOnly && 'cursor-pointer hover:brightness-110'
                  );
                  const cellBody = (
                    <>
                      <div className="flex items-center justify-center gap-1">
                        {linked ? (
                          <CheckCircle2 className="size-3 text-emerald-400" />
                        ) : (
                          <Circle className="size-3 text-muted-foreground/60" />
                        )}
                        <p className="text-[11px] font-bold tracking-wide">{displayLabel}</p>
                      </div>
                      <p className="mt-0.5 text-[10px] opacity-90">{micro.sessionsCount} ses.</p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">
                        {micro.weekStart.slice(5).replace('-', '/')} –{' '}
                        {micro.weekEnd.slice(5).replace('-', '/')}
                      </p>
                    </>
                  );

                  return (
                    <td key={`${meso.id}-${rowIndex}`} className="border border-primary/10 p-1 align-top">
                      {readOnly ? (
                        <div className={cellClass} title={`${micro.weekStart} → ${micro.weekEnd}`}>
                          {cellBody}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectMcc?.(micro)}
                          className={cellClass}
                          title={`${micro.weekStart} → ${micro.weekEnd}`}
                        >
                          {cellBody}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className={cn(labelCell, 'text-center')}>Sesiones</td>
              {macro.mesocycles.map((meso) => (
                <td
                  key={`${meso.id}-sessions`}
                  className="border border-primary/10 bg-muted/10 px-2 py-1.5 text-center text-[11px] font-semibold"
                >
                  {meso.totalSessions}
                </td>
              ))}
            </tr>
            <tr>
              <td className={cn(labelCell, 'text-center')}>Tareas</td>
              {macro.mesocycles.map((meso) => (
                <td
                  key={`${meso.id}-tasks`}
                  className="border border-primary/10 bg-muted/5 px-2 py-1.5 text-center text-[11px] text-muted-foreground"
                >
                  {meso.totalTasks}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
