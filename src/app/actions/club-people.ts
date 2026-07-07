'use server';

import { isDemoActive } from '@/lib/demo';
import {
  DEMO_CLUB_PEOPLE,
  type AccessProfile,
  type ClubPerson,
  type PersonKind,
} from '@/lib/club-people';
import {
  DEMO_TEAMS,
  parseAssignmentsJson,
  type PersonAssignment,
  type TeamOption,
} from '@/lib/person-assignments';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const PERSON_SELECT =
  'id, club_id, full_name, email, phone, person_kind, institutional_role, sport_role, access_profile, user_id, notes, photo_url, medical_until, sport_teams';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export type ClubPeopleState = {
  ok: boolean;
  message?: string;
  personId?: string;
};

async function uploadClubMediaFile(
  clubId: string,
  folder: string,
  file: File
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: 'too_large' };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { ok: false, message: 'invalid_type' };

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${clubId}/${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error('upload media', error);
    return { ok: false, message: 'upload_error' };
  }

  const { data } = supabase.storage.from('club-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function uploadPersonPhoto(
  clubId: string,
  formData: FormData
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'no_file' };
  const personId = String(formData.get('personId') ?? '').trim();
  const folder = personId ? `people/${personId}` : 'people/drafts';
  return uploadClubMediaFile(clubId, folder, file);
}

export async function loadClubTeams(clubId: string): Promise<TeamOption[]> {
  if (await isDemoActive()) {
    const supabase = await createClient();
  const { data } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug')
    .eq('club_id', clubId)
    .eq('active', true)
    .order('name');
    if (data && data.length > 0) return data as TeamOption[];
    return DEMO_TEAMS;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_teams')
    .select('id, name, category')
    .eq('club_id', clubId)
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('loadClubTeams', error);
    return [];
  }

  return (data ?? []) as TeamOption[];
}

