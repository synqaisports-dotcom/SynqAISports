"use client";

import { Zap, ShieldCheck, Globe, Activity, Monitor, Watch, UserCircle, Key } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SynqAiIndex() {
  const modules = [
    { label: "Admin Global", icon: Globe, href: "/admin-global" },
    { label: "Tactical Board", icon: Monitor, href: "/board" },
    { label: "Coach Hub", icon: BrainCircuit, href: "/dashboard" },
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
        {/* LOGO RECONSTRUCTION */}
        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/40 blur-[40px] rounded-full group-hover:bg-primary/60 transition-all duration-700 animate-pulse" />
            <div className="relative w-32 h-32 flex items-center justify-center border-2 border-primary/30 rounded-full bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(0,242,255,0.2)]">
              <svg viewBox="0 0 100 100" className="w-20 h-20 text-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.8)]">
                <path d="M30 40 C30 20, 70 20, 70 40 C70 50, 50 50, 50 60 C50 80, 10 80, 10 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="opacity-80" />
                <path d="M70 60 C70 80, 30 80, 30 60 C30 50, 50 50, 50 40 C50 20, 90 20, 90 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-0">
            <h1 className="text-7xl md:text-8xl font-headline font-bold tracking-tighter uppercase leading-none">
              Synq<span className="text-primary cyan-text-glow">AI</span>
            </h1>
            <p className="text-white/40 font-bold tracking-[1em] text-lg uppercase ml-4">
              SPORTS
            </p>
          </div>
          
          <div className="inline-flex items-center gap-3 px-4 py-1 mt-4 rounded-none border-l-2 border-primary bg-primary/5">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">PROTOCOLO_ELITE_ACTIVO</span>
          </div>
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
            <Link href="/admin-global">INICIAR_SISTEMA_DE_CONTROL</Link>
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
