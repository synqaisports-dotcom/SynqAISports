
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Minus,
  CloudSun,
  Thermometer,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { synqSync } from "@/lib/sync-service";

function SmartwatchContent() {
  const { loading, profile } = useAuth();
  const searchParamsHook = useSearchParams();
  
  // ESTADOS DE VINCULACIÓN
  const [isLinked, setIsLinked] = useState(false);
  const [pairingInput, setPairingInput] = useState("");
  const [pairingError, setPairingError] = useState(false);
  const [isClubMode, setIsClubMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [autoLinking, setAutoLinking] = useState(false);

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

  // DETECCIÓN DE AUTO-LINK (TOKEN EN URL)
  useEffect(() => {
    const codeInUrl = searchParamsHook.get("code") || searchParamsHook.get("token");
    if (codeInUrl && !isLinked) {
      setAutoLinking(true);
      setTimeout(() => {
        setIsLinked(true);
        localStorage.setItem("synq_watch_linked", "true");
        localStorage.setItem("synq_watch_pairing_code", codeInUrl);
        setAutoLinking(false);
      }, 1500);
    }
  }, [searchParamsHook, isLinked]);

  // CARGA DE ENTORNO Y ROSTER
  useEffect(() => {
    const linked = localStorage.getItem("synq_watch_linked") === "true";
    setIsLinked(linked);
    setIsOnline(navigator.onLine);

    const handleConnectivity = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        synqSync.syncNow();
      }
    };

    window.addEventListener('online', handleConnectivity);
    window.addEventListener('offline', handleConnectivity);

    if (linked) {
      const clubId = profile?.clubId;
      if (clubId && clubId !== "global-hq") {
        setIsClubMode(true);
        setStarters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        setSubstitutes([12, 14, 15, 19]);
      } else {
        setIsClubMode(false);
        const savedTeam = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
        if (savedTeam) {
          setStarters(savedTeam.starters.map((_: any, i: number) => i + 1));
          setSubstitutes(savedTeam.substitutes.map((_: any, i: number) => savedTeam.starters.length + i + 1));
        } else {
          setStarters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
          setSubstitutes([12, 14, 15, 19]);
        }
      }
    }

    return () => {
      window.removeEventListener('online', handleConnectivity);
      window.removeEventListener('offline', handleConnectivity);
    };
  }, [profile, isLinked]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

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

  const handleGoal = (team: 'home' | 'guest') => {
    setScore(prev => ({ ...prev, [team]: prev[team] + 1 }));
    triggerHaptic([150, 50, 150]);
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
    triggerHaptic(60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || autoLinking) {
    return (
      <div className="fixed inset-0 bg-[#04070c] flex flex-col items-center justify-center p-2">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Sincronizando_Token...</p>
      </div>
    );
  }

  if (!isLinked) {
    return (
      <div className="fixed inset-0 bg-[#04070c] flex items-center justify-center overflow-hidden touch-none select-none p-2">
        <div className="relative aspect-square w-full max-w-[340px] rounded-[2.5rem] border border-primary/30 bg-[#04070c] overflow-hidden flex flex-col items-center p-6 text-center">
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
                  if (key === "back") setPairingInput(prev => prev.slice(0, -1));
                  else if (key === "ok") { if (pairingInput.length === 6) handlePairingSubmit(); }
                  else handleKeypadPress(key);
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
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#04070c] flex items-center justify-center overflow-hidden touch-none select-none p-2">
      <div className="relative aspect-square w-full max-w-[340px] rounded-[clamp(2rem,20%,50%)] border border-primary/30 bg-[#04070c] overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,242,255,0.15)]">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        <div className="h-14 pt-6 px-10 flex items-center justify-between shrink-0 z-20">
           <div className="flex items-center gap-1.5">
              <Zap className={cn("h-3 w-3 animate-pulse", isClubMode ? "text-primary" : "text-white/40")} />
              <span className={cn("text-[8px] font-black uppercase tracking-[0.2em] italic", isClubMode ? "text-primary" : "text-white/60")}>
                {isClubMode ? 'CLUB' : 'SND'}
              </span>
           </div>

           <div className={cn(
             "flex items-center gap-2 px-2 py-0.5 rounded-lg border transition-all",
             isOnline ? "bg-primary/10 border-primary/20" : "bg-rose-500/10 border-rose-500/20"
           )}>
              <CloudSun className={cn("h-3 w-3", isOnline ? "text-primary animate-pulse" : "text-rose-500")} />
              <span className="text-[8px] font-black text-white">{isOnline ? '18°C' : 'OFF'}</span>
           </div>
        </div>

        <div className="flex-1 relative z-10 flex flex-col items-center px-6 overflow-hidden">
          {view === 'main' && (
            <div className="w-full h-full flex flex-col items-center justify-between py-2 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-center gap-4 w-full">
                <button onClick={() => { setIsRunning(false); setTimeLeft(45*60); triggerHaptic(60); }} className="p-2.5 bg-white/5 rounded-full text-white/40 active:bg-rose-500"><RotateCcw className="h-4 w-4" /></button>
                <div className="flex flex-col items-center cursor-pointer active:scale-95" onClick={toggleClock}>
                  <span className={cn("text-6xl font-black font-headline tabular-nums tracking-tighter leading-none", timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow")}>{formatTime(timeLeft)}</span>
                  <div className="flex items-center gap-1.5 mt-1 bg-black/40 px-3 py-0.5 rounded-full border border-white/5">
                     {isRunning ? <Pause className="h-3 w-3 text-primary/60" /> : <Play className="h-3 w-3 text-emerald-400" />}
                     <span className="text-[8px] font-black text-white/40 uppercase">P_01</span>
                  </div>
                </div>
                <button onClick={() => setView('config')} className="p-2.5 bg-white/5 rounded-full text-white/40 active:bg-primary"><Settings className="h-4 w-4" /></button>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 flex-1 items-stretch mt-3">
                 <button onClick={() => handleGoal('home')} className="relative bg-primary/5 border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center active:bg-primary active:text-black group overflow-hidden">
                    <span className="text-[8px] font-black text-primary/60 uppercase mb-1">LOC</span>
                    <span className="text-4xl font-black text-white group-active:text-black">{score.home}</span>
                 </button>
                 <button onClick={() => handleGoal('guest')} className="relative bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl flex flex-col items-center justify-center active:bg-rose-500 group overflow-hidden">
                    <span className="text-[8px] font-black text-rose-400/60 uppercase mb-1">VIS</span>
                    <span className="text-4xl font-black text-white group-active:text-white">{score.guest}</span>
                 </button>
              </div>

              <button onClick={() => { setView('subs_out'); triggerHaptic(40); }} className="w-full h-12 mt-2 bg-white/5 border-2 border-white/10 rounded-[2rem] flex items-center justify-center gap-3 active:bg-white/20 shrink-0">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">SUSTITUCIÓN</span>
              </button>
            </div>
          )}

          {view === 'subs_out' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-bottom-6">
               <div className="flex items-center justify-between pt-4 pb-2 px-8 shrink-0">
                  <button onClick={() => setView('main')} className="p-2 bg-white/5 rounded-full"><X className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-primary uppercase">SALIDA</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2">
                  {starters.map(num => (
                    <button key={num} onClick={() => { setSelectedOut(num); setView('subs_in'); triggerHaptic(40); }} className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl flex items-center justify-between active:bg-primary active:text-black group">
                       <span className="text-sm font-black italic text-white group-active:text-black">#{num}</span>
                       <span className="text-[8px] font-black uppercase text-rose-400/60 group-active:text-black">Titular</span>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {view === 'subs_in' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-right-6">
               <div className="flex items-center justify-between pt-4 pb-2 px-8 shrink-0">
                  <button onClick={() => setView('subs_out')} className="p-2 bg-white/5 rounded-full"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-emerald-400 uppercase">ENTRADA</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2">
                  {substitutes.map(num => (
                    <button key={num} onClick={() => { setView('main'); triggerHaptic(300); }} className="w-full p-4 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl flex items-center justify-between active:bg-emerald-500 active:text-black group">
                       <span className="text-sm font-black italic text-white group-active:text-black">#{num}</span>
                       <UserCheck className="h-4 w-4 text-emerald-400 group-active:text-black" />
                    </button>
                  ))}
               </div>
            </div>
          )}

          {view === 'config' && (
            <div className="w-full h-full flex flex-col animate-in slide-in-from-top-6">
               <div className="flex items-center justify-between pt-4 pb-2 px-8 shrink-0">
                  <button onClick={() => setView('main')} className="p-2 bg-white/5 rounded-full"><ChevronLeft className="h-4 w-4 text-primary" /></button>
                  <span className="text-[9px] font-black text-primary uppercase">CONFIG</span>
                  <div className="w-8" />
               </div>
               <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-2 pb-10 px-2">
                  <button onClick={() => { setScore({home:0, guest:0}); setView('main'); triggerHaptic([100,50,100]); }} className="w-full p-4 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl flex items-center justify-between group active:bg-rose-500">
                     <span className="text-[10px] font-black uppercase italic group-active:text-white">RESET MARCADOR</span>
                     <RotateCcw className="h-4 w-4 text-rose-500 group-active:text-white" />
                  </button>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                     <div className="flex items-center gap-2">
                        <Thermometer className="h-3 w-3 text-primary/40" />
                        <span className="text-[8px] font-black text-white/40 uppercase">Telemetría Sincro</span>
                     </div>
                     <p className="text-[7px] text-white/20 uppercase font-bold italic leading-tight">Actualizando cola de eventos publicitarios en cada chequeo climático.</p>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="h-12 pb-6 flex items-center justify-center shrink-0 z-20">
           <div className="flex items-center gap-2 px-4 py-1 bg-black/40 rounded-full border border-white/5">
              <ShieldCheck className={cn("h-2.5 w-2.5 animate-pulse", isOnline ? "text-emerald-400" : "text-rose-500")} />
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
                {isOnline ? 'SINCRO_CLOUD' : 'MODO_LOCAL'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function SmartwatchPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#04070c] flex items-center justify-center text-primary font-black uppercase tracking-widest animate-pulse">Cargando_Ecosistema...</div>}>
      <SmartwatchContent />
    </Suspense>
  );
}
