'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { SponsorWallSlide } from '@/components/portal/signage/SponsorWallSlide';
import { Button } from '@/components/ui/button';
import type { SignageSponsor } from '@/lib/signage';
import type { SponsorWallEntrance } from '@/lib/sponsor-wall';
import { Maximize2, Minimize2 } from 'lucide-react';

type Props = {
  sponsors: SignageSponsor[];
  clubName: string;
  clubLogoUrl: string | null;
  entrance: SponsorWallEntrance;
  replayKey?: number;
};

export function SponsorWallPreviewFrame({
  sponsors,
  clubName,
  clubLogoUrl,
  entrance,
  replayKey = 0,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen]);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border border-primary/15 bg-black/40">
        <div className="aspect-video max-h-44 w-full sm:max-h-48">
          <SponsorWallSlide
            key={replayKey}
            sponsors={sponsors}
            clubName={clubName}
            clubLogoUrl={clubLogoUrl}
            entrance={entrance}
            compact
          />
        </div>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-2 top-2 size-8 border border-primary/20 bg-background/85 shadow-sm backdrop-blur-sm"
          onClick={() => setFullscreen(true)}
          aria-label="Ver muro en pantalla completa"
          title="Maximizar"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {mounted && fullscreen
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-3 sm:p-6">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute right-4 top-4 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => setFullscreen(false)}
                aria-label="Cerrar pantalla completa"
                title="Minimizar"
              >
                <Minimize2 className="size-4" />
              </Button>
              <div className="aspect-video h-full max-h-full w-full max-w-[min(100vw,calc((100vh-3rem)*16/9))] overflow-hidden rounded-xl border border-primary/25 shadow-2xl">
                <SponsorWallSlide
                  key={replayKey}
                  sponsors={sponsors}
                  clubName={clubName}
                  clubLogoUrl={clubLogoUrl}
                  entrance={entrance}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
