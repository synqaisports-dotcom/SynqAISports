'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { deviceIsOnline, type SignageDevice, type SignagePlaylist, type SignageSponsor } from '@/lib/signage';
import { cn } from '@/lib/utils';
import { ArrowRight, Handshake, ListMusic, Monitor, Wifi } from 'lucide-react';

type Props = {
  sponsors: SignageSponsor[];
  devices: SignageDevice[];
  playlists: SignagePlaylist[];
  actions?: ReactNode;
  className?: string;
};

const cardSurfaceClass =
  'portal-section-surface rounded-xl px-4 py-3.5 transition-colors hover:border-primary/40';

const linkedCardClass =
  'group block cursor-pointer hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  highlight,
}: {
  label: string;
  value: string;
  icon: typeof Monitor;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p
          className={cn(
            'mt-1.5 text-2xl font-semibold tabular-nums',
            highlight ? 'text-cyan-300' : 'text-primary'
          )}
        >
          {value}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {href ? (
          <ArrowRight
            className="size-3.5 text-primary/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
        <Icon className="size-5 text-primary/80" strokeWidth={1.75} aria-hidden />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={cn(cardSurfaceClass, linkedCardClass)}>
        {content}
      </Link>
    );
  }

  return <div className={cardSurfaceClass}>{content}</div>;
}

export function SignageHero({ sponsors, devices, playlists, actions, className }: Props) {
  const online = devices.filter((d) => deviceIsOnline(d.last_seen_at)).length;
  const activeSponsors = sponsors.filter((s) => s.active).length;

  const cards = [
    {
      label: 'Pantallas',
      value: String(devices.length),
      icon: Monitor,
      href: '/portal/signage/pantallas',
    },
    {
      label: 'En línea',
      value: String(online),
      icon: Wifi,
      href: '/portal/signage/pantallas',
      highlight: online > 0,
    },
    {
      label: 'Patrocinadores',
      value: String(activeSponsors),
      icon: Handshake,
      href: '/portal/signage/patrocinadores',
    },
    {
      label: 'Playlists',
      value: String(playlists.length),
      icon: ListMusic,
      href: '/portal/signage/programacion',
    },
  ] as const;

  return (
    <div className={cn('space-y-3', className)}>
      {actions ? <div className="flex justify-end">{actions}</div> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
