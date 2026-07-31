'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TournamentClasificacionPanel } from '@/components/portal/torneos/TournamentClasificacionPanel';
import { TournamentSchedulePanel } from '@/components/portal/torneos/TournamentSchedulePanel';
import { PublicBracketsPanel } from '@/components/torneo/public/PublicBracketsPanel';
import { PublicSponsorStrip } from '@/components/torneo/public/PublicSponsorStrip';
import { PublicSponsorsPanel } from '@/components/torneo/public/PublicSponsorsPanel';
import {
  parsePublicTournamentTab,
  PUBLIC_TOURNAMENT_TABS,
  type PublicTournamentTabId,
} from '@/lib/public-tournament-tabs';
import {
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type TournamentBundle,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  GitBranch,
  ListOrdered,
  MapPin,
  Megaphone,
  Radio,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TAB_ICONS: Record<PublicTournamentTabId, LucideIcon> = {
  horarios: CalendarClock,
  clasificacion: ListOrdered,
  cruces: GitBranch,
  patrocinadores: Megaphone,
};

type Props = {
  bundle: TournamentBundle;
  slug: string;
  initialTab?: PublicTournamentTabId;
};

export function PublicTournamentHub({ bundle, slug, initialTab = 'horarios' }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<PublicTournamentTabId>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const { tournament } = bundle;
  const liveMatches = bundle.matches.filter((m) => m.status === 'live');
  const sponsorsHref = `/torneo/${slug}?tab=patrocinadores`;

  const dateLabel = useMemo(() => {
    if (!tournament.starts_at) return null;
    const start = new Date(tournament.starts_at);
    const end = tournament.ends_at ? new Date(tournament.ends_at) : start;
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const startStr = start.toLocaleDateString('es-ES', opts);
    if (start.toDateString() === end.toDateString()) return startStr;
    const endStr = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    return `${startStr} – ${endStr}`;
  }, [tournament.starts_at, tournament.ends_at]);

  const selectTab = useCallback(
    (next: PublicTournamentTabId) => {
      setTab(next);
      const url = next === 'horarios' ? `/torneo/${slug}` : `/torneo/${slug}?tab=${next}`;
      router.replace(url, { scroll: false });
    },
    [router, slug]
  );

  return (
    <div className="min-h-dvh bg-[#060a12]">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-cyan-400/10">
        {tournament.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tournament.cover_image_url}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/80 to-[#060a12]/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-violet-500/5" />
        )}

        <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
              <Trophy className="mr-1 size-3" />
              Torneo oficial
            </Badge>
            <Badge variant="outline">{TOURNAMENT_STATUS_LABELS[tournament.status]}</Badge>
            {liveMatches.length > 0 ? (
              <Badge className="border-cyan-400/40 bg-cyan-400/15 text-cyan-100">
                <Radio className="mr-1 size-3 animate-pulse" />
                {liveMatches.length} en vivo
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            {tournament.name}
          </h1>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
            <span>{TOURNAMENT_SPORT_LABELS[tournament.sport_key]}</span>
            {dateLabel ? <span>{dateLabel}</span> : null}
            {tournament.venue_name ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5 text-cyan-300" />
                {tournament.venue_name}
              </span>
            ) : null}
          </div>

          {tournament.description ? (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/60">{tournament.description}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {bundle.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Sticky tabs */}
      <nav
        className="sticky top-0 z-20 border-b border-border/50 bg-[#060a12]/90 backdrop-blur-md"
        aria-label="Secciones del torneo"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
          {PUBLIC_TOURNAMENT_TABS.map(({ id, label }) => {
            const Icon = TAB_ICONS[id];
            return (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_hsl(183_100%_50%_/_0.12)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
            );
          })}
        </div>
      </nav>

      {/* Live ticker */}
      {liveMatches.length > 0 && tab !== 'horarios' ? (
        <div className="border-b border-cyan-400/20 bg-cyan-400/5">
          <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 text-xs">
            <Radio className="size-3.5 shrink-0 animate-pulse text-cyan-300" />
            <span className="shrink-0 font-medium text-cyan-200">En vivo ahora</span>
            {liveMatches.slice(0, 4).map((m) => {
              const home = bundle.teams.find((t) => t.id === m.home_team_id)?.name ?? '—';
              const away = bundle.teams.find((t) => t.id === m.away_team_id)?.name ?? '—';
              return (
                <span key={m.id} className="shrink-0 text-muted-foreground">
                  {home} vs {away}
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === 'horarios' ? <TournamentSchedulePanel bundle={bundle} /> : null}
        {tab === 'clasificacion' ? <TournamentClasificacionPanel bundle={bundle} /> : null}
        {tab === 'cruces' ? <PublicBracketsPanel bundle={bundle} /> : null}
        {tab === 'patrocinadores' ? <PublicSponsorsPanel sponsors={bundle.sponsors} /> : null}
      </main>

      {tab !== 'patrocinadores' ? (
        <PublicSponsorStrip sponsors={bundle.sponsors} sponsorsTabHref={sponsorsHref} />
      ) : null}

      <footer className="border-t border-white/5 py-6 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        SynqAI Sports · Torneo en vivo
      </footer>
    </div>
  );
}
