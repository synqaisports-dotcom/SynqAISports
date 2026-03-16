
"use client";

import { BarChart3, TrendingUp, Users, Zap, Globe, Activity, Target, Flame, MousePointerClick, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Global Analytics - v9.46.0
 * Terminal de Conversión Sandbox para detección de Leads Calientes y saturación de slots.
 */
export default function GlobalAnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Neural_Network_Analytics</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            ANALYTICS_COMMAND
          </h1>
        </div>
      </div>

      {/* MÉTRICAS DE RED GLOBAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsMiniCard label="Nodos Totales" value="4.8k" trend="+5%" icon={Globe} />
        <AnalyticsMiniCard label="Sesiones / Día" value="12k" trend="+20%" icon={Activity} />
        <AnalyticsMiniCard label="Tasa Conversión" value="8.4%" trend="+1.2%" icon={Zap} />
        <AnalyticsMiniCard label="Retención Red" value="98.2%" trend="+0.5%" icon={ShieldCheck} />
      </div>

      {/* TERMINAL DE CONVERSIÓN SANDBOX (LEAD DETECTOR) */}
      <section className="space-y-6 pt-8">
        <div className="flex items-center gap-3 px-2">
          <Target className="h-5 w-5 text-emerald-400" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">CONVERSION_SANDBOX_LEADS</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SATURACIÓN DE SLOTS (Venta Directa) */}
          <Card className="glass-panel border-emerald-500/20 bg-black/40 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Flame className="h-24 w-24 text-emerald-500" /></div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Saturación de Slots</p>
                <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">LEADS_CALIENTES (20/20)</h4>
              </div>
              <div className="text-5xl font-black text-white italic tracking-tighter">142</div>
              <p className="text-[9px] text-white/30 uppercase font-bold leading-relaxed">
                Usuarios con el Sandbox lleno. Prioridad alta para campaña de Magic Token "Upgrade Pro".
              </p>
              <div className="space-y-2">
                 <div className="flex justify-between text-[8px] font-black text-emerald-400/60 uppercase">
                    <span>Tráfico Orgánico</span>
                    <span>72%</span>
                 </div>
                 <Progress value={72} className="h-1 bg-emerald-500/20" />
              </div>
            </div>
          </Card>

          {/* MAPA DE CALOR POR PAÍSES */}
          <Card className="glass-panel border-emerald-500/20 bg-black/40 p-8 rounded-[2.5rem] lg:col-span-2">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Geo_Distribution</p>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">MAPA DE CALOR SANDBOX</h4>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] font-black uppercase">REAL_TIME_SYNC</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <CountryLeadRow flag="🇪🇸" name="España" count={1240} percent={45} />
                <CountryLeadRow flag="🇦🇷" name="Argentina" count={850} percent={32} />
                <CountryLeadRow flag="🇧🇷" name="Brasil" count={420} percent={15} />
                <CountryLeadRow flag="🇲🇽" name="México" count={210} percent={8} />
              </div>
              <div className="flex flex-col items-center justify-center p-6 border border-white/5 bg-white/[0.02] rounded-3xl text-center space-y-4">
                 <Globe className="h-12 w-12 text-emerald-500/20 animate-pulse" />
                 <p className="text-[10px] font-black text-emerald-400/40 uppercase tracking-widest">Analizando Tráfico Regional...</p>
                 <span className="text-[8px] text-white/20 uppercase font-bold italic">Detectado incremento en Región LATAM (+14%)</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel h-80 flex flex-col items-center justify-center p-12 relative overflow-hidden border border-emerald-500/20">
           <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp className="h-40 w-40 text-emerald-500" /></div>
           <BarChart3 className="h-12 w-12 text-emerald-500/20 mb-4" />
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Generando_Gráficas_de_Rendimiento...</span>
        </Card>
        <Card className="glass-panel h-80 flex flex-col items-center justify-center p-12 relative overflow-hidden border border-emerald-500/20">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Users className="h-40 w-40 text-emerald-500" /></div>
           <Activity className="h-12 w-12 text-emerald-500/20 mb-4" />
           <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Sincronizando_Datos_de_Atletas...</span>
        </Card>
      </div>
    </div>
  );
}

function CountryLeadRow({ flag, name, count, percent }: any) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-lg">{flag}</span>
          <span className="text-[10px] font-black text-white uppercase italic tracking-widest group-hover:text-emerald-400 transition-colors">{name}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-400/60">{count} NODOS</span>
      </div>
      <Progress value={percent} className="h-1 bg-white/5" />
    </div>
  );
}

function AnalyticsMiniCard({ label, value, trend, icon: Icon }: any) {
  return (
    <Card className="glass-panel p-6 relative group border border-emerald-500/20">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
        <Icon className="h-8 w-8 text-emerald-500" />
      </div>
      <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end gap-3">
        <p className="text-2xl font-black text-white italic tracking-tighter">{value}</p>
        <span className="text-[10px] font-black text-emerald-400 mb-1">{trend}</span>
      </div>
    </Card>
  );
}
