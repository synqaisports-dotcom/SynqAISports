'use server';

import { isDemoActive } from '@/lib/demo';
import {
  isValidBirthYear,
  isValidJerseyNumber,
  parseOptionalInt,
  playerBirthYearMax,
} from '@/lib/player-form';
import { parseGuardiansFromForm, validateGuardians } from '@/lib/player-guardians';
import { buildInitialPlayerHistory, buildTeamMoveHistoryEvent, parsePlayerHistoryJson, prependPlayerHistoryEvent } from '@/lib/player-club-history';
import { isValidMedicalDate } from '@/lib/player-medical';
import { requireClubId } from '@/lib/auth-staff';
import { DEMO_CANTERA_TEAMS, formatTeamName } from '@/lib/cantera-teams';
import { getCanteraCategory } from '@/lib/cantera-categories';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import {
  DEMO_TEAM_SETUP,
  findTrainingConflicts,
  parseTeamSetupFromForm,
  teamSetupToDbPayload,
  type TeamTrainingSlot,
} from '@/lib/team-setup';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ActionState = {
  ok: boolean;
  message?: string;
  playerId?: string;
  teamId?: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_DOCUMENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

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

export async function uploadPlayerDocument(
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
  if (file.size > MAX_DOCUMENT_BYTES) return { ok: false, message: 'too_large' };
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) return { ok: false, message: 'invalid_type' };

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf';
  const path = `${clubId}/players/${playerId || 'drafts'}/documents/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error('upload player document', error);
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

export async function updatePlayer(
  playerId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const jerseyRaw = String(formData.get('jerseyNumber') ?? '').trim();
  const jerseyNumber = parseOptionalInt(jerseyRaw);
  const position = String(formData.get('position') ?? '').trim() || null;
  const birthRaw = String(formData.get('birthYear') ?? '').trim();
  const birthYear = parseOptionalInt(birthRaw);
  const photoUrl = String(formData.get('photoUrl') ?? '').trim();
  const isMinor = formData.get('isMinor') === 'true';
  const guardians = parseGuardiansFromForm(formData);

  if (!displayName) return { ok: false, message: 'validation' };
  if (!isValidJerseyNumber(jerseyNumber)) return { ok: false, message: 'validation' };
  if (!isValidBirthYear(birthYear, playerBirthYearMax())) return { ok: false, message: 'validation' };
  if (!validateGuardians(isMinor, guardians)) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/jugadores');
    revalidatePath(`/portal/cantera/jugadores/${playerId}`);
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_players')
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: displayName,
      jersey_number: jerseyNumber,
      position,
      birth_year: birthYear,
      photo_url: photoUrl || null,
      is_minor: isMinor,
      guardians_json: isMinor && guardians.length > 0 ? guardians : null,
    })
    .eq('id', playerId)
    .eq('club_id', clubId);

  if (error) {
    console.error('updatePlayer', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera/jugadores');
  revalidatePath(`/portal/cantera/jugadores/${playerId}`);
  revalidatePath(`/portal/cantera/jugadores/${playerId}/editar`);
  return { ok: true };
}

export async function movePlayerTeam(
  playerId: string,
  newTeamId: string
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (!newTeamId) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/jugadores');
    revalidatePath('/portal/cantera/equipos');
    return { ok: true, message: 'demo' };
  }

  const supabase = await createClient();

  const { data: player } = await supabase
    .from('synq_players')
    .select('id, team_id, player_history_json, synq_teams(name, category, category_slug)')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!player) return { ok: false, message: 'error' };
  if (player.team_id === newTeamId) return { ok: false, message: 'validation' };

  const { data: newTeam } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug')
    .eq('id', newTeamId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!newTeam) return { ok: false, message: 'validation' };

  const currentTeam = Array.isArray(player.synq_teams)
    ? player.synq_teams[0]
    : player.synq_teams;

  const history = parsePlayerHistoryJson(player.player_history_json);
  const moveEvent = buildTeamMoveHistoryEvent({
    fromTeam: currentTeam
      ? {
          name: currentTeam.name,
          category: currentTeam.category,
          category_slug: currentTeam.category_slug,
        }
      : null,
    toTeam: {
      name: newTeam.name,
      category: newTeam.category,
      category_slug: newTeam.category_slug,
    },
  });

  const { error } = await supabase
    .from('synq_players')
    .update({
      team_id: newTeamId,
      player_history_json: prependPlayerHistoryEvent(history, moveEvent),
    })
    .eq('id', playerId)
    .eq('club_id', clubId);

  if (error) {
    console.error('movePlayerTeam', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera/jugadores');
  revalidatePath('/portal/cantera/equipos');
  return { ok: true, playerId };
}

export async function updatePlayerMedical(
  playerId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const medicalUntil = String(formData.get('medicalUntil') ?? '').trim();
  const medicalDocumentUrl = String(formData.get('medicalDocumentUrl') ?? '').trim();

  if (!medicalUntil || !isValidMedicalDate(medicalUntil)) {
    return { ok: false, message: 'validation' };
  }

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/jugadores');
    revalidatePath(`/portal/cantera/jugadores/${playerId}`);
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_players')
    .update({
      medical_until: medicalUntil,
      medical_document_url: medicalDocumentUrl || null,
    })
    .eq('id', playerId)
    .eq('club_id', clubId);

  if (error) {
    console.error('updatePlayerMedical', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera/jugadores');
  revalidatePath(`/portal/cantera/jugadores/${playerId}`);
  return { ok: true };
}

export async function getUsedTeamLetters(
  clubId: string,
  categorySlug: string,
  excludeTeamId?: string
): Promise<string[]> {
  const letters = new Set<string>();

  if (await isDemoActive()) {
    for (const team of DEMO_CANTERA_TEAMS) {
      if (team.category_slug === categorySlug && team.team_letter && team.id !== excludeTeamId) {
        letters.add(team.team_letter.toUpperCase());
      }
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_teams')
    .select('team_letter, id')
    .eq('club_id', clubId)
    .eq('category_slug', categorySlug)
    .not('team_letter', 'is', null);

  if (error) {
    console.error('getUsedTeamLetters', error);
  } else {
    for (const row of data ?? []) {
      if (row.team_letter && row.id !== excludeTeamId) {
        letters.add(String(row.team_letter).toUpperCase());
      }
    }
  }

  return [...letters];
}


export async function getTeamTrainingSlots(
  clubId: string,
  excludeTeamId?: string
): Promise<TeamTrainingSlot[]> {
  const slots: TeamTrainingSlot[] = [];

  if (await isDemoActive()) {
    for (const team of DEMO_CANTERA_TEAMS) {
      if (team.id === excludeTeamId) continue;
      const setup = DEMO_TEAM_SETUP[team.id];
      if (!setup?.training_facility_id) continue;
      slots.push({
        teamId: team.id,
        teamName: team.name,
        training_facility_id: setup.training_facility_id,
        training_division: setup.training_division,
        training_days: setup.training_days,
        training_start: setup.training_start,
        training_end: setup.training_end,
      });
    }
    return slots;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_teams')
    .select(
      'id, name, training_facility_id, training_division, training_days, training_start, training_end'
    )
    .eq('club_id', clubId)
    .not('training_facility_id', 'is', null);

  if (error) {
    console.error('getTeamTrainingSlots', error);
    return slots;
  }

  for (const row of data ?? []) {
    if (row.id === excludeTeamId || !row.training_facility_id) continue;
    slots.push({
      teamId: row.id,
      teamName: row.name,
      training_facility_id: row.training_facility_id,
      training_division: row.training_division,
      training_days: row.training_days ?? '',
      training_start: row.training_start ? String(row.training_start).slice(0, 5) : '',
      training_end: row.training_end ? String(row.training_end).slice(0, 5) : '',
    });
  }

  return slots;
}

async function validateTeamSetup(
  clubId: string,
  setup: ReturnType<typeof parseTeamSetupFromForm>,
  excludeTeamId?: string
): Promise<string | null> {
  if (!setup.training_facility_id) return null;

  const facilities = await loadClubFacilities(clubId);
  const facility = facilities.find((item) => item.id === setup.training_facility_id);
  const slots = await getTeamTrainingSlots(clubId, excludeTeamId);
  const conflicts = findTrainingConflicts(setup, facility, slots, excludeTeamId);

  if (conflicts.length > 0) return 'training_conflict';
  return null;
}

export async function createTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const categorySlug = String(formData.get('categorySlug') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const teamLetter = String(formData.get('teamLetter') ?? '')
    .trim()
    .toUpperCase();
  const sport = String(formData.get('sport') ?? 'football');

  const categoryMeta = categorySlug ? getCanteraCategory(categorySlug) : null;
  const categoryName = category || categoryMeta?.name || '';

  if (!categorySlug || !teamLetter || !/^[A-Z]$/.test(teamLetter) || !categoryName) {
    return { ok: false, message: 'validation' };
  }

  const used = await getUsedTeamLetters(clubId, categorySlug);
  if (used.includes(teamLetter)) return { ok: false, message: 'duplicate_letter' };

  const name = formatTeamName(categoryName, teamLetter);
  const setup = parseTeamSetupFromForm(formData);
  const setupError = await validateTeamSetup(clubId, setup);
  if (setupError) return { ok: false, message: setupError };

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/equipos');
    return { ok: true, message: 'demo' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_teams')
    .insert({
      club_id: clubId,
      name,
      category: categoryName,
      category_slug: categorySlug,
      team_letter: teamLetter,
      sport: sport === 'futsal' ? 'futsal' : 'football',
      ...teamSetupToDbPayload(setup),
    })
    .select('id')
    .single();

  if (error) {
    console.error('create team', error);
    if (error.code === '23505') return { ok: false, message: 'duplicate_letter' };
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera');
  revalidatePath('/portal/cantera/equipos');
  revalidatePath(`/portal/cantera/equipos/${categorySlug}`);
  return { ok: true, teamId: data.id };
}

export async function updateTeam(
  teamId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const teamLetter = String(formData.get('teamLetter') ?? '')
    .trim()
    .toUpperCase();
  const sport = String(formData.get('sport') ?? 'football');

  if (!teamLetter || !/^[A-Z]$/.test(teamLetter)) return { ok: false, message: 'validation' };

  const supabase = await createClient();
  const { data: team } = await supabase
    .from('synq_teams')
    .select('category_slug, category')
    .eq('id', teamId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!team?.category_slug) return { ok: false, message: 'validation' };

  const used = await getUsedTeamLetters(clubId, team.category_slug, teamId);
  if (used.includes(teamLetter)) return { ok: false, message: 'duplicate_letter' };

  const categoryMeta = getCanteraCategory(team.category_slug);
  const categoryName = team.category || categoryMeta?.name || team.category_slug;
  const name = formatTeamName(categoryName, teamLetter);
  const setup = parseTeamSetupFromForm(formData);
  const setupError = await validateTeamSetup(clubId, setup, teamId);
  if (setupError) return { ok: false, message: setupError };

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/equipos');
    revalidatePath(`/portal/cantera/equipos/equipo/${teamId}`);
    revalidatePath(`/portal/cantera/equipos/equipo/${teamId}/editar`);
    if (team.category_slug) revalidatePath(`/portal/cantera/equipos/${team.category_slug}`);
    return { ok: true };
  }

  const { error } = await supabase
    .from('synq_teams')
    .update({
      name,
      team_letter: teamLetter,
      sport: sport === 'futsal' ? 'futsal' : 'football',
      ...teamSetupToDbPayload(setup),
    })
    .eq('id', teamId)
    .eq('club_id', clubId);

  if (error) {
    if (error.code === '23505') return { ok: false, message: 'duplicate_letter' };
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera/equipos');
  revalidatePath(`/portal/cantera/equipos/equipo/${teamId}`);
  revalidatePath(`/portal/cantera/equipos/equipo/${teamId}/editar`);
  if (team.category_slug) revalidatePath(`/portal/cantera/equipos/${team.category_slug}`);
  return { ok: true };
}

export async function toggleTeamActive(teamId: string, active: boolean): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const supabase = await createClient();
  const { data: team } = await supabase
    .from('synq_teams')
    .select('category_slug')
    .eq('id', teamId)
    .eq('club_id', clubId)
    .maybeSingle();

  const { error } = await supabase
    .from('synq_teams')
    .update({ active })
    .eq('id', teamId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidatePath('/portal/cantera');
  revalidatePath('/portal/cantera/equipos');
  revalidatePath(`/portal/cantera/equipos/equipo/${teamId}`);
  if (team?.category_slug) revalidatePath(`/portal/cantera/equipos/${team.category_slug}`);
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
  revalidatePath('/portal/cantera/equipos');
  return { ok: true };
}

export async function createPlayer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const legacyDisplay = String(formData.get('displayName') ?? '').trim();
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || legacyDisplay;
  const teamId = String(formData.get('teamId') ?? '').trim() || null;
  const jerseyNumber = parseOptionalInt(String(formData.get('jerseyNumber') ?? '').trim());
  const position = String(formData.get('position') ?? '').trim() || null;
  const birthYear = parseOptionalInt(String(formData.get('birthYear') ?? '').trim());

  if (!displayName) return { ok: false, message: 'validation' };
  if (!isValidJerseyNumber(jerseyNumber)) return { ok: false, message: 'validation' };

  const usesNewForm = Boolean(firstName || lastName);
  if (usesNewForm && (!birthYear || !isValidBirthYear(birthYear, playerBirthYearMax()))) {
    return { ok: false, message: 'validation' };
  }

  const supabase = await createClient();

  let teamName: string | null = null;
  if (teamId) {
    const { data: team } = await supabase
      .from('synq_teams')
      .select('name')
      .eq('id', teamId)
      .eq('club_id', clubId)
      .maybeSingle();
    teamName = team?.name ?? null;
  }

  const history = buildInitialPlayerHistory(teamName);

  if (await isDemoActive()) {
    revalidatePath('/portal/cantera/jugadores');
    revalidatePath('/portal/cantera');
    return { ok: true, message: 'demo' };
  }

  const { data, error } = await supabase
    .from('synq_players')
    .insert({
      club_id: clubId,
      team_id: teamId,
      first_name: firstName || null,
      last_name: lastName || null,
      display_name: displayName,
      jersey_number: jerseyNumber,
      position,
      birth_year: birthYear,
      active: true,
      is_minor: false,
      player_history_json: history,
    })
    .select('id')
    .single();

  if (error) {
    console.error('create player', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/cantera');
  revalidatePath('/portal/cantera/jugadores');
  revalidatePath('/portal');
  return { ok: true, playerId: data.id };
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
