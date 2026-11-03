import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const COACH_FREE_COOKIE = 'synq_free_id';
export const COACH_FREE_RECORD_COOKIE = 'synq_free_record';

export type CoachFreeSession = {
  id: string;
  fullName: string;
  email: string;
  countryCode: string;
  accessCode: string;
  createdAt: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

export function createAccessCode(taken: Set<string>): string {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 8; i += 1) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  } while (taken.has(code));
  return code;
}

function sessionSecret(): string {
  return (
    process.env.COACH_FREE_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'synq-coach-free-demo-v1'
  );
}

export function sealCoachFreePayload(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `v1.${body}.${sig}`;
}

export function openCoachFreePayload<T>(token: string | undefined): T | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const body = parts[1];
  const sig = parts[2];
  const expected = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}
