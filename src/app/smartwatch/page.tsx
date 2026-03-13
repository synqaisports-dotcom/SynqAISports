
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Zap, 
  Watch, 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Trophy, 
  ChevronLeft,
  ChevronRight,
  Activity,
  UserCheck,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

/**
 * PROTOCOLO_SMARTWATCH_V2.5
 * Diseño circular "Fat Finger" optimizado para alta competición.
 */
export default function SmartwatchPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  
  // ESTADOS DE JUEGO (Sincronizados vía LocalStorage para el prototipo)
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [view, setView] = useState<'main' | 'subs' | 'stats'>('main');

  // HAPTIC FEEDBACK ENGINE
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handleGoal = (team: 'home' | 'guest') => {
    setScore(prev => ({ ...prev, [team]: prev[team] + 1 }));
    triggerHaptic([100, 50, 100]); // Doble pulso para GOL
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
    triggerHaptic(50); // Pulso corto
  };

  const handleSubConfirm = () => {
    triggerHaptic([300]); // Pulso largo para confirmar cambio
    setView('main');
  };

  // SINCRONIZACIÓN CON EL "HEARTBEAT" DE LA PIZARRA MASTER
  useEffect(() => {
    const syncMaster = () => {
      // En un entorno real esto vendría de una suscripción a Firestore
      const masterState = localStorage.getItem("synq_match_master");
      if (masterState) {
        const data = JSON.parse(masterState);
        // Sincronizar solo si hay cambios significativos
        if (Math.abs(data.timeLeft - timeLeft) > 2) setTimeLeft(data.timeLeft);
        setIsRunning(data.isRunning);
        setScore(data.score);
      }
    };

    const interval = setInterval(() => {
      if (isRunning) setTimeLeft(prev => Math.max(0, prev - 1));
      syncMaster();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-[#04070c] flex items-center justify-center overflow-hidden touch-none select-none p-4">
      {/* ESFERA CIRCULAR VIRTUAL (Para visualización en navegador) */}
      <div className="relative aspect-square w-full max-w-[320px] rounded-full border border-primary/20 bg-black overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,242,255,0.1)]">
        
        {/* SCAN LINES & EFFECTS */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="scan-line opacity-20" />

        {/* HEADER MINI */}
        <div className="h-12 pt-4 flex flex-col items-center justify-center shrink-0 z-20">
           <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">SynqAI_Watch</span>
           </div>
        </div>

        {/* VISTAS DINÁMICAS */}
        <div className="flex-1 relative z-10 flex flex-col items-center px-6">
          
          {view === 'main' && (
            <div className="w-full h-full flex flex-col items-center justify-between py-2 animate-in fade-in zoom-in-95">
              {/* TIEMPO */}
              <div 
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
                onClick={toggleClock}
              >
                <span className={cn(
                  "text-5xl font-black font-headline tabular-nums tracking-tighter leading-none",
                  timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow"
                )}>
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center gap-1 mt-1">
                   {isRunning ? <Pause className="h-3 w-3 text-primary/40" /> : <Play className="h-3 w-3 text-emerald-400" />}
                   <span className="text-[7px] font-black text-white/30 uppercase">PERIOD_01</span>
                </div>
              </div>

              {/* MARCADOR "FAT FINGER" (OCUPA EL 40% DE LA PANTALLA) */}
              <div className="w-full grid grid-cols-2 gap-2 flex-1 items-center mt-2">
                 <button 
                  onClick={() => handleGoal('home')}
                  className="h-full bg-primary/10 border border-primary/30 rounded-2xl flex flex-col items-center justify-center active:bg-primary active:text-black transition-all group"
                 >
                    <span className="text-[8px] font-black text-primary uppercase mb-1 group-active:text-black">LOC</span>
                    <span className="text-3xl font-black text-white group-active:text-black">{score.home}</span>
                 </button>
                 <button 
                  onClick={() => handleGoal('guest')}
                  className="h-full bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col items-center justify-center active:bg-rose-500 active:text-white transition-all group"
                 >
                    <span className="text-[8px] font-black text-rose-400 uppercase mb-1 group-active:text-white">VIS</span>
                    <span className="text-3xl font-black text-white group-active:text-white">{score.guest}</span>
                 </button>
              </div>

              {/* ACCESO A SUBS */}
              <button 
                onClick={() => setView('subs')}
                className="w-full h-12 mt-2 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 active:bg-white/20"
              >
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest">Sustitución</span>
              </button>
            </div>
          )}

          {view === 'subs' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setView('main')} className="p-2"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[8px] font-black text-primary uppercase">Roster_Active</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 pb-8">
                  {[10, 7, 9].map(num => (
                    <div 
                      key={num} 
                      onClick={handleSubConfirm}
                      className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between active:bg-primary active:text-black group transition-all"
                    >
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black italic">#{num}</span>
                          <span className="text-[9px] font-bold uppercase opacity-40 group-active:opacity-100">JUGADOR_ID</span>
                       </div>
                       <UserCheck className="h-3 w-3 text-primary group-active:text-black" />
                    </div>
                  ))}
                  <div className="p-4 border border-dashed border-white/10 rounded-xl text-center">
                     <span className="text-[7px] font-bold text-white/20 uppercase">Fin de Lista</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* BARRA INFERIOR DE ESTADO */}
        <div className="h-10 pb-4 flex items-center justify-center gap-4 shrink-0 z-20">
           <Activity className="h-2 w-2 text-emerald-400 animate-pulse" />
           <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Live_Sync_Established</span>
        </div>

      </div>
    </div>
  );
}
