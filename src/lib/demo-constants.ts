export const DEMO_COOKIE = 'synq_demo';

export const DEMO_CLUB_ID = '00000000-0000-4000-8000-000000000001';

/** Ruta única de entrada al portal sin login (siempre pone la cookie). */
export const DEMO_ENTRY_PATH = '/demo';

export function isDemoCookieValue(value: string | undefined): boolean {
  return value === '1';
}

/** Demo sin login. Variables: SYNQ_VERCEL_DEMO o NEXT_PUBLIC_SYNQ_DEMO_MODE = true */
export function isDemoModeEnv(): boolean {
  return (
    process.env.NEXT_PUBLIC_SYNQ_DEMO_MODE === 'true' ||
    process.env.SYNQ_VERCEL_DEMO === 'true'
  );
}

export function hasServiceRoleKey(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      process.env.SUPABASE_SECRET_KEY?.trim()
  );
}

export function getDemoClubIdFallback(): string {
  return process.env.SYNQ_DEMO_CLUB_ID?.trim() || DEMO_CLUB_ID;
}
