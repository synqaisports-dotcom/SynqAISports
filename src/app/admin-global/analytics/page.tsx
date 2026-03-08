
"use client";

import { BarChart3, TrendingUp, Users, Zap, Globe, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsMiniCard label="Nodos Totales" value="4.8k" trend="+5%" icon={Globe} />
        <AnalyticsMiniCard label="Sesiones / Día" value="12k" trend="+20%" icon={Activity} />
        <AnalyticsMiniCard label="Tasa Conversión" value="8.4%" trend="+1.2%" icon={Zap} />
        <AnalyticsMiniCard label="Retención Red" value="98.2%" trend="+0.5%" icon={Shield} />
      </div>

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

const Shield = ({ className }: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);
