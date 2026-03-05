"use client";

import { Shield, TrendingUp, Users, Building2, Zap, LayoutGrid, TicketPercent, UserPlus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGlobalDashboard() {
  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          GLOBAL_COMMAND_CENTER
        </h1>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Sincronización de Red: Estable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Clubes Activos" value="24" icon={Building2} trend="+3" />
        <MetricCard title="Nodos Globales" value="1.2k" icon={Users} trend="+12%" />
        <MetricCard title="Ingresos Red" value="$42.5k" icon={TrendingUp} trend="+8%" />
        <MetricCard title="Estado IA" value="Active" icon={Zap} trend="Optimizado" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel border-none lg:col-span-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-1 bg-primary/20 text-[8px] font-black px-2 uppercase tracking-widest text-primary">Live_Stream</div>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black">Monitoreo de Tráfico Global</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center m-6 mt-0 border border-primary/10 bg-black/40 relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/tech/800/400')] bg-cover" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse relative z-10">Analizando_Flujos_Tacticos...</span>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black">Alertas de Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertItem type="Success" title="Nuevo_Club_Sync" desc="Elite Soccer Academy ha completado el onboarding." />
            <AlertItem type="Info" title="Modulo_AI_Update" desc="Despliegue de Neural Planner V3 finalizado." />
            <AlertItem type="Warning" title="Latencia_Nodo_S" desc="Sincronización parcial detectada en sector 04." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="glass-panel border-none relative overflow-hidden group hover:border-primary/30 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/30">{title}</CardDescription>
        <CardTitle className="text-3xl font-black text-white group-hover:cyan-text-glow transition-all">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-[10px] font-black text-primary uppercase">{trend}</span>
      </CardContent>
    </Card>
  );
}

function AlertItem({ type, title, desc }: any) {
  const color = type === 'Success' ? 'text-emerald-400' : type === 'Warning' ? 'text-amber-400' : 'text-primary';
  return (
    <div className="p-4 bg-white/[0.02] border-l-2 border-primary/20 hover:bg-white/[0.05] transition-colors">
      <p className={`text-[10px] font-black uppercase mb-1 ${color}`}>{title}</p>
      <p className="text-[10px] text-white/50 leading-tight uppercase font-bold">{desc}</p>
    </div>
  );
}
