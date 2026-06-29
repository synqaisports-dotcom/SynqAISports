import Link from 'next/link';
import type { ClubRow } from '@/lib/portal';
import { getClubSocialLinks, normalizeExternalUrl } from '@/lib/club-social';
import { cn } from '@/lib/utils';

type Props = {
  club: ClubRow;
  className?: string;
};

export function ClubSocialBar({ club, className }: Props) {
  const links = getClubSocialLinks(club).filter((item) => Boolean(item.url?.trim()));

  if (links.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>
        Sin redes configuradas
      </p>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {links.map(({ key, label, url, Icon }) => (
        <Link
          key={key}
          href={normalizeExternalUrl(url!)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-primary transition-colors hover:border-primary/55 hover:bg-primary/15 hover:text-primary"
          aria-label={label}
          title={label}
        >
          <Icon className="size-[18px]" />
        </Link>
      ))}
    </div>
  );
}
