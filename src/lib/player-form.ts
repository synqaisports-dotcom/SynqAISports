export const PLAYER_BIRTH_YEAR_MIN = 1990;

export function playerBirthYearMax(): number {
  return new Date().getFullYear();
}

export function playerBirthYearOptions(maxYear = playerBirthYearMax()) {
  const options: { value: string; label: string }[] = [];
  for (let year = maxYear; year >= PLAYER_BIRTH_YEAR_MIN; year -= 1) {
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}

export function isValidJerseyNumber(value: number | null): boolean {
  return value == null || (Number.isInteger(value) && value >= 0 && value <= 99);
}

export function isValidBirthYear(value: number | null, maxYear = playerBirthYearMax()): boolean {
  return (
    value == null ||
    (Number.isInteger(value) && value >= PLAYER_BIRTH_YEAR_MIN && value <= maxYear)
  );
}

export function parseOptionalInt(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
