
"use client";

import { useState, useEffect } from "react";
import { Shield, TrendingUp, Users, Building2, Zap, Activity, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminGlobalDashboard() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const existingLogs = JSON.parse(localStorage.getItem("synq_audit_logs") || "[]");
    setLogs(existingLogs);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER SECTOR */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Global_Command_Center</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter emerald-text-glow">
          SYSTEM_OVERVIEW
        </h1>
        <p className="text-[10px] font-black text-emerald-400/30 tracking-[0.2em] uppercase">Sincronización de Red: Nodos 100% Operativos</p>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Clubes Activos" value="24" icon={Building2} trend="+3" />
        <MetricCard title="Nodos Globales" value="1.2k" icon={Users} trend="+12%" />
        <MetricCard title="Ingresos Red" value="$42.5k" icon={TrendingUp} trend="+8.2%" />
        <MetricCard title="Carga IA" value="14%" icon={Zap} trend="Óptima" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TRAFFIC MONITOR */}
        <Card className="glass-panel lg:col-span-2 overflow-hidden relative group border border-emerald-500/20">
          <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 text-[8px] font-black px-2 uppercase tracking-widest text-emerald-400">Live_Network_Traffic</div>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2 text-emerald-400">
              <Activity className="h-4 w-4 text-emerald-400" /> Monitoreo de Flujos Globales
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center m-6 mt-0 border border-emerald-500/10 bg-black/40 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/cyber/1200/600')] bg-cover bg-center" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
             <div className="scan-line" />
             <div className="relative z-10 text-center space-y-4">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] animate-pulse">Analizando_Nodos_Tácticos...</span>
                <div className="flex gap-4">
                   <div className="h-2 w-32 bg-emerald-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-2/3 animate-pulse" />
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>
        
        {/* ACCESS LOGS - AUDIT REGISTRY */}
        <Card className="glass-panel border border-emerald-500/20 bg-black/40">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-sm uppercase tracking-widest font-black text-emerald-400">Registros de Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {logs.length > 0 ? logs.map((log) => (
                <LogItem key={log.id} type={log.type} title={log.title} desc={log.desc} />
              )) : (
                <div className="p-10 text-center space-y-4">
                   <Activity className="h-8 w-8 text-emerald-500/20 mx-auto animate-pulse" />
                   <p className="text-[10px] font-black text-emerald-400/20 uppercase tracking-widest">Esperando flujo de datos...</p>
                </div>
              )}
              {/* Logs estáticos de sistema */}
              <LogItem type="Info" title="Update_IA_Complete" desc="Despliegue de Neural Planner finalizado." />
              <LogItem type="Warning" title="Intento_Acceso_Denegado" desc="IP no autorizada bloqueada en nodo Tutor." />
            </div>
          </CardContent>
          <div className="p-4 border-t border-white/5">
             <Button variant="ghost" className="w-full h-10 rounded-none border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-all active:scale-95" asChild>
                <Link href="/admin-global/users">Ver todos los usuarios <ArrowRight className="h-3 w-3 ml-2" /></Link>
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="glass-panel relative overflow-hidden group hover:scale-[1.02] transition-all border border-emerald-500/20 bg-black/20">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12 text-emerald-500" />
      </div>
      <CardHeader className="pb-2">
        <CardDescription className="text-[9px] font-black uppercase tracking-widest text-emerald-400/40">{title}</CardDescription>
        <CardTitle className="text-3xl font-black text-white group-hover:emerald-text-glow transition-all italic tracking-tighter">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-emerald-400 uppercase">{trend}</span>
           <div className="h-[1px] flex-1 bg-emerald-500/20" />
        </div>
      </CardContent>
    </Card>
  );
}

function LogItem({ type, title, desc }: any) {
  const color = type === 'Success' ? 'text-emerald-400' : type === 'Warning' ? 'text-rose-400' : 'text-emerald-500';
  return (
    <div className="p-5 hover:bg-white/[0.02] transition-colors group cursor-default">
      <div className="flex items-center gap-3 mb-1">
         <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${type === 'Success' ? 'bg-emerald-400 shadow-[0_0_8px_var(--emerald-400)]' : type === 'Warning' ? 'bg-rose-400' : 'bg-emerald-500'}`} />
         <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{title}</p>
      </div>
      <p className="text-[10px] text-emerald-400/40 leading-tight uppercase font-bold pl-[18px]">{desc}</p>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
