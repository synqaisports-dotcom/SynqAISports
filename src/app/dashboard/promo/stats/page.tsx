"use client";

import { useState, useEffect, useMemo, type ComponentType } from "react";
import {
  BarChart3,
  Trophy,
  Zap,
  TrendingUp,
  Calendar,
  Activity,
  Info,
  Download,
  CloudSun,
  Thermometer,
  Award,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { synqSync } from "@/lib/sync-service";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

type PromoMatch = {
  id?: number;
  date?: string;
  rivalName?: string;
  location?: string;
  status?: string;
  score?: { home?: number; guest?: number };
};

type PromoVault = {
  exercises?: unknown[];
  sessions?: unknown[];
  matches?: PromoMatch[];
};

/**
 * Estadísticas sandbox: mismos paneles Command Hub que tareas / agenda / partidos.
 */
export default function PromoStatsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<PromoVault>({ exercises: [], sessions: [], matches: [] });
  const [isOnline, setIsOnline] = useState(true);
  const [coachXP, setCoachXP] = useState(0);

  useEffect(() => {
    let saved: PromoVault = { exercises: [], sessions: [], matches: [] };
    try {
      saved = JSON.parse(localStorage.getItem("synq_promo_vault") || "{}") as PromoVault;
    } catch {
      /* noop */
    }
    const exercises = Array.isArray(saved.exercises) ? saved.exercises : [];
    const matches = Array.isArray(saved.matches) ? saved.matches : [];
    setVault({ ...saved, exercises, sessions: Array.isArray(saved.sessions) ? saved.sessions : [], matches });
    setIsOnline(typeof navigator !== "undefined" && navigator.onLine);

    const exercisesCount = exercises.length;
    const matchesCount = matches.length;
    setCoachXP(exercisesCount * 50 + matchesCount * 100);

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast({ title: "Conexión restablecida", description: "Sincronización en segundo plano." });
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [toast]);

  const stats = useMemo(() => {
    const matches = vault.matches || [];
    const played = matches.filter((m) => m.status === "Played");
    const wins = played.filter((m) => (m.score?.home ?? 0) > (m.score?.guest ?? 0)).length;
    const losses = played.filter((m) => (m.score?.home ?? 0) < (m.score?.guest ?? 0)).length;
    const draws = played.filter((m) => (m.score?.home ?? 0) === (m.score?.guest ?? 0)).length;
    const goalsFor = played.reduce((acc, m) => acc + (m.score?.home ?? 0), 0);
    const goalsAgainst = played.reduce((acc, m) => acc + (m.score?.guest ?? 0), 0);
    const winRate = played.length > 0 ? (wins / played.length) * 100 : 0;
    const nextMatch = matches
      .filter((m) => m.status === "Scheduled")
      .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())[0];

    return { played: played.length, wins, losses, draws, goalsFor, goalsAgainst, winRate, nextMatch };
  }, [vault]);

  const coachLevel = Math.floor(coachXP / 500) + 1;
  const levelProgress = (coachXP % 500) / 5;
  const rank =
    coachLevel >= 5
      ? { label: "Gold coach", color: "text-amber-400" }
      : coachLevel >= 3
        ? { label: "Silver coach", color: "text-slate-300" }
        : { label: "Bronze coach", color: "text-orange-400" };

  const handlePrintPDF = () => {
    synqSync.trackEvent("ad_click", { action: "export_pdf_stats" });
    toast({ title: "Generando reporte", description: "Preparando impresión / PDF local…" });
    window.setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 print:p-0 print:bg-white">
      <div
        className={cn(
          "flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none print:border-black/10",
          PANEL_OUTER,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 print:hidden">
          <BarChart3 className={cn(iconCyan, "h-6 w-6 shrink-0")} />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de analítica</p>
            <p className="text-sm font-black uppercase tracking-tight text-white truncate">Rendimiento local · sandbox</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:justify-end print:hidden">
          {!isOnline ? (
            <Badge
              variant="outline"
              className="rounded-none border-rose-500/40 text-rose-400 text-[8px] font-black uppercase px-3 py-1.5 justify-center animate-pulse"
            >
              Offline
            </Badge>
          ) : null}
          <div className="flex items-center gap-4 px-3 py-2 rounded-none border border-white/10 bg-slate-950/40">
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Jugados</p>
              <p className="font-mono text-xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                {stats.played}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Efectividad</p>
              <p className="font-mono text-xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                {Math.round(stats.winRate)}%
              </p>
            </div>
          </div>
          <Button
            onClick={handlePrintPDF}
            className="h-11 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest px-6 border-0 shadow-[0_0_24px_rgba(6,182,212,0.55)] hover:bg-cyan-400 shrink-0"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <PromoAdsPanel placement="sandbox_stats_page_horizontal" />

      <HubPanel>
        <SectionBar title="Progreso entrenador" right={<Award className={cn(iconCyan, rank.color)} />} />
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-6 print:hidden">
          <div className="h-14 w-14 shrink-0 rounded-none border border-cyan-400/30 bg-slate-950/50 flex items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.2)]">
            <Award className={cn("h-7 w-7", rank.color)} />
          </div>
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex justify-between items-end gap-2">
              <span className={cn("text-[9px] font-black uppercase tracking-widest", rank.color)}>{rank.label}</span>
              <span className="text-[11px] font-black text-white font-mono">LVL {coachLevel}</span>
            </div>
            <Progress
              value={levelProgress}
              className="h-2 rounded-none border border-white/10 bg-slate-950/50 [&>div]:bg-cyan-500 [&>div]:shadow-[0_0_10px_rgba(34,211,238,0.45)]"
            />
            <div className="flex flex-wrap justify-between gap-2">
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                +{500 - (coachXP % 500)} XP para subir
              </p>
              {coachLevel >= 3 ? (
                <Badge className="rounded-none bg-cyan-500 text-black text-[7px] font-black px-2 py-0">Bonus listo</Badge>
              ) : null}
            </div>
          </div>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-xs hidden lg:block">
            Tu actividad en el sandbox suma reconocimiento en la red SynqAI.
          </p>
        </div>
      </HubPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsMiniHub label="Victorias" value={String(stats.wins)} icon={Trophy} highlight />
        <StatsMiniHub label="Goles a favor" value={String(stats.goalsFor)} icon={Zap} />
        <StatsMiniHub
          label="Goles en contra"
          value={String(stats.goalsAgainst)}
          icon={Activity}
          warning={stats.goalsAgainst > stats.goalsFor}
        />
        <WeatherHub isOnline={isOnline} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <HubPanel>
          <SectionBar title="Distribución de resultados" right={<TrendingUp className={iconCyan} />} />
          <div className="p-4 sm:p-6 space-y-8 print:bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-slate-500 uppercase print:text-black/50">Victorias</span>
                  <span className="text-xs font-black text-cyan-300 font-mono print:text-black">{stats.wins}</span>
                </div>
                <Progress
                  value={stats.played > 0 ? (stats.wins / stats.played) * 100 : 0}
                  className="h-1.5 rounded-none border border-white/10 bg-slate-950/50 print:bg-black/5 [&>div]:bg-cyan-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-slate-500 uppercase print:text-black/50">Empates</span>
                  <span className="text-xs font-black text-white/80 font-mono print:text-black/70">{stats.draws}</span>
                </div>
                <Progress
                  value={stats.played > 0 ? (stats.draws / stats.played) * 100 : 0}
                  className="h-1.5 rounded-none border border-white/10 bg-slate-950/50 print:bg-black/5 [&>div]:bg-slate-400"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-slate-500 uppercase print:text-black/50">Derrotas</span>
                  <span className="text-xs font-black text-rose-400 font-mono print:text-black">{stats.losses}</span>
                </div>
                <Progress
                  value={stats.played > 0 ? (stats.losses / stats.played) * 100 : 0}
                  className="h-1.5 rounded-none border border-white/10 bg-slate-950/50 print:bg-black/5 [&>div]:bg-rose-500/80"
                />
              </div>
            </div>
          </div>
        </HubPanel>

        <HubPanel>
          <SectionBar title="Próximo objetivo" right={<Calendar className={cn(iconCyan, "h-4 w-4")} />} />
          <div className="p-4 sm:p-5 print:hidden">
            {stats.nextMatch ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Encuentro</p>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">vs {stats.nextMatch.rivalName}</h4>
                </div>
                <div className="flex items-center gap-4 py-3 border-y border-white/10">
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase">Fecha</span>
                    <p className="text-xs font-black text-cyan-300 mt-0.5">{stats.nextMatch.date}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <span className="text-[8px] font-black text-slate-500 uppercase">Sede</span>
                    <p className="text-xs font-black text-white mt-0.5">{stats.nextMatch.location}</p>
                  </div>
                </div>
                <Badge className="rounded-none border-cyan-400/30 bg-cyan-500/15 text-cyan-200 font-black uppercase text-[8px] px-3 py-1 tracking-widest">
                  Listo para dirigir
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Info className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sin partidos programados</p>
              </div>
            )}
          </div>
        </HubPanel>
      </div>
    </div>
  );
}

function StatsMiniHub({
  label,
  value,
  icon: Icon,
  highlight,
  warning,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
  warning?: boolean;
}) {
  return (
    <HubPanel>
      <div className="p-4 flex items-center gap-4">
        <div
          className={cn(
            "h-12 w-12 shrink-0 flex items-center justify-center rounded-none border bg-slate-950/50 print:bg-black/5",
            highlight ? "border-cyan-400/30 shadow-[0_0_14px_rgba(6,182,212,0.15)]" : "border-white/10",
            warning ? "border-rose-500/25 bg-rose-500/10" : "",
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6",
              highlight ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] print:text-black" : "text-slate-500 print:text-black/40",
              warning ? "text-rose-400" : "",
            )}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black/45">{label}</p>
          <p
            className={cn(
              "font-mono text-2xl font-black tabular-nums tracking-tight",
              highlight ? "text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)] print:text-black print:drop-shadow-none" : "text-white print:text-black",
              warning ? "text-rose-400" : "",
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </HubPanel>
  );
}

function WeatherHub({ isOnline }: { isOnline: boolean }) {
  return (
    <HubPanel>
      <div
        className={cn(
          "p-4 flex items-center gap-4 relative overflow-hidden",
          isOnline ? "" : "grayscale opacity-90",
        )}
      >
        <div
          className={cn(
            "h-12 w-12 shrink-0 flex items-center justify-center rounded-none border",
            isOnline ? "border-cyan-400/30 bg-cyan-500/10" : "border-white/10 bg-slate-950/50",
          )}
        >
          <CloudSun className={cn("h-6 w-6", isOnline ? "text-cyan-400 animate-pulse" : "text-slate-600")} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clima campo</p>
          {isOnline ? (
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="font-mono text-2xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">
                18°C
              </p>
              <span className="text-[8px] font-bold text-slate-500 uppercase">Nublado</span>
            </div>
          ) : (
            <p className="text-sm font-black text-slate-600 uppercase tracking-widest mt-0.5">Offline</p>
          )}
        </div>
        <Thermometer className="absolute top-2 right-2 h-8 w-8 text-cyan-400/10" />
      </div>
    </HubPanel>
  );
}
