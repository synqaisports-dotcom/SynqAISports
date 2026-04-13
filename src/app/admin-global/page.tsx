"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type Trend = "up" | "flat";

type DashboardTrend = { label: string; trend: Trend };

type DashboardMetrics = {
  clubsActive: number;
  profilesTotal: number;
  promoScans: number;
  conversionRate: number;
  collabLeads: number;
  collabFeedback: number;
};

type AnalyticsJson = {
  ok?: boolean;
  error?: string;
  clubsActive?: number;
  profilesTotal?: number;
  promoScans?: number;
  conversionRate?: number;
  collabLeads?: number;
  collabFeedback?: number;
  dashboardDays?: string[];
  profilesDaily?: number[];
  clubsActiveDaily?: number[];
  promoScansDaily?: number[];
  collabLeadsDaily?: number[];
  collabFeedbackDaily?: number[];
  signalBarsMax?: number;
  dashboardTrends?: {
    clubsActive?: DashboardTrend;
    profiles?: DashboardTrend;
    promoScans?: DashboardTrend;
    conversion?: DashboardTrend;
  };
};

export default function AdminGlobalDashboard() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    clubsActive: 0,
    profilesTotal: 0,
    promoScans: 0,
    conversionRate: 0,
    collabLeads: 0,
    collabFeedback: 0,
  });
  const [days, setDays] = useState<string[]>([]);
  const [profilesDaily, setProfilesDaily] = useState<number[]>([]);
  const [clubsActiveDaily, setClubsActiveDaily] = useState<number[]>([]);
  const [promoScansDaily, setPromoScansDaily] = useState<number[]>([]);
  const [collabLeadsDaily, setCollabLeadsDaily] = useState<number[]>([]);
  const [collabFeedbackDaily, setCollabFeedbackDaily] = useState<number[]>([]);
  const [signalBarsMax, setSignalBarsMax] = useState(1);
  const [trends, setTrends] = useState<{
    clubsActive: DashboardTrend;
    profiles: DashboardTrend;
    promoScans: DashboardTrend;
    conversion: DashboardTrend;
  }>({
    clubsActive: { label: "—", trend: "flat" },
    profiles: { label: "—", trend: "flat" },
    promoScans: { label: "—", trend: "flat" },
    conversion: { label: "—", trend: "flat" },
  });

  const loadDashboard = useCallback(async () => {
    const cacheRaw = localStorage.getItem("synq_admin_global_metrics_cache");
    const cache = cacheRaw ? (JSON.parse(cacheRaw) as AnalyticsJson) : null;
    if (cache && cache.ok !== false) {
      setMetrics({
        clubsActive: cache.clubsActive ?? 0,
        profilesTotal: cache.profilesTotal ?? 0,
        promoScans: cache.promoScans ?? 0,
        conversionRate: cache.conversionRate ?? 0,
        collabLeads: cache.collabLeads ?? 0,
        collabFeedback: cache.collabFeedback ?? 0,
      });
      if (Array.isArray(cache.dashboardDays) && cache.dashboardDays.length > 0) {
        setDays(cache.dashboardDays);
        setProfilesDaily(cache.profilesDaily ?? []);
        setClubsActiveDaily(cache.clubsActiveDaily ?? []);
        setPromoScansDaily(cache.promoScansDaily ?? []);
        setCollabLeadsDaily(cache.collabLeadsDaily ?? []);
        setCollabFeedbackDaily(cache.collabFeedbackDaily ?? []);
        setSignalBarsMax(typeof cache.signalBarsMax === "number" ? cache.signalBarsMax : 1);
      }
      if (cache.dashboardTrends) {
        setTrends({
          clubsActive: cache.dashboardTrends.clubsActive ?? { label: "—", trend: "flat" },
          profiles: cache.dashboardTrends.profiles ?? { label: "—", trend: "flat" },
          promoScans: cache.dashboardTrends.promoScans ?? { label: "—", trend: "flat" },
          conversion: cache.dashboardTrends.conversion ?? { label: "—", trend: "flat" },
        });
      }
      setLoading(false);
    }

    if (!session?.access_token) {
      setError("Inicia sesión como superadmin para cargar métricas reales.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = (await res.json()) as AnalyticsJson;

      if (!res.ok || !json.ok) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        const next: DashboardMetrics = {
          clubsActive: json.clubsActive ?? 0,
          profilesTotal: json.profilesTotal ?? 0,
          promoScans: json.promoScans ?? 0,
          conversionRate: json.conversionRate ?? 0,
          collabLeads: json.collabLeads ?? 0,
          collabFeedback: json.collabFeedback ?? 0,
        };
        setMetrics(next);
        const payload: AnalyticsJson = { ...json, ok: true };
        localStorage.setItem("synq_admin_global_metrics_cache", JSON.stringify(payload));

        if (Array.isArray(json.dashboardDays) && json.dashboardDays.length > 0) {
          setDays(json.dashboardDays);
          setProfilesDaily(json.profilesDaily ?? []);
          setClubsActiveDaily(json.clubsActiveDaily ?? []);
          setPromoScansDaily(json.promoScansDaily ?? []);
          setCollabLeadsDaily(json.collabLeadsDaily ?? []);
          setCollabFeedbackDaily(json.collabFeedbackDaily ?? []);
          setSignalBarsMax(typeof json.signalBarsMax === "number" ? json.signalBarsMax : 1);
        }
        if (json.dashboardTrends) {
          setTrends({
            clubsActive: json.dashboardTrends.clubsActive ?? { label: "—", trend: "flat" },
            profiles: json.dashboardTrends.profiles ?? { label: "—", trend: "flat" },
            promoScans: json.dashboardTrends.promoScans ?? { label: "—", trend: "flat" },
            conversion: json.dashboardTrends.conversion ?? { label: "—", trend: "flat" },
          });
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando métricas");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const kpis = useMemo(
    () => [
      {
        title: "Clubes activos",
        value: loading ? "—" : String(metrics.clubsActive),
        subtitle: "Operando en la red",
        trendLabel: loading ? "—" : trends.clubsActive.label,
        trend: trends.clubsActive.trend as Trend,
        icon: Building2,
      },
      {
        title: "Perfiles globales",
        value: loading ? "—" : formatCompact(metrics.profilesTotal),
        subtitle: "Usuarios en plataforma",
        trendLabel: loading ? "—" : trends.profiles.label,
        trend: trends.profiles.trend as Trend,
        icon: Users,
      },
      {
        title: "Escaneos promo",
        value: loading ? "—" : formatCompact(metrics.promoScans),
        subtitle: "Interacciones acumuladas",
        trendLabel: loading ? "—" : trends.promoScans.label,
        trend: trends.promoScans.trend as Trend,
        icon: TrendingUp,
      },
      {
        title: "Conversión",
        value: loading ? "—" : `${metrics.conversionRate}%`,
        subtitle: "Lead / perfil",
        trendLabel: loading ? "—" : trends.conversion.label,
        trend: trends.conversion.trend as Trend,
        icon: Zap,
      },
    ],
    [loading, metrics, trends],
  );

  const last7LeadSum = useMemo(() => {
    const slice = collabLeadsDaily.slice(-7);
    return slice.reduce((a, b) => a + b, 0);
  }, [collabLeadsDaily]);

  const last7FeedbackSum = useMemo(() => {
    const slice = collabFeedbackDaily.slice(-7);
    return slice.reduce((a, b) => a + b, 0);
  }, [collabFeedbackDaily]);

  const signalHeights = useMemo(() => {
    if (days.length === 0 || profilesDaily.length === 0) return null;
    const n = Math.min(days.length, profilesDaily.length, promoScansDaily.length);
    const prof = profilesDaily.slice(-n);
    const promo = promoScansDaily.slice(-n);
    const max = Math.max(1, signalBarsMax);
    return prof.map((p, i) => {
      const sum = p + (promo[i] ?? 0);
      return Math.round((sum / max) * 100);
    });
  }, [days.length, profilesDaily, promoScansDaily, signalBarsMax]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <p className="text-[10px] uppercase font-black tracking-[0.28em] text-emerald-300/70">Backoffice</p>
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <span className="text-[10px] font-black text-emerald-300 tracking-[0.34em] uppercase">Executive Analytics</span>
        </div>
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">
          Global Dashboard
        </h1>
        <p className="text-[11px] font-bold text-white/55">
          {loading ? "Sincronizando métricas..." : "Control ejecutivo de red, adquisición y monetización."}
        </p>
      </div>

      {error && (
        <Card className="surface-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-[10px] font-bold text-amber-100/90 uppercase tracking-wide">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <AnalyticKpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            trendLabel={kpi.trendLabel}
            trend={kpi.trend}
            icon={kpi.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="surface-card border-emerald-500/20 bg-[#141a1f]">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.22em] text-emerald-300">Pipeline de captación</CardTitle>
            <CardDescription className="text-white/60">
              Estado de leads y feedback procedentes del entorno sandbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <MetricMini
              title="Leads"
              value={loading ? "—" : String(metrics.collabLeads)}
              hint={loading ? "—" : `${last7LeadSum} últimos 7 días (UTC)`}
            />
            <MetricMini
              title="Feedback"
              value={loading ? "—" : String(metrics.collabFeedback)}
              hint={loading ? "—" : `${last7FeedbackSum} últimos 7 días (UTC)`}
            />
          </CardContent>
        </Card>

        <Card className="surface-card border-emerald-500/20 bg-[#141a1f]">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.22em] text-emerald-300">Accesos rápidos</CardTitle>
            <CardDescription className="text-white/60">
              Navegación directa a módulos críticos de operación global.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            <Button variant="ghost" className="w-full h-11 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10" asChild>
              <Link href="/admin-global/users">Gestionar usuarios <ArrowRight className="h-3.5 w-3.5 ml-2" /></Link>
            </Button>
            <Button variant="ghost" className="w-full h-11 border border-primary/25 text-primary hover:bg-primary/10" asChild>
              <Link href="/admin-global/analytics">Abrir analytics <ArrowRight className="h-3.5 w-3.5 ml-2" /></Link>
            </Button>
            <Button variant="ghost" className="w-full h-11 border border-white/20 text-white/80 hover:bg-white/10" asChild>
              <Link href="/admin-global/health">Ver system health <ArrowRight className="h-3.5 w-3.5 ml-2" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card border-emerald-500/20 bg-[#141a1f]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm uppercase tracking-[0.22em] text-emerald-300 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Señal operativa
            </CardTitle>
            <CardDescription className="text-white/60">
              Últimos 30 días (UTC): altas de perfil + escaneos promo por día. Datos vía API.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {signalHeights && signalHeights.length > 0 ? (
            <div className="h-36 rounded-2xl border border-white/10 bg-[#0d1117] p-4 flex items-end gap-1">
              {signalHeights.map((h, i) => (
                <span
                  key={`${days[days.length - signalHeights.length + i] ?? i}-${i}`}
                  title={days[days.length - signalHeights.length + i] ?? ""}
                  className="flex-1 min-w-0 rounded-sm bg-gradient-to-t from-emerald-500/75 to-emerald-300/60"
                  style={{ height: `${Math.max(8, h)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="h-36 rounded-2xl border border-white/10 bg-[#0d1117] p-4 flex items-center justify-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {loading ? "Cargando serie…" : "Sin datos de serie (revisa Supabase o permisos)."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricMini({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a2029] p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/55">{title}</p>
      <p className="mt-1 text-2xl font-black italic text-white">{value}</p>
      <p className="text-[10px] text-emerald-300 mt-1">{hint}</p>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function AnalyticKpiCard({
  title,
  value,
  subtitle,
  trendLabel,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  trendLabel: string;
  trend: Trend;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const trendTone = trend === "up" ? "text-emerald-300" : "text-slate-300";
  return (
    <Card className="surface-card relative overflow-hidden border-emerald-500/20 bg-[#141a1f] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-11 w-11 text-emerald-500" />
      </div>
      <CardHeader className="pb-2">
        <CardDescription className="text-[9px] font-black uppercase tracking-widest text-emerald-400/50">{title}</CardDescription>
        <CardTitle className="text-3xl font-black text-white italic tracking-tighter">{value}</CardTitle>
        <p className="text-[10px] text-white/55">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <span className={cn("text-[10px] font-black uppercase tracking-wider", trendTone)}>{trendLabel}</span>
          <MiniTrend trend={trend} />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniTrend({ trend }: { trend: Trend }) {
  const bars = trend === "up" ? [20, 38, 46, 58, 70] : [52, 50, 49, 50, 51];
  return (
    <div className="inline-flex items-end gap-1 h-8 w-20 justify-end">
      {bars.map((h, idx) => (
        <span
          key={`${idx}-${h}`}
          className={cn(
            "w-2 rounded-sm",
            trend === "up" ? "bg-emerald-400/70" : "bg-slate-400/70",
          )}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
