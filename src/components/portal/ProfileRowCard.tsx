import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProfileRowField = {
  label: string;
  value: string;
};

type ProfileRowCardProps = {
  photoUrl?: string | null;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  fields?: ProfileRowField[];
  actions?: ReactNode;
  className?: string;
  inactive?: boolean;
};

export function ProfileRowCard({
  photoUrl,
  title,
  subtitle,
  badges,
  fields = [],
  actions,
  className,
  inactive,
}: ProfileRowCardProps) {
  return (
    <article
      className={cn(
        'flex w-full items-stretch gap-3 rounded-xl border border-primary/25 bg-card p-3 shadow-[0_4px_24px_hsl(183_100%_50%_/_0.06)] transition-colors sm:items-center sm:gap-4 sm:p-4',
        inactive && 'opacity-60',
        className
      )}
    >
      <ProfileRowPhoto photoUrl={photoUrl} name={title} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
        <div className="min-w-0 sm:basis-44 lg:basis-52">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{title}</h3>
            {badges}
          </div>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          ) : null}
        </div>

        {fields.length > 0 ? (
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field) => (
              <div key={field.label} className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </p>
                <p className="truncate text-sm text-foreground">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-0.5 self-center sm:gap-1">{actions}</div>
      ) : null}
    </article>
  );
}

function ProfileRowPhoto({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-muted/20 sm:size-16">
      {photoUrl ? (
        <Image src={photoUrl} alt={name} fill className="object-cover" sizes="64px" />
      ) : (
        <Camera className="size-6 text-primary/70 sm:size-7" strokeWidth={1.5} />
      )}
    </div>
  );
}

type ProfileRowActionProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  className?: string;
};

export function ProfileRowAction({ href, label, icon: Icon, className }: ProfileRowActionProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors',
        'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
        className
      )}
    >
      <Icon className="size-4" />
    </Link>
  );
}

export function ProfileRowList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('flex w-full flex-col gap-3', className)}>{children}</div>;
}
