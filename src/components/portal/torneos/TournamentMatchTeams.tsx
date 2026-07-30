import type { TournamentBundle } from '@/lib/tournaments';
import { findTournamentTeam, TournamentTeamLogo } from '@/components/portal/torneos/TournamentTeamLogo';

type Props = {
  bundle: TournamentBundle;
  homeTeamId: string | null;
  awayTeamId: string | null;
  compact?: boolean;
};

function TeamInline({
  bundle,
  teamId,
  compact,
}: {
  bundle: TournamentBundle;
  teamId: string | null;
  compact?: boolean;
}) {
  const team = findTournamentTeam(bundle.teams, teamId);
  const label = team?.name ?? '—';
  const display = compact && label.length > 12 ? `${label.slice(0, 10)}…` : label;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {team ? <TournamentTeamLogo team={team} size="xs" /> : null}
      <span className="truncate">{display}</span>
    </span>
  );
}

export function TournamentMatchTeams({ bundle, homeTeamId, awayTeamId, compact }: Props) {
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-1">
      <TeamInline bundle={bundle} teamId={homeTeamId} compact={compact} />
      <span className="text-muted-foreground">vs</span>
      <TeamInline bundle={bundle} teamId={awayTeamId} compact={compact} />
    </span>
  );
}
