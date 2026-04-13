"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Globe,
  Activity,
  Target,
  Flame,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Link2,
  QrCode,
  MessageSquareQuote,
  ArrowRight,
  MapPin,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { synqSync } from "@/lib/sync-service";
import { cn } from "@/lib/utils";

const SYNQ_PENDING_STORAGE_KEY = "synq_event_queue_pending";
/** Mínimo entre refrescos al volver a la pestaña (evita martillar la API). */
const VISIBILITY_REFRESH_MS = 30_000;

type GeoRow = { country: string; count: number; percent: number };
type GeoHeatPoint = { lat: number; lon: number; intensity: number; label: string };
type TopPromo = {
  id: string;
  title: string;
  token: string;
  scan_count: number;
  max_uses: number | null;
  is_active: boolean;
};

type SandboxWorldRow = { country: string; devices: number; pings: number };

type AnalyticsPayload = {
  ok: boolean;
  offline?: boolean;
  error?: string;
  profilesTotal?: number;
  clubsTotal?: number;
  clubsActive?: number;
  exercisesTotal?: number;
  promoCampaigns?: number;
  promoScans?: number;
  promoNearLimit?: number;
  collabLeads?: number;
  collabFeedback?: number;
  geo?: GeoRow[];
  geoHeat?: GeoHeatPoint[];
  sandboxWorldByCountry?: SandboxWorldRow[];
  sandboxWorldHeat?: GeoHeatPoint[];
  sandboxWorldTotalDevices?: number;
  sandboxWorldTotalPings?: number;
  topPromos?: TopPromo[];
  conversionRate?: number;
  sandboxCoachOpens?: number;
  sandboxCoachAdImpressions?: number;
  sandboxCoachAdClicks?: number;
  sandboxCoachEstimatedRevenue?: number;
};

const ANALYTICS_PANEL =
  "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.5)] drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]";

function AnalyticsSurfaceHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/90">{title}</p>
        {subtitle ? (
          <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function DigitalGrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function flagForCountry(name: string): string {
  const u = name.toUpperCase();
  if (u === "ES" || u.includes("ESPAÑA") || u.includes("SPAIN")) return "🇪🇸";
  if (u === "AR" || u.includes("ARGENTINA")) return "🇦🇷";
  if (u === "BR" || u.includes("BRASIL")) return "🇧🇷";
  if (u === "MX" || u.includes("MÉXICO") || u.includes("MEXICO")) return "🇲🇽";
  if (u === "CO" || u.includes("COLOMBIA")) return "🇨🇴";
  if (u === "CL" || u.includes("CHILE")) return "🇨🇱";
  if (u === "US" || u.includes("USA") || u.includes("UNITED STATES")) return "🇺🇸";
  if (u.includes("SIN PAÍS")) return "🌐";
  return "🌐";
}

function toMapPoint(lat: number, lon: number, intensity: number, label: string) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y, intensity, label };
}

