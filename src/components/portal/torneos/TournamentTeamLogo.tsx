import type { TournamentTeam } from '@/lib/tournaments';
import { cn } from '@/lib/utils';

type TeamLike = Pick<TournamentTeam, 'name' | 'logo_url'>;

const SIZE_CLASS = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  md: 'size-8 text-xs',
} as const;

type Props = {
  team: TeamLike;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

export function TournamentTeamLogo({ team, size = 'sm', className }: Props) {
  const sizeClass = SIZE_CLASS[size];

  if (team.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.logo_url}
        alt=""
        className={cn(sizeClass, 'shrink-0 rounded-md border border-border/40 bg-background/50 object-contain p-0.5', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'flex shrink-0 items-center justify-center rounded-md border border-border/40 bg-primary/10 font-bold text-primary',
        className
      )}
      aria-hidden
    >
      {team.name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export function findTournamentTeam(
  teams: TournamentTeam[],
  teamId: string | null | undefined
): TournamentTeam | null {
  if (!teamId) return null;
  return teams.find((t) => t.id === teamId) ?? null;
}
