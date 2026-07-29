import {
  fieldLabel,
  formatMatchDateTime,
  groupMatchesByDay,
  roundLabelWithBracket,
} from '@/lib/tournament-schedule';
import {
  formatMatchScore,
  TOURNAMENT_SPORT_LABELS,
  type TournamentBundle,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, MapPin, Radio, Trophy } from 'lucide-react';

export function PublicTournamentView({ bundle }: { bundle: TournamentBundle }) {
  const { tournament } = bundle;
  const liveMatches = bundle.matches.filter((m) => m.status === 'live');
  const days = groupMatchesByDay(bundle.matches.filter((m) => m.status !== 'finished').slice(0, 24));

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/50 bg-gradient-to-b from-cyan-400/10 to-transparent px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-cyan-300">
            <Trophy className="size-5" />
            <span className="text-xs uppercase tracking-widest">Torneo SynqAI</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{tournament.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {TOURNAMENT_SPORT_LABELS[tournament.sport_key]}
            {tournament.venue_name ? ` · ${tournament.venue_name}` : ''}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        {liveMatches.length > 0 ? (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-cyan-300">
              <Radio className="size-4 animate-pulse" />
              En vivo
            </h2>
            <div className="space-y-2">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} bundle={bundle} live />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="size-4" />
            Horarios
          </h2>
          {days.slice(0, 2).map((day) => (
            <div key={day.dateKey} className="mb-4 space-y-2">
              <p className="text-xs font-medium capitalize text-cyan-300/80">{day.label}</p>
              {day.matches.slice(0, 8).map((m) => (
                <MatchCard key={m.id} match={m} bundle={bundle} />
              ))}
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Categorías
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {bundle.categories.map((c) => (
              <div key={c.id} className="portal-section-surface rounded-xl p-3 text-sm">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.groups_count} grupos · {c.teams_per_group} equipos · Finales Platinum/Silver…
                </p>
              </div>
            ))}
          </div>
        </section>

        {bundle.sponsors.filter((s) => s.active).length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Patrocinadores
            </h2>
            <div className="flex flex-wrap gap-2">
              {bundle.sponsors
                .filter((s) => s.active)
                .map((s) => (
                  <Badge key={s.id} variant="outline">
                    {s.name}
                  </Badge>
                ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function MatchCard({
  match,
  bundle,
  live,
}: {
  match: TournamentBundle['matches'][0];
  bundle: TournamentBundle;
  live?: boolean;
}) {
  const home = bundle.teams.find((t) => t.id === match.home_team_id)?.name ?? '—';
  const away = bundle.teams.find((t) => t.id === match.away_team_id)?.name ?? '—';
  const cat = bundle.categories.find((c) => c.id === match.category_id)?.name;
  const when = formatMatchDateTime(match.scheduled_at);
  const bracket = match.bracket_key && match.bracket_key !== 'groups'
    ? bundle.categories
        .flatMap((c) => c.placement_brackets_json)
        .find((b) => b.bracket_key === match.bracket_key)?.name
    : undefined;

  return (
    <div className="portal-section-surface rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {cat} · {roundLabelWithBracket(match.round_key, bracket)}
        </p>
        <span className="text-xs font-medium tabular-nums text-cyan-300">{when.time}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {home} <span className="text-muted-foreground">vs</span> {away}
        </p>
        <span className={`tabular-nums font-semibold ${live ? 'text-cyan-300' : 'text-primary'}`}>
          {match.status === 'scheduled' ? '—' : formatMatchScore(match)}
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3" />
        {fieldLabel(bundle.fields, match.field_id)}
      </p>
    </div>
  );
}
