'use client';

import { useMemo, useState } from 'react';
import { MesaScoreboard } from '@/components/torneo/MesaScoreboard';
import { formatMatchDateTime } from '@/lib/tournament-schedule';
import type { MesaFieldSlot } from '@/lib/tournament-mesa-field';
import {
  filterMatchesByStatus,
  scheduledHourKey,
  type MatchStatusFilter,
} from '@/lib/tournament-mesa';
import {
  formatMatchScore,
  MATCH_STATUS_LABELS,
  type TournamentBundle,
  type TournamentMatch,
} from '@/lib/tournaments';
import { publicTournamentUrl } from '@/lib/tournament-urls';
import { cn } from '@/lib/utils';
import { CalendarClock, MapPin, Radio, Trophy } from 'lucide-react';
import Link from 'next/link';

type Props = {
  bundle: TournamentBundle;
  slot: MesaFieldSlot;
  matches: TournamentMatch[];
};

const STATUS_FILTERS: { key: MatchStatusFilter; label: string }[] = [
  { key: 'live', label: 'En juego' },
  { key: 'scheduled', label: 'Programados' },
  { key: 'finished', label: 'Finalizados' },
];

function teamName(bundle: TournamentBundle, teamId: string | null): string {
  if (!teamId) return '—';
  return bundle.teams.find((t) => t.id === teamId)?.name ?? '—';
}

export function MesaFieldBoard({ bundle, slot, matches }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [hourFilter, setHourFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>('live');

  const hourOptions = useMemo(() => {
    const keys = [...new Set(matches.map((m) => scheduledHourKey(m.scheduled_at)))].sort();
    return keys.map((key) => ({
      key,
      label: key === 'sin-horario' ? 'Sin horario' : key,
    }));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let list = filterMatchesByStatus(matches, statusFilter);
    if (hourFilter !== 'all') {
      list = list.filter((m) => scheduledHourKey(m.scheduled_at) === hourFilter);
    }
    return list;
  }, [matches, statusFilter, hourFilter]);

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) ?? null
    : null;

  if (selectedMatch) {
    return (
      <MesaScoreboard
        key={selectedMatch.id}
        match={selectedMatch}
        bundle={bundle}
        mesaFieldToken={slot.token}
        onBack={() => setSelectedMatchId(null)}
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5">
        <p className="text-center text-xs uppercase tracking-widest text-cyan-300">Mesa móvil · SynqAI</p>
        <h1 className="mt-2 text-center text-lg font-semibold">{bundle.tournament.name}</h1>
        <p className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-sm text-cyan-200">
          <MapPin className="size-3.5 shrink-0" />
          {slot.label}
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Solo partidos de este campo con equipos asignados
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === key
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
                  : 'border-white/10 text-muted-foreground hover:border-white/20'
              )}
            >
              {key === 'live' ? (
                <span className="inline-flex items-center gap-1">
                  <Radio className="size-3" />
                  {label}
                </span>
              ) : (
                label
              )}
            </button>
          ))}
        </div>

        {hourOptions.length > 1 ? (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Horario
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={hourFilter === 'all'} onClick={() => setHourFilter('all')} label="Todos" />
              {hourOptions.map((timeSlot) => (
                <FilterChip
                  key={timeSlot.key}
                  active={hourFilter === timeSlot.key}
                  onClick={() => setHourFilter(timeSlot.key)}
                  label={timeSlot.label}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {filteredMatches.length === 0 ? (
          <p className="rounded-xl border border-border/40 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground">
            No hay partidos en este campo con los filtros seleccionados.
          </p>
        ) : (
          filteredMatches.map((match) => {
            const when = formatMatchDateTime(match.scheduled_at);
            const score = formatMatchScore(match);
            const category = bundle.categories.find((c) => c.id === match.category_id);
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => setSelectedMatchId(match.id)}
                className="portal-section-surface w-full rounded-xl p-4 text-left transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {teamName(bundle, match.home_team_id)} vs {teamName(bundle, match.away_team_id)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {category?.name ?? 'Categoría'} · {MATCH_STATUS_LABELS[match.status]}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <CalendarClock className="size-3 text-cyan-300" />
                      {when.time}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {match.status !== 'scheduled' ? (
                      <p className="text-lg font-bold tabular-nums text-cyan-300">{score}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Pendiente</p>
                    )}
                    {match.status === 'live' ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase text-cyan-300">
                        <Radio className="size-3 animate-pulse" />
                        Live
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={publicTournamentUrl(bundle.tournament.slug)}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-300/80 hover:text-cyan-200"
        >
          <Trophy className="size-3.5" />
          Ver web pública del torneo
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11px] transition-colors',
        active
          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
          : 'border-white/10 text-muted-foreground hover:border-white/20'
      )}
    >
      {label}
    </button>
  );
}
