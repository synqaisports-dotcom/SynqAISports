'use client';

import { useEffect, useState } from 'react';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { loadCoachFreeSport, saveCoachFreeSport } from '@/lib/coach-free-device';

export function useCoachFreeSport() {
  const [sport, setSport] = useState<ClubPracticedSport>('football');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSport(loadCoachFreeSport());
    setReady(true);
  }, []);

  function choose(next: ClubPracticedSport) {
    setSport(next);
    saveCoachFreeSport(next);
  }

  return { sport, ready, choose };
}
