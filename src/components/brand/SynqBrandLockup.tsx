import { SynqBrand } from '@/components/brand/SynqBrand';
import { SynqWordmark } from '@/components/brand/SynqWordmark';
import { cn } from '@/lib/utils';

type Layout = 'horizontal' | 'stacked' | 'icon-only';

type Props = {
  layout?: Layout;
  iconSize?: number;
  showTagline?: boolean;
  subtitle?: string;
  subtitleClassName?: string;
  showSportsSuffix?: boolean;
  className?: string;
  priority?: boolean;
};

export function SynqBrandLockup({
  layout = 'horizontal',
  iconSize = 40,
  showTagline = false,
  subtitle,
  subtitleClassName,
  showSportsSuffix = false,
  className,
  priority,
}: Props) {
  if (layout === 'icon-only') {
    return (
      <SynqBrand
        variant="icon"
        width={iconSize}
        priority={priority}
        className={cn('drop-shadow-[0_0_14px_rgba(0,242,255,0.32)]', className)}
      />
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col items-center text-center', className)}>
        <SynqBrand
          variant="icon"
          width={iconSize}
          priority={priority}
          className="drop-shadow-[0_0_18px_rgba(0,242,255,0.35)]"
        />
        <SynqWordmark
          size="lg"
          showTagline={showTagline}
          showSportsSuffix={showSportsSuffix}
          subtitle={subtitle}
          subtitleClassName={subtitleClassName}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <SynqBrand
        variant="icon"
        width={iconSize}
        priority={priority}
        className="drop-shadow-[0_0_14px_rgba(0,242,255,0.32)]"
      />
      <SynqWordmark
        size={iconSize >= 44 ? 'lg' : 'md'}
        showTagline={showTagline}
        showSportsSuffix={showSportsSuffix}
        subtitle={subtitle}
        subtitleClassName={subtitleClassName}
        className="min-w-0 flex-1"
      />
    </div>
  );
}
