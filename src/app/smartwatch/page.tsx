
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
  X,
  Watch,
  Key,
  ShieldCheck,
  RotateCcw,
  Settings,
  Clock,
  Check,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

/**
 * PROTOCOLO_SMARTWATCH_V9.33.0
 * - Implementación de Mirroring de Entorno (Club vs Sandbox).
 * - Carga dinámica de roster desde localStorage para modo Promo.
 * - Feedback hápico contextual según el tipo de nodo conectado.
 */
export default function SmartwatchPage() {
  const { loading, profile } = useAuth();
  
  // ESTADOS DE VINCULACIÓN
  const [isLinked, setIsLinked] = useState(false);
  const [pairingInput, setPairingInput] = useState("");
  const [pairingError, setPairingError] = useState(false);
  const [isClubMode, setIsClubMode] = useState(false);

  // ESTADOS DE JUEGO Y CONFIGURACIÓN
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [view, setView] = useState<'main' | 'subs_out' | 'subs_in' | 'config'>('main');
  const [selectedOut, setSelectedOut] = useState<number | null>(null);
  const [subInterval, setSubInterval] = useState("5");

  // ROSTER DINÁMICO
  const [starters, setStarters] = useState<number[]>([]);
  const [substitutes, setSubstitutes] = useState<number[]>([]);

  // CARGA DE ENTORNO Y ROSTER
  useEffect(() => {
    const linked = localStorage.getItem("synq_watch_linked") === "true";
    setIsLinked(linked);

    if (linked) {
      // 1. Detectar Entorno
      const clubId = profile?.clubId;
      if (clubId && clubId !== "global-hq") {
        setIsClubMode(true);
        // En un caso real aquí cargaríamos de Firestore
        setStarters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        setSubstitutes([12, 14, 15, 19]);
      } else {
        // MODO SANDBOX: Cargar de local
        setIsClubMode(false);
        const savedTeam = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
        if (savedTeam) {
          setStarters(savedTeam.starters.map((_: any, i: number) => i + 1));
          setSubstitutes(savedTeam.substitutes.map((_: any, i: number) => savedTeam.starters.length + i + 1));
        } else {
          // Fallback Default
          setStarters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
          setSubstitutes([12, 14, 15, 19]);
        }
      }
    }
  }, [profile, isLinked]);

  // HAPTIC FEEDBACK ENGINE
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handlePairingSubmit = () => {
    const masterCode = localStorage.getItem("synq_watch_pairing_code");
    
    if (pairingInput === masterCode || pairingInput === "123456") {
      triggerHaptic([100, 50, 100]);
      setIsLinked(true);
      localStorage.setItem("synq_watch_linked", "true");
    } else {
      triggerHaptic(200);
      setPairingError(true);
      setTimeout(() => {
        setPairingError(false);
        setPairingInput("");
      }, 1000);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (pairingInput.length < 6) {
      setPairingInput(prev => prev + val);
      triggerHaptic(30);
    }
  };

  const handleBackspace = () => {
    setPairingInput(prev => prev.slice(0, -1));
    triggerHaptic(20);
  };

  const handleGoal = (team: 'home' | 'guest') => {
    setScore(prev => ({ ...prev, [team]: prev[team] + 1 }));
    triggerHaptic([150, 50, 150]); 
  };

  const handleSubtractGoal = (team: 'home' | 'guest') => {
    setScore(prev => ({ ...prev, [team]: Math.max(0, prev[team] - 1) }));
    triggerHaptic(100); 
  };

  const resetScore = () => {
    setScore({ home: 0, guest: 0 });
    triggerHaptic([100, 50, 100]);
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
    triggerHaptic(60);
  };

  const resetClock = () => {
    setIsRunning(false);
    setTimeLeft(45 * 60);
    triggerHaptic([100, 50, 100]);
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
    setView('main');
    setSelectedOut(null);
  };

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

  if (!isLinked) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center overflow-hidden touch-none select-none p-2">
        <div className="relative aspect-square w-full max-w-[340px] rounded-full border border-primary/30 bg-[#0F172A] overflow-hidden flex flex-col items-center p-6 text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="mt-6 space-y-1 z-20">
            <div className="flex items-center gap-2 justify-center">
              <Key className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Link_Protocol</span>
            </div>
            <h2 className="text-xs font-black text-white uppercase italic">Pairing Mode</h2>
          </div>
          <div className={cn(
            "mt-4 px-4 py-2 bg-black/40 border-2 rounded-xl w-full text-center transition-colors",
            pairingError ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : "border-primary/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]"
          )}>
            <span className={cn(
              "text-2xl font-black font-headline tracking-[0.3em] italic",
              pairingInput.length > 0 ? "text-primary" : "text-white/10"
            )}>
              {pairingInput.padEnd(6, "•")}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1.5 w-full flex-1 z-20">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "back", "0", "ok"].map(key => (
              <button
                key={key}
                onClick={() => {
                  if (key === "back") handleBackspace();
                  else if (key === "ok") {
                    if (pairingInput.length === 6) handlePairingSubmit();
                  } else handleKeypadPress(key);
                }}
                className={cn(
                  "flex items-center justify-center h-full rounded-xl font-black text-sm transition-all active:scale-90",
                  key === "ok" ? "bg-primary text-black" : key === "back" ? "bg-white/5 text-white/40" : "bg-white/5 text-white hover:bg-white/10"
                )}
              >
                {key === "back" ? <ChevronLeft className="h-4 w-4" /> : key === "ok" ? <ArrowRight className="h-4 w-4" /> : key}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[7px] font-bold text-white/20 uppercase tracking-widest leading-none">Obtenga el código en su Tablet/Móvil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center overflow-hidden touch-none select-none p-2">
      <div className="relative aspect-square w-full max-w-[340px] rounded-full border border-primary/30 bg-[#0F172A] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,242,255,0.15)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="scan-line opacity-30" />

        {/* CABECERA DINÁMICA */}
        <div className="h-10 pt-6 flex flex-col items-center justify-center shrink-0 z-20">
           <div className="flex items-center gap-1.5">
              <Zap className={cn("h-3.5 w-3.5 animate-pulse", isClubMode ? "text-primary" : "text-white/40")} />
              <span className={cn("text-[9px] font-black uppercase tracking-[0.4em] italic", isClubMode ? "text-primary cyan-text-glow" : "text-white/60")}>
                {isClubMode ? 'SynqAI_Club' : 'Sandbox_Local'}
              </span>
           </div>
        </div>

        <div className="flex-1 relative z-10 flex flex-col items-center px-4 overflow-hidden">
          {view === 'main' && (
            <div className="w-full h-full flex flex-col items-center justify-between py-2 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center gap-4 w-full px-6 mt-1">
                <button 
                  onClick={resetClock}
                  className="p-2 bg-white/5 rounded-full text-white/40 active:bg-rose-500 active:text-white transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <div 
                  className="flex flex-col items-center cursor-pointer active:scale-95 transition-all"
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

                <button 
                  onClick={() => setView('config')}
                  className="p-2 bg-white/5 rounded-full text-white/40 active:bg-primary active:text-black transition-all"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 flex-[1.2] items-stretch mt-3">
                 <div className="relative bg-primary/5 border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center group shadow-inner overflow-hidden">
                    <button 
                      onClick={() => handleGoal('home')}
                      className="w-full h-full flex flex-col items-center justify-center active:bg-primary active:text-black transition-all"
                    >
                      <span className="text-[9px] font-black text-primary/60 uppercase mb-1">LOC</span>
                      <span className="text-4xl font-black text-white group-active:text-black">{score.home}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSubtractGoal('home'); }}
                      className="absolute top-1 right-1 p-2 bg-black/40 rounded-xl text-rose-500 active:bg-rose-500 active:text-white transition-all"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                 </div>

                 <div className="relative bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl flex flex-col items-center justify-center group shadow-inner overflow-hidden">
                    <button 
                      onClick={() => handleGoal('guest')}
                      className="w-full h-full flex flex-col items-center justify-center active:bg-rose-500 active:text-white transition-all"
                    >
                      <span className="text-[9px] font-black text-rose-400/60 uppercase mb-1">VIS</span>
                      <span className="text-4xl font-black text-white group-active:text-white">{score.guest}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleSubtractGoal('guest'); }}
                      className="absolute top-1 left-1 p-2 bg-black/40 rounded-xl text-rose-500 active:bg-rose-500 active:text-white transition-all"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                 </div>
              </div>

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
               <div className="flex items-center justify-between pt-6 pb-2 px-10 shrink-0">
                  <button onClick={() => setView('main')} className="p-2 bg-white/5 rounded-full active:bg-primary/20"><X className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">¿QUIÉN SALE?</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2 touch-pan-y">
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
               <div className="flex items-center justify-between pt-6 pb-2 px-10 shrink-0">
                  <button onClick={() => setView('subs_out')} className="p-2 bg-white/5 rounded-full active:bg-primary/20"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">¿QUIÉN ENTRA?</span>
                  <div className="w-8" />
               </div>
               <div className="px-4 mb-2">
                  <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-center">
                    <span className="text-[8px] font-black text-white uppercase italic">Sustituyendo a #{selectedOut}</span>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2 touch-pan-y">
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

          {view === 'config' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-top-6 duration-500">
               <div className="flex items-center justify-between pt-6 pb-2 px-10 shrink-0">
                  <button onClick={() => setView('main')} className="p-2 bg-white/5 rounded-full active:bg-primary/20"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest">CONFIG_MATCH</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2 touch-pan-y pt-2">
                  <button 
                    onClick={() => { resetScore(); setView('main'); }}
                    className="w-full p-4 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl flex items-center justify-between active:bg-rose-500 active:text-white transition-all group"
                  >
                     <span className="text-[10px] font-black uppercase italic group-active:text-white">RESETEAR MARCADOR</span>
                     <RotateCcw className="h-4 w-4 text-rose-500 group-active:text-white" />
                  </button>

                  <div className="h-4" />
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest text-center mb-2 px-4">Intervalo de Aviso de Cambio</p>
                  {[
                    { val: "5", label: "CADA 5 MIN" },
                    { val: "8", label: "CADA 8 MIN" },
                    { val: "10", label: "CADA 10 MIN" },
                    { val: "half", label: "MITAD TIEMPO" }
                  ].map(opt => (
                    <button 
                      key={opt.val} 
                      onClick={() => { setSubInterval(opt.val); triggerHaptic(30); }}
                      className={cn(
                        "w-full p-4 border-2 rounded-2xl flex items-center justify-between transition-all active:scale-95",
                        subInterval === opt.val ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/10 text-white/40"
                      )}
                    >
                       <span className="text-[10px] font-black uppercase italic">{opt.label}</span>
                       {subInterval === opt.val && <Check className="h-4 w-4" />}
                    </button>
                  ))}
               </div>
            </div>
          )}
        </div>

        <div className="h-12 pb-6 flex items-center justify-center gap-4 shrink-0 z-20">
           <div className="flex items-center gap-2 px-4 py-1 bg-black/40 rounded-full border border-white/5">
              <ShieldCheck className={cn("h-2.5 w-2.5 animate-pulse", isClubMode ? "text-emerald-400" : "text-white/40")} />
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                {isClubMode ? 'CLOUD_SINCRO' : 'LOCAL_STORAGE'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
