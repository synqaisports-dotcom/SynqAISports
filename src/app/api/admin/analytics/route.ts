import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { verifySuperadminFromRequest } from '../verify-superadmin';

type GeoHeatPoint = { lat: number; lon: number; intensity: number; label: string };

const COUNTRY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  ES: { lat: 40.4168, lon: -3.7038 },
  SPAIN: { lat: 40.4168, lon: -3.7038 },
  ESPAÑA: { lat: 40.4168, lon: -3.7038 },
  AR: { lat: -34.6037, lon: -58.3816 },
  ARGENTINA: { lat: -34.6037, lon: -58.3816 },
  BR: { lat: -15.7939, lon: -47.8828 },
  BRASIL: { lat: -15.7939, lon: -47.8828 },
  BRAZIL: { lat: -15.7939, lon: -47.8828 },
  MX: { lat: 19.4326, lon: -99.1332 },
  MEXICO: { lat: 19.4326, lon: -99.1332 },
  MÉXICO: { lat: 19.4326, lon: -99.1332 },
  CO: { lat: 4.711, lon: -74.0721 },
  COLOMBIA: { lat: 4.711, lon: -74.0721 },
  CL: { lat: -33.4489, lon: -70.6693 },
  CHILE: { lat: -33.4489, lon: -70.6693 },
  US: { lat: 38.9072, lon: -77.0369 },
  USA: { lat: 38.9072, lon: -77.0369 },
  "UNITED STATES": { lat: 38.9072, lon: -77.0369 },
  FR: { lat: 48.8566, lon: 2.3522 },
  FRANCE: { lat: 48.8566, lon: 2.3522 },
  DE: { lat: 52.52, lon: 13.405 },
  GERMANY: { lat: 52.52, lon: 13.405 },
  IT: { lat: 41.9028, lon: 12.4964 },
  ITALY: { lat: 41.9028, lon: 12.4964 },
  PT: { lat: 38.7223, lon: -9.1393 },
  PORTUGAL: { lat: 38.7223, lon: -9.1393 },
  UK: { lat: 51.5074, lon: -0.1278 },
  "UNITED KINGDOM": { lat: 51.5074, lon: -0.1278 },
};

function normalizeCountryKey(country: string): string {
  return country.trim().toUpperCase();
}

function buildGeoHeat(
  geoProfiles: Array<{ country: string; count: number }>,
  geoClubs: Array<{ country: string; count: number }>,
  sandboxOpens: number,
): GeoHeatPoint[] {
  const byCountry = new Map<string, number>();
  for (const row of geoProfiles) {
    byCountry.set(row.country, (byCountry.get(row.country) ?? 0) + row.count);
  }
  for (const row of geoClubs) {
    byCountry.set(row.country, (byCountry.get(row.country) ?? 0) + row.count * 2);
  }
  if (sandboxOpens > 0 && byCountry.has("Sin país")) {
    byCountry.set("Sin país", (byCountry.get("Sin país") ?? 0) + sandboxOpens);
  }
  const points: GeoHeatPoint[] = [];
  for (const [country, intensity] of byCountry.entries()) {
    const key = normalizeCountryKey(country);
    const coords = COUNTRY_COORDINATES[key];
    if (!coords) continue;
    points.push({
      lat: coords.lat,
      lon: coords.lon,
      intensity,
      label: country,
    });
  }
  return points.sort((a, b) => b.intensity - a.intensity).slice(0, 24);
}

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
    let clubCountries: { country: string; count: number }[] = [];
    try {
      const rows = await fetchAllCountries(admin, 'profiles');
      profileCountries = tallyCountries(rows).slice(0, 8);
    } catch (e) {
      console.warn('[SynqAI] analytics profile countries:', e);
    }
    try {
      const rows = await fetchAllCountries(admin, 'clubs');
      clubCountries = tallyCountries(rows).slice(0, 8);
    } catch (e) {
      console.warn('[SynqAI] analytics club countries:', e);
    }

    const totalProfileCountry = profileCountries.reduce((s, x) => s + x.count, 0) || 1;
    const geoWithPercent = profileCountries.map((g) => ({
      ...g,
      percent: Math.round((g.count / totalProfileCountry) * 100),
    }));

    const conversionRate =
      profilesTotal > 0 ? Math.round((collabLeads / profilesTotal) * 10000) / 100 : 0;

    // Funnel SANDBOX COACH (si no existe tabla/migración, cae a 0 sin romper analytics).
    let sandboxCoachOpens = 0;
    let sandboxCoachAdImpressions = 0;
    let sandboxCoachAdClicks = 0;
    try {
      const eventsRes = await admin
        .from("ad_events_queue" as any)
        .select("event_type,metadata")
        .limit(5000);
      if (!eventsRes.error && Array.isArray(eventsRes.data)) {
        for (const ev of eventsRes.data as Array<{ event_type?: string; metadata?: Record<string, unknown> }>) {
          const appSlug = String(ev.metadata?.app_slug ?? "");
          const source = String(ev.metadata?.source ?? "");
          const isSandboxCoach = appSlug === "sandbox-coach" || source === "sandbox";
          if (!isSandboxCoach) continue;
          const type = String(ev.event_type ?? "");
          if (type === "session_save" && String(ev.metadata?.event_name ?? "") === "app_open") sandboxCoachOpens += 1;
          if (type === "ad_impression") sandboxCoachAdImpressions += 1;
          if (type === "ad_click") sandboxCoachAdClicks += 1;
        }
      }
    } catch {
      // noop
    }

    const adCpm = Number(process.env.SANDBOX_AD_ESTIMATED_CPM_EUR ?? "1.2");
    const adCpc = Number(process.env.SANDBOX_AD_ESTIMATED_CPC_EUR ?? "0.05");
    const sandboxCoachEstimatedRevenue =
      Math.round(((sandboxCoachAdImpressions / 1000) * adCpm + sandboxCoachAdClicks * adCpc) * 100) / 100;
    const geoHeat = buildGeoHeat(profileCountries, clubCountries, sandboxCoachOpens);

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
      geoHeat,
      topPromos,
      conversionRate,
      sandboxCoachOpens,
      sandboxCoachAdImpressions,
      sandboxCoachAdClicks,
      sandboxCoachEstimatedRevenue,
    });
  } catch (e) {
    console.error('[SynqAI] admin analytics:', e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error agregando métricas' },
      { status: 500 },
    );
  }
}
