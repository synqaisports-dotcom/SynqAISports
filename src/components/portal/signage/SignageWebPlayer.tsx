'use client';

import { useEffect } from 'react';
import { SignagePlaylistPlayer } from '@/components/portal/signage/SignagePlaylistPlayer';
import type { SignageAsset, SignageDevice, SignagePlaylist, SignageSchedule, SignageSponsor } from '@/lib/signage';

type Props = {
  device: SignageDevice;
  playlist: SignagePlaylist | null;
  schedule: SignageSchedule | null;
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  exercises: { id: string; title: string; drawing_json: unknown }[];
  clubName: string;
  clubLogoUrl: string | null;
  deviceToken: string;
};

export function SignageWebPlayer({
  device,
  playlist,
  schedule,
  sponsors,
  assets,
  exercises,
  clubName,
  clubLogoUrl,
  deviceToken,
}: Props) {
  useEffect(() => {
    const interval = window.setInterval(() => {
      void fetch(`/api/signage/heartbeat?token=${encodeURIComponent(deviceToken)}`, { method: 'POST' });
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [deviceToken]);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black">
      <SignagePlaylistPlayer
        orientation={device.orientation}
        playlist={playlist}
        schedule={schedule}
        sponsors={sponsors}
        assets={assets}
        exercises={exercises}
        clubName={clubName}
        clubLogoUrl={clubLogoUrl}
        autoPlay
        fullscreen
        className="h-full w-full"
      />
    </div>
  );
}
