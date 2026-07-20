'use server';

import { requireClubId } from '@/lib/auth-staff';
import { isDemoActive } from '@/lib/demo';
import {
  DEMO_FAMILY_ACCOUNT,
  FAMILY_SELECT,
  type FamilyAccount,
} from '@/lib/family-accounts';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type FamilyAccountActionState = { ok: boolean; message?: string; accountId?: string };

export async function loadFamilyAccounts(clubId: string): Promise<FamilyAccount[]> {
  if (await isDemoActive()) {
    return [DEMO_FAMILY_ACCOUNT];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_family_accounts')
    .select(FAMILY_SELECT)
    .eq('club_id', clubId)
    .order('email');

  if (error) {
    console.error('loadFamilyAccounts', error);
    return [];
  }

  return (data ?? []) as FamilyAccount[];
}

export async function inviteTutorFromGuardian(input: {
  clubId: string;
  playerId: string;
  email: string;
  displayName: string;
}): Promise<FamilyAccountActionState> {
  const clubId = await requireClubId();
  if (!clubId || clubId !== input.clubId) return { ok: false, message: 'unauthorized' };

  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/jugadores');
    return { ok: true, accountId: DEMO_FAMILY_ACCOUNT.id, message: 'demo' };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('synq_family_accounts')
    .select('id')
    .eq('club_id', clubId)
    .eq('email', email)
    .maybeSingle();

  let accountId = existing?.id as string | undefined;

  if (!accountId) {
    const { data: created, error: createError } = await supabase
      .from('synq_family_accounts')
      .insert({
        club_id: clubId,
        email,
        display_name: input.displayName,
        account_type: 'tutor',
        status: 'invited',
      })
      .select('id')
      .single();

    if (createError || !created) {
      console.error('inviteTutorFromGuardian', createError);
      return { ok: false, message: 'error' };
    }
    accountId = created.id;
  }

  const { error: linkError } = await supabase.from('synq_family_player_links').upsert(
    {
      club_id: clubId,
      family_account_id: accountId,
      player_id: input.playerId,
      relationship: 'tutor',
      is_primary: true,
    },
    { onConflict: 'family_account_id,player_id' }
  );

  if (linkError) {
    console.error('inviteTutorFromGuardian link', linkError);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera/jugadores');
  return { ok: true, accountId };
}

export async function inviteAdultPlayer(input: {
  clubId: string;
  playerId: string;
  email: string;
  displayName: string;
}): Promise<FamilyAccountActionState> {
  const clubId = await requireClubId();
  if (!clubId || clubId !== input.clubId) return { ok: false, message: 'unauthorized' };

  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    return { ok: true, message: 'demo' };
  }

  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('synq_family_accounts')
    .insert({
      club_id: clubId,
      email,
      display_name: input.displayName,
      account_type: 'player',
      status: 'invited',
    })
    .select('id')
    .single();

  if (error || !created) {
    console.error('inviteAdultPlayer', error);
    return { ok: false, message: 'error' };
  }

  await supabase.from('synq_family_player_links').insert({
    club_id: clubId,
    family_account_id: created.id,
    player_id: input.playerId,
    relationship: 'self',
    is_primary: true,
  });

  revalidatePath('/portal/cantera/jugadores');
  return { ok: true, accountId: created.id };
}

export async function requestFamilyMagicLink(
  email: string,
  redirectTo: string
): Promise<{ ok: boolean; message?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    return { ok: true, message: 'demo' };
  }

  const supabase = await createClient();
  const { data: account } = await supabase
    .from('synq_family_accounts')
    .select('id, status')
    .eq('email', normalizedEmail)
    .in('status', ['invited', 'active'])
    .maybeSingle();

  if (!account) {
    return { ok: false, message: 'not_found' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    console.error('requestFamilyMagicLink', error);
    return { ok: false, message: 'error' };
  }

  return { ok: true };
}

export async function joinClubWithInviteCode(input: {
  inviteCode: string;
  email: string;
  displayName?: string;
}): Promise<{ ok: boolean; message?: string; clubId?: string }> {
  const email = input.email.trim().toLowerCase();
  const inviteCode = input.inviteCode.trim().toUpperCase();
  if (!email || !inviteCode) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    if (inviteCode !== 'DEMO2026') return { ok: false, message: 'invalid_code' };
    return { ok: true, clubId: 'demo-club', message: 'demo' };
  }

  const supabase = await createClient();
  const { data: club } = await supabase
    .from('synq_clubs')
    .select('id')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (!club) return { ok: false, message: 'invalid_code' };

  const { data: players } = await supabase
    .from('synq_players')
    .select('id, display_name, is_minor, guardians_json, contact_email')
    .eq('club_id', club.id)
    .eq('active', true);

  let matchedPlayerId: string | null = null;
  let accountType: 'tutor' | 'player' = 'tutor';
  let relationship: 'tutor' | 'self' = 'tutor';

  for (const player of players ?? []) {
    if (!player.is_minor && player.contact_email?.toLowerCase() === email) {
      matchedPlayerId = player.id;
      accountType = 'player';
      relationship = 'self';
      break;
    }

    const guardians = Array.isArray(player.guardians_json) ? player.guardians_json : [];
    const guardianMatch = guardians.find(
      (guardian: { email?: string }) => guardian.email?.toLowerCase() === email
    );
    if (guardianMatch && player.is_minor) {
      matchedPlayerId = player.id;
      accountType = 'tutor';
      relationship = 'tutor';
      break;
    }
  }

  if (!matchedPlayerId) {
    return { ok: false, message: 'email_not_registered' };
  }

  const { data: account, error: accountError } = await supabase
    .from('synq_family_accounts')
    .upsert(
      {
        club_id: club.id,
        email,
        display_name: input.displayName?.trim() || null,
        account_type: accountType,
        status: 'invited',
      },
      { onConflict: 'club_id,email' }
    )
    .select('id')
    .single();

  if (accountError || !account) {
    console.error('joinClubWithInviteCode account', accountError);
    return { ok: false, message: 'error' };
  }

  await supabase.from('synq_family_player_links').upsert(
    {
      club_id: club.id,
      family_account_id: account.id,
      player_id: matchedPlayerId,
      relationship,
      is_primary: true,
    },
    { onConflict: 'family_account_id,player_id' }
  );

  return { ok: true, clubId: club.id };
}
