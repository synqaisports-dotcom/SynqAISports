"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { synqSync } from "@/lib/sync-service";

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
  topPromos?: TopPromo[];
  conversionRate?: number;
  sandboxCoachOpens?: number;
  sandboxCoachAdImpressions?: number;
  sandboxCoachAdClicks?: number;
  sandboxCoachEstimatedRevenue?: number;
};

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
  const globalPulse = (topPromos.slice(0, 8).length > 0
    ? topPromos.slice(0, 8).map((p, idx) => ({
        label: `P${idx + 1}`,
        sessions: p.scan_count,
        attendance: p.max_uses && p.max_uses > 0 ? Math.round((p.scan_count / p.max_uses) * 100) : Math.min(100, p.scan_count),
      }))
    : [
        { label: "JAN", sessions: 34, attendance: 42 },
        { label: "FEB", sessions: 49, attendance: 57 },
        { label: "MAR", sessions: 51, attendance: 61 },
        { label: "APR", sessions: 38, attendance: 48 },
        { label: "MAY", sessions: 65, attendance: 73 },
        { label: "JUN", sessions: 77, attendance: 82 },
      ]) as Array<{ label: string; sessions: number; attendance: number }>;

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

      <Card className="glass-panel rounded-3xl border border-emerald-500/20 bg-slate-950/80 overflow-hidden">
        <CardHeader className="p-6 border-b border-white/5">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" /> Tendencia Global (Picos)
          </CardTitle>
          <CardDescription className="text-[10px] text-emerald-400/40 uppercase font-bold tracking-widest">
            Tracción de campañas y ocupación de cupos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <GlobalPeaks data={globalPulse} />
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
            <Globe className="h-4 w-4" /> Mapa de calor global (Sandbox + Clubs)
          </CardTitle>
          <CardDescription className="text-[9px] uppercase text-white/35">
            Puntos agregados por país y ecosistema para visión de expansión.
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
            <GlobalHeatMap points={geoHeat} />
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

function GlobalPeaks({
  data,
}: {
  data: Array<{ label: string; sessions: number; attendance: number }>;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({ x: 10, y: 10 });
  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;

  const w = 100;
  const h = 30;
  const maxSessions = Math.max(1, ...data.map((d) => d.sessions));
  const sx = (idx: number) => (data.length === 1 ? 0 : (idx / (data.length - 1)) * w);
  const syA = (v: number) => h - (Math.max(0, Math.min(100, v)) / 100) * h;
  const syS = (v: number) => h - (v / maxSessions) * h;
  const path = (key: "sessions" | "attendance", yFn: (v: number) => number) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(2)} ${yFn(d[key]).toFixed(2)}`).join(" ");
  const pSessions = path("sessions", syS);
  const pAttend = path("attendance", syA);
  const pAttendArea = `${pAttend} L ${sx(data.length - 1).toFixed(2)} ${h} L 0 ${h} Z`;
  const thresholdY = syA(80);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-black/35 p-3 relative overflow-hidden">
        {hovered && (
          <div
            className="absolute z-20 rounded-lg border border-white/15 bg-black/80 px-2 py-1 pointer-events-none"
            style={{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px`, transform: "translate(10px,-10px)" }}
          >
            <p className="text-[9px] font-black uppercase text-emerald-300">{hovered.label}</p>
            <p className="text-[9px] font-bold uppercase text-white/80">
              Scans: {hovered.sessions} · Cupo: {hovered.attendance}%
            </p>
          </div>
        )}
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-36"
          onMouseLeave={() => setHoveredIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverPos({
              x: Math.max(8, Math.min(rect.width - 120, e.clientX - rect.left)),
              y: Math.max(8, Math.min(rect.height - 40, e.clientY - rect.top)),
            });
          }}
        >
          <line x1="0" y1={thresholdY} x2={w} y2={thresholdY} stroke="rgb(251 146 60)" strokeWidth="0.45" strokeDasharray="1.6 1.6" />
          <path d={pAttendArea} fill="rgb(16 185 129 / 0.10)" />
          <path d={pSessions} fill="none" stroke="rgb(34 211 238)" strokeWidth="0.7" />
          <path d={pAttend} fill="none" stroke="rgb(16 185 129)" strokeWidth="0.7" />
          {data.map((d, i) => (
            <g key={`${d.label}-${i}`} onMouseEnter={() => setHoveredIdx(i)}>
              <circle cx={sx(i)} cy={syS(d.sessions)} r="0.8" fill="rgb(34 211 238)" />
              <circle cx={sx(i)} cy={syA(d.attendance)} r="0.9" fill={d.attendance < 80 ? "rgb(251 146 60)" : "rgb(16 185 129)"} />
            </g>
          ))}
        </svg>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {data.map((d) => (
          <div key={d.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
            <p className="text-[8px] font-black uppercase text-emerald-300/80">{d.label}</p>
            <p className="text-[9px] font-bold uppercase text-white/75">{d.sessions}</p>
          </div>
        ))}
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

function GlobalHeatMap({ points }: { points: GeoHeatPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.intensity));
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] h-[320px]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_40%,#22d3ee_0%,transparent_50%),radial-gradient(circle_at_70%_60%,#10b981_0%,transparent_50%)]" />
      {points.map((p, idx) => {
        const pp = toMapPoint(p.lat, p.lon, p.intensity, p.label);
        const size = 8 + Math.round((p.intensity / max) * 26);
        return (
          <div
            key={`${p.label}-${idx}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/30 border border-emerald-300/50"
            style={{
              left: `${pp.x}%`,
              top: `${pp.y}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: "0 0 24px rgba(16,185,129,0.45)",
            }}
            title={`${p.label} · ${p.intensity}`}
          />
        );
      })}
      <div className="absolute bottom-3 right-3 text-[9px] font-black uppercase text-white/45 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
        Intensidad relativa por región
      </div>
    </div>
  );
}
