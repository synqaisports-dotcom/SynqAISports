import Image from 'next/image';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { SynqIcon } from '@/components/brand/SynqIcon';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { WEEKDAY_BUTTONS } from '@/lib/club-facilities';
import {
  buildCalendarTimeLabels,
  computeCalendarTimeGrid,
  positionEventsForWeekday,
  type TrainingCalendarEvent,
} from '@/lib/training-calendar';

const PRINT_ROW_HEIGHT_PX = 26;

const PRINT_CATEGORY_COLORS: Record<
  CanteraCategorySlug,
  { background: string; border: string; color: string }
> = {
  debutantes: { background: '#fae8ff', border: '#d946ef', color: '#701a75' },
  prebenjamin: { background: '#f4f4f5', border: '#71717a', color: '#27272a' },
  benjamin: { background: '#d1fae5', border: '#10b981', color: '#065f46' },
  alevin: { background: '#e0f2fe', border: '#0ea5e9', color: '#0c4a6e' },
  infantil: { background: '#ede9fe', border: '#8b5cf6', color: '#4c1d95' },
  cadete: { background: '#fef3c7', border: '#f59e0b', color: '#92400e' },
  juvenil: { background: '#ffe4e6', border: '#f43f5e', color: '#9f1239' },
};

const DEFAULT_PRINT_COLOR = {
  background: '#ecfeff',
  border: '#06b6d4',
  color: '#155e75',
};

function printColorsForEvent(event: TrainingCalendarEvent) {
  if (event.categorySlug && PRINT_CATEGORY_COLORS[event.categorySlug]) {
    return PRINT_CATEGORY_COLORS[event.categorySlug];
  }
  return DEFAULT_PRINT_COLOR;
}

function TrainingSchedulePrintGrid({ events }: { events: TrainingCalendarEvent[] }) {
  const grid = computeCalendarTimeGrid(events);
  const timeLabels = buildCalendarTimeLabels(grid);
  const gridHeight = ((grid.endMinutes - grid.startMinutes) / grid.slotMinutes) * PRINT_ROW_HEIGHT_PX;

  const eventsByWeekday = new Map<string, TrainingCalendarEvent[]>();
  for (const day of WEEKDAY_BUTTONS) {
    eventsByWeekday.set(day.value, []);
  }
  for (const event of events) {
    const list = eventsByWeekday.get(event.weekday);
    if (list) list.push(event);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-gray-300 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
        <div className="px-1 py-2">Hora</div>
        {WEEKDAY_BUTTONS.map((day) => (
          <div key={day.value} className="border-l border-gray-200 px-1 py-2 text-center">
            {day.letter}
            <span className="mt-0.5 block text-[9px] font-normal normal-case text-gray-500">
              {day.title}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))]">
        <div className="relative border-r border-gray-200" style={{ height: gridHeight }}>
          {timeLabels.map((label, index) => (
            <div
              key={label}
              className="absolute right-1 -translate-y-1/2 text-[9px] tabular-nums text-gray-500"
              style={{ top: index * PRINT_ROW_HEIGHT_PX }}
            >
              {label}
            </div>
          ))}
        </div>

        {WEEKDAY_BUTTONS.map((day) => {
          const dayEvents = positionEventsForWeekday(eventsByWeekday.get(day.value) ?? []);

          return (
            <div
              key={day.value}
              className="relative border-l border-gray-200"
              style={{ height: gridHeight }}
            >
              {timeLabels.map((label, index) => (
                <div
                  key={`${day.value}-${label}`}
                  className="absolute inset-x-0 border-t border-gray-100"
                  style={{ top: index * PRINT_ROW_HEIGHT_PX }}
                />
              ))}

              {dayEvents.map((event) => {
                const colors = printColorsForEvent(event);
                const top =
                  ((event.startMinutes - grid.startMinutes) / grid.slotMinutes) * PRINT_ROW_HEIGHT_PX;
                const height = Math.max(
                  ((event.endMinutes - event.startMinutes) / grid.slotMinutes) * PRINT_ROW_HEIGHT_PX - 2,
                  20
                );
                const widthPercent = 100 / event.laneCount;
                const leftPercent = event.lane * widthPercent;

                return (
                  <div
                    key={event.id}
                    className="absolute overflow-hidden rounded border px-1 py-0.5 text-[9px] leading-tight"
                    style={{
                      top,
                      height,
                      left: `calc(${leftPercent}% + 1px)`,
                      width: `calc(${widthPercent}% - 2px)`,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.color,
                    }}
                  >
                    <p className="truncate font-semibold">{event.teamName}</p>
                    <p className="truncate">
                      {event.start}–{event.end}
                    </p>
                    {event.divisionLabel ? (
                      <p className="truncate opacity-80">{event.divisionLabel}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type TrainingSchedulePrintSection = {
  facilityId: string;
  facilityName: string;
  events: TrainingCalendarEvent[];
};

type Props = {
  clubName: string;
  clubLogoUrl: string | null;
  sections: TrainingSchedulePrintSection[];
  generatedAt: string;
};

export function TrainingSchedulePrintDocument({
  clubName,
  clubLogoUrl,
  sections,
  generatedAt,
}: Props) {
  const generatedLabel = new Date(generatedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="training-schedule-print relative mx-auto max-w-[72rem] overflow-hidden rounded-lg bg-white p-8 text-gray-900 shadow print:shadow-none">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05] print:opacity-[0.07]"
        aria-hidden
      >
        <SynqIcon size={320} />
      </div>

      <div className="relative">
        <header className="border-b border-gray-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {clubLogoUrl ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Image
                    src={clubLogoUrl}
                    alt={`Escudo ${clubName}`}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                  Escudo
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Horarios de entrenamiento
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-tight">{clubName}</h1>
                <p className="mt-1 text-sm text-gray-600">Calendario semanal · {generatedLabel}</p>
              </div>
            </div>
            <SynqBrandLockup layout="stacked" iconSize={48} wordmarkSize="sm" showSportsSuffix />
          </div>
        </header>

        <div className="mt-6 space-y-8">
          {sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              No hay entrenamientos con horario asignado para la selección indicada.
            </p>
          ) : (
            sections.map((section, index) => (
              <section
                key={section.facilityId}
                className={
                  index < sections.length - 1
                    ? 'training-schedule-print-section break-after-page'
                    : undefined
                }
              >
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Sede</p>
                    <h2 className="text-lg font-semibold text-gray-900">{section.facilityName}</h2>
                  </div>
                  <p className="text-xs text-gray-500">
                    {section.events.length} sesión{section.events.length === 1 ? '' : 'es'} semanales
                  </p>
                </div>
                <TrainingSchedulePrintGrid events={section.events} />
              </section>
            ))
          )}
        </div>

        <footer className="mt-10 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-[10px] uppercase tracking-wider text-gray-400">
          <SynqIcon size={16} />
          <span>Documento generado con SynqAI Sports</span>
        </footer>
      </div>
    </div>
  );
}
