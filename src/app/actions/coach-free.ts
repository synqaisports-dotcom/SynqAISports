'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COACH_FREE_COUNTRIES } from '@/lib/coach-free-countries';
import {
  COACH_FREE_COOKIE,
  createAccessCode,
  hashPassword,
  verifyPassword,
} from '@/lib/coach-free';
import {
  findCoachFreeByEmail,
  findCoachFreeById,
  insertCoachFreeAccount,
  listCoachFreeAccounts,
} from '@/lib/demo-coach-free-store';
import { createServiceClient } from '@/lib/supabase/service';

export type CoachFreeFormState = {
  ok: boolean;
  message: string;
};

function cleanEmail(value: FormDataEntryValue | null): string {
  return String(value ?? '').trim().toLowerCase();
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
  if (findCoachFreeByEmail(email)) {
    return { ok: false, message: 'Ese email ya tiene una cuenta Free. Entra con ella.' };
  }

  const accessCode = createAccessCode(new Set(listCoachFreeAccounts().map((item) => item.accessCode)));
  const account = insertCoachFreeAccount({
    id: crypto.randomUUID(),
    fullName,
    email,
    countryCode,
    accessCode,
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

  const cookieStore = await cookies();
  cookieStore.set(COACH_FREE_COOKIE, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect('/coach/app');
}

export async function loginCoachFree(
  _prev: CoachFreeFormState,
  formData: FormData
): Promise<CoachFreeFormState> {
  const email = cleanEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  const account = findCoachFreeByEmail(email);
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { ok: false, message: 'Email o contraseña incorrectos.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(COACH_FREE_COOKIE, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect('/coach/app');
}

export async function logoutCoachFree(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COACH_FREE_COOKIE);
  redirect('/coach');
}

export async function currentCoachFree() {
  const cookieStore = await cookies();
  const id = cookieStore.get(COACH_FREE_COOKIE)?.value;
  if (!id) return null;
  const account = findCoachFreeById(id);
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
