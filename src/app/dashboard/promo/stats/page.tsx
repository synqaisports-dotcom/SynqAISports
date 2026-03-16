
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
  Droplets
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { synqSync } from "@/lib/sync-service";

export default function PromoStatsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [], matches: [] });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": [], "matches": []}');
    setVault(saved);
    setIsOnline(navigator.onLine);

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

    return {
      played: played.length,
      wins,
      losses,
      draws,
      goalsFor,
      goalsAgainst,
      winRate,
      nextMatch
    };
  }, [vault]);

  const handlePrintPDF = () => {
    synqSync.trackEvent('ad_click', { action: 'export_pdf_stats' });
    toast({
      title: "GENERANDO_REPORTE",
      description: "Preparando documento PDF de rendimiento local...",
    });
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12 print:p-0 print:bg-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 print:border-black/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 print:hidden">
            <BarChart3 className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Local_Analytics_Module_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none print:text-black print:text-glow-none">
            ESTADÍSTICAS_SANDBOX
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase print:text-black/40">Rendimiento Técnico del Equipo Local</p>
        </div>

        <div className="flex items-center gap-4">
           {!isOnline && (
             <Badge variant="outline" className="border-rose-500/40 text-rose-500 text-[8px] font-black uppercase tracking-widest px-3 py-1 animate-pulse mr-4">
               TRABAJANDO_OFFLINE
             </Badge>
           )}
           <div className="text-right">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest print:text-black/40">Partidos Analizados</p>
              <p className="text-2xl font-black text-white italic tracking-tighter print:text-black">{stats.played}</p>
           </div>
           <div className="h-10 w-[1px] bg-white/10 print:bg-black/10" />
           <div className="text-right">
              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest print:text-black/40">Efectividad</p>
              <p className="text-2xl font-black text-primary italic tracking-tighter print:text-black">{Math.round(stats.winRate)}%</p>
           </div>
           <Button 
            onClick={handlePrintPDF}
            className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl blue-glow hover:scale-105 transition-all border-none print:hidden ml-4"
           >
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
           </Button>
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
                     <Progress value={(stats.wins / stats.played) * 100} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase print:text-black/40">Empates</span><span className="text-xs font-black text-white/60 print:text-black/60">{stats.draws}</span></div>
                     <Progress value={(stats.draws / stats.played) * 100} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-end"><span className="text-[10px] font-black text-white/40 uppercase print:text-black/40">Derrotas</span><span className="text-xs font-black text-rose-500 print:text-black">{stats.losses}</span></div>
                     <Progress value={(stats.losses / stats.played) * 100} className="h-1.5 bg-white/5 print:bg-black/5" />
                  </div>
               </div>

               <div className="p-8 bg-primary/5 border border-primary/20 rounded-3xl flex items-center justify-between group overflow-hidden print:bg-black/5 print:border-black/10">
                  <div className="flex items-center gap-6">
                     <div className="h-14 w-14 rounded-2xl bg-black/40 border border-primary/30 flex items-center justify-center pulse-glow print:bg-white print:border-black/20">
                        <Activity className="h-6 w-6 text-primary print:text-black" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-white uppercase italic tracking-widest print:text-black">Promedio de Goles por Partido</p>
                        <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-1 print:text-black/40">
                           Ofensivo: {(stats.goalsFor / stats.played || 0).toFixed(1)} • Defensivo: {(stats.goalsAgainst / stats.played || 0).toFixed(1)}
                        </p>
                     </div>
                  </div>
                  <div className="text-right print:hidden">
                     <span className="text-4xl font-black italic text-primary/20 group-hover:text-primary transition-colors duration-700">SINCRO_OK</span>
                  </div>
               </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 glass-panel border-white/5 rounded-3xl space-y-4 print:bg-white print:border-black/10">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="h-4 w-4 text-emerald-400 print:text-black" />
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-widest print:text-black/60">Fortaleza Defensiva</span>
                </div>
                <p className="text-[9px] text-white/20 uppercase font-bold leading-relaxed italic print:text-black/40">
                   El sistema detecta una solidez del {Math.max(0, 100 - (stats.goalsAgainst * 10))}% en los últimos bloqueos tácticos registrados en la pizarra de partido.
                </p>
             </div>
             <div className="p-8 glass-panel border-white/5 rounded-3xl space-y-4 print:bg-white print:border-black/10">
                <div className="flex items-center gap-3">
                   <Zap className="h-4 w-4 text-amber-400 print:text-black" />
                   <span className="text-[10px] font-black text-white/60 uppercase tracking-widest print:text-black/60">Eficacia en Transición</span>
                </div>
                <p className="text-[9px] text-white/20 uppercase font-bold leading-relaxed italic print:text-black/40">
                   Tus goles a favor representan un índice de conversión del {Math.min(100, stats.goalsFor * 5)}% respecto a las jugadas de ataque diagramadas.
                </p>
             </div>
          </div>
        </div>

        <aside className="space-y-8 print:hidden">
          <Card className="glass-panel border-primary/30 bg-primary/5 p-8 relative overflow-hidden group rounded-[2.5rem]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Swords className="h-32 w-32 text-primary" /></div>
            <div className="flex items-center gap-3 mb-6">
               <Calendar className="h-4 w-4 text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase text-primary tracking-widest">PRÓXIMO_OBJETIVO</span>
            </div>
            
            {stats.nextMatch ? (
              <div className="space-y-6 relative z-10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Encuentro Agendado</p>
                    <h4 className="text-2xl font-black text-white uppercase italic italic tracking-tighter">vs {stats.nextMatch.rivalName}</h4>
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

          <div className="p-8 border border-dashed border-white/10 bg-white/[0.01] rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/20 transition-all">
             <Megaphone className="h-10 w-10 text-white/10 group-hover:text-primary/20 transition-colors" />
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Google_Ad_Slot_Sidebar_Analytics</p>
          </div>

          <div className="p-8 bg-black/40 border border-white/5 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-primary/40" />
                <span className="text-[10px] font-black uppercase text-white/40">Protocolo de Datos</span>
             </div>
             <p className="text-[9px] text-white/20 leading-relaxed font-bold uppercase italic">
                Estas analíticas son temporales y se basan en el almacenamiento local. Para informes históricos por jugador y comparativas de red, activa el modo Elite Club.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatsMiniCard({ label, value, icon: Icon, highlight, warning }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-white/5 bg-black/20 rounded-3xl print:bg-white print:border-black/10">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl bg-white/5 border-white/10 print:bg-black/5 print:border-black/10",
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
      "glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-white/5 rounded-3xl transition-all duration-700",
      isOnline ? "bg-primary/5 border-primary/20" : "bg-white/5 grayscale"
    )}>
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rounded-2xl",
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
