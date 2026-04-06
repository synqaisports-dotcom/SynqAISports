
"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap, 
  Swords, 
  Calendar, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Megaphone,
  Info,
  Download,
  CloudSun,
  Thermometer,
  Wind as WindIcon,
  Droplets,
  Award,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { synqSync } from "@/lib/sync-service";

/**
 * Estadísticas Sandbox - v10.1.0
 * Integra el sistema de Gamificación (XP) en el corazón del análisis local.
 */
export default function PromoStatsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [], matches: [] });
  const [isOnline, setIsOnline] = useState(true);
  const [coachXP, setCoachXP] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": [], "matches": []}');
    setVault(saved);
    setIsOnline(navigator.onLine);

    // Cálculo de XP local: 50 por Tarea, 100 por Partido
    const exercisesCount = saved.exercises?.length || 0;
    const matchesCount = saved.matches?.length || 0;
    const totalXP = (exercisesCount * 50) + (matchesCount * 100);
    setCoachXP(totalXP);

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        toast({ title: "CONEXIÓN_RESTABLECIDA", description: "Sincronizando datos de red en segundo plano..." });
      }
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [toast]);

  const stats = useMemo(() => {
    const matches = vault.matches || [];
    const played = matches.filter((m: any) => m.status === 'Played');
    const wins = played.filter((m: any) => m.score.home > m.score.guest).length;
    const losses = played.filter((m: any) => m.score.home < m.score.guest).length;
    const draws = played.filter((m: any) => m.score.home === m.score.guest).length;
    const goalsFor = played.reduce((acc: number, m: any) => acc + (m.score.home || 0), 0);
    const goalsAgainst = played.reduce((acc: number, m: any) => acc + (m.score.guest || 0), 0);
    const winRate = played.length > 0 ? (wins / played.length) * 100 : 0;
    const nextMatch = matches
      .filter((m: any) => m.status === 'Scheduled')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    return { played: played.length, wins, losses, draws, goalsFor, goalsAgainst, winRate, nextMatch };
  }, [vault]);

  // Lógica de Niveles (Cada 500 XP = 1 Nivel)
  const coachLevel = Math.floor(coachXP / 500) + 1;
  const levelProgress = (coachXP % 500) / 5;
  const rank = coachLevel >= 5 ? { label: "GOLD_COACH", color: "text-amber-400" } : 
               coachLevel >= 3 ? { label: "SILVER_COACH", color: "text-slate-300" } : 
               { label: "BRONZE_COACH", color: "text-orange-400" };

  const handlePrintPDF = () => {
    synqSync.trackEvent('ad_click', { action: 'export_pdf_stats' });
    toast({ title: "GENERANDO_REPORTE", description: "Preparando documento PDF de rendimiento local..." });
    setTimeout(() => { window.print(); }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12 print:p-0 print:bg-white">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 print:border-black/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 print:hidden">
            <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Local_Analytics_Module_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none print:text-black">
            ESTADÍSTICAS_SANDBOX
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase print:text-black/40">Rendimiento Técnico del Equipo Local</p>
        </div>

        <div className="flex items-center gap-4">
           {!isOnline && <Badge variant="outline" className="border-rose-500/40 text-rose-500 text-[8px] font-black uppercase px-3 py-1 animate-pulse mr-4">TRABAJANDO_OFFLINE</Badge>}
           <div className="text-right">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest print:text-black/40">Partidos</p>
              <p className="text-2xl font-black text-white italic tracking-tighter print:text-black">{stats.played}</p>
           </div>
           <div className="h-10 w-[1px] bg-white/10 print:bg-black/10" />
           <div className="text-right">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest print:text-black/40">Efectividad</p>
              <p className="text-2xl font-black text-primary italic tracking-tighter print:text-black">{Math.round(stats.winRate)}%</p>
           </div>
           <Button onClick={handlePrintPDF} className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl blue-glow hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none print:hidden ml-4">
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
           </Button>
        </div>
      </div>

      {/* BLOQUE DE GAMIFICACIÓN INTEGRADO (v10.1.0) */}
      <div className="flex items-center gap-6 p-6 bg-primary/5 border border-primary/20 rounded-[2.5rem] shadow-2xl group hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform] relative overflow-hidden print:hidden">
         <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
         <div className="h-16 w-16 rounded-2xl bg-black border-2 border-primary/40 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <Award className={cn("h-8 w-8", rank.color)} />
         </div>
         <div className="space-y-2 min-w-[220px] relative z-10">
            <div className="flex justify-between items-end">
               <span className={cn("text-[9px] font-black uppercase italic tracking-widest", rank.color)}>{rank.label}</span>
               <span className="text-[11px] font-black text-white italic">LVL {coachLevel}</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-primary shadow-[0_0_10px_var(--primary)] transition-[background-color,border-color,color,opacity,transform] duration-1000" style={{ width: `${levelProgress}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[7px] font-bold text-primary/40 uppercase tracking-widest italic">+{500 - (coachXP % 500)} XP para subir de rango</p>
              {coachLevel >= 3 && <Badge className="bg-primary text-black text-[7px] font-black px-2 py-0 animate-pulse">BONUS_IA_READY</Badge>}
            </div>
         </div>
         <div className="hidden md:block ml-auto max-w-[200px] text-right">
            <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest leading-relaxed italic">
              Tu actividad en el Sandbox desbloquea niveles de reconocimiento en la red global de SynqAI.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsMiniCard label="Victorias" value={stats.wins.toString()} icon={Trophy} highlight />
        <StatsMiniCard label="Goles a Favor" value={stats.goalsFor.toString()} icon={Zap} />
        <StatsMiniCard label="Goles en Contra" value={stats.goalsAgainst.toString()} icon={Activity} warning={stats.goalsAgainst > stats.goalsFor} />
        <WeatherWidget isOnline={isOnline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
        <div className="space-y-8">
          <Card className="glass-panel border-none bg-black/40 overflow-hidden relative rounded-[2.5rem] print:bg-white print:border print:border-black/10">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01] print:border-black/10">
               <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-3 text-primary/60 print:text-black/60">
                  <TrendingUp className="h-4 w-4 text-primary print:text-black" /> Distribución de Rendimiento
               </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase print:text-black/40">Victorias</span><span className="text-xs font-black text-primary print:text-black">{stats.wins}</span></div>
                     <Progress value={stats.played > 0 ? (stats.wins / stats.played) * 100 : 0} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase print:text-black/40">Empates</span><span className="text-xs font-black text-white/60 print:text-black/60">{stats.draws}</span></div>
                     <Progress value={stats.played > 0 ? (stats.draws / stats.played) * 100 : 0} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase print:text-black/40">Derrotas</span><span className="text-xs font-black text-rose-500 print:text-black">{stats.losses}</span></div>
                     <Progress value={stats.played > 0 ? (stats.losses / stats.played) * 100 : 0} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8 print:hidden">
          <Card className="glass-panel border-primary/30 bg-primary/5 p-8 relative overflow-hidden group rounded-[2.5rem]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-[background-color,border-color,color,opacity,transform]"><Swords className="h-32 w-32 text-primary" /></div>
            <div className="flex items-center gap-3 mb-6">
               <Calendar className="h-4 w-4 text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">PRÓXIMO_OBJETIVO</span>
            </div>
            {stats.nextMatch ? (
              <div className="space-y-6 relative z-10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Encuentro Agendado</p>
                    <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">vs {stats.nextMatch.rivalName}</h4>
                 </div>
                 <div className="flex items-center gap-4 py-4 border-y border-white/5">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-white/20 uppercase">Fecha</span>
                       <span className="text-xs font-black text-primary">{stats.nextMatch.date}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-white/10" />
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-white/20 uppercase">Sede</span>
                       <span className="text-xs font-black text-white">{stats.nextMatch.location}</span>
                    </div>
                 </div>
                 <Badge className="bg-primary text-black font-black uppercase text-[8px] px-3 py-1 rounded-full tracking-widest italic">PREPARADO_PARA_DIRIGIR</Badge>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                 <Info className="h-8 w-8 text-white/10 mx-auto" />
                 <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">No hay partidos agendados en el calendario Sandbox.</p>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, icon: Icon, highlight, warning }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-white/5 bg-black/20 rounded-3xl print:bg-white print:border-black/10">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-[background-color,border-color,color,opacity,transform] rotate-3 group-hover:rotate-0 duration-500 rounded-2xl bg-white/5 border-white/10 print:bg-black/5 print:border-black/10",
         highlight ? "border-primary/20 bg-primary/5" : "",
         warning ? "border-rose-500/20 bg-rose-500/10" : ""
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary print:text-black" : "text-white/20 print:text-black/20", warning ? "text-rose-500" : "")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest italic print:text-black/40">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary blue-text-glow print:text-black print:text-glow-none" : "text-white print:text-black",
               warning ? "text-rose-500" : ""
             )}>{value}</p>
          </div>
       </div>
    </Card>
  );
}

function WeatherWidget({ isOnline }: { isOnline: boolean }) {
  return (
    <Card className={cn(
      "glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-white/5 rounded-3xl transition-[background-color,border-color,color,opacity,transform] duration-700",
      isOnline ? "bg-primary/5 border-primary/20" : "bg-white/5 grayscale"
    )}>
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-[background-color,border-color,color,opacity,transform] rounded-2xl",
         isOnline ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/10"
       )}>
          <CloudSun className={cn("h-6 w-6", isOnline ? "text-primary animate-pulse" : "text-white/20")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">Clima_Campo</p>
          <div className="flex items-baseline gap-2">
             {isOnline ? (
               <>
                 <p className="text-2xl font-black text-primary italic tracking-tighter">18°C</p>
                 <span className="text-[8px] font-bold text-white/40 uppercase">Nublado</span>
               </>
             ) : (
               <p className="text-sm font-black text-white/20 uppercase tracking-widest animate-pulse">OFFLINE</p>
             )}
          </div>
       </div>
       <div className="absolute top-0 right-0 p-2 opacity-5">
          <Thermometer className="h-10 w-10 text-primary" />
       </div>
    </Card>
  );
}
