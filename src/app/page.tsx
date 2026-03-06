
"use client";

import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Activity, 
  Monitor, 
  Watch, 
  UserCircle, 
  Key, 
  BrainCircuit, 
  Cpu, 
  Users, 
  LayoutDashboard,
  ArrowRight,
  Database,
  Network
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SynqAiIndex() {
  const categories = [
    {
      title: "Núcleo de Control",
      description: "Administración global y gestión de red",
      color: "text-emerald-400",
      nodes: [
        { label: "Admin Global", icon: LayoutDashboard, href: "/admin-global" },
        { label: "Red de Clubes", icon: Globe, href: "/admin-global/clubs" },
        { label: "Gestión de Usuarios", icon: Users, href: "/admin-global/users" },
      ]
    },
    {
      title: "Operativa Élite",
      description: "Terminales de rendimiento y táctica",
      color: "text-primary",
      nodes: [
        { label: "Coach Hub", icon: Cpu, href: "/dashboard" },
        { label: "Tactical Board", icon: Monitor, href: "/board" },
        { label: "Neural Planner", icon: BrainCircuit, href: "/dashboard/coach/planner" },
      ]
    },
    {
      title: "Sincronización",
      description: "Terminales de acceso y telemetría",
      color: "text-white/40",
      nodes: [
        { label: "Smartwatch", icon: Watch, href: "/smartwatch" },
        { label: "Tutor Portal", icon: UserCircle, href: "/tutor" },
        { label: "Acceso Sistema", icon: Key, href: "/login" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#04070c] text-white flex flex-col items-center justify-center p-6 md:p-12 font-body overflow-hidden relative">
      {/* CAPA TÉCNICA DE FONDO */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.08),transparent_70%)] pointer-events-none" />
      <div className="scan-line" />

      {/* MONITOR DE ESTADO SUPERIOR */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none opacity-40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em]">System_Online_v1.0</span>
          </div>
          <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">Sincronización Local: Estable</span>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
           <span className="text-[8px] font-black uppercase tracking-[0.5em]">Protocolo_Elite_Activo</span>
           <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em]">IP: 192.168.1.104_HQ</span>
        </div>
      </div>

      <div className="max-w-7xl w-full space-y-24 relative z-10 flex flex-col items-center">
        
        {/* LOGO RECONSTRUCTION AREA */}
        <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full group-hover:bg-primary/50 transition-all duration-700 animate-pulse" />
            <div className="relative w-40 h-40 flex items-center justify-center border border-primary/20 rounded-full bg-black/60 backdrop-blur-xl shadow-[0_0_80px_rgba(0,242,255,0.1)] group-hover:border-primary/50 transition-all duration-500">
              <svg viewBox="0 0 100 100" className="w-24 h-24 text-primary drop-shadow-[0_0_20px_rgba(0,242,255,0.6)]">
                <path d="M30 40 C30 20, 70 20, 70 40 C70 50, 50 50, 50 60 C50 80, 10 80, 10 60" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="opacity-40" />
                <path d="M70 60 C70 80, 30 80, 30 60 C30 50, 50 50, 50 40 C50 20, 90 20, 90 40" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-full opacity-20" />
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <h1 className="text-7xl md:text-9xl font-headline font-black tracking-tighter uppercase leading-none italic cyan-text-glow">
              Synq<span className="text-primary">AI</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] w-12 bg-primary/20" />
               <p className="text-white/40 font-black tracking-[1.2em] text-sm md:text-lg uppercase">
                 SPORTS_PRO
               </p>
               <div className="h-[1px] w-12 bg-primary/20" />
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <Button size="lg" className="bg-primary text-black font-black rounded-none h-16 px-16 cyan-glow uppercase tracking-[0.4em] text-xs hover:scale-105 transition-all shadow-[0_0_40px_rgba(0,242,255,0.3)] border-none" asChild>
              <Link href="/login">INICIAR_SISTEMA_DE_CONTROL</Link>
            </Button>
            <div className="flex items-center gap-8 opacity-30">
               <div className="flex items-center gap-2">
                  <Database className="h-3 w-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">PostgreSQL_Neural</span>
               </div>
               <div className="flex items-center gap-2">
                  <Network className="h-3 w-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Multi-Tenant_Sync</span>
               </div>
            </div>
          </div>
        </div>

        {/* NODES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="px-4 space-y-1">
                <div className="flex items-center gap-2">
                   <div className={cn("h-1 w-1 rounded-full bg-current", cat.color)} />
                   <h3 className={cn("text-[10px] font-black uppercase tracking-[0.4em]", cat.color)}>{cat.title}</h3>
                </div>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-3">{cat.description}</p>
              </div>

              <div className="grid gap-3">
                {cat.nodes.map((node, i) => (
                  <Link 
                    key={i} 
                    href={node.href} 
                    className="group flex items-center gap-4 p-5 glass-panel border border-white/5 hover:border-primary/40 transition-all duration-500 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <node.icon className="h-5 w-5 text-white/20 group-hover:text-primary transition-all group-hover:scale-110 relative z-10" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors relative z-10 group-hover:emerald-text-glow">
                      {node.label}
                    </span>
                    <ArrowRight className="h-3 w-3 ml-auto text-white/5 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER METRICS */}
        <div className="pt-12 w-full border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20">
           <div className="flex gap-12">
              <div className="text-center md:text-left">
                 <p className="text-[7px] font-black uppercase tracking-widest mb-1">Carga IA</p>
                 <p className="text-xs font-black italic">0.14ms</p>
              </div>
              <div className="text-center md:text-left">
                 <p className="text-[7px] font-black uppercase tracking-widest mb-1">Nodos Activos</p>
                 <p className="text-xs font-black italic">1.2k</p>
              </div>
              <div className="text-center md:text-left">
                 <p className="text-[7px] font-black uppercase tracking-widest mb-1">Latencia Red</p>
                 <p className="text-xs font-black italic">ESTABLE</p>
              </div>
           </div>
           <p className="text-[7px] font-black uppercase tracking-[0.8em]">SynqSports_Neural_Systems_2024</p>
        </div>
      </div>
    </div>
  );
}
