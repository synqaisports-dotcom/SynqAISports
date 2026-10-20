import { PublicAdSlot } from '@/components/torneo/public/PublicAdSlot';

type Props = {
  categoryName: string;
  className?: string;
};

export function PublicCategoryAd({ categoryName, className }: Props) {
  return (
    <div className={className} aria-label={`Publicidad ${categoryName}`}>
      <PublicAdSlot slotId="content-inline" />
    </div>
  );
}
