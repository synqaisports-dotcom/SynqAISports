import { cookies } from 'next/headers';
import {
  COACH_FREE_RECORD_COOKIE,
  openCoachFreePayload,
} from '@/lib/coach-free';
import {
  findCoachFreeByEmail,
  insertCoachFreeAccount,
  listCoachFreeAccounts,
  type CoachFreeAccount,
} from '@/lib/demo-coach-free-store';
import { createServiceClient } from '@/lib/supabase/service';

type AccountRow = {
  id: string;
  full_name: string;
  email: string;
  country_code: string;
  access_code: string;
  password_hash: string;
  created_at: string;
};

function mapRow(row: AccountRow): CoachFreeAccount {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    countryCode: row.country_code,
    accessCode: row.access_code,
    createdAt: row.created_at,
    passwordHash: row.password_hash,
  };
}

async function remoteAccounts(): Promise<CoachFreeAccount[]> {
  const service = createServiceClient();
  if (!service) return [];
  const { data, error } = await service
    .from('synq_coach_free_accounts')
    .select('id, full_name, email, country_code, access_code, password_hash, created_at');
  if (error || !data) return [];
  return (data as AccountRow[]).map(mapRow);
}

export async function listCoachFreeDirectory() {
  const merged = new Map<string, CoachFreeAccount>();
  for (const account of await remoteAccounts()) merged.set(account.email, account);
  for (const account of listCoachFreeAccounts()) merged.set(account.email, account);
  return [...merged.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ passwordHash: _passwordHash, ...account }) => account);
}

async function accountFromRecordCookie(email: string): Promise<CoachFreeAccount | undefined> {
  const cookieStore = await cookies();
  const saved = openCoachFreePayload<CoachFreeAccount>(cookieStore.get(COACH_FREE_RECORD_COOKIE)?.value);
  if (!saved || saved.email !== email || !saved.passwordHash) return undefined;
  insertCoachFreeAccount(saved);
  return saved;
}

export async function resolveCoachFreeAccount(email: string): Promise<CoachFreeAccount | undefined> {
  const local = findCoachFreeByEmail(email);
  if (local) return local;

  const service = createServiceClient();
  if (service) {
    const { data, error } = await service
      .from('synq_coach_free_accounts')
      .select('id, full_name, email, country_code, access_code, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();
    if (!error && data) {
      const account = mapRow(data as AccountRow);
      insertCoachFreeAccount(account);
      return account;
    }
  }

  return accountFromRecordCookie(email);
}
