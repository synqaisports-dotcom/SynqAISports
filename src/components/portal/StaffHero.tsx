'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { UserCog } from 'lucide-react';
import type { ClubPerson } from '@/lib/club-people';
import { medicalStatus } from '@/lib/profile-row';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';

type Props = {
  people: ClubPerson[];
  actions?: ReactNode;
  className?: string;
};

export function StaffHero({ people, actions, className }: Props) {
  const medicalOk = people.filter((person) => medicalStatus(person).ok).length;
  const pending = people.length - medicalOk;

  return (
    <PortalSectionShell actions={actions} className={className}>
      <PortalSectionBadge icon={<UserCog className="size-3.5" />}>Cuerpo técnico</PortalSectionBadge>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Staff deportivo</h1>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        Fichas del cuerpo técnico enlazadas a la persona maestra del club. Misma persona puede
        aparecer en organigrama y aquí con distintos roles.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{people.length} fichas</Badge>
        {medicalOk > 0 ? <Badge variant="outline">{medicalOk} médico OK</Badge> : null}
        {pending > 0 ? <Badge variant="destructive">{pending} pendientes</Badge> : null}
      </div>
    </PortalSectionShell>
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
          : 'border border-primary/30 bg-background/40 text-foreground backdrop-blur-sm hover:bg-primary/10'
      )}
    >
      {children}
    </Link>
  );
}
