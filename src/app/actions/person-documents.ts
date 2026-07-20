'use server';

import { isDemoActive } from '@/lib/demo';
import {
  parsePersonDocumentsJson,
  type PersonDocumentsData,
} from '@/lib/person-documents';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const PDF_MIME = 'application/pdf';

export type PersonDocumentActionState = {
  ok: boolean;
  message?: string;
  url?: string;
  fileName?: string;
};

export async function uploadPersonPdfDocument(
  clubId: string,
  formData: FormData
): Promise<PersonDocumentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const file = formData.get('file');
  const personId = String(formData.get('personId') ?? '').trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'no_file' };
  if (file.size > MAX_PDF_BYTES) return { ok: false, message: 'too_large' };

  const isPdf =
    file.type === PDF_MIME || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return { ok: false, message: 'invalid_type' };

  const path = `${clubId}/people/${personId || 'drafts'}/documents/${Date.now()}.pdf`;

  const { error } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: PDF_MIME,
  });

  if (error) {
    console.error('upload person pdf', error);
    return { ok: false, message: 'upload_error' };
  }

  const { data } = supabase.storage.from('club-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl, fileName: file.name };
}

export async function savePersonDocuments(
  clubId: string,
  personId: string,
  documents: PersonDocumentsData
): Promise<PersonDocumentActionState> {
  if (!personId) return { ok: false, message: 'missing_person' };

  if (await isDemoActive()) {
    return { ok: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'unauthorized' };

  const { error } = await supabase
    .from('synq_club_people')
    .update({ documents_json: documents })
    .eq('id', personId)
    .eq('club_id', clubId);

  if (error) {
    console.error('savePersonDocuments', error);
    return { ok: false, message: 'save_error' };
  }

  revalidatePath('/portal/club/staff');
  revalidatePath('/portal/club/estructura');
  return { ok: true };
}

export async function loadPersonDocumentsFromRow(
  documentsJson: unknown
): Promise<PersonDocumentsData> {
  return parsePersonDocumentsJson(documentsJson);
}
