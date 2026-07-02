'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Landmark } from 'lucide-react';
import { ACCESS_PROFILE_LABELS, personSubtitle, type ClubPerson } from '@/lib/club-people';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';

type Props = {
  people: ClubPerson[];
  actions?: ReactNode;
  className?: string;
};

export function EstructuraHero({ people, actions, className }: Props) {
  const withAccess = people.filter((p) => p.access_profile && p.access_profile !== 'none').length;

  return (
    <PortalSectionShell actions={actions} className={className}>
      <PortalSectionBadge icon={<Landmark className="size-3.5" />}>Gobierno del club</PortalSectionBadge>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Estructura no deportiva</h1>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        Presidente, junta directiva y cargos institucionales. Cada persona tiene una ficha única
        que luego puede asignarse en el organigrama y, más adelante, definir su acceso al portal o
        a la app.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{people.length} personas</Badge>
        {withAccess > 0 ? (
          <Badge variant="outline">{withAccess} con perfil de acceso</Badge>
        ) : null}
      </div>
    </PortalSectionShell>
  );
}

export function EstructuraHeroLinkAction({
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

export function EstructuraPersonCard({ person }: { person: ClubPerson }) {
  const accessLabel =
    person.access_profile && person.access_profile !== 'none'
      ? ACCESS_PROFILE_LABELS[person.access_profile]
      : null;

  return (
    <div className="portal-section-surface rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{person.full_name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{personSubtitle(person)}</p>
        </div>
        {accessLabel ? (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {accessLabel}
          </Badge>
        ) : null}
      </div>
      {person.email || person.phone ? (
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {person.email ? <p>{person.email}</p> : null}
          {person.phone ? <p>{person.phone}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
