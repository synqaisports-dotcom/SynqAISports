'use server';

import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ClubProfileState = {
  ok: boolean;
  message?: string;
};

export async function updateClubProfile(
  clubId: string,
  _prev: ClubProfileState,
  formData: FormData
): Promise<ClubProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const coverUrl = String(formData.get('coverUrl') ?? '').trim();
  const logoUrl = String(formData.get('logoUrl') ?? '').trim();
  const playersCount = parseInt(String(formData.get('playersCount') ?? '0'), 10);
  const familyFee = parseFloat(String(formData.get('familyFee') ?? '12'));

  if (!name) return { ok: false, message: 'validation' };

  const { error } = await supabase
    .from('synq_clubs')
    .update({
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      cover_url: coverUrl || null,
      logo_url: logoUrl || null,
      players_count: playersCount,
      family_fee_annual_eur: familyFee,
    })
    .eq('id', clubId);

  if (error) {
    console.error('club update', error);
    return { ok: false, message: 'error' };
  }

  revalidatePath('/portal');
  revalidatePath('/portal/club');
  revalidatePath('/portal/club/datos');
  return { ok: true };
}

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function regenerateInviteCode(clubId: string): Promise<{ ok: boolean; code?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false };

  const code = randomCode();
  const { error } = await supabase
    .from('synq_clubs')
    .update({ invite_code: code })
    .eq('id', clubId);

  if (error) {
    console.error('invite code', error);
    return { ok: false };
  }

  revalidatePath('/portal/config');
  return { ok: true, code };
}
