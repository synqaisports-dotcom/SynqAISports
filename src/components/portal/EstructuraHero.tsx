'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Landmark } from 'lucide-react';
import { ACCESS_PROFILE_LABELS, personSubtitle, type ClubPerson } from '@/lib/club-people';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
  people: ClubPerson[];
  actions?: ReactNode;
  className?: string;
};

export function EstructuraHero({ people, actions, className }: Props) {
  const withAccess = people.filter((p) => p.access_profile && p.access_profile !== 'none').length;

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
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Landmark className="size-3.5" />
              Gobierno del club
            </div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Estructura no deportiva
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Presidente, junta directiva y cargos institucionales. Cada persona tiene una ficha
              única que luego puede asignarse en el organigrama y, más adelante, definir su acceso
              al portal o a la app.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{people.length} personas</Badge>
              {withAccess > 0 ? (
                <Badge variant="outline">{withAccess} con perfil de acceso</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
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
          : 'border border-primary/30 bg-card/90 text-foreground hover:bg-card'
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
    <div className="rounded-xl border border-primary/25 bg-card p-4 shadow-[0_4px_24px_hsl(183_100%_50%_/_0.06)]">
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
