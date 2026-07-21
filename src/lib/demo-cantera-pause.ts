import { cookies } from 'next/headers';

const PAUSED_TEAMS_COOKIE = 'synq_demo_paused_teams';
const PAUSED_PLAYERS_COOKIE = 'synq_demo_paused_players';

function parseCookieSet(value: string | undefined): Set<string> {
  if (!value?.trim()) return new Set();
  return new Set(value.split(',').map((item) => item.trim()).filter(Boolean));
}

function serializeCookieSet(set: Set<string>): string {
  return [...set].join(',');
}

export async function getDemoPausedTeamIds(): Promise<Set<string>> {
  const cookieStore = await cookies();
  return parseCookieSet(cookieStore.get(PAUSED_TEAMS_COOKIE)?.value);
}

export async function getDemoPausedPlayerIds(): Promise<Set<string>> {
  const cookieStore = await cookies();
  return parseCookieSet(cookieStore.get(PAUSED_PLAYERS_COOKIE)?.value);
}

export async function setDemoTeamActive(teamId: string, active: boolean): Promise<void> {
  const cookieStore = await cookies();
  const paused = await getDemoPausedTeamIds();
  if (active) paused.delete(teamId);
  else paused.add(teamId);
  cookieStore.set(PAUSED_TEAMS_COOKIE, serializeCookieSet(paused), { path: '/' });
}

export async function setDemoPlayerActive(playerId: string, active: boolean): Promise<void> {
  const cookieStore = await cookies();
  const paused = await getDemoPausedPlayerIds();
  if (active) paused.delete(playerId);
  else paused.add(playerId);
  cookieStore.set(PAUSED_PLAYERS_COOKIE, serializeCookieSet(paused), { path: '/' });
}

export function isDemoCanteraEntityId(id: string): boolean {
  return id.startsWith('demo-');
}
