
"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Users, 
  Play, 
  Pause, 
  ChevronLeft,
  Activity,
  UserCheck,
  ArrowRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

/**
 * PROTOCOLO_SMARTWATCH_V9.22.1
 * Protocolo de Sustitución Táctil (Tap-to-Tap).
 * Ajuste ergonómico del botón principal para evitar desbordamiento circular.
 * Fondo: Deep Night (#0F172A).
 */
export default function SmartwatchPage() {
  const { loading } = useAuth();
  
  // ESTADOS DE JUEGO
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [view, setView] = useState<'main' | 'subs_out' | 'subs_in'>('main');
  const [selectedOut, setSelectedOut] = useState<number | null>(null);

  // MOCK DATA (Sincronizado con el Nodo Central)
  const starters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const substitutes = [12, 14, 15, 19];

  // HAPTIC FEEDBACK ENGINE
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handleGoal = (team: 'home' | 'guest') => {
    setScore(prev => ({ ...prev, [team]: prev[team] + 1 }));
    triggerHaptic([150, 50, 150]); 
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
    triggerHaptic(60);
  };

  const startSubProcess = () => {
    setSelectedOut(null);
    setView('subs_out');
    triggerHaptic(40);
  };

  const selectPlayerOut = (num: number) => {
    setSelectedOut(num);
    setView('subs_in');
    triggerHaptic(40);
  };

  const confirmSubstitution = (numIn: number) => {
    triggerHaptic([300]); 
    console.log(`SUB_EXEC: Out #${selectedOut} -> In #${numIn}`);
    setView('main');
    setSelectedOut(null);
  };

  // SINCRO_HEARTBEAT
  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center overflow-hidden touch-none select-none p-2">
      {/* ESFERA CIRCULAR VIRTUAL */}
      <div 
        className="relative aspect-square w-full max-w-[340px] rounded-full border border-primary/30 bg-[#0F172A] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,242,255,0.15)]"
        draggable="false"
      >
        
        {/* EFECTOS TÉCNICOS */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="scan-line opacity-30" />

        {/* HEADER */}
        <div className="h-10 pt-6 flex flex-col items-center justify-center shrink-0 z-20">
           <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] cyan-text-glow">SynqAI_Watch</span>
           </div>
        </div>

        {/* VISTAS */}
        <div className="flex-1 relative z-10 flex flex-col items-center px-4 overflow-hidden">
          
          {view === 'main' && (
            <div className="w-full h-full flex flex-col items-center justify-between py-2 animate-in fade-in zoom-in-95 duration-500">
              
              <div 
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-all mt-1"
                onClick={toggleClock}
              >
                <span className={cn(
                  "text-6xl font-black font-headline tabular-nums tracking-tighter leading-none",
                  timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow"
                )}>
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center gap-1.5 mt-1 bg-black/40 px-3 py-0.5 rounded-full border border-white/5">
                   {isRunning ? <Pause className="h-3 w-3 text-primary/60" /> : <Play className="h-3 w-3 text-emerald-400" />}
                   <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">P_01</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 flex-[1.2] items-stretch mt-3">
                 <button 
                  onClick={() => handleGoal('home')}
                  className="bg-primary/5 border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center active:bg-primary active:text-black transition-all group shadow-inner"
                 >
                    <span className="text-[9px] font-black text-primary/60 uppercase mb-1">LOC</span>
                    <span className="text-4xl font-black text-white group-active:text-black">{score.home}</span>
                 </button>
                 <button 
                  onClick={() => handleGoal('guest')}
                  className="bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl flex flex-col items-center justify-center active:bg-rose-500 active:text-white transition-all group shadow-inner"
                 >
                    <span className="text-[9px] font-black text-rose-400/60 uppercase mb-1">VIS</span>
                    <span className="text-4xl font-black text-white group-active:text-white">{score.guest}</span>
                 </button>
              </div>

              {/* AJUSTE ERGONÓMICO v9.22.1: El botón no desborda la curva inferior */}
              <button 
                onClick={startSubProcess}
                className="w-[85%] h-12 mt-2 bg-white/5 border-2 border-white/10 rounded-[2rem] flex items-center justify-center gap-3 active:bg-white/20 transition-all active:scale-95 shrink-0 shadow-lg"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">SUSTITUCIÓN</span>
              </button>
            </div>
          )}

          {view === 'subs_out' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-bottom-6 duration-500">
               <div className="flex items-center justify-between py-2 shrink-0">
                  <button onClick={() => setView('main')} className="p-2 bg-white/5 rounded-full active:bg-primary/20"><X className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">¿QUIÉN SALE? (OUT)</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-10">
                  {starters.map(num => (
                    <button 
                      key={num} 
                      onClick={() => selectPlayerOut(num)}
                      className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl flex items-center justify-between active:bg-primary active:text-black group transition-all"
                    >
                       <span className="text-sm font-black italic text-white group-active:text-black">#{num}</span>
                       <span className="text-[8px] font-black uppercase text-rose-400/60 group-active:text-black">Titular</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {view === 'subs_in' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-right-6 duration-500">
               <div className="flex items-center justify-between py-2 shrink-0">
                  <button onClick={() => setView('subs_out')} className="p-2 bg-white/5 rounded-full active:bg-primary/20"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">¿QUIÉN ENTRA? (IN)</span>
                  <div className="w-8" />
               </div>
               <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl mb-2 text-center">
                  <span className="text-[8px] font-black text-white uppercase italic">Sustituyendo a #{selectedOut}</span>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-10">
                  {substitutes.map(num => (
                    <button 
                      key={num} 
                      onClick={() => confirmSubstitution(num)}
                      className="w-full p-4 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-between active:bg-emerald-500 active:text-black group transition-all"
                    >
                       <span className="text-sm font-black italic text-white group-active:text-black">#{num}</span>
                       <UserCheck className="h-4 w-4 text-emerald-400 group-active:text-black" />
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>

        {/* STATUS BAR */}
        <div className="h-12 pb-6 flex items-center justify-center gap-4 shrink-0 z-20">
           <div className="flex items-center gap-2 px-4 py-1 bg-black/40 rounded-full border border-white/5">
              <Activity className="h-2.5 w-2.5 text-emerald-400 animate-pulse" />
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">SYNC_ESTABLISHED</span>
           </div>
        </div>

      </div>
    </div>
  );
}
