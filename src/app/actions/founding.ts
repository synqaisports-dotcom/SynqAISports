'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDemoActive } from '@/lib/demo';
import {
  addDemoFoundingLead,
  getDemoFoundingLead,
  listDemoFoundingLeads,
  updateDemoFoundingLead,
  type FoundingLead,
} from '@/lib/demo-founding-store';
import {
  foundingInviteCode,
  foundingSlug,
  foundingUntilFrom,
  takenCodes,
  takenSlugs,
} from '@/lib/founding-leads';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export type FoundingFormState = {
  ok: boolean;
  message: string;
};

function readLeadInput(formData: FormData) {
  const clubName = String(formData.get('clubName') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const contactEmail = String(formData.get('contactEmail') ?? '').trim();
  const countryCode = String(formData.get('countryCode') ?? 'ES')
    .trim()
    .toUpperCase()
    .slice(0, 2);
  const playersCount = parseInt(String(formData.get('playersCount') ?? '0'), 10);
  const sitesCount = parseInt(String(formData.get('sitesCount') ?? '1'), 10);
  const message = String(formData.get('message') ?? '').trim();
  return { clubName, contactName, contactEmail, countryCode, playersCount, sitesCount, message };
}

export async function submitFoundingLead(
  _prev: FoundingFormState,
  formData: FormData
): Promise<FoundingFormState> {
  const input = readLeadInput(formData);
  if (!input.clubName || !input.contactName || !input.contactEmail.includes('@') || input.playersCount < 1) {
    return { ok: false, message: 'validation' };
  }

  const lead: FoundingLead = {
    id: crypto.randomUUID(),
    club_name: input.clubName,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    country_code: input.countryCode || 'ES',
    players_count: input.playersCount,
    sites_count: Number.isFinite(input.sitesCount) && input.sitesCount > 0 ? input.sitesCount : 1,
    message: input.message || null,
    status: 'pending',
    created_at: new Date().toISOString(),
    invite_code: null,
    club_slug: null,
    founding_until: null,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('synq_founding_leads').insert({
        id: lead.id,
        club_name: lead.club_name,
        contact_name: lead.contact_name,
        contact_email: lead.contact_email,
        country_code: lead.country_code,
        players_count: lead.players_count,
        sites_count: lead.sites_count,
        message: lead.message,
      });
      if (error) console.error('founding lead insert', error);
    } catch (error) {
      console.error(error);
    }
  }

  addDemoFoundingLead(lead);
  revalidatePath('/');
  revalidatePath('/admin');
  return { ok: true, message: 'success' };
}

async function assertDemoDesk() {
  if (!(await isDemoActive())) redirect('/demo?next=/admin');
}

export async function reviewFoundingLead(formData: FormData): Promise<void> {
  await assertDemoDesk();
  const id = String(formData.get('id') ?? '').trim();
  const decision = formData.get('decision') === 'rejected' ? 'rejected' : 'approved';
  const current = getDemoFoundingLead(id);
  if (!current || current.status !== 'pending') {
    revalidatePath('/admin');
    return;
  }

  if (decision === 'rejected') {
    updateDemoFoundingLead(id, { status: 'rejected' });
    await syncLeadStatus(id, 'rejected');
    revalidatePath('/admin');
    return;
  }

  const all = listDemoFoundingLeads();
  const inviteCode = foundingInviteCode(takenCodes(all, id));
  const clubSlug = foundingSlug(current.club_name, takenSlugs(all, id));
  const foundingUntil = foundingUntilFrom();
  updateDemoFoundingLead(id, {
    status: 'approved',
    invite_code: inviteCode,
    club_slug: clubSlug,
    founding_until: foundingUntil,
  });
  await syncLeadStatus(id, 'approved');
  await createFoundingClub({
    name: current.club_name,
    slug: clubSlug,
    email: current.contact_email,
    countryCode: current.country_code,
    playersCount: current.players_count,
    inviteCode,
    foundingUntil,
  });
  revalidatePath('/admin');
}

async function syncLeadStatus(id: string, status: 'approved' | 'rejected') {
  const service = createServiceClient();
  if (!service || id.startsWith('demo-lead-')) return;
  const { error } = await service.from('synq_founding_leads').update({ status }).eq('id', id);
  if (error) console.error('founding lead status', error);
}

async function createFoundingClub(input: {
  name: string;
  slug: string;
  email: string;
  countryCode: string;
  playersCount: number;
  inviteCode: string;
  foundingUntil: string;
}) {
  const service = createServiceClient();
  if (!service) return;
  const { error } = await service.from('synq_clubs').insert({
    name: input.name,
    slug: input.slug,
    players_count: input.playersCount,
    country_code: input.countryCode,
    email: input.email,
    is_founding: true,
    founding_until: input.foundingUntil,
    invite_code: input.inviteCode,
  });
  if (error) console.error('founding club insert', error);
}
