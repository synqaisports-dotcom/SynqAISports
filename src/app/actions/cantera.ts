'use server';

import { isDemoActive } from '@/lib/demo';
import { requireClubId } from '@/lib/auth-staff';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = { ok: boolean; message?: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function uploadPlayerPhoto(
  clubId: string,
  formData: FormData
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const file = formData.get('file');
  const playerId = String(formData.get('playerId') ?? '').trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'no_file' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: 'too_large' };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { ok: false, message: 'invalid_type' };

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${clubId}/players/${playerId || 'drafts'}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error('upload player photo', error);
    return { ok: false, message: 'upload_error' };
  }

  const { data } = supabase.storage.from('club-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function updatePlayerPhoto(
  playerId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const photoUrl = String(formData.get('photoUrl') ?? '').trim();
  if (await isDemoActive()) {
    revalidatePath(`/portal/cantera/jugadores/${playerId}`);
    revalidatePath('/portal/cantera/jugadores');
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_players')
    .update({ photo_url: photoUrl || null })
    .eq('id', playerId)
    .eq('club_id', clubId);

  if (error) {
    console.error('updatePlayerPhoto', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath(`/portal/cantera/jugadores/${playerId}`);
  revalidatePath(`/portal/cantera/jugadores/${playerId}/editar`);
  revalidatePath('/portal/cantera/jugadores');
  return { ok: true };
}

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
