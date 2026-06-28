'use server';

import { isDemoActive } from '@/lib/demo';
import {
  DEMO_CLUB_PEOPLE,
  type AccessProfile,
  type ClubPerson,
  type PersonKind,
} from '@/lib/club-people';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const PERSON_SELECT =
  'id, club_id, full_name, email, phone, person_kind, institutional_role, sport_role, access_profile, user_id, notes';

export type ClubPeopleState = {
  ok: boolean;
  message?: string;
};

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
  };

  if (await isDemoActive()) {
    revalidatePath('/portal/club/estructura');
    revalidatePath('/portal/club/organigrama');
    revalidatePath('/portal/club/organigrama/editar');
    return { ok: true };
  }

  const query = personId
    ? supabase.from('synq_club_people').update(payload).eq('id', personId).eq('club_id', clubId)
    : supabase.from('synq_club_people').insert(payload);

  const { error } = await query;
  if (error) {
    console.error('upsertInstitutionalPerson', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/club/estructura');
  revalidatePath('/portal/club/estructura/editar');
  revalidatePath('/portal/club/organigrama');
  revalidatePath('/portal/club/organigrama/editar');
  return { ok: true };
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
