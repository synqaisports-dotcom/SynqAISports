'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toggleTournamentPublic } from '@/app/actions/tournaments';
import { TournamentAccessSheet } from '@/components/portal/torneos/TournamentAccessSheet';
import { publicTournamentUrl } from '@/lib/tournament-urls';
import type { Tournament } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExternalLink, Eye, EyeOff, QrCode } from 'lucide-react';

const iconBtnClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-primary/25 text-cyan-300 transition-colors hover:border-primary/45 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50';

type Props = {
  tournament: Tournament;
};

export function TournamentHeaderActions({ tournament }: Props) {
  const [pending, startTransition] = useTransition();
  const [accessOpen, setAccessOpen] = useState(false);
  const [publicEnabled, setPublicEnabled] = useState(tournament.public_enabled);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-1.5">
        {publicEnabled ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={publicTournamentUrl(tournament.slug)}
                target="_blank"
                className={iconBtnClass}
                aria-label="Abrir web pública"
              >
                <ExternalLink className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Web pública del torneo</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn(iconBtnClass, 'cursor-not-allowed opacity-40')} aria-hidden>
                <ExternalLink className="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Publica el torneo para abrir la web</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={iconBtnClass}
              onClick={() => setAccessOpen(true)}
              aria-label="Accesos y enlaces PWA"
            >
              <QrCode className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Accesos PWA (mesa, delegado, QR)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={iconBtnClass}
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const next = !publicEnabled;
                  const res = await toggleTournamentPublic(tournament.id, next);
                  if (res.ok) setPublicEnabled(next);
                });
              }}
              aria-label={publicEnabled ? 'Ocultar web pública' : 'Publicar web'}
            >
              {publicEnabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{publicEnabled ? 'Ocultar web pública' : 'Publicar web pública'}</TooltipContent>
        </Tooltip>
      </div>

      <TournamentAccessSheet
        tournamentId={tournament.id}
        open={accessOpen}
        onOpenChange={setAccessOpen}
      />
    </TooltipProvider>
  );
}