function AnalyticsFunnelAreaChart({
  opens,
  impressions,
  clicks,
}: {
  opens: number;
  impressions: number;
  clicks: number;
}) {
  const data = useMemo(() => {
    const o = Math.max(0, opens);
    const i = Math.max(0, impressions);
    const c = Math.max(0, clicks);
    const base = Math.max(1, o + i + c);
    return Array.from({ length: 16 }).map((_, idx) => {
      const t = idx;
      const waveO = Math.sin(t / 2.2) * 12 + (o / base) * 55;
      const waveI = Math.cos(t / 1.8) * 10 + (i / base) * 45;
      const waveC = Math.sin(t / 2.8 + 0.5) * 8 + (c / base) * 40;
      return {
        t: String(t).padStart(2, "0"),
        a: Math.max(6, 38 + waveO + idx * 1.1),
        b: Math.max(6, 32 + waveI - idx * 0.4),
        c: Math.max(6, 28 + waveC + (idx % 3) * 2),
      };
    });
  }, [opens, impressions, clicks]);

  return (
    <div className={cn("relative min-h-[260px]", ANALYTICS_PANEL)}>
      <DigitalGrainOverlay />
      <AnalyticsSurfaceHeader title="SANDBOX_FUNNEL_SIGNAL" subtitle="Aperturas · impresiones · clics (estilo Command Hub)" />
      <div className="relative h-[260px] p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="admA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="admB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="admC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "rgba(148,163,184,0.7)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 8", "dataMax + 12"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0,
                fontSize: 11,
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area type="monotone" dataKey="a" stroke="#22d3ee" strokeWidth={1.6} fill="url(#admA)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="b" stroke="#34d399" strokeWidth={1.4} fill="url(#admB)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="c" stroke="#10b981" strokeWidth={1.2} fill="url(#admC)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AnalyticsPromoScansBarChart({ promos }: { promos: TopPromo[] }) {
  const data = useMemo(
    () =>
      promos.slice(0, 8).map((p, i) => ({
        name: `P${i + 1}`,
        scans: p.scan_count,
        full: p.title.slice(0, 18),
      })),
    [promos],
  );

  if (data.length === 0) {
    return (
      <div className={cn("relative flex min-h-[200px] items-center justify-center", ANALYTICS_PANEL)}>
        <DigitalGrainOverlay />
        <AnalyticsSurfaceHeader title="CAMPAIGN_SCANS" subtitle="Sin datos de promo_campaigns" />
        <p className="p-8 text-center text-[10px] font-bold uppercase text-slate-500">Sin campañas activas</p>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[260px]", ANALYTICS_PANEL)}>
      <DigitalGrainOverlay />
      <AnalyticsSurfaceHeader title="CAMPAIGN_SCANS" subtitle="Escaneos por campaña (top 8)" />
      <div className="relative h-[260px] p-3 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }} barCategoryGap="24%">
            <defs>
              <linearGradient id="barEmerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0,
                fontSize: 11,
              }}
              formatter={(v: number) => [v, "scans"]}
              labelFormatter={(_, payload) => (payload?.[0]?.payload?.full as string) ?? ""}
            />
            <Bar dataKey="scans" fill="url(#barEmerald)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Analytics Command — datos vía `/api/admin/analytics`.
 * Refresco al volver a la pestaña (`visibilitychange`, con throttle).
 */
export default function GlobalAnalyticsPage() {
  const { session } = useAuth();
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEvents, setPendingEvents] = useState(0);
  const [syncingAds, setSyncingAds] = useState(false);
  const [adsLastSyncAt, setAdsLastSyncAt] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const lastVisibilityRefresh = useRef(0);

  const load = useCallback(async () => {
    if (!session?.access_token) {
      setData({ ok: false, error: "Inicia sesión como superadmin." });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as AnalyticsPayload;
      if (res.status === 501 && j.offline) {
        setData(j);
        setError(j.error ?? "Configura SUPABASE_SERVICE_ROLE_KEY en el servidor.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(j.error || `HTTP ${res.status}`);
        setData(j);
        setLoading(false);
        return;
      }
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setData({ ok: false });
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SYNQ_PENDING_STORAGE_KEY || e.key === null) {
        setPendingEvents(synqSync.getPendingCount());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastVisibilityRefresh.current < VISIBILITY_REFRESH_MS) return;
      lastVisibilityRefresh.current = now;
      void load();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [load]);

  useEffect(() => {
    setPendingEvents(synqSync.getPendingCount());
    setIsOnline(navigator.onLine);

    const onQueueEvent = () => setPendingEvents(synqSync.getPendingCount());
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("synq:queue-pending-updated", onQueueEvent as EventListener);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("synq:queue-pending-updated", onQueueEvent as EventListener);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const flushAdsQueue = useCallback(async () => {
    setSyncingAds(true);
    try {
      await synqSync.syncNow();
      setPendingEvents(synqSync.getPendingCount());
      setAdsLastSyncAt(new Date().toLocaleTimeString());
    } catch {
      // Blindaje extra si el runtime devuelve un rechazo inesperado.
    } finally {
      setSyncingAds(false);
    }
  }, []);

  const d = data;
  const profiles = d?.profilesTotal ?? 0;
  const clubs = d?.clubsTotal ?? 0;
  const promoScans = d?.promoScans ?? 0;
  const promoNear = d?.promoNearLimit ?? 0;
  const geo = d?.geo ?? [];
  const geoHeat = d?.geoHeat ?? [];
  const sandboxWorldByCountry = d?.sandboxWorldByCountry ?? [];
  const sandboxWorldHeat = d?.sandboxWorldHeat ?? [];
  const sandboxWorldTotalDevices = d?.sandboxWorldTotalDevices ?? 0;
  const sandboxWorldTotalPings = d?.sandboxWorldTotalPings ?? 0;
  const topPromos = d?.topPromos ?? [];
  const conv = d?.conversionRate ?? 0;
  const activationRate = clubs > 0 ? Math.round(((d?.clubsActive ?? 0) / clubs) * 100) : 0;
  const scansPerCampaign = (d?.promoCampaigns ?? 0) > 0 ? Math.round(promoScans / (d?.promoCampaigns ?? 1)) : 0;
  const leadsPer1000Profiles = profiles > 0 ? Math.round(((d?.collabLeads ?? 0) / profiles) * 1000) : 0;
  const feedbackPer1000Profiles = profiles > 0 ? Math.round(((d?.collabFeedback ?? 0) / profiles) * 1000) : 0;
  const sandboxCoachOpens = d?.sandboxCoachOpens ?? 0;
  const sandboxCoachAdImpressions = d?.sandboxCoachAdImpressions ?? 0;
  const sandboxCoachAdClicks = d?.sandboxCoachAdClicks ?? 0;
  const sandboxCoachEstimatedRevenue = d?.sandboxCoachEstimatedRevenue ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">
              Neural_Network_Analytics
            </span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            ANALYTICS_COMMAND
          </h1>
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
            Auto-refresco: otra pestaña (storage) · volver aquí (cada {VISIBILITY_REFRESH_MS / 1000}s máx.)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-2xl border-emerald-500/30 text-emerald-400 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="glass-panel border-amber-500/30 bg-amber-500/5 rounded-2xl">
          <CardContent className="py-4 text-[10px] font-bold text-amber-100/90 uppercase tracking-wide">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsMiniCard
          label="Perfiles (red)"
          value={loading ? "—" : formatNum(profiles)}
          trend={clubs ? `${clubs} clubes` : "—"}
          icon={Users}
        />
        <AnalyticsMiniCard
          label="Escaneos QR (total)"
          value={loading ? "—" : formatNum(promoScans)}
          trend={`${d?.promoCampaigns ?? 0} campañas`}
          icon={Activity}
        />
        <AnalyticsMiniCard
          label="Conversión lead / perfil"
          value={loading ? "—" : `${conv}%`}
          trend={`${d?.collabLeads ?? 0} leads`}
          icon={Zap}
        />
        <AnalyticsMiniCard
          label="Clubes activos"
          value={loading ? "—" : String(d?.clubsActive ?? 0)}
          trend={`${d?.exercisesTotal ?? 0} ejercicios`}
          icon={ShieldCheck}
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Target className="h-5 w-5 text-emerald-400" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">KPI_NEGOCIO_OPERATIVA</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard
            title="Activación de clubes"
            value={loading ? "—" : `${activationRate}%`}
            note="Clubes activos / total clubes"
            tone={activationRate >= 70 ? "good" : activationRate >= 40 ? "warn" : "bad"}
          />
          <KpiCard
            title="Conversión sandbox->lead"
            value={loading ? "—" : `${conv}%`}
            note="Leads sobre perfiles totales"
            tone={conv >= 3 ? "good" : conv >= 1 ? "warn" : "bad"}
          />
          <KpiCard
            title="Leads por 1.000 perfiles"
            value={loading ? "—" : String(leadsPer1000Profiles)}
            note="Intensidad comercial del funnel"
            tone={leadsPer1000Profiles >= 20 ? "good" : leadsPer1000Profiles >= 8 ? "warn" : "bad"}
          />
          <KpiCard
            title="Feedback por 1.000 perfiles"
            value={loading ? "—" : String(feedbackPer1000Profiles)}
            note="Señal de co-creación de producto"
            tone={feedbackPer1000Profiles >= 15 ? "good" : feedbackPer1000Profiles >= 5 ? "warn" : "bad"}
          />
          <KpiCard
            title="Escaneos por campaña"
            value={loading ? "—" : String(scansPerCampaign)}
            note="Tracción media por activación promo"
            tone={scansPerCampaign >= 50 ? "good" : scansPerCampaign >= 15 ? "warn" : "bad"}
          />
          <KpiCard
            title="Biblioteca (proxy uso)"
            value={loading ? "—" : String(d?.exercisesTotal ?? 0)}
            note="Volumen de ejercicios creados"
            tone={(d?.exercisesTotal ?? 0) >= 500 ? "good" : (d?.exercisesTotal ?? 0) >= 100 ? "warn" : "bad"}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">SANDBOX_COACH_FUNNEL</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsMiniCard
            label="Aperturas app"
            value={loading ? "—" : formatNum(sandboxCoachOpens)}
            trend="session_save/app_open"
            icon={Users}
          />
          <AnalyticsMiniCard
            label="Impresiones Ads"
            value={loading ? "—" : formatNum(sandboxCoachAdImpressions)}
            trend="ad_impression"
            icon={Activity}
          />
          <AnalyticsMiniCard
            label="Clics Ads"
            value={loading ? "—" : formatNum(sandboxCoachAdClicks)}
            trend="ad_click"
            icon={Target}
          />
          <AnalyticsMiniCard
            label="Revenue estimado (€)"
            value={loading ? "—" : String(sandboxCoachEstimatedRevenue.toFixed(2))}
            trend="CPM/CPC configurable"
            icon={TrendingUp}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsFunnelAreaChart
          opens={sandboxCoachOpens}
          impressions={sandboxCoachAdImpressions}
          clicks={sandboxCoachAdClicks}
        />
        <AnalyticsPromoScansBarChart promos={topPromos} />
      </div>

      <Card className="glass-panel overflow-hidden rounded-3xl border border-cyan-500/25 bg-slate-950/80">
        <CardHeader className="border-b border-white/5 p-6">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-cyan-300">
            <MapPin className="h-4 w-4" /> Plano mundial Sandbox (telemetría)
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Dispositivos únicos por país desde <code className="text-emerald-400/80">sandbox_device_snapshots</code> (beacon en /sandbox/app, país desde Mi equipo). Sin datos personales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-[8px] font-black uppercase text-slate-500">Países</p>
              <p className="text-2xl font-black italic text-white">{loading ? "—" : sandboxWorldByCountry.length}</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-center">
              <p className="text-[8px] font-black uppercase text-cyan-400/80">Dispositivos</p>
              <p className="text-2xl font-black italic text-cyan-200">{loading ? "—" : formatNum(sandboxWorldTotalDevices)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <p className="text-[8px] font-black uppercase text-emerald-400/80">Pulsos</p>
              <p className="text-2xl font-black italic text-emerald-200">{loading ? "—" : formatNum(sandboxWorldTotalPings)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-[8px] font-black uppercase text-slate-500">Mapa</p>
              <p className="text-[10px] font-black uppercase leading-tight text-slate-300">Heat por región</p>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500/50" />
            </div>
          ) : sandboxWorldHeat.length === 0 ? (
            <p className="py-8 text-center text-[10px] font-bold uppercase text-slate-500">
              Aún no hay telemetría con país. Los usuarios deben guardar país en Sandbox → Mi equipo y abrir la app (pulso cada ~6h).
            </p>
          ) : (
            <GlobalHeatMap points={sandboxWorldHeat} accent="cyan" />
          )}
          {sandboxWorldByCountry.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-[10px]">
                <thead className="sticky top-0 bg-black/80 text-[9px] font-black uppercase text-cyan-400/90">
                  <tr className="border-b border-white/10">
                    <th className="p-3">País</th>
                    <th className="p-3 text-right">Dispositivos</th>
                    <th className="p-3 text-right">Pulsos</th>
                  </tr>
                </thead>
                <tbody>
                  {sandboxWorldByCountry.slice(0, 16).map((r) => (
                    <tr key={r.country} className="border-b border-white/5 text-white/80">
                      <td className="p-3 font-mono uppercase">{r.country}</td>
                      <td className="p-3 text-right font-bold text-cyan-300">{r.devices}</td>
                      <td className="p-3 text-right text-slate-400">{r.pings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border border-emerald-500/20 bg-black/40 rounded-[2rem]">
        <CardHeader className="pb-3">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Cola AdMob Offline (Elite + Sandbox)
          </CardTitle>
          <CardDescription className="text-[9px] uppercase text-white/35">
            Reintento automático al recuperar red + opción manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-[8px] font-black text-white/35 uppercase mb-1">Pendientes</p>
              <p className="text-2xl font-black text-white italic">{pendingEvents}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-[8px] font-black text-white/35 uppercase mb-1">Estado red</p>
              <p className={`text-xs font-black uppercase ${isOnline ? "text-emerald-400" : "text-rose-400"}`}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <p className="text-[8px] font-black text-white/35 uppercase mb-1">Último sync</p>
              <p className="text-xs font-black uppercase text-white/80">{adsLastSyncAt ?? "—"}</p>
            </div>
            <Button
              onClick={() => void flushAdsQueue()}
              disabled={!isOnline || syncingAds}
              className="h-12 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400"
            >
              {syncingAds ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Reintentar cola
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 px-2">
          <Target className="h-5 w-5 text-emerald-400" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">
            CONVERSIÓN_Y_CUPO_QR
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass-panel border-emerald-500/20 bg-black/40 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Flame className="h-24 w-24 text-emerald-500" />
            </div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
                  Campañas cerca del límite
                </p>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  CUPO ≥ 80% USOS
                </h4>
              </div>
              <div className="text-5xl font-black text-white italic tracking-tighter">
                {loading ? "—" : promoNear}
              </div>
              <p className="text-[9px] text-white/30 uppercase font-bold leading-relaxed">
                Con <code className="text-emerald-500/80">max_uses</code> y escaneos ≥ 80% del tope.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-black text-emerald-400/60 uppercase">
                  <span>Feedback colaboración</span>
                  <span>{loading ? "—" : d?.collabFeedback ?? 0}</span>
                </div>
                <Progress
                  value={
                    profiles > 0 && (d?.collabFeedback ?? 0) > 0
                      ? Math.min(100, ((d?.collabFeedback ?? 0) / profiles) * 1000)
                      : 0
                  }
                  className="h-1 bg-emerald-500/20"
                />
              </div>
              <Link
                href="/admin-global/collaboration"
                className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:underline inline-flex items-center gap-1"
              >
                Ir a Leads & feedback <Link2 className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="glass-panel border-emerald-500/20 bg-black/40 p-8 rounded-[2.5rem] lg:col-span-2">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
                  Geo_Distribution
                </p>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">
                  PERFILES POR PAÍS
                </h4>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase">
                AGREGADO
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase py-12 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Cargando…
              </div>
            ) : geo.length === 0 ? (
              <p className="text-[10px] text-white/35 uppercase font-bold py-12 text-center">
                Sin datos de país en perfiles o red vacía.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  {geo.map((g) => (
                    <CountryLeadRow
                      key={g.country}
                      flag={flagForCountry(g.country)}
                      name={g.country}
                      count={g.count}
                      percent={g.percent}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center justify-center p-6 border border-white/5 bg-white/[0.02] rounded-3xl text-center space-y-4">
                  <Globe className="h-12 w-12 text-emerald-500/30" />
                  <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">
                    Fuente <code className="text-emerald-500/70">profiles.country</code>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <Card className="glass-panel border border-emerald-500/20 bg-black/40 rounded-[2rem] overflow-hidden">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Globe className="h-4 w-4" /> Mapa ecosistema (perfiles + clubes)
          </CardTitle>
          <CardDescription className="text-[9px] uppercase text-slate-400">
            Agregado por país desde perfiles y clubes en Supabase (complementario al plano Sandbox).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500/40" />
            </div>
          ) : geoHeat.length === 0 ? (
            <p className="text-[10px] text-white/35 uppercase font-bold text-center py-10">
              Sin coordenadas globales disponibles todavía.
            </p>
          ) : (
            <GlobalHeatMap points={geoHeat} accent="emerald" />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel min-h-[320px] flex flex-col border border-emerald-500/20 overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Top campañas por escaneos
            </CardTitle>
            <CardDescription className="text-[9px] uppercase text-white/35">
              Por <code className="text-emerald-500/60">scan_count</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500/40" />
              </div>
            ) : topPromos.length === 0 ? (
              <p className="text-[10px] text-white/35 uppercase font-bold text-center py-12">
                Sin campañas o tabla no disponible.
              </p>
            ) : (
              topPromos.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-[10px] font-black text-white uppercase truncate">{p.title}</p>
                    <p className="text-[9px] font-mono text-emerald-400/60 truncate">{p.token}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-white italic">{p.scan_count}</p>
                    <p className="text-[8px] text-white/30 uppercase">
                      {p.max_uses != null ? `max ${p.max_uses}` : "sin tope"}
                    </p>
                    {!p.is_active && (
                      <Badge variant="outline" className="text-[7px] mt-1 border-rose-500/40 text-rose-300">
                        inactiva
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
            <Link
              href="/admin-global/promos"
              className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:underline inline-flex items-center gap-1 pt-2"
            >
              Gestionar promos <TrendingUp className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-panel min-h-[320px] flex flex-col border border-emerald-500/20 overflow-hidden">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4" /> Colaboración
            </CardTitle>
            <CardDescription className="text-[9px] uppercase text-white/35">
              <code className="text-emerald-500/60">sandbox_collaboration_submissions</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-[8px] font-black text-emerald-400/70 uppercase mb-1">Leads</p>
                <p className="text-3xl font-black text-white italic">{loading ? "—" : d?.collabLeads ?? 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-[8px] font-black text-primary/70 uppercase mb-1">Feedback</p>
                <p className="text-3xl font-black text-white italic">{loading ? "—" : d?.collabFeedback ?? 0}</p>
              </div>
            </div>
            <p className="text-[9px] text-white/35 leading-relaxed uppercase font-bold">
              Sesiones/día y retención requieren tracking de producto (pendiente).
            </p>
            <Link
              href="/admin-global/collaboration"
              className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:underline inline-flex items-center gap-1"
            >
              Centro de colaboración <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CountryLeadRow({
  flag,
  name,
  count,
  percent,
}: {
  flag: string;
  name: string;
  count: number;
  percent: number;
}) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg shrink-0">{flag}</span>
          <span className="text-[10px] font-black text-white uppercase italic tracking-widest truncate group-hover:text-emerald-400 transition-colors">
            {name}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400/60 shrink-0">{count}</span>
      </div>
      <Progress value={percent} className="h-1 bg-white/5" />
    </div>
  );
}

function AnalyticsMiniCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="glass-panel p-6 relative group border border-emerald-500/20">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-[background-color,border-color,color,opacity,transform]">
        <Icon className="h-8 w-8 text-emerald-500" />
      </div>
      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-3 flex-wrap">
        <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
        <span className="text-[10px] font-black text-emerald-400/80 mb-1">{trend}</span>
      </div>
    </Card>
  );
}

function KpiCard({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: "good" | "warn" | "bad";
}) {
  const toneClasses =
    tone === "good"
      ? "text-emerald-400 border-emerald-500/30"
      : tone === "warn"
        ? "text-amber-400 border-amber-500/30"
        : "text-rose-400 border-rose-500/30";
  return (
    <Card className="glass-panel p-6 border border-white/10 bg-black/30 rounded-3xl">
      <div className="space-y-2">
        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">{title}</p>
        <p className={`text-3xl font-black italic tracking-tighter ${toneClasses.split(" ")[0]}`}>{value}</p>
        <Badge variant="outline" className={`text-[8px] uppercase font-black ${toneClasses}`}>
          {tone === "good" ? "Saludable" : tone === "warn" ? "Vigilar" : "Crítico"}
        </Badge>
        <p className="text-[9px] text-white/35 uppercase font-bold pt-1">{note}</p>
      </div>
    </Card>
  );
}

function GlobalHeatMap({ points, accent }: { points: GeoHeatPoint[]; accent: "emerald" | "cyan" }) {
  const max = Math.max(1, ...points.map((p) => p.intensity));
  const isCyan = accent === "cyan";
  return (
    <div className="relative h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220]">
      <div
        className={cn(
          "absolute inset-0 opacity-25",
          isCyan
            ? "bg-[radial-gradient(circle_at_25%_35%,#22d3ee_0%,transparent_45%),radial-gradient(circle_at_75%_55%,#06b6d4_0%,transparent_50%)]"
            : "bg-[radial-gradient(circle_at_30%_40%,#22d3ee_0%,transparent_50%),radial-gradient(circle_at_70%_60%,#10b981_0%,transparent_50%)]",
        )}
      />
      {points.map((p, idx) => {
        const pp = toMapPoint(p.lat, p.lon, p.intensity, p.label);
        const size = 8 + Math.round((p.intensity / max) * 26);
        return (
          <div
            key={`${p.label}-${idx}`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border",
              isCyan
                ? "border-cyan-300/60 bg-cyan-400/35"
                : "border-emerald-300/50 bg-emerald-400/30",
            )}
            style={{
              left: `${pp.x}%`,
              top: `${pp.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: isCyan ? "0 0 24px rgba(34,211,238,0.5)" : "0 0 24px rgba(16,185,129,0.45)",
            }}
            title={`${p.label} · ${p.intensity}`}
          />
        );
      })}
      <div className="absolute bottom-3 right-3 rounded-xl border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-black uppercase text-slate-400">
        Intensidad relativa por región
      </div>
    </div>
  );
}
