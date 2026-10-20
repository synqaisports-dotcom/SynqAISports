import Link from 'next/link';
import { groupStandings, matchesByBracket } from '@/lib/tournament-brackets';
import { formatMatchDateTime, roundLabelWithBracket } from '@/lib/tournament-schedule';
import {
  formatMatchScore,
  placementBracketsForCategory,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, GitBranch, Radio, Trophy } from 'lucide-react';
import { mesaFieldUrlForMatch } from '@/lib/tournament-mesa-field';

type Props = {
  bundle: TournamentBundle;
  categoryId?: string;
};

function BracketMatchNode({
  match,
  bundle,
  bracketName,
}: {
  match: TournamentMatch;
  bundle: TournamentBundle;
  bracketName: string;
}) {
  const home = bundle.teams.find((t) => t.id === match.home_team_id)?.name ?? 'Por determinar';
  const away = bundle.teams.find((t) => t.id === match.away_team_id)?.name ?? 'Por determinar';
  const when = formatMatchDateTime(match.scheduled_at);
  const isLive = match.status === 'live';

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-xl border border-border/70 bg-background/40 p-3 text-sm',
        isLive && 'border-cyan-400/50 bg-cyan-400/5'
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {roundLabelWithBracket(match.round_key, bracketName)}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{when.full}</p>
      <div className="mt-2 space-y-1">
        <p className={cn('truncate font-medium', match.score_home > match.score_away && match.status === 'finished' && 'text-cyan-300')}>
          {home}
        </p>
        <p className={cn('truncate font-medium', match.score_away > match.score_home && match.status === 'finished' && 'text-cyan-300')}>
          {away}
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-lg font-bold tabular-nums text-primary">
          {match.status === 'scheduled' ? '—' : formatMatchScore(match)}
        </span>
        {isLive ? <Radio className="size-4 animate-pulse text-cyan-300" /> : null}
        {(() => {
          const mesaHref = mesaFieldUrlForMatch(bundle, match);
          return mesaHref ? (
            <Link href={mesaHref} target="_blank" className="text-cyan-300 hover:text-cyan-200">
              <ExternalLink className="size-4" />
            </Link>
          ) : null;
        })()}
      </div>
    </div>
  );
}

function BracketTree({
  bracketName,
  color,
  matches,
  bundle,
}: {
  bracketName: string;
  color?: string;
  matches: TournamentMatch[];
  bundle: TournamentBundle;
}) {
  const rounds = ['qf', 'r16', 'sf', 'final', 'third_place', 'consolation_final'] as const;
  const byRound = rounds
    .map((r) => ({
      round: r,
      matches: matches.filter((m) => m.round_key === r),
    }))
    .filter((x) => x.matches.length > 0);

  if (byRound.length === 0 && matches.length > 0) {
    return (
      <div className="space-y-2">
        {matches.map((m) => (
          <BracketMatchNode key={m.id} match={m} bundle={bundle} bracketName={bracketName} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-4">
        {byRound.map(({ round, matches: roundMatches }) => (
          <div key={round} className="flex w-52 flex-col gap-3">
            <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {roundLabelWithBracket(round, bracketName)}
            </p>
            {roundMatches.map((m) => (
              <BracketMatchNode key={m.id} match={m} bundle={bundle} bracketName={bracketName} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupStandingsTable({
  groupCode,
  bundle,
  categoryId,
}: {
  groupCode: string;
  bundle: TournamentBundle;
  categoryId: string;
}) {
  const catMatches = bundle.matches.filter((m) => m.category_id === categoryId);
  const standings = groupStandings(groupCode, bundle.teams, catMatches);

  return (
    <div className="portal-section-surface overflow-hidden rounded-xl">
      <div className="border-b border-border/50 bg-primary/5 px-3 py-2">
        <p className="text-sm font-semibold">Grupo {groupCode}</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Equipo</th>
            <th className="px-3 py-2 text-center">PJ</th>
            <th className="px-3 py-2 text-center">Pts</th>
            <th className="px-3 py-2 text-center">DG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team.id} className="border-t border-border/30">
              <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
              <td className="max-w-[120px] truncate px-3 py-2 font-medium">{row.team.name}</td>
              <td className="px-3 py-2 text-center tabular-nums">{row.played}</td>
              <td className="px-3 py-2 text-center tabular-nums font-semibold text-cyan-300">{row.pts}</td>
              <td className="px-3 py-2 text-center tabular-nums">{row.gf - row.ga}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryCruces({ bundle, category }: { bundle: TournamentBundle; category: TournamentCategory }) {
  const groups = bundle.groups.filter((g) => g.category_id === category.id);
  const groupCodes = groups.map((g) => g.code).sort();
  const brackets = placementBracketsForCategory(category);
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const groupMatches = categoryMatches.filter((m) => m.round_key === 'group');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {category.groups_count} grupos × {category.teams_per_group} equipos · Finales paralelas por puesto
          </p>
        </div>
        <Badge variant="outline">{groupMatches.length} partidos de grupos</Badge>
      </div>

      <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <Trophy className="size-4 text-primary" />
          Fase de grupos — clasificación
        </h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupCodes.map((code) => (
            <GroupStandingsTable key={code} groupCode={code} bundle={bundle} categoryId={category.id} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Tras los grupos: todos los 1º compiten en Platinum, los 2º en Gold, los 3º en Silver, los 4º en Bronze (nombres configurables).
        </p>
      </section>

      <section className="space-y-4">
        <h4 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          <GitBranch className="size-4 text-cyan-300" />
          Cruces eliminatorios por bandeja
        </h4>
        {brackets.map((bracket) => {
          const bracketMatches = matchesByBracket(categoryMatches, bracket.bracket_key);
          return (
            <div key={bracket.bracket_key} className="portal-section-surface rounded-xl p-4">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="size-3 rounded-full ring-2 ring-white/10"
                  style={{ backgroundColor: bracket.color ?? '#94a3b8' }}
                />
                <div>
                  <p className="font-semibold" style={{ color: bracket.color ?? undefined }}>
                    {bracket.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Puesto {bracket.position} en grupo · {bracketMatches.length} partidos
                  </p>
                </div>
              </div>
              <BracketTree
                bracketName={bracket.name}
                color={bracket.color}
                matches={bracketMatches}
                bundle={bundle}
              />
            </div>
          );
        })}

        {category.teams_per_group >= 4 ? (
          <div className="portal-section-surface rounded-xl p-4">
            <p className="font-semibold text-slate-400">Consolación</p>
            <p className="text-xs text-muted-foreground">Últimos puestos / bandeja inferior</p>
            <div className="mt-3">
              <BracketTree
                bracketName="Consolación"
                matches={matchesByBracket(categoryMatches, 'consolation')}
                bundle={bundle}
              />
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export function TournamentCrucesPanel({ bundle, categoryId }: Props) {
  const categories = categoryId
    ? bundle.categories.filter((c) => c.id === categoryId)
    : bundle.categories;

  if (categories.length === 0) {
    return (
      <div className="portal-section-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
        Añade categorías en <strong>Configuración</strong> y genera la competición para ver grupos y cruces.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {categories.map((cat) => (
        <CategoryCruces key={cat.id} bundle={bundle} category={cat} />
      ))}
    </div>
  );
}
