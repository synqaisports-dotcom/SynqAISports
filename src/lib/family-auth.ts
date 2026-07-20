import { createClient } from '@/lib/supabase/server';
import { isDemoActive } from '@/lib/demo';
import {
  DEMO_FAMILY_ACCOUNT,
  DEMO_FAMILY_PLAYERS,
  type FamilyContext,
  staticDemoFamilyContext,
} from '@/lib/family-accounts';

const CLUB_SELECT = 'id, name, slug, logo_url, invite_code';

export async function getFamilyContext(): Promise<FamilyContext | null> {
  if (await isDemoActive()) {
    return staticDemoFamilyContext();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: account } = await supabase
    .from('synq_family_accounts')
    .select(
      'id, club_id, user_id, email, display_name, account_type, status, invited_at, activated_at'
    )
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!account) return null;

  const [{ data: club }, { data: links }] = await Promise.all([
    supabase.from('synq_clubs').select(CLUB_SELECT).eq('id', account.club_id).maybeSingle(),
    supabase
      .from('synq_family_player_links')
      .select('player_id, relationship, synq_players(id, display_name, is_minor, synq_teams(name))')
      .eq('family_account_id', account.id),
  ]);

  if (!club) return null;

  const players = (links ?? []).map((link) => {
    const player = Array.isArray(link.synq_players) ? link.synq_players[0] : link.synq_players;
    const team = player?.synq_teams
      ? Array.isArray(player.synq_teams)
        ? player.synq_teams[0]
        : player.synq_teams
      : null;
    return {
      id: String(link.player_id),
      display_name: String(player?.display_name ?? 'Jugador'),
      is_minor: player?.is_minor === true,
      team_name: String(team?.name ?? 'Sin equipo'),
      relationship: link.relationship as 'tutor' | 'self',
    };
  });

  return {
    account: {
      id: account.id,
      club_id: account.club_id,
      user_id: account.user_id,
      email: account.email,
      display_name: account.display_name,
      account_type: account.account_type,
      status: account.status,
      invited_at: account.invited_at,
      activated_at: account.activated_at,
    },
    club: {
      id: club.id,
      name: club.name,
      slug: club.slug,
      logo_url: club.logo_url,
      invite_code: club.invite_code,
    },
    players,
  };
}

export async function activateFamilyAccountForUser(userId: string, email: string): Promise<void> {
  if (await isDemoActive()) return;

  const supabase = await createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data: account } = await supabase
    .from('synq_family_accounts')
    .select('id, status')
    .eq('email', normalizedEmail)
    .in('status', ['invited', 'active'])
    .maybeSingle();

  if (!account) return;

  await supabase
    .from('synq_family_accounts')
    .update({
      user_id: userId,
      status: 'active',
      activated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', account.id);
}

export function isStaffAlsoFamilyDemo(): boolean {
  return false;
}

export { DEMO_FAMILY_ACCOUNT, DEMO_FAMILY_PLAYERS, staticDemoFamilyContext };
