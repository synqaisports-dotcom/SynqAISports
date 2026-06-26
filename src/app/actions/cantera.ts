'use server';

import { requireClubId } from '@/lib/auth-staff';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = { ok: boolean; message?: string };

export async function createTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const sport = String(formData.get('sport') ?? 'football');

  if (!name || !category) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { error } = await supabase.from('synq_teams').insert({
    club_id: clubId,
    name,
    category,
    sport: sport === 'futsal' ? 'futsal' : 'football',
  });

  if (error) {
    console.error('create team', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera');
  revalidatePath('/portal');
  return { ok: true };
}

export async function deleteTeam(teamId: string): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_teams')
    .delete()
    .eq('id', teamId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/cantera');
  return { ok: true };
}

export async function createPlayer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const displayName = String(formData.get('displayName') ?? '').trim();
  const teamId = String(formData.get('teamId') ?? '').trim() || null;
  const jerseyNumber = parseInt(String(formData.get('jerseyNumber') ?? ''), 10);
  const position = String(formData.get('position') ?? '').trim();
  const birthYear = parseInt(String(formData.get('birthYear') ?? ''), 10);

  if (!displayName) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { error } = await supabase.from('synq_players').insert({
    club_id: clubId,
    team_id: teamId,
    display_name: displayName,
    jersey_number: Number.isNaN(jerseyNumber) ? null : jerseyNumber,
    position: position || null,
    birth_year: Number.isNaN(birthYear) ? null : birthYear,
    active: true,
  });

  if (error) {
    console.error('create player', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera');
  revalidatePath('/portal');
  return { ok: true };
}

export async function togglePlayerActive(playerId: string, active: boolean): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_players')
    .update({ active })
    .eq('id', playerId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/cantera');
  revalidatePath('/portal');
  return { ok: true };
}
