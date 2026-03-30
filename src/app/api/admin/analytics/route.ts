import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../verify-superadmin';

const PAGE = 1000;
const MAX_PAGES = 100;

async function fetchAllCountries(
  admin: ReturnType<typeof createClient<Database>>,
  table: 'profiles' | 'clubs',
): Promise<{ country: string | null }[]> {
  const out: { country: string | null }[] = [];
  let from = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await admin
      .from(table)
      .select('country')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const chunk = data ?? [];
    out.push(...chunk);
    if (chunk.length < PAGE) break;
    from += PAGE;
  }
  return out;
}

function tallyCountries(rows: { country: string | null }[]) {
  const m = new Map<string, number>();
  for (const r of rows) {
    const raw = (r.country ?? '').trim();
    const key = raw || 'Sin país';
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));
}

export async function GET(req: Request) {
  const gate = await verifySuperadminFromRequest(req);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json(
      { ok: false, offline: true, error: 'SUPABASE_SERVICE_ROLE_KEY requerida para analytics.' },
      { status: 501 },
    );
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const [
      profilesCountRes,
      clubsCountRes,
      clubsActiveRes,
      exercisesCountRes,
      promoListRes,
    ] = await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('clubs').select('*', { count: 'exact', head: true }),
      admin.from('clubs').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
      admin.from('exercises').select('*', { count: 'exact', head: true }),
      admin.from('promo_campaigns').select('id, title, token, scan_count, max_uses, is_active'),
    ]);

    const promos =
      promoListRes.error ? [] : (promoListRes.data ?? []);
    if (promoListRes.error) {
      console.warn('[SynqAI] analytics promo_campaigns:', promoListRes.error.message);
    }

    let collabRows: { submission_type: 'feedback' | 'lead' }[] = [];
    const collabQ = await admin.from('sandbox_collaboration_submissions').select('submission_type');
    if (!collabQ.error && collabQ.data) {
      collabRows = collabQ.data as { submission_type: 'feedback' | 'lead' }[];
    }

    const profilesTotal = profilesCountRes.count ?? 0;
    const clubsTotal = clubsCountRes.count ?? 0;
    const clubsActive = clubsActiveRes.count ?? 0;
    const exercisesTotal = exercisesCountRes.count ?? 0;

    const promoScans = promos.reduce(
      (s, p) => s + (typeof p.scan_count === 'number' ? p.scan_count : 0),
      0,
    );
    let promoNearLimit = 0;
    for (const p of promos) {
      const max = p.max_uses;
      const used = p.scan_count ?? 0;
      if (max != null && max > 0 && used >= max * 0.8) promoNearLimit += 1;
    }

    const topPromos = [...promos]
      .sort((a, b) => (b.scan_count ?? 0) - (a.scan_count ?? 0))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        token: p.token,
        scan_count: p.scan_count ?? 0,
        max_uses: p.max_uses,
        is_active: p.is_active,
      }));

    let collabLeads = 0;
    let collabFeedback = 0;
    for (const row of collabRows) {
      if (row.submission_type === 'lead') collabLeads += 1;
      if (row.submission_type === 'feedback') collabFeedback += 1;
    }

    let profileCountries: { country: string; count: number }[] = [];
    try {
      const rows = await fetchAllCountries(admin, 'profiles');
      profileCountries = tallyCountries(rows).slice(0, 8);
    } catch (e) {
      console.warn('[SynqAI] analytics profile countries:', e);
    }

    const totalProfileCountry = profileCountries.reduce((s, x) => s + x.count, 0) || 1;
    const geoWithPercent = profileCountries.map((g) => ({
      ...g,
      percent: Math.round((g.count / totalProfileCountry) * 100),
    }));

    const conversionRate =
      profilesTotal > 0 ? Math.round((collabLeads / profilesTotal) * 10000) / 100 : 0;

    return NextResponse.json({
      ok: true,
      profilesTotal,
      clubsTotal,
      clubsActive,
      exercisesTotal,
      promoCampaigns: promos.length,
      promoScans,
      promoNearLimit,
      collabLeads,
      collabFeedback,
      geo: geoWithPercent,
      topPromos,
      conversionRate,
    });
  } catch (e) {
    console.error('[SynqAI] admin analytics:', e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error agregando métricas' },
      { status: 500 },
    );
  }
}
