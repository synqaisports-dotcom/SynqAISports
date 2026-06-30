'use client';

import { DEMO_COOKIE, isDemoCookieValue, isDemoModeEnv } from '@/lib/demo-constants';

export function isDemoClient(): boolean {
  if (isDemoModeEnv()) return true;
  if (typeof document === 'undefined') return false;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${DEMO_COOKIE}=`));
  return isDemoCookieValue(match?.split('=')[1]);
}

export function demoTemplateMicrocycleId(mccId: string, variantId: string): string {
  return `demo-micro-${mccId}-${variantId}`;
}

export function demoTeamMicrocycleId(teamId: string, mccId: string): string {
  return `demo-micro-team-${teamId}-${mccId}`;
}
