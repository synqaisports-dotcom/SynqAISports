"use client";

import { Zap, ShieldCheck, Globe, Activity, Monitor, Watch, UserCircle, Key } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SynqAiIndex() {
  const modules = [
    { label: "Admin Global", icon: Globe, href: "/admin-global" },
    { label: "Tactical Board", icon: Monitor, href: "/board" },
    { label: "Coach Hub", icon: BrainCircuit, href: "/coach" },
    { label: "Analytics", icon: Activity, href: "/analytics" },
    { label: "Smartwatch", icon: Watch, href: "/smartwatch" },
    { label: "Tutor Portal", icon: UserCircle, href: "/tutor" },
    { label: "Admin Club", icon: ShieldCheck, href: "/admin" },
    { label: "Acceso", icon: Key, href: "/login" },
  ];

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-8 font-body overflow-hidden relative">
      <div className="scan-line" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-6xl w-full space-y-16 relative z-10 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full border border-primary/30 bg-primary/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary cyan-text-glow">ESTADO_NÚCLEO: ÓPTIMO</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-headline font-black tracking-tighter uppercase italic leading-none">
            SYNQ<span className="text-primary italic cyan-text-glow">AI</span> <br />
            <span className="text-white/10">SPORTS</span>
          </h1>
          
          <p className="text-white/40 font-bold tracking-[0.6em] text-[10px] uppercase max-w-lg mx-auto leading-loose">
            Arquitectura de Inteligencia Deportiva <br /> 
            <span className="text-primary/60 tracking-[0.2em]">Protocolo Elite Activo</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {modules.map((node, i) => (
            <Link key={i} href={node.href || "#"} className="group p-8 glass-panel border border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1">
              <node.icon className="h-6 w-6 text-white/20 group-hover:text-primary mx-auto mb-4 transition-colors group-hover:scale-110" />
              <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors group-hover:cyan-text-glow">
                {node.label}
              </h3>
            </Link>
          ))}
        </div>

        <div className="pt-12">
          <Button size="lg" className="bg-primary text-black font-black rounded-none h-16 px-16 cyan-glow uppercase tracking-[0.3em] text-xs hover:scale-105 transition-transform" asChild>
            <Link href="/admin-global">INICIAR_COMANDO_CENTRAL</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

const BrainCircuit = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h2z"/><path d="M16.5 16a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h2z"/><path d="M10 5.5v13"/><path d="M10 11.5h10"/><path d="M14 7.5v8"/><path d="M14 11.5h3"/>
  </svg>
);
