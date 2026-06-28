import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClubRow, StaffContext } from '@/lib/portal';
import {
  DEMO_CLUB_ID,
  DEMO_COOKIE,
  getDemoClubIdFallback,
  hasServiceRoleKey,
  isDemoCookieValue,
  isDemoModeEnv,
} from '@/lib/demo-constants';

export {
  DEMO_COOKIE,
  DEMO_ENTRY_PATH,
  DEMO_CLUB_ID,
  getDemoClubIdFallback,
  hasServiceRoleKey,
  isDemoCookieValue,
  isDemoModeEnv,
  isDemoRequest,
} from '@/lib/demo-constants';

const CLUB_SELECT =
  'id, name, slug, country_code, address, phone, email, cover_url, logo_url, website_url, instagram_url, facebook_url, x_url, tiktok_url, youtube_url, players_count, family_fee_annual_eur, synq_rate_per_user_eur, invite_code, is_founding, founding_until';

export async function isDemoActive(): Promise<boolean> {
  if (isDemoModeEnv()) return true;
  const cookieStore = await cookies();
  return isDemoCookieValue(cookieStore.get(DEMO_COOKIE)?.value);
}

export function staticDemoStaffContext(): StaffContext {
  return {
    club: {
      id: getDemoClubIdFallback(),
      name: 'Club Demo SynqAI',
      slug: 'club-demo-synqai',
      country_code: 'ES',
      address: 'Calle del Fútbol 1, Madrid',
      phone: '+34 600 000 000',
      email: 'demo@synqai.test',
      cover_url: null,
      logo_url: null,
      website_url: null,
      instagram_url: null,
      facebook_url: null,
      x_url: null,
      tiktok_url: null,
      youtube_url: null,
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

export async function resolveDemoClub(supabase: SupabaseClient): Promise<ClubRow> {
  const configuredId = process.env.SYNQ_DEMO_CLUB_ID?.trim();
  if (configuredId) {
    const { data } = await supabase
      .from('synq_clubs')
      .select(CLUB_SELECT)
      .eq('id', configuredId)
      .maybeSingle();
    if (data) return data as ClubRow;
  }

  const { data: first } = await supabase
    .from('synq_clubs')
    .select(CLUB_SELECT)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (first) return first as ClubRow;

  if (!hasServiceRoleKey()) {
    return staticDemoStaffContext().club;
  }

  const { data: created } = await supabase
    .from('synq_clubs')
    .insert({
      name: 'Club Piloto Madrid',
      slug: `club-piloto-${Date.now().toString(36)}`,
      players_count: 80,
      is_founding: true,
      invite_code: 'SYNQ2026',
    })
    .select(CLUB_SELECT)
    .single();

  if (created) return created as ClubRow;
  return staticDemoStaffContext().club;
}

export async function loadDemoStaffContext(
  supabase: SupabaseClient
): Promise<StaffContext> {
  const club = await resolveDemoClub(supabase);
  return { club, role: 'admin' };
}

export function isDemoMode(): boolean {
  return isDemoModeEnv();
}
