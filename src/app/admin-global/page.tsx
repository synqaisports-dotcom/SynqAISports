"use client";

import { Shield, TrendingUp, Users, Building2, Zap, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminGlobalDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter">
          GLOBAL_COMMAND_CENTER
        </h1>
        <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Estado: Operativo | Nivel de Acceso: Root</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Clubes Totales" value="24" icon={Building2} trend="+3" />
        <MetricCard title="Usuarios Activos" value="1.2k" icon={Users} trend="+12%" />
        <MetricCard title="MRR Proyectado" value="$42.5k" icon={TrendingUp} trend="+8%" />
        <MetricCard title="Nodos Activos" value="156" icon={Zap} trend="Sincro" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel border-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black">Actividad de Red Global</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border border-white/5 bg-black/20 m-6 mt-0">
            <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Motor_Gráfico_Inactivo</span>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-none">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black">Eventos Críticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 border-l-2 border-primary">
              <p className="text-[10px] font-black uppercase text-primary mb-1">Nuevo_Registro</p>
              <p className="text-xs text-white/60">Elite Soccer Academy ha iniciado sincronización.</p>
            </div>
            <div className="p-4 bg-white/5 border-l-2 border-white/20">
              <p className="text-[10px] font-black uppercase text-white/40 mb-1">Actualización_Sistema</p>
              <p className="text-xs text-white/60">Módulo Smartwatch V2.1 desplegado.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="glass-panel border-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/30">{title}</CardDescription>
        <CardTitle className="text-3xl font-black text-white">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-[10px] font-black text-primary uppercase">{trend}</span>
      </CardContent>
    </Card>
  );
}
