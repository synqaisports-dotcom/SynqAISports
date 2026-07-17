import { SynqIcon } from '@/components/brand/SynqIcon';
import { SynqWordmark } from '@/components/brand/SynqWordmark';
import { cn } from '@/lib/utils';

type Layout = 'horizontal' | 'stacked' | 'icon-only';

type Props = {
  layout?: Layout;
  iconSize?: number;
  wordmarkSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  subtitle?: string;
  subtitleClassName?: string;
  showSportsSuffix?: boolean;
  className?: string;
};

export function SynqBrandLockup({
  layout = 'horizontal',
  iconSize = 36,
  wordmarkSize,
  showTagline = false,
  subtitle,
  subtitleClassName,
  showSportsSuffix = false,
  className,
}: Props) {
  const markSize = wordmarkSize ?? (iconSize >= 40 ? 'lg' : iconSize >= 34 ? 'md' : 'sm');

  if (layout === 'icon-only') {
    return (
      <span className={cn('inline-flex items-center justify-center', className)}>
        <SynqIcon size={iconSize} />
      </span>
    );
  }

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col items-center text-center', className)}>
        <SynqIcon size={iconSize} />
        <SynqWordmark
          size={markSize}
          showTagline={showTagline}
          showSportsSuffix={showSportsSuffix}
          subtitle={subtitle}
          subtitleClassName={subtitleClassName}
          className="mt-3"
        />
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <span className="inline-flex shrink-0 items-center justify-center">
        <SynqIcon size={iconSize} />
      </span>
      <SynqWordmark
        size={markSize}
        showTagline={showTagline}
        showSportsSuffix={showSportsSuffix}
        subtitle={subtitle}
        subtitleClassName={subtitleClassName}
        className="min-w-0"
      />
    </div>
  );
}
