"use client";

import { useState, useEffect } from "react";
import { Trophy, Clock, Save, UserCog, History } from "lucide-react";
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
    <div className="flex-1 flex flex-col bg-black overflow-hidden font-body relative">
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6 lg:gap-10 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-lg font-headline font-black text-white italic tracking-tighter uppercase leading-none truncate">Terminal</h1>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 px-4 md:px-8 py-2.5 bg-primary/5 border border-primary/20 rounded-2xl shrink-0">
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">L</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40">-</button>
                  <span className="text-2xl font-black font-headline text-primary tabular-nums">{score.home}</span>
                  <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40">+</button>
                </div>
             </div>
             <div className="w-[1px] h-6 bg-white/10" />
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40">-</button>
                  <span className="text-2xl font-black font-headline text-primary tabular-nums">{score.guest}</span>
                  <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-5 w-5 flex items-center justify-center rounded-lg border border-primary/20 text-primary/40">+</button>
                </div>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">V</span>
             </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl shrink-0">
             <Clock className={cn("h-3.5 w-3.5", isRunning ? "text-primary animate-spin" : "text-white/20")} />
             <span className="text-xl font-black font-headline text-white/80 tabular-nums">{formatTime(timer)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 rounded-xl cyan-glow border-none">
            <Save className="h-4 w-4 mr-2" /> <span className="hidden md:inline">Guardar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex" />
        <main className="flex-1 relative overflow-hidden">
          <TacticalField theme="cyan" />
        </main>
      </div>
    </div>
  );
}