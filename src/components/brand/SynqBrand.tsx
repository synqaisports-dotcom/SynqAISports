import Image from 'next/image';
import { cn } from '@/lib/utils';

export type SynqBrandVariant = 'icon' | 'horizontal' | 'stacked' | 'wordmark';

const ASSETS: Record<SynqBrandVariant, { src: string; width: number; height: number; alt: string }> = {
  icon: { src: '/brand/synqai-icon.svg', width: 48, height: 48, alt: 'SynqAI' },
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
  variant?: SynqBrandVariant;
  className?: string;
  /** Ancho en px; la altura se calcula por proporción del asset. */
  width?: number;
  priority?: boolean;
};

export function SynqBrand({ variant = 'icon', className, width, priority }: Props) {
  const asset = ASSETS[variant];
  const renderWidth = width ?? asset.width;
  const renderHeight = Math.round((renderWidth / asset.width) * asset.height);

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={renderWidth}
      height={renderHeight}
      className={cn('h-auto w-auto shrink-0', className)}
      priority={priority}
    />
  );
}
