import Link from 'next/link';
import type { ReactNode } from 'react';
import { ImageIcon, Shield } from 'lucide-react';
import type { ClubRow } from '@/lib/portal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type Props = {
  club: Pick<ClubRow, 'name' | 'country_code' | 'is_founding' | 'invite_code' | 'cover_url' | 'logo_url'>;
  /** Botones integrados en la sección (modificar, volver, etc.) */
  actions?: ReactNode;
  className?: string;
};

function clubInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ShieldBlock({
  name,
  logoUrl,
  size = 'md',
}: {
  name: string;
  logoUrl: string | null | undefined;
  size?: 'md' | 'lg';
}) {
  const hasLogo = Boolean(logoUrl?.trim());
  const initials = clubInitials(name);
  const dim = size === 'lg' ? 'size-20 md:size-24' : 'size-16 md:size-20';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-[0_4px_24px_hsl(183_100%_50%_/_0.12)]',
        dim,
        !hasLogo && 'bg-primary text-primary-foreground'
      )}
    >
      {hasLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl!}
          alt={`Escudo de ${name}`}
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <Shield className={cn(size === 'lg' ? 'size-6' : 'size-5', 'opacity-85')} />
          <span className={cn('font-bold leading-none', size === 'lg' ? 'text-lg' : 'text-sm')}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
}

export function ClubIdentityHero({ club, actions, className }: Props) {
  const hasCover = Boolean(club.cover_url?.trim());

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="relative h-32 w-full overflow-hidden md:h-40">
        {hasCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.cover_url!}
            alt={`Banner de ${club.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-primary/25 via-primary/8 to-background">
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(183 100% 50% / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(183 100% 50% / 0.35) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-primary/55">
              <ImageIcon className="size-7" strokeWidth={1.5} />
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />
        {actions ? (
          <div className="absolute right-3 top-3 flex items-center gap-2">{actions}</div>
        ) : null}
      </div>

      <div className="flex items-center gap-4 border-t border-primary/15 bg-card/40 px-4 py-4 md:gap-5 md:px-5 md:py-5">
        <ShieldBlock name={club.name} logoUrl={club.logo_url} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">{club.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{club.country_code}</Badge>
            {club.is_founding ? <Badge>Founding club</Badge> : null}
            {club.invite_code ? (
              <Badge variant="outline">Código {club.invite_code}</Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClubIdentityPreview({
  name,
  coverUrl,
  logoUrl,
  countryCode = 'ES',
}: {
  name: string;
  coverUrl: string;
  logoUrl: string;
  countryCode?: string;
}) {
  const hasCover = Boolean(coverUrl.trim());

  return (
    <div className="overflow-hidden rounded-xl border border-primary/30">
      <div className="relative h-28 w-full overflow-hidden md:h-32">
        {hasCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl.trim()} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-transparent text-primary/50">
            <ImageIcon className="size-6" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 bg-card px-3 py-3">
        <ShieldBlock name={name} logoUrl={logoUrl || null} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{name || 'Nombre del club'}</p>
          <Badge variant="secondary" className="mt-1.5">
            {countryCode}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export function ClubIdentityHeroLinkAction({
  href,
  children,
  variant = 'default',
}: {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'outline';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-sm transition-colors',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border border-primary/30 bg-card/90 text-foreground hover:bg-card'
      )}
    >
      {children}
    </Link>
  );
}
