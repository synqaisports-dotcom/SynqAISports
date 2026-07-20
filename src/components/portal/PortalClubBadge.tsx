import Link from 'next/link';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

function clubInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type Props = {
  clubName: string;
  clubLogoUrl?: string | null;
  className?: string;
};

/** Escudo + nombre del club en la barra superior del portal. */
export function PortalClubBadge({ clubName, clubLogoUrl, className }: Props) {
  const hasLogo = Boolean(clubLogoUrl?.trim());
  const initials = clubInitials(clubName);

  return (
    <Link
      href="/portal/club/datos"
      className={cn(
        'flex min-w-0 max-w-[min(100%,14rem)] items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5',
        'transition-colors hover:border-primary/25 hover:bg-white/[0.06]',
        className
      )}
      title={clubName}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/25',
          hasLogo ? 'bg-card' : 'bg-primary text-primary-foreground'
        )}
      >
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clubLogoUrl!}
            alt=""
            className="size-full object-contain p-1"
          />
        ) : (
          <span className="flex flex-col items-center justify-center leading-none">
            <Shield className="size-3 opacity-80" aria-hidden />
            <span className="mt-0.5 text-[9px] font-bold tracking-tight">{initials}</span>
          </span>
        )}
      </span>
      <span className="truncate text-sm font-medium text-white/90">{clubName}</span>
    </Link>
  );
}
