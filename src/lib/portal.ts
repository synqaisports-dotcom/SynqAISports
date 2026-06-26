import type { SupabaseClient } from '@supabase/supabase-js';
import { getDemoClubId, isDemoMode, loadDemoStaffContext } from '@/lib/demo';

export type ClubRow = {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  players_count: number;
  family_fee_annual_eur: number;
  synq_rate_per_user_eur: number;
  invite_code: string | null;
  is_founding: boolean;
  founding_until: string | null;
};

export type StaffContext = {
  club: ClubRow;
  role: string;
};

export async function getStaffContext(
  supabase: SupabaseClient
): Promise<StaffContext | null> {
  if (isDemoMode()) {
    return loadDemoStaffContext(async (clubId) => {
      const { data: club, error } = await supabase
        .from('synq_clubs')
        .select(
          'id, name, slug, country_code, address, phone, email, players_count, family_fee_annual_eur, synq_rate_per_user_eur, invite_code, is_founding, founding_until'
        )
        .eq('id', clubId)
        .maybeSingle();
      if (error || !club) return null;
      return club as ClubRow;
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff, error: staffError } = await supabase
    .from('synq_staff')
    .select('club_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (staffError || !staff) return null;

  const { data: club, error: clubError } = await supabase
    .from('synq_clubs')
    .select(
      'id, name, slug, country_code, address, phone, email, players_count, family_fee_annual_eur, synq_rate_per_user_eur, invite_code, is_founding, founding_until'
    )
    .eq('id', staff.club_id)
    .single();

  if (clubError || !club) return null;

  return { club: club as ClubRow, role: staff.role };
}

export async function countActivePlayers(
  supabase: SupabaseClient,
  clubId: string
): Promise<number> {
  const { count } = await supabase
    .from('synq_players')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', clubId)
    .eq('active', true);
  return count ?? 0;
}
