'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { revalidatePath } from 'next/cache';

export type FoundingFormState = {
  ok: boolean;
  message: string;
};

export async function submitFoundingLead(
  _prev: FoundingFormState,
  formData: FormData
): Promise<FoundingFormState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'not_configured' };
  }

  const clubName = String(formData.get('clubName') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? 'ES').trim().toUpperCase();
  const playersCount = parseInt(String(formData.get('playersCount') ?? '0'), 10);
  const sitesCount = parseInt(String(formData.get('sitesCount') ?? '1'), 10);
  const message = String(formData.get('message') ?? '').trim();

  if (!clubName || !contactName || !contactEmail || playersCount < 1) {
    return { ok: false, message: 'validation' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('synq_founding_leads').insert({
      club_name: clubName,
      contact_name: contactName,
      contact_email: contactEmail,
      country_code: countryCode,
      players_count: playersCount,
      sites_count: sitesCount,
      message: message || null,
    });

    if (error) {
      console.error('founding lead insert', error);
      return { ok: false, message: 'error' };
    }

    revalidatePath('/');
    return { ok: true, message: 'success' };
  } catch (e) {
    console.error(e);
    return { ok: false, message: 'error' };
  }
}
