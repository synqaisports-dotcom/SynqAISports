import { PublicAdSlot } from '@/components/torneo/public/PublicAdSlot';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

export function PublicAdMobileBanner({ className }: Props) {
  return (
    <div className={cn('lg:hidden', className)} aria-label="Publicidad móvil">
      <PublicAdSlot slotId="mobile-banner" />
    </div>
  );
}