export async function loadClubPersonAssignments(clubId: string): Promise<PersonAssignment[]> {
  if (await isDemoActive()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_person_assignments')
    .select('id, person_id, team_id, category, assignment_role')
    .eq('club_id', clubId);

  if (error) {
    console.error('loadClubPersonAssignments', error);
    return [];
  }

  return (data ?? []) as PersonAssignment[];
}

export async function loadPersonAssignments(personId: string): Promise<PersonAssignment[]> {
  if (await isDemoActive()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_person_assignments')
    .select('id, person_id, team_id, category, assignment_role')
    .eq('person_id', personId);

  if (error) {
    console.error('loadPersonAssignments', error);
    return [];
  }

  return (data ?? []) as PersonAssignment[];
}

async function syncAssignments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clubId: string,
  personId: string,
  assignmentsJson: string,
  teams: TeamOption[]
): Promise<string | null> {
  const inputs = parseAssignmentsJson(assignmentsJson);
  await supabase.from('synq_person_assignments').delete().eq('person_id', personId);

  if (inputs.length === 0) return null;

  const teamById = new Map(teams.map((team) => [team.id, team]));
  const summaryParts: string[] = [];

  const rows = inputs.map((input) => {
    if (input.teamId) {
      const team = teamById.get(input.teamId);
      if (team) summaryParts.push(team.name);
    } else if (input.category) {
      summaryParts.push(input.category);
    }
    return {
      club_id: clubId,
      person_id: personId,
      team_id: input.teamId,
      category: input.category,
      assignment_role: input.assignmentRole,
    };
  });

  const { error } = await supabase.from('synq_person_assignments').insert(rows);
  if (error) {
    console.error('syncAssignments', error);
    return null;
  }

  return summaryParts.join(', ') || null;
}

export async function loadClubPeople(clubId: string): Promise<ClubPerson[]> {
  if (await isDemoActive()) {
    return DEMO_CLUB_PEOPLE.map((person) => ({ ...person, club_id: clubId }));
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_people')
    .select(PERSON_SELECT)
    .eq('club_id', clubId)
    .order('full_name', { ascending: true });

  if (error) {
    console.error('loadClubPeople', error);
    return [];
  }

  return (data ?? []) as ClubPerson[];
}

export async function loadInstitutionalPeople(clubId: string): Promise<ClubPerson[]> {
  const people = await loadClubPeople(clubId);
  return people.filter(
    (person) => person.person_kind === 'institutional' || person.person_kind === 'mixed'
  );
}

export async function loadSportPeople(clubId: string): Promise<ClubPerson[]> {
  const people = await loadClubPeople(clubId);
  return people.filter(
    (person) => person.person_kind === 'sport' || person.person_kind === 'mixed'
  );
}

export async function upsertInstitutionalPerson(
  clubId: string,
  _prev: ClubPeopleState,
  formData: FormData
): Promise<ClubPeopleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const personId = String(formData.get('personId') ?? '').trim();
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const institutionalRole = String(formData.get('institutionalRole') ?? '').trim();
  const accessProfile = String(formData.get('accessProfile') ?? '').trim() as AccessProfile;
  const notes = String(formData.get('notes') ?? '').trim();
  const photoUrl = String(formData.get('photoUrl') ?? '').trim();

  if (!fullName || !institutionalRole) return { ok: false, message: 'validation' };

  const payload = {
    club_id: clubId,
    full_name: fullName,
    email: email || null,
    phone: phone || null,
    person_kind: 'institutional' as PersonKind,
    institutional_role: institutionalRole,
    sport_role: null,
    access_profile: accessProfile || 'none',
    notes: notes || null,
    photo_url: photoUrl || null,
  };

  if (await isDemoActive()) {
    revalidatePath('/portal/club/estructura');
    revalidatePath('/portal/club/organigrama');
    revalidatePath('/portal/club/organigrama/editar');
    return { ok: true };
  }

  if (personId) {
    const { error } = await supabase
      .from('synq_club_people')
      .update(payload)
      .eq('id', personId)
      .eq('club_id', clubId);
    if (error) {
      console.error('upsertInstitutionalPerson', error);
      return { ok: false, message: 'error' };
    }
  } else {
    const { error } = await supabase.from('synq_club_people').insert(payload);
    if (error) {
      console.error('upsertInstitutionalPerson', error);
      return { ok: false, message: 'error' };
    }
  }

  revalidatePath('/portal/club/estructura');
  revalidatePath('/portal/club/organigrama');
  revalidatePath('/portal/club/organigrama/editar');
  return { ok: true };
}

export async function upsertSportPerson(
  clubId: string,
  _prev: ClubPeopleState,
  formData: FormData
): Promise<ClubPeopleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const personId = String(formData.get('personId') ?? '').trim();
  const fullName = String(formData.get('fullName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const sportRole = String(formData.get('sportRole') ?? '').trim();
  const medicalUntil = String(formData.get('medicalUntil') ?? '').trim();
  const accessProfile = String(formData.get('accessProfile') ?? '').trim() as AccessProfile;
  const notes = String(formData.get('notes') ?? '').trim();
  const photoUrl = String(formData.get('photoUrl') ?? '').trim();
  const assignmentsJson = String(formData.get('assignmentsJson') ?? '[]');

  if (!fullName || !sportRole) return { ok: false, message: 'validation' };

  const teams = await loadClubTeams(clubId);

  const payload = {
    club_id: clubId,
    full_name: fullName,
    email: email || null,
    phone: phone || null,
    person_kind: 'sport' as PersonKind,
    institutional_role: null,
    sport_role: sportRole,
    medical_until: medicalUntil || null,
    access_profile: accessProfile || 'coach',
    notes: notes || null,
    photo_url: photoUrl || null,
    sport_teams: null as string | null,
  };

  if (await isDemoActive()) {
    revalidatePath('/portal/club/staff');
    revalidatePath('/portal/club/organigrama');
    revalidatePath('/portal/club/organigrama/editar');
    return { ok: true, message: 'demo', personId: personId || undefined };
  }

  let savedPersonId = personId;

  if (personId) {
    const { error } = await supabase
      .from('synq_club_people')
      .update(payload)
      .eq('id', personId)
      .eq('club_id', clubId);
    if (error) {
      console.error('upsertSportPerson', error);
      return { ok: false, message: 'error' };
    }
  } else {
    const { data, error } = await supabase
      .from('synq_club_people')
      .insert(payload)
      .select('id')
      .single();
    if (error || !data) {
      console.error('upsertSportPerson', error);
      return { ok: false, message: 'error' };
    }
    savedPersonId = data.id;
  }

  const sportTeamsSummary = await syncAssignments(
    supabase,
    clubId,
    savedPersonId,
    assignmentsJson,
    teams
  );

  if (sportTeamsSummary !== null) {
    await supabase
      .from('synq_club_people')
      .update({ sport_teams: sportTeamsSummary })
      .eq('id', savedPersonId);
  }

  revalidatePath('/portal/club/staff');
  revalidatePath('/portal/club/staff/nuevo');
  revalidatePath(`/portal/club/staff/${savedPersonId}`);
  revalidatePath(`/portal/club/staff/${savedPersonId}/editar`);
  revalidatePath('/portal/club/organigrama');
  revalidatePath('/portal/club/organigrama/editar');
  return { ok: true, personId: savedPersonId };
}

export async function deleteInstitutionalPerson(
  clubId: string,
  personId: string
): Promise<ClubPeopleState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    revalidatePath('/portal/club/estructura');
    return { ok: true };
  }

  const { error } = await supabase
    .from('synq_club_people')
    .delete()
    .eq('id', personId)
    .eq('club_id', clubId);

  if (error) {
    console.error('deleteInstitutionalPerson', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/club/estructura');
  revalidatePath('/portal/club/organigrama');
  revalidatePath('/portal/club/organigrama/editar');
  return { ok: true };
}
