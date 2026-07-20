'use server';

import { parsePracticedSportsFromForm } from '@/lib/club-practiced-sports';
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
  const websiteUrl = String(formData.get('websiteUrl') ?? '').trim();
  const instagramUrl = String(formData.get('instagramUrl') ?? '').trim();
  const facebookUrl = String(formData.get('facebookUrl') ?? '').trim();
  const xUrl = String(formData.get('xUrl') ?? '').trim();
  const tiktokUrl = String(formData.get('tiktokUrl') ?? '').trim();
  const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
  const playersCount = parseInt(String(formData.get('playersCount') ?? '0'), 10);
  const familyFee = parseFloat(String(formData.get('familyFee') ?? '12'));
  const practicedSports = parsePracticedSportsFromForm(formData);

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
      website_url: websiteUrl || null,
      instagram_url: instagramUrl || null,
      facebook_url: facebookUrl || null,
      x_url: xUrl || null,
      tiktok_url: tiktokUrl || null,
      youtube_url: youtubeUrl || null,
      players_count: playersCount,
      family_fee_annual_eur: familyFee,
      practiced_sports: practicedSports,
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

export async function uploadClubMedia(
  clubId: string,
  formData: FormData
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !(await isDemoActive())) return { ok: false, message: 'unauthorized' };

  const file = formData.get('file');
  const type = formData.get('type');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'no_file' };
  if (type !== 'cover' && type !== 'logo') return { ok: false, message: 'invalid_type' };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, message: 'too_large' };
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { ok: false, message: 'invalid_type' };

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${clubId}/${type}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('club-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error('upload club media', error);
    return { ok: false, message: 'upload_error' };
  }

  const { data } = supabase.storage.from('club-media').getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
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
