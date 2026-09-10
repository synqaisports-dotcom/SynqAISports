'use client';

import { useEffect, useState } from 'react';
import { SponsorWallSlide } from '@/components/portal/signage/SponsorWallSlide';
import type { SignageSponsor } from '@/lib/signage';

const ROTATION_MS = 30_000;

type Props = {
  sponsors: SignageSponsor[];
  tournamentName: string;
  coverImageUrl?: string | null;
};

/** Pantalla fullscreen para TV: muro de patrocinadores del torneo (sin playlist manual). */
export function TournamentSignageScreen({ sponsors, tournamentName, coverImageUrl }: Props) {
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setReplayKey((k) => k + 1), ROTATION_MS);
    return () => window.clearInterval(interval);
  }, []);

  if (sponsors.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-[#060a12] via-[#0a1628] to-[#060a12] p-8 text-center text-white">
        {coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImageUrl} alt="" className="mb-6 max-h-40 max-w-[70%] rounded-xl object-cover opacity-80" />
        ) : null}
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/70">SynqAI Torneos</p>
        <h1 className="mt-3 text-3xl font-semibold">{tournamentName}</h1>
        <p className="mt-4 max-w-md text-sm text-white/60">
          Añade patrocinadores con logo en el portal para activar el muro en pantalla.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black">
      <SponsorWallSlide
        key={replayKey}
        sponsors={sponsors}
        clubName={tournamentName}
        clubLogoUrl={coverImageUrl ?? null}
        entrance="stagger-fade"
        replayKey={replayKey}
      />
    </div>
  );
}
