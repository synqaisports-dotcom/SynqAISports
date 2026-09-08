'use client';

import Link from 'next/link';
import { TournamentHeaderActions } from '@/components/portal/torneos/TournamentHeaderActions';
import {
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type Tournament,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { ArrowRight, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cardSurfaceClass =
  'portal-section-surface rounded-xl transition-colors hover:border-primary/40';

type Props = {
  tournament: Tournament;
  teamCount: number;
};

export function TournamentListCard({ tournament, teamCount }: Props) {
  const dateLabel = tournament.starts_at
    ? new Date(tournament.starts_at).toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : 'Sin fecha';

  return (
    <div className={cn(cardSurfaceClass, 'p-4')}>
      <div className="flex items-start justify-between gap-3">
        <Link href={`/portal/torneos/${tournament.id}`} className="min-w-0 flex-1 group">
          <p className="truncate font-medium group-hover:text-cyan-200">{tournament.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {TOURNAMENT_SPORT_LABELS[tournament.sport_key]} · {dateLabel}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wider text-cyan-300/80">
            {TOURNAMENT_STATUS_LABELS[tournament.status]}
            {tournament.public_enabled ? ' · Público' : ''}
            {' · '}
            {teamCount} equipos
          </p>
        </Link>
        <Link
          href={`/portal/torneos/${tournament.id}`}
          className="shrink-0 text-muted-foreground hover:text-primary"
          aria-label="Gestionar torneo"
        >
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
          <Link href={`/portal/torneos/${tournament.id}`}>Gestionar</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground">
          <Link href={`/portal/torneos/${tournament.id}?tab=ajustes`}>
            <Settings className="size-3.5" />
            Ajustes
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5 text-xs text-muted-foreground">
          <Link href={`/portal/torneos/${tournament.id}?tab=dossier`}>
            <FileText className="size-3.5" />
            Dossier
          </Link>
        </Button>
        <TournamentHeaderActions tournament={tournament} />
      </div>
    </div>
  );
}
