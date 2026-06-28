'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserCog } from 'lucide-react';
import type { ClubPerson } from '@/lib/club-people';
import { medicalStatus } from '@/lib/profile-row';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
  people: ClubPerson[];
  actions?: ReactNode;
  className?: string;
};

export function StaffHero({ people, actions, className }: Props) {
  const medicalOk = people.filter((person) => medicalStatus(person).ok).length;
  const pending = people.length - medicalOk;

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-primary/20 via-background to-background px-4 py-6 md:px-6 md:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, hsl(183 100% 50% / 0.5) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        {actions ? (
          <div className="relative z-10 mb-4 flex justify-end gap-2">{actions}</div>
        ) : null}
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <UserCog className="size-3.5" />
            Cuerpo técnico
          </div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Staff deportivo</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Fichas del cuerpo técnico enlazadas a la persona maestra del club. Misma persona puede
            aparecer en organigrama y aquí con distintos roles.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{people.length} fichas</Badge>
            {medicalOk > 0 ? <Badge variant="outline">{medicalOk} médico OK</Badge> : null}
            {pending > 0 ? <Badge variant="destructive">{pending} pendientes</Badge> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StaffHeroLinkAction({
  href,
  children,
  variant = 'default',
}: {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'outline';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-sm transition-colors',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border border-primary/30 bg-card/90 text-foreground hover:bg-card'
      )}
    >
      {children}
    </Link>
  );
}
