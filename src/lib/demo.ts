import type { ClubRow, StaffContext } from '@/lib/portal';

export const DEMO_CLUB_ID = '00000000-0000-4000-8000-000000000001';

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_SYNQ_DEMO_MODE === 'true';
}

export function getDemoClubId(): string {
  return process.env.SYNQ_DEMO_CLUB_ID?.trim() || DEMO_CLUB_ID;
}

export function staticDemoStaffContext(): StaffContext {
  return {
    club: {
      id: getDemoClubId(),
      name: 'Club Demo SynqAI',
      slug: 'club-demo-synqai',
      country_code: 'ES',
      address: 'Calle del Fútbol 1, Madrid',
      phone: '+34 600 000 000',
      email: 'demo@synqai.test',
      players_count: 80,
      family_fee_annual_eur: 12,
      synq_rate_per_user_eur: 0.5,
      invite_code: 'DEMO2026',
      is_founding: true,
      founding_until: null,
    },
    role: 'admin',
  };
}

export async function loadDemoStaffContext(
  fetchClub: (clubId: string) => Promise<ClubRow | null>
): Promise<StaffContext> {
  const clubId = getDemoClubId();
  const club = await fetchClub(clubId);
  if (club) {
    return { club, role: 'admin' };
  }
  return staticDemoStaffContext();
}
