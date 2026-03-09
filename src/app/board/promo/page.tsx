
"use client";

import { useState } from "react";
import { Zap, Lock, ArrowRight, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TacticalField } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";

export default function PromoBoardPage() {
  const [exercisesCount, setExercisesCount] = useState(2);
  const MAX_EXERCISES = 4;

  const isLocked = exercisesCount >= MAX_EXERCISES;

  return (
    <div className="h-screen flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Tactical_Board_PROMO_MODE</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">Versión Gratuita</h1>
          </div>
          
          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3">
             <span className="text-[9px] font-black text-primary uppercase">CAPACIDAD:</span>
             <div className="h-1.5 w-24 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-1000", isLocked ? "bg-rose-500" : "bg-primary")} 
                  style={{ width: `${(exercisesCount / MAX_EXERCISES) * 100}%` }} 
                />
             </div>
             <span className="text-[10px] font-black text-white">{exercisesCount}/{MAX_EXERCISES}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-[10px] font-black uppercase text-white/40 hover:text-white" asChild>
            <Link href="/">Saber Más</Link>
          </Button>
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow border-none" asChild>
            <Link href="/login">Obtener Acceso Pro <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2" />

        <main className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
          <TacticalField theme="cyan" showWatermark />

          {isLocked && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <Lock className="h-20 w-20 text-primary relative z-10" />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Protocolo de Capacidad Lleno</h3>
              <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] max-w-md mx-auto leading-relaxed">
                Has alcanzado el límite de {MAX_EXERCISES} sesiones en modo promocional. Sincroniza tu club con el Plan Élite para desbloquear almacenamiento ilimitado y funciones IA avanzadas.
              </p>
              <Button className="h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] px-12 rounded-2xl cyan-glow border-none" asChild>
                <Link href="/login">Actualizar a Plan Pro <Sparkles className="h-4 w-4 ml-3" /></Link>
              </Button>
            </div>
          )}
        </main>

        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-8 flex flex-col shrink-0 z-50">
           <div className="mt-auto space-y-6">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4">
                 <div className="flex items-center gap-3">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Ventajas Pro</span>
                 </div>
                 <ul className="space-y-3">
                    <li className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="h-3 w-3 text-primary" /> Guardado Ilimitado
                    </li>
                    <li className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="h-3 w-3 text-primary" /> Analítica IA Gemini
                    </li>
                    <li className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="h-3 w-3 text-primary" /> Exportación Video HD
                    </li>
                 </ul>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
