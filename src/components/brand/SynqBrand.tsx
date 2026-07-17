import { cn } from '@/lib/utils';

export type SynqBrandVariant = 'horizontal' | 'stacked' | 'wordmark';

const ASSETS: Record<SynqBrandVariant, { src: string; width: number; height: number; alt: string }> = {
  horizontal: {
    src: '/brand/synqai-logo-horizontal.svg',
    width: 280,
    height: 56,
    alt: 'SynqAI Club & Tactics Platform',
  },
  stacked: {
    src: '/brand/synqai-logo-stacked.svg',
    width: 320,
    height: 360,
    alt: 'SynqAI Club & Tactics Platform',
  },
  wordmark: {
    src: '/brand/synqai-wordmark.svg',
    width: 220,
    height: 48,
    alt: 'SynqAI Club & Tactics Platform',
  },
};

type Props = {
  variant: SynqBrandVariant;
  className?: string;
  width?: number;
};

/** Logos completos en SVG estático (marketing, documentos). Para UI usar SynqIcon + SynqWordmark. */
export function SynqBrand({ variant, className, width }: Props) {
  const asset = ASSETS[variant];
  const renderWidth = width ?? asset.width;
  const renderHeight = Math.round((renderWidth / asset.width) * asset.height);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.src}
      alt={asset.alt}
      width={renderWidth}
      height={renderHeight}
      className={cn('h-auto max-w-full shrink-0', className)}
      decoding="async"
    />
  );
}
