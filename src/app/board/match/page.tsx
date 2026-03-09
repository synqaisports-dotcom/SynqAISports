
"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Video, Save, UserCog, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";

export default function MatchBoardPage() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden font-body">
      {/* Cabecera Técnica de Alta Competición */}
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Protocolo_Match_Live</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">Terminal de Partido</h1>
          </div>

          {/* Marcador Digital */}
          <div className="flex items-center gap-6 px-8 py-2.5 bg-primary/5 border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(0,242,255,0.05)]">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">LOCAL</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary hover:border-primary/60 transition-all">-</button>
                  <span className="text-3xl font-black font-headline text-primary cyan-text-glow tabular-nums">{score.home}</span>
                  <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary hover:border-primary/60 transition-all">+</button>
                </div>
             </div>
             <div className="w-[1px] h-8 bg-white/10" />
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary hover:border-primary/60 transition-all">-</button>
                  <span className="text-3xl font-black font-headline text-primary cyan-text-glow tabular-nums">{score.guest}</span>
                  <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary hover:border-primary/60 transition-all">+</button>
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">VISITANTE</span>
             </div>
          </div>

          {/* Cronómetro Operativo */}
          <div className="flex items-center gap-4 px-6 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
             <Clock className={cn("h-4 w-4 transition-all", isRunning ? "text-primary animate-spin" : "text-white/20")} />
             <span className="text-2xl font-black font-headline text-white/80 tabular-nums tracking-wider">{formatTime(timer)}</span>
             <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isRunning ? "text-rose-400 hover:bg-rose-500/10" : "text-primary hover:bg-primary/10"
              )} 
              onClick={() => setIsRunning(!isRunning)}
             >
               {isRunning ? "PAUSA" : "INICIAR"}
             </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 border-white/10 text-white/40 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 rounded-2xl px-8 transition-all">
            <History className="h-4 w-4 mr-3" /> Historial
          </Button>
          <Button className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] px-10 rounded-2xl cyan-glow border-none shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            <Save className="h-4 w-4 mr-3" /> Guardar Táctica
          </Button>
        </div>
      </header>

      {/* Entorno de Pizarra */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toolbar Flotante Izquierdo */}
        <BoardToolbar theme="cyan" className="absolute left-8 top-1/2 -translate-y-1/2 z-50 shadow-2xl" />

        {/* Campo Táctico Proporcional */}
        <main className="flex-1 relative">
          <TacticalField theme="cyan" />
        </main>

        {/* Panel de Gestión de Activos (Derecha) */}
        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-8 flex flex-col shrink-0 z-50 overflow-hidden">
          <div className="flex flex-col gap-1 mb-8">
            <h3 className="text-[11px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-3">
              <UserCog className="h-4 w-4" /> Nodo Atletas
            </h3>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Sincronización Local Activa</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-black text-xs shadow-[0_0_15px_rgba(0,242,255,0.1)] group-hover:bg-primary group-hover:text-black transition-all">
                    {i}
                  </div>
                  <span className="text-[10px] font-black text-white/40 uppercase group-hover:text-white transition-colors">Jugador_{i.toString().padStart(2, '0')}</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/20 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
             <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-2">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Estado de Red</span>
                <p className="text-[10px] font-bold text-primary/40 uppercase leading-relaxed">Conexión encriptada con el Nodo de Cantera estable.</p>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
