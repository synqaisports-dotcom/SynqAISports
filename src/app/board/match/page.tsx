
"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Save, LayoutGrid, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const TIME_PRESETS = [15, 20, 25, 30, 35, 45];

export default function MatchBoardPage() {
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 min por defecto
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetPreset = (minutes: number) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden font-body relative">
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6 lg:gap-10 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-lg font-headline font-black text-white italic tracking-tighter uppercase leading-none truncate">Terminal de Partido</h1>
          </div>

          <div className="hidden md:block">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[160px] h-11 bg-white/5 border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Superficie" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-primary/20">
                <SelectItem value="f11" className="text-[10px] font-black uppercase">Fútbol 11</SelectItem>
                <SelectItem value="f7" className="text-[10px] font-black uppercase">Fútbol 7</SelectItem>
                <SelectItem value="futsal" className="text-[10px] font-black uppercase">Fútbol Sala</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 px-4 md:px-8 py-2.5 bg-primary/5 border border-primary/20 rounded-2xl shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">L</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary transition-colors">-</button>
                  <span className="text-2xl font-black font-headline text-primary tabular-nums">{score.home}</span>
                  <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary transition-colors">+</button>
                </div>
             </div>
             <div className="w-[1px] h-6 bg-white/10" />
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary transition-colors">-</button>
                  <span className="text-2xl font-black font-headline text-primary tabular-nums">{score.guest}</span>
                  <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40 hover:text-primary transition-colors">+</button>
                </div>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">V</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 rounded-xl cyan-glow border-none hover:scale-105 transition-all">
            <Save className="h-4 w-4 mr-2" /> <span className="hidden md:inline">Guardar Partido</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex" />
        
        {/* PANEL DE CRONÓMETRO FLOTANTE */}
        <aside className="absolute right-6 top-1/2 -translate-y-1/2 w-72 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col p-6 gap-6 z-50 shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Timer className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Countdown_Control</span>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center group hover:border-primary/40 transition-all">
              <span className={cn(
                "text-5xl font-black font-headline tabular-nums tracking-tighter transition-all",
                timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-white cyan-text-glow"
              )}>
                {formatTime(timeLeft)}
              </span>
              <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.3em] mt-2">Sincro_Reloj_Nativo</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                  isRunning ? "bg-amber-500 text-black" : "bg-primary text-black cyan-glow"
                )}
              >
                {isRunning ? <><Pause className="h-4 w-4 mr-2" /> Pausa</> : <><Play className="h-4 w-4 mr-2" /> Iniciar</>}
              </Button>
              <Button 
                variant="outline"
                onClick={() => { setIsRunning(false); setTimeLeft(45 * 60); }}
                className="h-12 border-white/10 text-white/40 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">Preconfiguración_Minutos</span>
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetPreset(mins)}
                  className="h-10 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-white/40 hover:border-primary/40 hover:text-primary transition-all active:scale-90"
                >
                  {mins}'
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
             <p className="text-[8px] text-primary/40 font-bold uppercase leading-relaxed text-center italic">
               Ajuste el tiempo según el periodo. El sistema bloqueará la pizarra al finalizar el tiempo si el protocolo está activo.
             </p>
          </div>
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <TacticalField theme="cyan" fieldType={fieldType} />
        </main>
      </div>
    </div>
  );
}
