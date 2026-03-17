"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Building2, 
  Zap, 
  Activity, 
  ArrowUpRight, 
  MessageSquareQuote, 
  Gift, 
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Global Admin Overview - v14.2.0
 * Restauración de estabilidad y utilidades de renderizado.
 */
export default function AdminGlobalDashboard() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const existingLogs = JSON.parse(localStorage.getItem("synq_audit_logs") || "[]");
    setLogs(existingLogs);
  }, []);

  const allianceLeads = logs.filter(l => l.title === "LEAD_ALIANZA_CLUB").length;
  const feedbackCount = logs.filter(l => l.title === "FEEDBACK_RECIBIDO").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Clubes Activos" value="24" icon={Building2} trend="+3" />
        <MetricCard title="Nodos Globales" value="1.2k" icon={Users} trend="+12%" />
        <MetricCard title="Ingresos Red" value="$42.5k" icon={TrendingUp} trend="+8.2%" />
        <MetricCard title="Carga IA" value="14%" icon={Zap} trend="Óptima" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <Link href="/admin-global/collaboration" className="block">
            <Card className="glass-panel p-8 border-emerald-500/20 bg-emerald-500/5 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Gift className="h-32 w-32 text-emerald-500" /></div>
               <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center pulse-glow">
                     <Sparkles className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">Leads de Alianza Pendientes</p>
                     <h3 className="text-3xl font-black text-white italic tracking-tighter">{allianceLeads} SOLICITUDES</h3>
                  </div>
               </div>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-loose">
                  Entrenadores Sandbox solicitando acceso profesional para sus clubes. Prioridad alta para el equipo de ventas.
               </p>
            </Card>
         </Link>

         <Link href="/admin-global/collaboration" className="block">
            <Card className="glass-panel p-8 border-primary/20 bg-primary/5 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><MessageSquareQuote className="h-32 w-32 text-primary" /></div>
               <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center pulse-glow">
                     <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Sugerencias Metodológicas</p>
                     <h3 className="text-3xl font-black text-white italic tracking-tighter">{feedbackCount} PROPUESTAS</h3>
                  </div>
               </div>
               <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-loose">
                  Ideas de nuevas herramientas tácticas recibidas desde el Sandbox. Analizar para el roadmap v11.
               </p>
            </Card>
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-panel lg:col-span-2 overflow-hidden relative group border border-emerald-500/20">
          <div className="absolute top-0 right-0 p-1 bg-emerald-500/20 text-[8px] font-black px-2 uppercase tracking-widest text-emerald-400">Live_Network_Traffic</div>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-widest font-black flex items-center gap-2 text-emerald-400">
              <Activity className="h-4 w-4 text-emerald-400" /> Monitoreo de Flujos Globales
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center m-6 mt-0 border border-emerald-500/10 bg-black/40 relative overflow-hidden rounded-3xl">
             <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/cyber/1200/600')] bg-cover bg-center" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
             <div className="scan-line" />
             <div className="relative z-10 text-center space-y-4">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em] animate-pulse">Analizando_Nodos_Tácticos...</span>
                <div className="h-2 w-48 bg-emerald-500/20 rounded-full mx-auto overflow-hidden">
                   <div className="h-full bg-emerald-500 w-2/3 animate-pulse" />
                </div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border border-emerald-500/20 bg-black/40 flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-sm uppercase tracking-widest font-black text-emerald-400">Registros de Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
            <div className="divide-y divide-white/5">
              <LogItem type="Success" title="Sincronización_Exitosa" desc="Nodo del Club Elite Madrid validado." icon={CheckCircle2} />
              <LogItem type="Info" title="Identidad_Validada" desc="IP autorizada en sector metodología." icon={ShieldCheck} />
              <LogItem type="Warning" title="Alerta_Acceso_IA" desc="Latencia detectada en motor Gemini." icon={ShieldAlert} />
              <LogItem type="Success" title="Update_Completo" desc="Parches de seguridad v12.7 aplicados." icon={RefreshCw} />
              {logs.map((log) => (
                <LogItem key={log.id} type={log.type} title={log.title} desc={log.desc} icon={Activity} />
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t border-white/5">
             <Button variant="ghost" className="w-full h-10 border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-all" asChild>
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
    <Card className="glass-panel relative overflow-hidden group hover:scale-[1.02] transition-all border border-emerald-500/20 bg-black/20 rounded-3xl">
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

function LogItem({ type, title, desc, icon: Icon }: any) {
  const color = type === 'Success' ? 'text-emerald-400' : type === 'Warning' ? 'text-rose-400' : 'text-emerald-500';
  return (
    <div className="p-6 hover:bg-emerald-500/[0.02] transition-colors group cursor-default flex items-start gap-5">
      <div className={cn("h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12", color.replace('text', 'border'))}>
         <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="space-y-1">
         <div className="flex items-center gap-3">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", color.replace('text', 'bg'))} />
            <p className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{title}</p>
         </div>
         <p className="text-[10px] text-white/40 leading-tight uppercase font-bold">{desc}</p>
      </div>
    </div>
  );
}
