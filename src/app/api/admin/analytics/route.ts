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

type SandboxWorldAgg = { country: string; devices: number; pings: number };

async function aggregateSandboxWorldFromSnapshots(
  admin: ReturnType<typeof createClient<Database>>,
): Promise<{ rows: SandboxWorldAgg[]; heat: GeoHeatPoint[]; totalDevices: number; totalPings: number }> {
  const byCountry = new Map<string, { devices: Set<string>; pings: number }>();
  const PAGE = 500;
  const MAX_PAGES = 40;

  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE;
    const { data, error } = await admin
      .from('sandbox_device_snapshots')
      .select('device_id,snapshot')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (error) {
      console.warn('[SynqAI] analytics sandbox_device_snapshots:', error.message);
      break;
    }
    const chunk = data ?? [];
    for (const row of chunk as Array<{ device_id?: string; snapshot?: Record<string, unknown> }>) {
      const snap = row.snapshot;
      if (!snap || typeof snap !== 'object') continue;
      const op = String(snap.op ?? '');
      if (op !== 'sandbox_telemetry') continue;
      const payload = snap.payload as Record<string, unknown> | undefined;
      if (!payload || String(payload.kind ?? '') !== 'sandbox_session') continue;
      const rawCc = String(payload.countryCode ?? '').trim();
      if (rawCc.length < 2) continue;
      const cc = normalizeCountryKey(rawCc);
      const deviceId = String(row.device_id ?? '').trim();
      let cur = byCountry.get(cc);
      if (!cur) {
        cur = { devices: new Set<string>(), pings: 0 };
        byCountry.set(cc, cur);
      }
      cur.pings += 1;
      if (deviceId) cur.devices.add(deviceId);
    }
    if (chunk.length < PAGE) break;
  }

  const rows: SandboxWorldAgg[] = [...byCountry.entries()]
    .map(([country, v]) => ({
      country,
      devices: v.devices.size,
      pings: v.pings,
    }))
    .sort((a, b) => b.devices - a.devices || b.pings - a.pings)
    .slice(0, 32);

  const heat: GeoHeatPoint[] = [];
  for (const r of rows) {
    const coords = COUNTRY_COORDINATES[r.country];
    if (!coords) continue;
    heat.push({
      lat: coords.lat,
      lon: coords.lon,
      intensity: r.devices * 3 + r.pings,
      label: r.country,
    });
  }
  heat.sort((a, b) => b.intensity - a.intensity);

  const totalDevices = [...byCountry.values()].reduce((s, v) => s + v.devices.size, 0);
  const totalPings = [...byCountry.values()].reduce((s, v) => s + v.pings, 0);

  return { rows, heat, totalDevices, totalPings };
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

const TS_PAGE = 1000;
const TS_MAX_ROWS = 80_000;

function utcDayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function lastNDaysUtcKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function buildDailyCounts(dayKeys: string[], timestamps: string[]): number[] {
  const m = new Map<string, number>();
  for (const k of dayKeys) m.set(k, 0);
  for (const iso of timestamps) {
    const k = utcDayKey(iso);
    if (!k || !m.has(k)) continue;
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return dayKeys.map((k) => m.get(k) ?? 0);
}

type TrendKind = 'up' | 'flat';

function trendVsPriorWeek(series: number[]): { label: string; trend: TrendKind } {
  if (series.length < 14) {
    return { label: 'Serie incompleta', trend: 'flat' };
  }
  const prev = series.slice(0, 7).reduce((a, b) => a + b, 0);
  const cur = series.slice(7, 14).reduce((a, b) => a + b, 0);
  if (prev === 0 && cur === 0) return { label: 'Sin altas este período', trend: 'flat' };
  if (prev === 0) return { label: `+${cur} vs semana anterior`, trend: 'up' };
  const pct = Math.round(((cur - prev) / prev) * 1000) / 10;
  if (Math.abs(pct) < 2) return { label: 'Estable vs semana anterior', trend: 'flat' };
  return {
    label: `${pct > 0 ? '+' : ''}${pct}% vs semana anterior`,
    trend: pct > 0 ? 'up' : 'flat',
  };
}

async function pullCreatedAtColumn(
  admin: ReturnType<typeof createClient<Database>>,
  table: 'profiles' | 'clubs',
  sinceIso: string,
): Promise<string[]> {
  const out: string[] = [];
  let from = 0;
  for (let page = 0; page < 200; page++) {
    const { data, error } = await admin
      .from(table)
      .select('created_at')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .range(from, from + TS_PAGE - 1);
    if (error) throw error;
    const chunk = (data ?? []) as { created_at?: string | null }[];
    for (const row of chunk) {
      if (row.created_at) out.push(row.created_at);
    }
    if (chunk.length < TS_PAGE) break;
    from += TS_PAGE;
    if (out.length >= TS_MAX_ROWS) break;
  }
  return out;
}

async function pullPromoScanTimes(
  admin: ReturnType<typeof createClient<Database>>,
  sinceIso: string,
): Promise<string[]> {
  const out: string[] = [];
  let from = 0;
  for (let page = 0; page < 200; page++) {
    const { data, error } = await admin
      .from('promo_campaign_events')
      .select('created_at')
      .eq('kind', 'scan')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .range(from, from + TS_PAGE - 1);
    if (error) {
      console.warn('[SynqAI] analytics promo_campaign_events timeseries:', error.message);
      return out;
    }
    const chunk = (data ?? []) as { created_at?: string | null }[];
    for (const row of chunk) {
      if (row.created_at) out.push(row.created_at);
    }
    if (chunk.length < TS_PAGE) break;
    from += TS_PAGE;
    if (out.length >= TS_MAX_ROWS) break;
  }
  return out;
}

async function pullCollabTimes(
  admin: ReturnType<typeof createClient<Database>>,
  sinceIso: string,
  submissionType: 'lead' | 'feedback',
): Promise<string[]> {
  const out: string[] = [];
  let from = 0;
  for (let page = 0; page < 200; page++) {
    const { data, error } = await admin
      .from('sandbox_collaboration_submissions')
      .select('created_at')
      .eq('submission_type', submissionType)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .range(from, from + TS_PAGE - 1);
    if (error) {
      console.warn('[SynqAI] analytics collab timeseries:', error.message);
      return out;
    }
    const chunk = (data ?? []) as { created_at?: string | null }[];
    for (const row of chunk) {
      if (row.created_at) out.push(row.created_at);
    }
    if (chunk.length < TS_PAGE) break;
    from += TS_PAGE;
    if (out.length >= TS_MAX_ROWS) break;
  }
  return out;
}

async function pullActiveClubSnapshots(
  admin: ReturnType<typeof createClient<Database>>,
  sinceIso: string,
): Promise<string[]> {
  const out: string[] = [];
  let from = 0;
  for (let page = 0; page < 200; page++) {
    const { data, error } = await admin
      .from('clubs')
      .select('created_at')
      .eq('status', 'Active')
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: true })
      .range(from, from + TS_PAGE - 1);
    if (error) throw error;
    const chunk = (data ?? []) as { created_at?: string | null }[];
    for (const row of chunk) {
      if (row.created_at) out.push(row.created_at);
    }
    if (chunk.length < TS_PAGE) break;
    from += TS_PAGE;
    if (out.length >= TS_MAX_ROWS) break;
  }
  return out;
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

    const dashboardDayKeys = lastNDaysUtcKeys(30);
    const since30 = new Date();
    since30.setUTCHours(0, 0, 0, 0);
    since30.setUTCDate(since30.getUTCDate() - 29);
    const since30Iso = since30.toISOString();

    let profilesDaily: number[] = dashboardDayKeys.map(() => 0);
    let clubsActiveDaily: number[] = dashboardDayKeys.map(() => 0);
    let promoScansDaily: number[] = dashboardDayKeys.map(() => 0);
    let collabLeadsDaily: number[] = dashboardDayKeys.map(() => 0);
    let collabFeedbackDaily: number[] = dashboardDayKeys.map(() => 0);

    try {
      const [profileTs, activeClubTs, promoTs, leadTs, feedbackTs] = await Promise.all([
        pullCreatedAtColumn(admin, 'profiles', since30Iso),
        pullActiveClubSnapshots(admin, since30Iso),
        pullPromoScanTimes(admin, since30Iso),
        pullCollabTimes(admin, since30Iso, 'lead'),
        pullCollabTimes(admin, since30Iso, 'feedback'),
      ]);
      profilesDaily = buildDailyCounts(dashboardDayKeys, profileTs);
      clubsActiveDaily = buildDailyCounts(dashboardDayKeys, activeClubTs);
      promoScansDaily = buildDailyCounts(dashboardDayKeys, promoTs);
      collabLeadsDaily = buildDailyCounts(dashboardDayKeys, leadTs);
      collabFeedbackDaily = buildDailyCounts(dashboardDayKeys, feedbackTs);
    } catch (e) {
      console.warn('[SynqAI] analytics dashboard timeseries:', e);
    }

    const last14 = (arr: number[]) => arr.slice(-14);
    const clubsTrend = trendVsPriorWeek(last14(clubsActiveDaily));
    const profilesTrend = trendVsPriorWeek(last14(profilesDaily));
    const promoTrend = trendVsPriorWeek(last14(promoScansDaily));

    const leads14 = last14(collabLeadsDaily);
    const prof14 = last14(profilesDaily);
    const convPrev =
      prof14.slice(0, 7).reduce((a, b) => a + b, 0) > 0
        ? (leads14.slice(0, 7).reduce((a, b) => a + b, 0) /
            prof14.slice(0, 7).reduce((a, b) => a + b, 0)) *
          100
        : 0;
    const convCur =
      prof14.slice(7, 14).reduce((a, b) => a + b, 0) > 0
        ? (leads14.slice(7, 14).reduce((a, b) => a + b, 0) /
            prof14.slice(7, 14).reduce((a, b) => a + b, 0)) *
          100
        : 0;
    let conversionTrendLabel = 'Estable vs semana anterior';
    let conversionTrend: TrendKind = 'flat';
    const deltaConv = Math.round((convCur - convPrev) * 10) / 10;
    if (Math.abs(deltaConv) < 0.05 && convPrev === 0 && convCur === 0) {
      conversionTrendLabel = 'Sin leads en ventana';
      conversionTrend = 'flat';
    } else if (Math.abs(deltaConv) < 0.05) {
      conversionTrendLabel = 'Estable vs semana anterior';
      conversionTrend = 'flat';
    } else {
      conversionTrendLabel = `${deltaConv > 0 ? '+' : ''}${deltaConv} pp vs semana anterior`;
      conversionTrend = deltaConv > 0 ? 'up' : 'flat';
    }

    const signalBarsMax = Math.max(1, ...profilesDaily.map((n, i) => n + promoScansDaily[i]));

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

    let sandboxWorldByCountry: SandboxWorldAgg[] = [];
    let sandboxWorldHeat: GeoHeatPoint[] = [];
    let sandboxWorldTotalDevices = 0;
    let sandboxWorldTotalPings = 0;
    try {
      const sw = await aggregateSandboxWorldFromSnapshots(admin);
      sandboxWorldByCountry = sw.rows;
      sandboxWorldHeat = sw.heat;
      sandboxWorldTotalDevices = sw.totalDevices;
      sandboxWorldTotalPings = sw.totalPings;
    } catch (e) {
      console.warn('[SynqAI] analytics sandbox world:', e);
    }

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
      sandboxWorldByCountry,
      sandboxWorldHeat,
      sandboxWorldTotalDevices,
      sandboxWorldTotalPings,
      topPromos,
      conversionRate,
      sandboxCoachOpens,
      sandboxCoachAdImpressions,
      sandboxCoachAdClicks,
      sandboxCoachEstimatedRevenue,
      dashboardDays: dashboardDayKeys,
      profilesDaily,
      clubsActiveDaily,
      promoScansDaily,
      collabLeadsDaily,
      collabFeedbackDaily,
      signalBarsMax,
      dashboardTrends: {
        clubsActive: clubsTrend,
        profiles: profilesTrend,
        promoScans: promoTrend,
        conversion: { label: conversionTrendLabel, trend: conversionTrend },
      },
    });
  } catch (e) {
    console.error('[SynqAI] admin analytics:', e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Error agregando métricas' },
      { status: 500 },
    );
  }
}
