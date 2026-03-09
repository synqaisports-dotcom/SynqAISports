
"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Save, LayoutGrid, Play, Pause, RotateCcw, Timer, ChevronDown } from "lucide-react";
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

const TIME_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "25 min", value: 25 },
  { label: "30 min", value: 30 },
  { label: "35 min", value: 35 },
  { label: "45 min", value: 45 },
];

export default function MatchBoardPage() {
  const [timeLeft, setTimeLeft] = useState(45 * 60);
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

  const handleSetPreset = (minutes: string) => {
    setIsRunning(false);
    setTimeLeft(parseInt(minutes) * 60);
  };

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden font-body relative">
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        {/* IDENTIDAD Y SELECTOR DE CAMPO */}
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-lg font-headline font-black text-white italic tracking-tighter uppercase leading-none truncate">Partido</h1>
          </div>

          <div className="hidden lg:block">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[140px] h-10 bg-white/5 border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Campo" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-primary/20">
                <SelectItem value="f11" className="text-[9px] font-black uppercase">Fútbol 11</SelectItem>
                <SelectItem value="f7" className="text-[9px] font-black uppercase">Fútbol 7</SelectItem>
                <SelectItem value="futsal" className="text-[9px] font-black uppercase">Fútbol Sala</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TERMINAL CENTRAL: MARCADOR Y CRONÓMETRO (MINIMALISTA) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 bg-primary/5 border border-primary/20 rounded-[2rem] shadow-[0_0_30px_rgba(0,242,255,0.05)]">
          {/* LOCAL */}
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">L</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 transition-all active:scale-90">-</button>
              <span className="text-2xl font-black font-headline text-white tabular-nums min-w-[20px] text-center">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 transition-all active:scale-90">+</button>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-white/10 mx-2" />

          {/* CRONÓMETRO CENTRAL */}
          <div className="flex flex-col items-center justify-center min-w-[120px] group">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn(
                "text-2xl font-black font-headline tabular-nums tracking-tighter transition-all",
                timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow"
              )}>
                {formatTime(timeLeft)}
              </span>
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                  isRunning ? "bg-amber-500 text-black" : "bg-primary text-black"
                )}
              >
                {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Select onValueChange={handleSetPreset}>
                <SelectTrigger className="h-5 bg-transparent border-none p-0 text-[8px] font-black uppercase text-white/20 hover:text-primary transition-colors focus:ring-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>Preset</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {TIME_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value.toString()} className="text-[9px] font-black uppercase">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => { setIsRunning(false); setTimeLeft(45 * 60); }} className="text-[8px] font-black text-white/20 hover:text-rose-400 uppercase flex items-center gap-1 transition-colors">
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-white/10 mx-2" />

          {/* VISITANTE */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 transition-all active:scale-90">-</button>
              <span className="text-2xl font-black font-headline text-white tabular-nums min-w-[20px] text-center">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 transition-all active:scale-90">+</button>
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">V</span>
          </div>
        </div>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 rounded-xl cyan-glow border-none hover:scale-105 transition-all">
            <Save className="h-4 w-4 mr-2" /> <span className="hidden md:inline">Guardar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        {/* BARRA DE HERRAMIENTAS FLOTANTE IZQUIERDA */}
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex" />
        
        {/* CAMPO TÁCTICO OCUPANDO EL 100% */}
        <main className="flex-1 relative overflow-hidden">
          <TacticalField theme="cyan" fieldType={fieldType} />
        </main>
      </div>
    </div>
  );
}
