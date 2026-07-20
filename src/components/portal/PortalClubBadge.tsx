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

/** Escudo + nombre del club en la barra superior (solo identificación, no interactivo). */
export function PortalClubBadge({ clubName, clubLogoUrl, className }: Props) {
  const hasLogo = Boolean(clubLogoUrl?.trim());
  const initials = clubInitials(clubName);

  return (
    <div
      className={cn('flex min-w-0 max-w-[min(100%,17rem)] items-center gap-2.5', className)}
      aria-label={`Club activo: ${clubName}`}
    >
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary/20',
          hasLogo ? 'bg-card/80' : 'bg-primary/90 text-primary-foreground'
        )}
        aria-hidden
      >
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clubLogoUrl!} alt="" className="size-full object-contain p-0.5" />
        ) : (
          <span className="flex flex-col items-center justify-center leading-none">
            <Shield className="size-2.5 opacity-80" />
            <span className="mt-px text-[8px] font-bold tracking-tight">{initials}</span>
          </span>
        )}
      </span>
      <span className="truncate text-[15px] font-medium leading-none text-white/92">{clubName}</span>
    </div>
  );
}
