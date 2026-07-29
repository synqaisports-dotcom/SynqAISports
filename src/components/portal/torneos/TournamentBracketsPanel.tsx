import {
  MATCH_STATUS_LABELS,
  ROUND_KEY_LABELS,
  formatMatchScore,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { matchesByBracket } from '@/lib/tournament-brackets';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExternalLink, Radio } from 'lucide-react';
import { mesaUrl } from '@/lib/tournament-urls';

type Props = {
  bundle: TournamentBundle;
  categoryId?: string;
};

function teamName(bundle: TournamentBundle, teamId: string | null): string {
  if (!teamId) return 'Por determinar';
  return bundle.teams.find((t) => t.id === teamId)?.name ?? 'Equipo';
}

function MatchRow({ match, bundle }: { match: TournamentMatch; bundle: TournamentBundle }) {
  const mesaHref = match.mesa_token ? mesaUrl(match.mesa_token) : null;
  const isLive = match.status === 'live';

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm',
        isLive && 'border-cyan-400/40 bg-cyan-400/5'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {ROUND_KEY_LABELS[match.round_key]} · #{match.match_number}
        </p>
        <p className="mt-0.5 font-medium">
          {teamName(bundle, match.home_team_id)}{' '}
          <span className="text-muted-foreground">vs</span> {teamName(bundle, match.away_team_id)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isLive ? (
          <Badge className="gap-1 border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <Radio className="size-3 animate-pulse" />
            {MATCH_STATUS_LABELS.live}
          </Badge>
        ) : (
          <span className="tabular-nums font-semibold text-primary">
            {match.status === 'scheduled' ? '—' : formatMatchScore(match)}
          </span>
        )}
        {mesaHref ? (
          <Link
            href={mesaHref}
            target="_blank"
            className="text-muted-foreground hover:text-cyan-300"
            title="Abrir mesa"
          >
            <ExternalLink className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function CategoryBrackets({ bundle, category }: { bundle: TournamentBundle; category: TournamentCategory }) {
  const brackets = category.placement_brackets_json.length
    ? category.placement_brackets_json
    : [{ position: 1, name: 'Platinum', bracket_key: 'p1' }];

  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const groupMatches = categoryMatches.filter((m) => m.round_key === 'group').slice(0, 4);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{category.name}</h3>
      <p className="text-xs text-muted-foreground">
        {category.groups_count} grupos × {category.teams_per_group} equipos · Finales paralelas
      </p>

      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fase de grupos</p>
        {groupMatches.map((m) => (
          <MatchRow key={m.id} match={m} bundle={bundle} />
        ))}
        {categoryMatches.filter((m) => m.round_key === 'group').length > 4 ? (
          <p className="text-xs text-muted-foreground">
            +{categoryMatches.filter((m) => m.round_key === 'group').length - 4} partidos más
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {brackets.map((bracket) => {
          const bracketMatches = matchesByBracket(categoryMatches, bracket.bracket_key);
          return (
            <div key={bracket.bracket_key} className="portal-section-surface rounded-xl p-3">
              <p className="text-sm font-medium" style={{ color: bracket.color ?? undefined }}>
                {bracket.name}
              </p>
              <p className="text-[10px] text-muted-foreground">{bracketMatches.length} partidos</p>
              <div className="mt-2 space-y-1.5">
                {bracketMatches.slice(0, 3).map((m) => (
                  <MatchRow key={m.id} match={m} bundle={bundle} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TournamentBracketsPanel({ bundle, categoryId }: Props) {
  const categories = categoryId
    ? bundle.categories.filter((c) => c.id === categoryId)
    : bundle.categories;

  if (categories.length === 0) {
    return (
      <div className="portal-section-surface rounded-xl p-6 text-center text-sm text-muted-foreground">
        Añade categorías y genera la estructura de competición.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <CategoryBrackets key={cat.id} bundle={bundle} category={cat} />
      ))}
    </div>
  );
}
