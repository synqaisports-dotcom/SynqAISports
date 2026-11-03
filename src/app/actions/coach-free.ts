'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { COACH_FREE_COUNTRIES } from '@/lib/coach-free-countries';
import {
  COACH_FREE_COOKIE,
  COACH_FREE_RECORD_COOKIE,
  createAccessCode,
  hashPassword,
  openCoachFreePayload,
  sealCoachFreePayload,
  verifyPassword,
  type CoachFreeSession,
} from '@/lib/coach-free';
import { listCoachFreeDirectory, resolveCoachFreeAccount } from '@/lib/coach-free-directory';
import {
  findCoachFreeByEmail,
  insertCoachFreeAccount,
  listCoachFreeAccounts,
  type CoachFreeAccount,
} from '@/lib/demo-coach-free-store';
import { createServiceClient } from '@/lib/supabase/service';

export type CoachFreeFormState = {
  ok: boolean;
  message: string;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

function cleanEmail(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim().toLowerCase();
}

async function cookieOptions() {
  const proto = (await headers()).get('x-forwarded-proto') ?? 'http';
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: proto === 'https',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
}

async function startSession(account: CoachFreeAccount): Promise<CoachFreeFormState> {
  const session: CoachFreeSession = {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    countryCode: account.countryCode,
    accessCode: account.accessCode,
    createdAt: account.createdAt,
  };
  const cookieStore = await cookies();
  const options = await cookieOptions();
  cookieStore.set(COACH_FREE_COOKIE, sealCoachFreePayload(session), options);
  cookieStore.set(COACH_FREE_RECORD_COOKIE, sealCoachFreePayload(account), options);
  return { ok: true, message: '' };
}

export async function registerCoachFree(
  _prev: CoachFreeFormState,
  formData: FormData
): Promise<CoachFreeFormState> {
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = cleanEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  const countryCode = String(formData.get('countryCode') ?? '').trim().toUpperCase();

  if (fullName.length < 2 || !email.includes('@') || password.length < 8) {
    return { ok: false, message: 'Revisa el nombre, el email y una contraseña de 8 caracteres.' };
  }
  if (!COACH_FREE_COUNTRIES.some((item) => item.code === countryCode)) {
    return { ok: false, message: 'Elige un país de la lista.' };
  }
  if (findCoachFreeByEmail(email) || (await resolveCoachFreeAccount(email))) {
    return { ok: false, message: 'Ese email ya tiene una cuenta Free. Entra con ella.' };
  }

  const taken = new Set((await listCoachFreeDirectory()).map((item) => item.accessCode));
  const account = insertCoachFreeAccount({
    id: crypto.randomUUID(),
    fullName,
    email,
    countryCode,
    accessCode: createAccessCode(taken),
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  });

  const service = createServiceClient();
  if (service) {
    const { error } = await service.from('synq_coach_free_accounts').insert({
      id: account.id,
      full_name: account.fullName,
      email: account.email,
      country_code: account.countryCode,
      access_code: account.accessCode,
      password_hash: account.passwordHash,
    });
    if (error) console.error('coach free insert', error);
  }

  return startSession(account);
}

export async function loginCoachFree(
  _prev: CoachFreeFormState,
  formData: FormData
): Promise<CoachFreeFormState> {
  const email = cleanEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  const account = await resolveCoachFreeAccount(email);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { ok: false, message: 'Email o contraseña incorrectos.' };
  }
  return startSession(account);
}

export async function logoutCoachFree(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COACH_FREE_COOKIE);
  cookieStore.delete(COACH_FREE_RECORD_COOKIE);
  redirect('/coach');
}

export async function currentCoachFree(): Promise<CoachFreeSession | null> {
  const cookieStore = await cookies();
  const session = openCoachFreePayload<CoachFreeSession>(cookieStore.get(COACH_FREE_COOKIE)?.value);
  if (session?.id && session.fullName && session.accessCode) return session;

  const legacyId = cookieStore.get(COACH_FREE_COOKIE)?.value;
  if (!legacyId) return null;
  const account = listCoachFreeAccounts().find((item) => item.id === legacyId);
  if (!account) return null;
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    countryCode: account.countryCode,
    accessCode: account.accessCode,
    createdAt: account.createdAt,
  };
}
