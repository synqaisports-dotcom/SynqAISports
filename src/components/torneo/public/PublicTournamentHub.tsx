'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TournamentClasificacionPanel } from '@/components/portal/torneos/TournamentClasificacionPanel';
import { TournamentSchedulePanel } from '@/components/portal/torneos/TournamentSchedulePanel';
import { PublicAdScript } from '@/components/torneo/public/PublicAdScript';
import { PublicBracketsPanel } from '@/components/torneo/public/PublicBracketsPanel';
import { PublicCategoryAd } from '@/components/torneo/public/PublicCategoryAd';
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

const CONTENT_MAX = 'mx-auto w-full max-w-6xl px-4';

type Props = {
  bundle: TournamentBundle;
  slug: string;
  initialTab?: PublicTournamentTabId;
};

function renderCategoryAd(category: { name: string }) {
  return <PublicCategoryAd categoryName={category.name} />;
}

export function PublicTournamentHub({ bundle, slug, initialTab = 'horarios' }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<PublicTournamentTabId>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const { tournament } = bundle;
  const liveMatches = bundle.matches.filter((m) => m.status === 'live');
  const sponsorsHref = `/torneo/${slug}?tab=patrocinadores`;
  const hasSponsors = bundle.sponsors.some((s) => s.active);
  const showFixedSponsors = hasSponsors && tab !== 'patrocinadores';

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
    <div className={cn('relative min-h-dvh', showFixedSponsors && 'pb-16 md:pb-[4.5rem]')}>
      <PublicAdScript />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-cyan-400/10">
        {tournament.cover_image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tournament.cover_image_url}
              alt=""
              className="absolute inset-0 size-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a12] via-[#060a12]/85 to-[#060a12]/50" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/12 via-transparent to-violet-500/8" />
        )}

        <div className={cn(CONTENT_MAX, 'relative py-8 text-left md:py-12')}>
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

      {/* Sticky tabs — transparente */}
      <div className="sticky top-0 z-30">
        <div className={cn(CONTENT_MAX, 'py-3')}>
          <nav
            className="flex gap-1 overflow-x-auto rounded-xl p-1"
            aria-label="Secciones del torneo"
          >
            {PUBLIC_TOURNAMENT_TABS.map(({ id, label }) => {
              const Icon = TAB_ICONS[id];
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectTab(id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Live ticker */}
      {liveMatches.length > 0 && tab !== 'horarios' ? (
        <div className="border-b border-cyan-400/20 bg-cyan-400/5">
          <div className={cn(CONTENT_MAX, 'flex items-center gap-2 overflow-x-auto py-2 text-xs')}>
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

      {/* Content — ancho completo como antes */}
      <main className={cn(CONTENT_MAX, 'py-8')}>
        {tab === 'horarios' ? (
          <TournamentSchedulePanel bundle={bundle} renderAfterCategory={renderCategoryAd} />
        ) : null}
        {tab === 'clasificacion' ? (
          <TournamentClasificacionPanel bundle={bundle} renderAfterCategory={renderCategoryAd} />
        ) : null}
        {tab === 'cruces' ? <PublicBracketsPanel bundle={bundle} /> : null}
        {tab === 'patrocinadores' ? <PublicSponsorsPanel sponsors={bundle.sponsors} /> : null}
      </main>

      <footer
        className={cn(
          CONTENT_MAX,
          'border-t border-white/5 py-6 text-left text-[10px] uppercase tracking-widest text-muted-foreground',
          showFixedSponsors && 'pb-4'
        )}
      >
        SynqAI Sports · Torneo en vivo
      </footer>

      {showFixedSponsors ? (
        <PublicSponsorStrip sponsors={bundle.sponsors} sponsorsTabHref={sponsorsHref} fixed />
      ) : null}
    </div>
  );
}
