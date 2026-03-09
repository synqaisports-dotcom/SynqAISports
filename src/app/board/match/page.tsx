
"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Video, Save, UserCog } from "lucide-react";
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
    <div className="h-screen flex flex-col bg-black overflow-hidden">
      <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Board_Elite_v1.0</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">Pizarra de Partido</h1>
          </div>

          <div className="flex items-center gap-4 px-6 py-2 bg-primary/5 border border-primary/20 rounded-2xl shadow-[0_0_20px_rgba(0,242,255,0.05)]">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white/40 uppercase">LOCAL</span>
                <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-primary/40 hover:text-primary">-</button>
                <span className="text-2xl font-black font-headline text-primary cyan-text-glow">{score.home}</span>
                <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-primary/40 hover:text-primary">+</button>
             </div>
             <div className="w-[1px] h-8 bg-white/10 mx-2" />
             <div className="flex items-center gap-3">
                <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-primary/40 hover:text-primary">-</button>
                <span className="text-2xl font-black font-headline text-primary cyan-text-glow">{score.guest}</span>
                <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-primary/40 hover:text-primary">+</button>
                <span className="text-[10px] font-black text-white/40 uppercase">VISITANTE</span>
             </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl">
             <Clock className={cn("h-4 w-4", isRunning ? "text-primary animate-spin" : "text-white/20")} />
             <span className="text-2xl font-black font-headline text-white/80 tabular-nums">{formatTime(timer)}</span>
             <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary" onClick={() => setIsRunning(!isRunning)}>
               {isRunning ? "PAUSA" : "INICIAR"}
             </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 rounded-xl px-6">
            <Video className="h-4 w-4 mr-2" /> Grabar Clip
          </Button>
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow">
            <Save className="h-4 w-4 mr-2" /> Guardar Táctica
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2" />

        <main className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
          <TacticalField theme="cyan" />
        </main>

        <aside className="w-72 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-6 flex flex-col shrink-0 z-50">
          <h3 className="text-[10px] font-black uppercase text-primary mb-6 tracking-widest flex items-center gap-2">
            <UserCog className="h-3 w-3" /> Titulares Sincronizados
          </h3>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-move group">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                  {i}
                </div>
                <span className="text-[10px] font-black text-white/60 uppercase group-hover:text-white transition-colors">JUGADOR_0{i}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
