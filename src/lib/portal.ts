import type { SupabaseClient } from '@supabase/supabase-js';
import { isDemoActive, loadDemoStaffContext } from '@/lib/demo';

export type ClubRow = {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  cover_url: string | null;
  logo_url: string | null;
  website_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  x_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  organigrama_json: unknown | null;
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
  if (await isDemoActive()) {
    return loadDemoStaffContext(supabase);
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
      'id, name, slug, country_code, address, phone, email, cover_url, logo_url, website_url, instagram_url, facebook_url, x_url, tiktok_url, youtube_url, organigrama_json, players_count, family_fee_annual_eur, synq_rate_per_user_eur, invite_code, is_founding, founding_until'
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
