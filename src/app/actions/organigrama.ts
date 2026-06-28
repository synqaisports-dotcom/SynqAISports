'use server';

import { isDemoActive } from '@/lib/demo';
import { buildOrganigramaTree, parseOrganigramaJson, type OrganigramaNodeFlat } from '@/lib/organigrama';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type OrganigramaState = {
  ok: boolean;
  message?: string;
};

export async function updateOrganigrama(
  clubId: string,
  _prev: OrganigramaState,
  formData: FormData
): Promise<OrganigramaState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const raw = String(formData.get('organigramaJson') ?? '').trim();
  if (!raw) return { ok: false, message: 'validation' };

  let flat: OrganigramaNodeFlat[];
  try {
    flat = JSON.parse(raw) as OrganigramaNodeFlat[];
    if (!Array.isArray(flat) || flat.length === 0) return { ok: false, message: 'validation' };
  } catch {
    return { ok: false, message: 'validation' };
  }

  const tree = buildOrganigramaTree(
    flat
      .map((row) => ({
        id: String(row.id ?? '').trim(),
        role: String(row.role ?? '').trim(),
        personId: row.personId ? String(row.personId).trim() : null,
        parentId: row.parentId ? String(row.parentId) : null,
      }))
      .filter((row) => row.id && row.role)
  );

  if (tree.length === 0) return { ok: false, message: 'validation' };

  const { error } = await supabase
    .from('synq_clubs')
    .update({ organigrama_json: tree })
    .eq('id', clubId);

  if (error) {
    console.error('organigrama update', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal/club/organigrama');
  revalidatePath('/portal/club/organigrama/editar');
  return { ok: true };
}

export async function loadOrganigramaFromClub(
  organigramaJson: unknown
): Promise<ReturnType<typeof parseOrganigramaJson>> {
  return parseOrganigramaJson(organigramaJson);
}
