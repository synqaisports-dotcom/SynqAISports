
"use client";

import { useState, useEffect } from "react";
import { 
  Monitor, 
  MousePointer2, 
  Pencil, 
  Type, 
  Square, 
  Circle as CircleIcon, 
  ArrowUpRight, 
  Save, 
  Video,
  Trash2,
  Undo2,
  Redo2,
  Clock,
  Trophy,
  ChevronDown,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Selección' },
  { id: 'draw', icon: Pencil, label: 'Trazo Libre' },
  { id: 'text', icon: Type, label: 'Texto Táctico' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Flecha de Movimiento' },
];

export default function MatchBoardPage() {
  const [activeTool, setActiveTool] = useState('select');
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
      {/* HEADER DE COMPETICIÓN */}
      <header className="h-20 border-b border-white/5 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Board_Elite_v1.0</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">Pizarra de Partido</h1>
          </div>

          {/* MARCADOR TÁCTICO */}
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

          {/* CRONÓMETRO */}
          <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl">
             <Clock className={cn("h-4 w-4", isRunning ? "text-primary animate-spin" : "text-white/20")} />
             <span className="text-2xl font-black font-headline text-white/80 tabular-nums">{formatTime(timer)}</span>
             <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-black uppercase text-primary"
              onClick={() => setIsRunning(!isRunning)}
             >
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
        {/* BARRA DE HERRAMIENTAS */}
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
                activeTool === tool.id 
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] scale-110" 
                  : "text-white/20 hover:text-white"
              )}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
          ))}
          <div className="w-8 h-[1px] bg-white/10 my-2" />
          <button className="text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
        </aside>

        {/* CAMPO DE JUEGO */}
        <main className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
          <div className="relative w-full max-w-6xl aspect-[1.6/1] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
             <div className="absolute inset-0 bg-[#0a0f18]" />
             <div className="absolute inset-8 border-2 border-white/5 rounded-sm">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/5 rounded-full" />
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-64 border-2 border-white/5 border-l-0" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-64 border-2 border-white/5 border-r-0" />
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white/5 uppercase tracking-[2em] rotate-12">MATCH_MODE_ACTIVE</span>
             </div>
          </div>
        </main>

        {/* PANEL DE JUGADORES */}
        <aside className="w-72 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-6 flex flex-col shrink-0 z-50">
          <h3 className="text-[10px] font-black uppercase text-primary mb-6 tracking-widest">Titulares Sincronizados</h3>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-move">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-black font-black text-xs">{i}</div>
                <span className="text-[10px] font-black text-white/60 uppercase">JUGADOR_0{i}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
