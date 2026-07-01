'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, MapPin } from 'lucide-react';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WEEKDAY_BUTTONS } from '@/lib/club-facilities';
import {
  CALENDAR_ROW_HEIGHT_PX,
  buildCalendarTimeLabels,
  computeCalendarTimeGrid,
  durationToGridHeight,
  eventStyleForFacility,
  eventStyleForTeam,
  minutesToGridOffset,
  positionEventsForWeekday,
  type TrainingCalendarEvent,
  type TrainingCalendarFacility,
} from '@/lib/training-calendar';
import { cn } from '@/lib/utils';

type ColorMode = 'team' | 'facility';

type Props = {
  events: TrainingCalendarEvent[];
  facilities: TrainingCalendarFacility[];
};

export function TrainingCalendarView({ events, facilities }: Props) {
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [colorMode, setColorMode] = useState<ColorMode>('team');

  const facilityIds = useMemo(() => facilities.map((facility) => facility.id), [facilities]);

  const filteredEvents = useMemo(() => {
    if (facilityFilter === 'all') return events;
    return events.filter((event) => event.facilityId === facilityFilter);
  }, [events, facilityFilter]);

  const grid = useMemo(() => computeCalendarTimeGrid(filteredEvents), [filteredEvents]);
  const timeLabels = useMemo(() => buildCalendarTimeLabels(grid), [grid]);

  const eventsByWeekday = useMemo(() => {
    const map = new Map<string, TrainingCalendarEvent[]>();
    for (const day of WEEKDAY_BUTTONS) {
      map.set(day.value, []);
    }
    for (const event of filteredEvents) {
      const list = map.get(event.weekday);
      if (list) list.push(event);
    }
    return map;
  }, [filteredEvents]);

  const legendItems = useMemo(() => {
    const seen = new Map<string, TrainingCalendarEvent>();
    for (const event of filteredEvents) {
      const key = colorMode === 'team' ? event.teamId : event.facilityId;
      if (!seen.has(key)) seen.set(key, event);
    }
    return [...seen.values()].sort((a, b) => a.teamName.localeCompare(b.teamName, 'es'));
  }, [filteredEvents, colorMode]);

  const gridHeight =
    ((grid.endMinutes - grid.startMinutes) / grid.slotMinutes) * CALENDAR_ROW_HEIGHT_PX;

  const facilityOptions = [
    { value: 'all', label: 'Todos los campos y sedes' },
    ...facilities.map((facility) => ({ value: facility.id, label: facility.name })),
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="size-4 text-primary" />
                Calendario semanal de entrenamientos
              </CardTitle>
              <CardDescription className="mt-1.5 max-w-2xl">
                Vista habitual de la semana: cada bloque muestra equipo, franja horaria y campo.
                El color identifica al equipo o a la instalación según el modo elegido.
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[28rem]">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Campo / sede
                </label>
                <SynqSelect
                  value={facilityFilter}
                  onChange={setFacilityFilter}
                  options={facilityOptions}
                  placeholder="Filtrar instalación"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Color en calendario
                </label>
                <SynqSelect
                  value={colorMode}
                  onChange={(value) => setColorMode(value as ColorMode)}
                  options={[
                    { value: 'team', label: 'Por equipo (categoría)' },
                    { value: 'facility', label: 'Por campo / sede' },
                  ]}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 bg-muted/5 p-6 text-sm text-muted-foreground">
              No hay entrenamientos con horario asignado
              {facilityFilter !== 'all' ? ' en esta instalación' : ''}. Configúralos en cada
              equipo desde Cantera → Equipos.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-primary/20 bg-muted/5">
              <div className="min-w-[52rem]">
                <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] border-b border-primary/15">
                  <div className="px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Hora
                  </div>
                  {WEEKDAY_BUTTONS.map((day) => (
                    <div
                      key={day.value}
                      className="border-l border-primary/10 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-primary/90"
                    >
                      {day.letter}
                      <span className="mt-0.5 block text-[10px] font-normal normal-case text-muted-foreground">
                        {day.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
                  <div className="relative border-r border-primary/10" style={{ height: gridHeight }}>
                    {timeLabels.map((label, index) => (
                      <div
                        key={label}
                        className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                        style={{ top: index * CALENDAR_ROW_HEIGHT_PX }}
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
                        className="relative border-l border-primary/10"
                        style={{ height: gridHeight }}
                      >
                        {timeLabels.map((label, index) => (
                          <div
                            key={`${day.value}-${label}`}
                            className={cn(
                              'absolute inset-x-0 border-t border-primary/10',
                              index % 2 === 1 && 'border-primary/5'
                            )}
                            style={{ top: index * CALENDAR_ROW_HEIGHT_PX }}
                          />
                        ))}

                        {dayEvents.map((event) => {
                          const style =
                            colorMode === 'facility'
                              ? eventStyleForFacility(event.facilityId, facilityIds)
                              : eventStyleForTeam(event.categorySlug);
                          const top = minutesToGridOffset(
                            event.startMinutes,
                            grid.startMinutes,
                            grid.slotMinutes
                          );
                          const height = durationToGridHeight(
                            event.startMinutes,
                            event.endMinutes,
                            grid.slotMinutes
                          );
                          const widthPercent = 100 / event.laneCount;
                          const leftPercent = event.lane * widthPercent;

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                'absolute overflow-hidden rounded-md border px-1.5 py-1 text-[10px] leading-tight shadow-sm',
                                style.block
                              )}
                              style={{
                                top,
                                height: Math.max(height - 2, 22),
                                left: `calc(${leftPercent}% + 2px)`,
                                width: `calc(${widthPercent}% - 4px)`,
                              }}
                              title={`${event.teamName} · ${event.start}–${event.end} · ${event.facilityName}${
                                event.divisionLabel ? ` · ${event.divisionLabel}` : ''
                              }`}
                            >
                              <p className="truncate font-semibold">{event.teamName}</p>
                              <p className="truncate opacity-90">
                                {event.start}–{event.end}
                              </p>
                              <p className="mt-0.5 flex items-center gap-0.5 truncate opacity-80">
                                <MapPin className="size-2.5 shrink-0" />
                                {event.facilityName}
                              </p>
                              {event.divisionLabel ? (
                                <p className="truncate opacity-75">{event.divisionLabel}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {legendItems.length > 0 ? (
        <Card className="border border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Leyenda</CardTitle>
            <CardDescription>
              {colorMode === 'team'
                ? 'Cada color corresponde a la categoría del equipo.'
                : 'Cada color corresponde a una instalación o sede de entrenamiento.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {legendItems.map((event) => {
              const style =
                colorMode === 'facility'
                  ? eventStyleForFacility(event.facilityId, facilityIds)
                  : eventStyleForTeam(event.categorySlug);
              const label = colorMode === 'team' ? event.teamName : event.facilityName;

              return (
                <Badge
                  key={colorMode === 'team' ? event.teamId : event.facilityId}
                  variant="outline"
                  className={cn('gap-2 border-primary/20 bg-muted/10 pr-3', style.block)}
                >
                  <span className={cn('size-2 rounded-full', style.dot)} />
                  {label}
                </Badge>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
