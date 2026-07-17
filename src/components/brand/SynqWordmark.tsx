import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const wordmarkSize: Record<Size, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
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
    <div className={cn('min-w-0', className)}>
      <p className={cn('synq-brand-wordmark leading-none', wordmarkSize[size])}>
        <span className="text-white">SYNQ</span>
        <span className="text-synq-cyan">AI</span>
        {showSportsSuffix ? (
          <span className="ml-2 font-semibold normal-case tracking-normal text-white/75 text-[0.72em]">
            Sports
          </span>
        ) : null}
      </p>
      {showTagline ? <p className="synq-brand-tagline mt-1.5">{tagline}</p> : null}
      {subtitle ? (
        <p className={cn('mt-1 truncate text-[11px] font-medium tracking-wide text-muted-foreground', subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
