import { SYNQ_BRAND } from '@/components/brand/brand-constants';
import { WORDMARK_DATA, WORDMARK_VIEWBOX } from '@/components/brand/wordmark-data';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'on-dark' | 'on-light';

const wordmarkHeight: Record<Size, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 22,
  xl: 34,
};

type Props = {
  size?: Size;
  showTagline?: boolean;
  subtitle?: string;
  subtitleClassName?: string;
  showSportsSuffix?: boolean;
  tone?: Tone;
  className?: string;
};

function WordmarkSvg({
  height,
  showTagline,
  tone,
}: {
  height: number;
  showTagline: boolean;
  tone: Tone;
}) {
  const synqFill = tone === 'on-light' ? SYNQ_BRAND.cyan : SYNQ_BRAND.white;
  const taglineFill = tone === 'on-light' ? SYNQ_BRAND.cyan : SYNQ_BRAND.white;

  const wordmarkOnlyHeight = WORDMARK_DATA.wordmark.baselineY + 2;
  const viewHeight = showTagline ? WORDMARK_VIEWBOX.height : wordmarkOnlyHeight;
  const aspect = WORDMARK_VIEWBOX.width / viewHeight;
  const renderHeight = showTagline ? height * (viewHeight / wordmarkOnlyHeight) : height;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WORDMARK_VIEWBOX.width} ${viewHeight}`}
      width={renderHeight * aspect}
      height={renderHeight}
      fill="none"
      role="img"
      aria-label="SynqAI"
      className="block max-w-full"
      preserveAspectRatio="xMinYMid meet"
    >
      {WORDMARK_DATA.wordmark.synq.map((p) => (
        <path key={`s-${p.char}`} d={p.d} fill={synqFill} />
      ))}
      {WORDMARK_DATA.wordmark.ai.map((p) => (
        <path key={`a-${p.char}`} d={p.d} fill={SYNQ_BRAND.cyan} />
      ))}
      {showTagline
        ? WORDMARK_DATA.tagline.paths.map((p, i) =>
            p.d ? <path key={`t-${i}`} d={p.d} fill={taglineFill} opacity={0.92} /> : null
          )
        : null}
    </svg>
  );
}

export function SynqWordmark({
  size = 'md',
  showTagline = false,
  subtitle,
  subtitleClassName,
  showSportsSuffix = false,
  tone = 'on-dark',
  className,
}: Props) {
  const h = wordmarkHeight[size];

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex min-w-0 items-end gap-1.5">
        <WordmarkSvg height={h} showTagline={showTagline} tone={tone} />
        {showSportsSuffix ? (
          <span
            className={cn(
              'mb-0.5 shrink-0 text-[0.62em] font-medium tracking-wide',
              tone === 'on-light' ? 'text-[#00E5FF]' : 'text-white/80'
            )}
          >
            Sports
          </span>
        ) : null}
      </div>
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
