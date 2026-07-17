import { sortWeekdayCodes, WEEKDAY_OPTIONS } from '@/lib/club-facilities';
import type { SessionsPerMicro } from '@/lib/periodization';

function weekdayLabel(code: string): string {
  return WEEKDAY_OPTIONS.find((day) => day.value === code)?.label ?? code;
}

/** Etiquetas de sesión enlazadas a los días de entreno del equipo (p. ej. Mar · Sesión 1). */
export function coachSessionLabels(
  trainingDaysCsv: string | undefined,
  sessionsPerMicro: SessionsPerMicro
): string[] {
  const dayCodes = sortWeekdayCodes(
    (trainingDaysCsv ?? '')
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean)
  );

  return Array.from({ length: sessionsPerMicro }, (_, index) => {
    const sessionNumber = index + 1;
    const dayCode = dayCodes[index];
    if (!dayCode) return `Sesión ${sessionNumber}`;
    return `${weekdayLabel(dayCode)} · Sesión ${sessionNumber}`;
  });
}
