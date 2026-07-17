import { SYNQ_BRAND } from '@/components/brand/brand-constants';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const wordmarkSize: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

type Props = {
  size?: Size;
  showTagline?: boolean;
  tagline?: string;
  subtitle?: string;
  subtitleClassName?: string;
  showSportsSuffix?: boolean;
  className?: string;
};

export function SynqWordmark({
  size = 'md',
  showTagline = false,
  tagline = 'Club & Tactics Platform',
  subtitle,
  subtitleClassName,
  showSportsSuffix = false,
  className,
}: Props) {
  return (
    <div className={cn('min-w-0 font-brand', className)}>
      <p className={cn('synq-brand-wordmark leading-tight', wordmarkSize[size])}>
        <span className="text-white">SYNQ</span>
        <span style={{ color: SYNQ_BRAND.cyan }}>AI</span>
        {showSportsSuffix ? (
          <span className="ml-1.5 align-baseline font-semibold normal-case tracking-normal text-white/80 text-[0.62em]">
            Sports
          </span>
        ) : null}
      </p>
      {showTagline ? (
        <p className="synq-brand-tagline mt-1 leading-tight text-white/90 max-sm:hidden">{tagline}</p>
      ) : null}
      {subtitle ? (
        <p
          className={cn(
            'mt-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground',
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
