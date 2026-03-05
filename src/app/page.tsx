"use client";

import { Terminal, Database, Code2, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RebuildPage() {
  return (
    <div className="min-h-screen bg-[#070a0f] text-white flex flex-col items-center justify-center p-8 font-body">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="max-w-3xl w-full space-y-12 relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="p-6 border-2 border-primary/50 bg-primary/5 rounded-none rotate-45 cyan-glow animate-pulse">
            <Terminal className="h-12 w-12 text-primary -rotate-45" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase italic">
            SYNQ<span className="text-primary">SPORTS</span> PRO
          </h1>
          <p className="text-primary font-black tracking-[0.5em] text-xs uppercase bg-primary/10 py-2 inline-block px-4">
            Estado: Listo para Importación de Código
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 border-l-2 border-l-primary space-y-2">
            <Database className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Base de Datos</h3>
            <p className="text-xs font-bold">Firestore configurado y síncrono.</p>
          </div>
          <div className="glass-panel p-6 border-l-2 border-l-primary space-y-2">
            <Code2 className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Arquitectura</h3>
            <p className="text-xs font-bold">NextJS 15 + Tailwind + ShadCN.</p>
          </div>
          <div className="glass-panel p-6 border-l-2 border-l-primary space-y-2">
            <Rocket className="h-5 w-5 text-primary mb-2" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Despliegue</h3>
            <p className="text-xs font-bold">Protocolo de Bypass Activo.</p>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary text-black font-black rounded-none h-14 px-12 cyan-glow uppercase tracking-widest" asChild>
            <Link href="/dashboard">Entrar a la Terminal</Link>
          </Button>
        </div>

        <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] pt-12">
          Pega el código de tus archivos de GitHub para iniciar la reconstrucción.
        </div>
      </div>
    </div>
  );
}
