'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type Tournament,
  type TournamentCategory,
  type TournamentMatch,
  type TournamentTeam,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { TournamentOperativaInfoButton } from '@/components/portal/torneos/TournamentOperativaInfoButton';
import { ArrowRight, Calendar, Layers, Trophy, Users } from 'lucide-react';

type Props = {
  tournaments: Tournament[];
  categoriesCount: number;
  teamsCount: number;
  liveMatches: number;
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
  icon: typeof Trophy;
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

export function TournamentHero({
  tournaments,
  categoriesCount,
  teamsCount,
  liveMatches,
  actions,
  className,
}: Props) {
  const active = tournaments.filter((t) => t.status !== 'finished' && t.status !== 'cancelled').length;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="size-6 text-cyan-300" strokeWidth={1.75} />
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Torneos</h1>
            <TournamentOperativaInfoButton />
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Organiza torneos de fin de semana con grupos, finales paralelas Platinum/Silver, mesa móvil y ticketing QR.
          </p>
        </div>
        {actions}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Torneos activos" value={String(active)} icon={Trophy} href="/portal/torneos" />
        <StatCard label="Categorías" value={String(categoriesCount)} icon={Layers} highlight={categoriesCount > 0} />
        <StatCard label="Equipos" value={String(teamsCount)} icon={Users} />
        <StatCard
          label="En vivo"
          value={String(liveMatches)}
          icon={Calendar}
          highlight={liveMatches > 0}
        />
      </div>
    </div>
  );
}

export function TournamentCard({ tournament, teamCount }: { tournament: Tournament; teamCount: number }) {
  const dateLabel = tournament.starts_at
    ? new Date(tournament.starts_at).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'Sin fecha';

  return (
    <Link
      href={`/portal/torneos/${tournament.id}`}
      className={cn(cardSurfaceClass, linkedCardClass, 'block p-4')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{tournament.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {TOURNAMENT_SPORT_LABELS[tournament.sport_key]} · {dateLabel}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-cyan-300/80">
            {TOURNAMENT_STATUS_LABELS[tournament.status]}
            {tournament.public_enabled ? ' · Público' : ''}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="tabular-nums">{teamCount} equipos</p>
          <ArrowRight className="ml-auto mt-2 size-4 text-primary/50 group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}
