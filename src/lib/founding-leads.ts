import type { FoundingLead } from '@/lib/demo-founding-store';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function foundingSlug(name: string, taken: Set<string>): string {
  const base =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'club';
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function foundingInviteCode(taken: Set<string>): string {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 8; i += 1) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  } while (taken.has(code));
  return code;
}

export function foundingUntilFrom(now = new Date()): string {
  const until = new Date(now);
  until.setMonth(until.getMonth() + 12);
  return until.toISOString();
}

export function takenSlugs(leads: FoundingLead[], exceptId?: string): Set<string> {
  return new Set(
    leads
      .filter((lead) => lead.id !== exceptId && lead.club_slug)
      .map((lead) => lead.club_slug as string)
  );
}

export function takenCodes(leads: FoundingLead[], exceptId?: string): Set<string> {
  return new Set(
    leads
      .filter((lead) => lead.id !== exceptId && lead.invite_code)
      .map((lead) => lead.invite_code as string)
  );
}
