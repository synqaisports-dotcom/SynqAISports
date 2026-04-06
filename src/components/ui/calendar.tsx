"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type CalendarProps = {
  className?: string;
  /** Compat con la API anterior (se ignora). */
  mode?: "single" | string;
  /** Fecha seleccionada. */
  selected?: Date;
  /** Callback al seleccionar día. */
  onSelect?: (date: Date | undefined) => void;
  /** Deshabilitar días (p.ej. fechas anteriores a inicio). */
  disabled?: (date: Date) => boolean;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a?: Date, b?: Date): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function formatMonthLabelES(d: Date): string {
  const month = d.toLocaleDateString("es-ES", { month: "long" });
  const monthTitle = month.length ? month[0].toUpperCase() + month.slice(1) : month;
  return `${monthTitle} ${d.getFullYear()}`;
}

function Calendar({ className, selected, onSelect, disabled }: CalendarProps) {
  const initial = React.useMemo(() => (selected ? new Date(selected) : new Date()), [selected]);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => new Date(initial.getFullYear(), initial.getMonth(), 1));

  React.useEffect(() => {
    if (!selected) return;
    setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [selected]);

  const today = React.useMemo(() => startOfDay(new Date()), []);
  // 0=Do ... 6=Sa -> queremos semana empezando en lunes
  const firstDowSunday0 = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const firstDowMonday0 = (firstDowSunday0 + 6) % 7; // 0=Lu ... 6=Do
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const blanks = Array.from({ length: firstDowMonday0 }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekdayLabels = ["LU", "MA", "MI", "JU", "VI", "SA", "DO"];
  const monthLabel = formatMonthLabelES(currentMonth);

  return (
    <div
      className={cn(
        "w-full max-w-[360px] bg-[#0F172A]/70 backdrop-blur-md border border-primary/25 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.08)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-primary/15 bg-[#0b1220]">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <div className="text-[12px] font-black tracking-[0.16em] uppercase text-white truncate">{monthLabel}</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, -1))}
            className="h-8 w-8 rounded-xl border border-primary/20 bg-black/20 text-primary hover:bg-primary/10 transition-[background-color,border-color,color,opacity,transform]"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="mx-auto h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="h-8 w-8 rounded-xl border border-primary/20 bg-black/20 text-primary hover:bg-primary/10 transition-[background-color,border-color,color,opacity,transform]"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="mx-auto h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {weekdayLabels.map((d) => (
            <div key={d} className="text-center text-[10px] font-black text-primary/55 tracking-[0.1em]">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((k) => (
            <div key={`b-${k}`} className="h-10 rounded-lg" aria-hidden="true" />
          ))}

          {days.map((day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isDisabled = disabled ? disabled(date) : false;
            const isSelected = sameDay(selected, date);
            const isToday = sameDay(today, date);

            return (
              <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (isDisabled) return;
                  onSelect?.(startOfDay(date));
                }}
                className={cn(
                  "h-10 rounded-xl border text-sm flex items-center justify-center transition-all duration-200",
                  isDisabled && "opacity-40 cursor-not-allowed border-transparent text-white/40",
                  !isDisabled &&
                    !isSelected &&
                    "border-transparent text-white hover:border-primary/40 hover:bg-primary/5",
                  isSelected &&
                    "bg-primary text-[#06101a] font-black border-primary shadow-[0_0_14px_rgba(0,242,255,0.35)]",
                  !isSelected && isToday && "border-primary/25 bg-white/[0.02]"
                )}
                aria-pressed={isSelected}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
