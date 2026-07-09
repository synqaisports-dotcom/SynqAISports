import { Badge } from '@/components/ui/badge';
import { playerMedicalStatus, type PlayerMedicalInfo } from '@/lib/player-medical';
import { cn } from '@/lib/utils';

type Props = {
  player: PlayerMedicalInfo;
  className?: string;
};

export function PlayerMedicalBadge({ player, className }: Props) {
  const medical = playerMedicalStatus(player);

  return (
    <Badge
      variant={medical.ok ? 'default' : 'destructive'}
      className={cn('text-[10px] font-semibold uppercase tracking-wide', className)}
    >
      {medical.label}
    </Badge>
  );
}
