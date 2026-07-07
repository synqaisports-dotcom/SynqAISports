export type PlayerGuardian = {
  first_name: string;
  last_name: string;
  email: string;
};

export function emptyPlayerGuardian(): PlayerGuardian {
  return { first_name: '', last_name: '', email: '' };
}

export function parseGuardiansJson(value: unknown): PlayerGuardian[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      first_name: String(item?.first_name ?? '').trim(),
      last_name: String(item?.last_name ?? '').trim(),
      email: String(item?.email ?? '').trim(),
    }))
    .filter((guardian) => guardian.first_name || guardian.last_name || guardian.email)
    .slice(0, 2);
}

export function parseGuardiansFromForm(formData: FormData): PlayerGuardian[] {
  if (formData.get('isMinor') !== 'true') return [];

  const guardians: PlayerGuardian[] = [];

  for (const index of [1, 2] as const) {
    const includeSecond = formData.get('includeTutor2') === 'true';
    if (index === 2 && !includeSecond) continue;

    const first_name = String(formData.get(`tutor${index}FirstName`) ?? '').trim();
    const last_name = String(formData.get(`tutor${index}LastName`) ?? '').trim();
    const email = String(formData.get(`tutor${index}Email`) ?? '').trim();

    if (first_name || last_name || email) {
      guardians.push({ first_name, last_name, email });
    }
  }

  return guardians.slice(0, 2);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateGuardians(isMinor: boolean, guardians: PlayerGuardian[]): boolean {
  if (!isMinor) return true;

  const primary = guardians[0];
  if (!primary) return false;
  if (!primary.first_name || !primary.last_name || !isValidEmail(primary.email)) return false;

  for (const tutor of guardians.slice(1)) {
    if (!tutor.first_name || !tutor.last_name || !isValidEmail(tutor.email)) return false;
  }

  return true;
}
