'use client';

import { useEffect, useRef } from 'react';
import {
  getPublicAdClientId,
  getPublicAdSlotById,
  getPublicAdSlotId,
  type PublicAdSlotId,
} from '@/lib/public-tournament-ads';
import { cn } from '@/lib/utils';

type Props = {
  slotId: PublicAdSlotId;
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function PublicAdSlot({ slotId, className }: Props) {
  const config = getPublicAdSlotById(slotId);
  const clientId = getPublicAdClientId();
  const adSlot = getPublicAdSlotId(config);
  const pushed = useRef(false);

  useEffect(() => {
    if (!clientId || !adSlot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense puede fallar en entornos sin red o con bloqueadores.
    }
  }, [clientId, adSlot]);

  if (!clientId || !adSlot) {
    return <PublicAdPlaceholder config={config} className={className} />;
  }

  return (
    <div className={cn('overflow-hidden rounded-xl', className)} style={{ minHeight: config.height }}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={config.format ?? 'auto'}
        data-full-width-responsive="false"
      />
    </div>
  );
}

function PublicAdPlaceholder({
  config,
  className,
}: {
  config: ReturnType<typeof getPublicAdSlotById>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-center rounded-xl border border-dashed border-cyan-400/20 bg-white/[0.02] p-4',
        className
      )}
      style={{ minHeight: config.height }}
      aria-hidden
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/50">
        Publicidad
      </span>
      <div
        className="mt-2 flex w-full items-center justify-center rounded-lg bg-white/[0.03] ring-1 ring-white/5"
        style={{ height: Math.max(config.height - 40, 60) }}
      >
        <span className="text-[10px] text-white/25">
          {config.width} × {config.height}
        </span>
      </div>
    </div>
  );
}
