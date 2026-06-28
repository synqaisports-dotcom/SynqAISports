import Link from 'next/link';
import { Camera, ImageIcon, Shield } from 'lucide-react';
import type { ClubRow } from '@/lib/portal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
  club: ClubRow;
  showEditHint?: boolean;
  className?: string;
};

function clubInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ClubIdentityHero({ club, showEditHint = false, className }: Props) {
  const initials = clubInitials(club.name);
  const hasCover = Boolean(club.cover_url?.trim());
  const hasLogo = Boolean(club.logo_url?.trim());

  return (
    <div className={cn('relative', className)}>
      <div className="relative h-36 w-full overflow-hidden md:h-44">
        {hasCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.cover_url!}
            alt={`Banner de ${club.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-primary/30 via-primary/10 to-background">
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  'linear-gradient(hsl(183 100% 50% / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(183 100% 50% / 0.35) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/70">
              <ImageIcon className="size-8" strokeWidth={1.5} />
              <p className="text-xs font-medium tracking-wide">Banner del club</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

        {showEditHint && (!hasCover || !hasLogo) ? (
          <div className="absolute right-4 top-4">
            <Button size="sm" variant="secondary" className="h-8 gap-1.5 bg-card/90 text-xs shadow-sm" asChild>
              <Link href="/portal/club/datos/editar">
                <Camera className="size-3.5" />
                Añadir imágenes
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-0 left-5 translate-y-1/2 md:left-6">
        <div
          className={cn(
            'flex size-[4.5rem] items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-card shadow-[0_8px_32px_hsl(183_100%_50%_/_0.15)] md:size-24',
            !hasLogo && 'bg-primary text-primary-foreground'
          )}
        >
          {hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={club.logo_url!}
              alt={`Escudo de ${club.name}`}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-0.5">
              <Shield className="size-5 opacity-80 md:size-6" />
              <span className="text-sm font-bold leading-none md:text-lg">{initials}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-1 pt-14 md:px-6 md:pt-16">
        <h2 className="text-2xl font-semibold tracking-tight">{club.name}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{club.country_code}</Badge>
          {club.is_founding ? <Badge>Founding club</Badge> : null}
          {club.invite_code ? (
            <Badge variant="outline">Código {club.invite_code}</Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
