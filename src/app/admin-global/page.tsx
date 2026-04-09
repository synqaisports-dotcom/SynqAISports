"use client";

import { useCallback, useEffect, useState } from "react";
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

type DashboardMetrics = {
  clubsActive: number;
  profilesTotal: number;
  promoScans: number;
  conversionRate: number;
  collabLeads: number;
  collabFeedback: number;
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

  const loadDashboard = useCallback(async () => {
    const cacheRaw = localStorage.getItem("synq_admin_global_metrics_cache");
    const cache = cacheRaw ? (JSON.parse(cacheRaw) as DashboardMetrics) : null;
    if (cache) {
      setMetrics(cache);
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
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        clubsActive?: number;
        profilesTotal?: number;
        promoScans?: number;
        conversionRate?: number;
        collabLeads?: number;
        collabFeedback?: number;
      };

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
        localStorage.setItem("synq_admin_global_metrics_cache", JSON.stringify(next));
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

  const kpis = [
    {
      title: "Clubes activos",
      value: loading ? "—" : String(metrics.clubsActive),
      subtitle: "Operando en la red",
      trendLabel: "+8.4% mensual",
      trend: "up" as Trend,
      icon: Building2,
    },
    {
      title: "Perfiles globales",
      value: loading ? "—" : formatCompact(metrics.profilesTotal),
      subtitle: "Usuarios en plataforma",
      trendLabel: "+3.2% semanal",
      trend: "up" as Trend,
      icon: Users,
    },
    {
      title: "Escaneos promo",
      value: loading ? "—" : formatCompact(metrics.promoScans),
      subtitle: "Interacciones acumuladas",
      trendLabel: "+12.1% mensual",
      trend: "up" as Trend,
      icon: TrendingUp,
    },
    {
      title: "Conversión",
      value: loading ? "—" : `${metrics.conversionRate}%`,
      subtitle: "Lead / perfil",
      trendLabel: "Estable",
      trend: "flat" as Trend,
      icon: Zap,
    },
  ];

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
            <MetricMini title="Leads" value={loading ? "—" : String(metrics.collabLeads)} hint="+4 hoy" />
            <MetricMini title="Feedback" value={loading ? "—" : String(metrics.collabFeedback)} hint="Crecimiento constante" />
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
            <CardDescription className="text-white/60">Indicador visual de estabilidad y tracción de red.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-36 rounded-2xl border border-white/10 bg-[#0d1117] p-4 flex items-end gap-2">
            {[24, 36, 42, 38, 52, 60, 58, 66, 74, 70, 80, 88].map((h, i) => (
              <span key={`${h}-${i}`} className="flex-1 rounded-sm bg-gradient-to-t from-emerald-500/75 to-emerald-300/60" style={{ height: `${h}%` }} />
            ))}
          </div>
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
          <span className={`text-[10px] font-black uppercase tracking-wider ${trendTone}`}>{trendLabel}</span>
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
