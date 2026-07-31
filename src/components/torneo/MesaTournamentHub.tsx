'use client';

import { useMemo, useState } from 'react';
import { MesaScoreboard } from '@/components/torneo/MesaScoreboard';
import { fieldLabel, formatMatchDateTime } from '@/lib/tournament-schedule';
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
import { ArrowLeft, CalendarClock, MapPin, Radio, Trophy } from 'lucide-react';
import Link from 'next/link';

type Props = {
  bundle: TournamentBundle;
  matches: TournamentMatch[];
  initialMatchId?: string | null;
};

const STATUS_FILTERS: { key: MatchStatusFilter; label: string }[] = [
  { key: 'live', label: 'En juego' },
  { key: 'scheduled', label: 'Programados' },
  { key: 'finished', label: 'Finalizados' },
  { key: 'all', label: 'Todos' },
];

function teamName(bundle: TournamentBundle, teamId: string | null): string {
  if (!teamId) return '—';
  return bundle.teams.find((t) => t.id === teamId)?.name ?? '—';
}

export function MesaTournamentHub({ bundle, matches, initialMatchId }: Props) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(initialMatchId ?? null);
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [hourFilter, setHourFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>('live');

  const fieldOptions = useMemo(() => {
    const ids = [...new Set(matches.map((m) => m.field_id).filter(Boolean))] as string[];
    return ids.map((id) => ({ id, label: fieldLabel(bundle.fields, id) }));
  }, [bundle.fields, matches]);

  const hourOptions = useMemo(() => {
    const keys = [...new Set(matches.map((m) => scheduledHourKey(m.scheduled_at)))].sort();
    return keys.map((key) => ({
      key,
      label: key === 'sin-horario' ? 'Sin horario' : key,
    }));
  }, [matches]);

  const filteredMatches = useMemo(() => {
    let list = filterMatchesByStatus(matches, statusFilter);
    if (fieldFilter !== 'all') {
      list = list.filter((m) => m.field_id === fieldFilter);
    }
    if (hourFilter !== 'all') {
      list = list.filter((m) => scheduledHourKey(m.scheduled_at) === hourFilter);
    }
    return [...list].sort((a, b) => {
      const ta = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
      const tb = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
      return ta - tb;
    });
  }, [matches, statusFilter, fieldFilter, hourFilter]);

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId) ?? null
    : null;

  if (selectedMatch) {
    return (
      <MesaScoreboard
        key={selectedMatch.id}
        match={selectedMatch}
        bundle={bundle}
        onBack={() => setSelectedMatchId(null)}
      />
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5">
        <p className="text-center text-xs uppercase tracking-widest text-cyan-300">Mesa móvil · SynqAI</p>
        <h1 className="mt-2 text-center text-lg font-semibold">{bundle.tournament.name}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Selecciona campo y horario para anotar partidos
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

        {fieldOptions.length > 1 ? (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Campo
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={fieldFilter === 'all'} onClick={() => setFieldFilter('all')} label="Todos" />
              {fieldOptions.map((field) => (
                <FilterChip
                  key={field.id}
                  active={fieldFilter === field.id}
                  onClick={() => setFieldFilter(field.id)}
                  label={field.label}
                />
              ))}
            </div>
          </div>
        ) : null}

        {hourOptions.length > 1 ? (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Horario
            </p>
            <div className="flex flex-wrap gap-2">
              <FilterChip active={hourFilter === 'all'} onClick={() => setHourFilter('all')} label="Todos" />
              {hourOptions.map((slot) => (
                <FilterChip
                  key={slot.key}
                  active={hourFilter === slot.key}
                  onClick={() => setHourFilter(slot.key)}
                  label={slot.label}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 space-y-2">
        {filteredMatches.length === 0 ? (
          <p className="rounded-xl border border-border/40 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground">
            No hay partidos con estos filtros.
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
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="size-3 text-cyan-300" />
                        {when.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-cyan-300" />
                        {fieldLabel(bundle.fields, match.field_id)}
                      </span>
                    </div>
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
