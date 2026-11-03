'use client';

import { CLUB_PRACTICED_SPORT_LABELS, PRACTICED_SPORT_DRAWING } from '@/lib/club-practiced-sports';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { CoachFreeSection } from '@/components/coach/CoachFreeSection';

export function CoachFreeSoon({ sport, title }: { sport: ClubPracticedSport; title: string }) {
  return (
    <CoachFreeSection title={title} text={CLUB_PRACTICED_SPORT_LABELS[sport]}>
      <p className="synq-card p-5 text-sm text-synq-muted">{PRACTICED_SPORT_DRAWING[sport].note}</p>
    </CoachFreeSection>
  );
}
