import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const COACH_FREE_COOKIE = 'synq_free_id';

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
