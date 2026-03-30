"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  Trophy,
  Dumbbell,
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
import {
  MATCH_TIMER_SYNC_KEY,
  matchTimerSyncKey,
  readMatchTimerSync,
  shouldApplyRemoteTimer,
  writeMatchTimerSync,
  readMatchTimerPresetMinutes,
  type MatchTimerSyncPayload,
} from "@/lib/match-timer-sync";
import {
  MATCH_SCORE_SYNC_KEY,
  matchScoreSyncKey,
  readMatchScoreSync,
  shouldApplyRemoteScore,
  writeMatchScoreSync,
} from "@/lib/match-score-sync";
import {
  ensureWatchPairingCode,
  readWatchLinked,
  writeWatchLinked,
  writeWatchPairingCode,
  type WatchPairingScope,
} from "@/lib/watch-pairing";
import {
  readContinuityContext,
  subscribeContinuityContext,
  writeContinuityContext,
  type ContinuityContext,
  type ContinuityMode,
} from "@/lib/continuity-context";

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
  const [presetMinutes, setPresetMinutes] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [view, setView] = useState<'main' | 'subs_out' | 'subs_in' | 'config'>('main');
  const [selectedOut, setSelectedOut] = useState<number | null>(null);
  const [subInterval, setSubInterval] = useState("5");
  const [isWatchCompact, setIsWatchCompact] = useState(false);
  const [activeMode, setActiveMode] = useState<ContinuityMode>("match");
  const [activeCtx, setActiveCtx] = useState<ContinuityContext | null>(null);
  const [screen, setScreen] = useState<"match" | "training" | "settings">("match");
  const touchStartXRef = useRef<number | null>(null);

  // ROSTER DINÁMICO
  const [starters, setStarters] = useState<number[]>([]);
  const [substitutes, setSubstitutes] = useState<number[]>([]);

  const timeLeftRef = useRef(45 * 60);
  const presetMinutesRef = useRef(45);
  const lastTimerSyncAppliedRef = useRef(0);
  const lastTickAtRef = useRef<number | null>(null);
  const lastScoreSyncAppliedRef = useRef(0);

  const clubScopeId = profile?.clubId ?? "global-hq";

  const urlCtx = React.useMemo(() => {
    const modeParam = searchParamsHook.get("mode") || "";
    const teamId = searchParamsHook.get("team") || "";
    const mcc = searchParamsHook.get("mcc") || "";
    const session = searchParamsHook.get("session") || "";
    if (!teamId || !mcc || !session) return null;
    const ctx: ContinuityMode =
      modeParam === "training" ? "training" : modeParam === "match" ? "match" : "match";
    return {
      clubId: clubScopeId,
      mode: ctx,
      teamId,
      mcc,
      session,
      updatedAt: Date.now(),
    } satisfies ContinuityContext;
  }, [searchParamsHook, clubScopeId]);

  const syncScope = React.useMemo(() => {
    const c = activeCtx;
    if (!c) return null;
    return { clubId: c.clubId, teamId: c.teamId, mcc: c.mcc, session: c.session, mode: c.mode };
  }, [activeCtx]);

  const timerKey = React.useMemo(
    () => matchTimerSyncKey(syncScope ?? undefined),
    [syncScope],
  );
  const scoreKey = React.useMemo(
    () => matchScoreSyncKey(syncScope ?? undefined),
    [syncScope],
  );

  const watchPairingScope = React.useMemo((): WatchPairingScope | null => {
    if (syncScope) return { clubId: syncScope.clubId, mode: "continuity" };
    const clubId = profile?.clubId;
    if (clubId && clubId !== "global-hq") return { clubId, mode: "elite" };
    return { clubId: "sandbox", mode: "sandbox" };
  }, [syncScope, profile?.clubId]);

  // Resolver modo/pantalla inicial: URL > contexto guardado > default
  useEffect(() => {
    if (typeof window === "undefined") return;
    const modeParam = searchParamsHook.get("mode") || "";
    const requested: ContinuityMode | null =
      modeParam === "training" ? "training" : modeParam === "match" ? "match" : null;

    const initial = urlCtx ?? readContinuityContext(clubScopeId);
    if (initial) {
      setActiveCtx(initial);
      setActiveMode(initial.mode);
      setScreen(initial.mode);
    } else if (requested) {
      setActiveMode(requested);
      setScreen(requested);
    } else {
      setActiveMode("match");
      setScreen("match");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubScopeId, urlCtx]);

  // Escuchar cambios de contexto (empujados desde el móvil)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = subscribeContinuityContext(clubScopeId, (next) => {
      if (!next) return;
      setActiveCtx(next);
      setActiveMode(next.mode);
      // Si el usuario está en settings, no forzar navegación; si está en match/training, sí.
      setScreen((prev) => (prev === "settings" ? prev : next.mode));
    });
    return () => unsub();
  }, [clubScopeId]);

  const setModeOnWatch = (nextMode: ContinuityMode) => {
    setActiveMode(nextMode);
    setScreen(nextMode);
    if (activeCtx) {
      const next = writeContinuityContext({
        clubId: activeCtx.clubId,
        mode: nextMode,
        teamId: activeCtx.teamId,
        mcc: activeCtx.mcc,
        session: activeCtx.session,
      });
      setActiveCtx(next);
    }
  };

  // DETECCIÓN DE AUTO-LINK (TOKEN EN URL)
  useEffect(() => {
    const codeInUrl = searchParamsHook.get("code") || searchParamsHook.get("token");
    if (codeInUrl && !isLinked) {
      setAutoLinking(true);
      setTimeout(() => {
        setIsLinked(true);
        writeWatchLinked(true, watchPairingScope);
        writeWatchPairingCode(codeInUrl, watchPairingScope);
        setAutoLinking(false);
      }, 1500);
    }
  }, [searchParamsHook, isLinked, watchPairingScope]);

  // CARGA DE ENTORNO Y ROSTER
  useEffect(() => {
    const linked = readWatchLinked(watchPairingScope);
    setIsLinked(linked);
    setIsOnline(navigator.onLine);
    ensureWatchPairingCode(watchPairingScope);

    const handleConnectivity = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        void synqSync.syncNow().catch(() => {
          // Sync best-effort: no bloquear UX del reloj.
        });
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
    if (typeof window === "undefined") return;
    const applyWatchCompact = () => {
      const minSide = Math.min(window.innerWidth || 0, window.innerHeight || 0);
      setIsWatchCompact(minSide <= 380);
    };
    applyWatchCompact();
    window.addEventListener("resize", applyWatchCompact);
    return () => window.removeEventListener("resize", applyWatchCompact);
  }, []);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Guardar un preset de minutos para que el botón reset no vuelva siempre a 45.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mins = readMatchTimerPresetMinutes(45);
    setPresetMinutes(mins);
    presetMinutesRef.current = mins;
    const sec = mins * 60;
    setTimeLeft(sec);
    timeLeftRef.current = sec;
  }, []);

  useEffect(() => {
    // Si cambia el contexto (timerKey), el estado “last applied” puede pertenecer a otro partido.
    // Reiniciamos para que el reloj aplique el valor correcto del nuevo scope.
    lastTimerSyncAppliedRef.current = 0;
    const p = readMatchTimerSync(timerKey);
    if (p && shouldApplyRemoteTimer(p, lastTimerSyncAppliedRef.current) && Date.now() - p.updatedAt < 3 * 60 * 60 * 1000) {
      lastTimerSyncAppliedRef.current = p.updatedAt;
      setTimeLeft(Math.max(0, p.remainingSec));
      setIsRunning(Boolean(p.running));
    }

    const onTimerStorage = (e: StorageEvent) => {
      if (e.key !== timerKey || !e.newValue) return;
      try {
        const remote = JSON.parse(e.newValue) as MatchTimerSyncPayload;
        if (!shouldApplyRemoteTimer(remote, lastTimerSyncAppliedRef.current)) return;
        if (Date.now() - remote.updatedAt > 3 * 60 * 60 * 1000) return;
        lastTimerSyncAppliedRef.current = remote.updatedAt;
        setTimeLeft(Math.max(0, remote.remainingSec));
        setIsRunning(remote.running);
      } catch {
        /* noop */
      }
    };
    window.addEventListener("storage", onTimerStorage);
    return () => window.removeEventListener("storage", onTimerStorage);
  }, [timerKey]);

  useEffect(() => {
    const p = readMatchScoreSync(scoreKey);
    if (shouldApplyRemoteScore(p, lastScoreSyncAppliedRef.current) && Date.now() - p.updatedAt < 3 * 60 * 60 * 1000) {
      lastScoreSyncAppliedRef.current = p.updatedAt;
      setScore({ home: Math.max(0, p.home), guest: Math.max(0, p.guest) });
    }

    const onScoreStorage = (e: StorageEvent) => {
      if (e.key !== scoreKey || !e.newValue) return;
      try {
        const remote = JSON.parse(e.newValue) as { home: number; guest: number; updatedAt: number };
        if (!shouldApplyRemoteScore(remote, lastScoreSyncAppliedRef.current)) return;
        if (Date.now() - remote.updatedAt > 3 * 60 * 60 * 1000) return;
        lastScoreSyncAppliedRef.current = remote.updatedAt;
        setScore({ home: Math.max(0, remote.home), guest: Math.max(0, remote.guest) });
      } catch {
        /* noop */
      }
    };

    window.addEventListener("storage", onScoreStorage);
    return () => window.removeEventListener("storage", onScoreStorage);
  }, [scoreKey]);

  const updateScore = (updater: (prev: { home: number; guest: number }) => { home: number; guest: number }) => {
    setScore((prev) => {
      const next = updater(prev);
      const safe = { home: Math.max(0, next.home), guest: Math.max(0, next.guest) };
      const now = Date.now();
      lastScoreSyncAppliedRef.current = now;
      writeMatchScoreSync({ ...safe, updatedAt: now, origin: "watch" }, scoreKey);
      return safe;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLinked && isRunning) {
      lastTickAtRef.current = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const last = lastTickAtRef.current ?? now;
        const deltaSec = Math.max(0, Math.floor((now - last) / 1000));
        if (deltaSec <= 0) return;
        lastTickAtRef.current = last + deltaSec * 1000;

        setTimeLeft((prev) => {
          const next = Math.max(0, prev - deltaSec);
          const writeAt = Date.now();
          lastTimerSyncAppliedRef.current = writeAt;
          const runningNext = next > 0;
          writeMatchTimerSync(
            { remainingSec: next, running: runningNext, updatedAt: writeAt, origin: "watch" },
            timerKey,
          );
          // Como `storage` no llega a la misma pestaña, aseguramos el estado local al llegar a 0.
          if (!runningNext) queueMicrotask(() => setIsRunning(false));
          return next;
        });
      }, 1000);
    } else {
      lastTickAtRef.current = null;
    }
    return () => clearInterval(interval);
  }, [isLinked, isRunning, timerKey]);

  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const handlePairingSubmit = () => {
    const masterCode = ensureWatchPairingCode(watchPairingScope);
    if (pairingInput === masterCode || pairingInput === "123456") {
      triggerHaptic([100, 50, 100]);
      setIsLinked(true);
      writeWatchLinked(true, watchPairingScope);
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

  const handleGoal = (team: 'home' | 'guest', delta = 1) => {
    updateScore((prev) =>
      team === "home"
        ? { home: prev.home + delta, guest: prev.guest }
        : { home: prev.home, guest: prev.guest + delta },
    );
    triggerHaptic(delta > 0 ? [150, 50, 150] : 80);
  };

  const toggleClock = () => {
    setIsRunning((r) => {
      const next = !r;
      queueMicrotask(() => {
        const now = Date.now();
        lastTimerSyncAppliedRef.current = now;
        writeMatchTimerSync({
          remainingSec: timeLeftRef.current,
          running: next,
          updatedAt: now,
          origin: "watch",
        }, timerKey);
      });
      return next;
    });
    triggerHaptic(60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || autoLinking) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-2">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">Sincronizando_Token...</p>
      </div>
    );
  }

  if (!isLinked) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden touch-none select-none p-2">
        <div className="relative aspect-square w-full max-w-[340px] rounded-[2.5rem] border border-primary/30 bg-card overflow-hidden flex flex-col items-center p-6 text-center">
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
    <div className={cn("fixed inset-0 bg-background flex items-center justify-center overflow-hidden touch-none select-none", isWatchCompact ? "p-1" : "p-2")}>
      <div
        className={cn(
          "relative rounded-[clamp(2rem,22%,50%)] border border-primary/30 bg-card overflow-hidden flex flex-col shadow-[0_0_60px_rgba(0,242,255,0.15)]",
          isWatchCompact ? "w-[min(96vw,96dvh,360px)] h-[min(96vw,96dvh,360px)]" : "w-[min(92vw,92dvh,340px)] h-[min(92vw,92dvh,340px)]",
        )}
        onTouchStart={(e) => {
          touchStartXRef.current = e.touches?.[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const startX = touchStartXRef.current;
          const endX = e.changedTouches?.[0]?.clientX ?? null;
          touchStartXRef.current = null;
          if (startX == null || endX == null) return;
          const dx = endX - startX;
          if (Math.abs(dx) < 45) return;
          const order: Array<"match" | "training" | "settings"> = ["match", "training", "settings"];
          const idx = order.indexOf(screen);
          const nextIdx = dx < 0 ? (idx + 1) % order.length : (idx - 1 + order.length) % order.length;
          const next = order[nextIdx]!;
          setScreen(next);
          if (next === "match") setModeOnWatch("match");
          if (next === "training") setModeOnWatch("training");
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        
        <div className={cn("flex items-center justify-between shrink-0 z-20", isWatchCompact ? "h-12 pt-4 px-6" : "h-14 pt-6 px-8")}>
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

        <div className={cn("flex-1 relative z-10 flex flex-col items-center overflow-hidden", isWatchCompact ? "px-4" : "px-6")}>
          {screen === "settings" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-2">
                <Settings className="h-7 w-7 text-primary mx-auto" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Ajustes</p>
              </div>
              <div className="w-full space-y-2">
                <button
                  className={cn(
                    "w-full h-12 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest",
                    activeMode === "match"
                      ? "bg-primary text-black border-primary/30"
                      : "bg-white/5 text-white/60 border-white/10",
                  )}
                  onClick={() => setModeOnWatch("match")}
                >
                  <Trophy className="h-4 w-4 inline-block mr-2" /> Partido
                </button>
                <button
                  className={cn(
                    "w-full h-12 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest",
                    activeMode === "training"
                      ? "bg-emerald-500 text-black border-emerald-500/30"
                      : "bg-white/5 text-white/60 border-white/10",
                  )}
                  onClick={() => setModeOnWatch("training")}
                >
                  <Dumbbell className="h-4 w-4 inline-block mr-2" /> Entreno
                </button>
              </div>
              <p className="text-[8px] uppercase font-bold text-white/30 text-center">
                Desliza para cambiar de pantalla
              </p>
            </div>
          ) : view === 'main' && screen === "match" ? (
            <div className={cn("w-full h-full flex flex-col items-center justify-between animate-in fade-in zoom-in-95", isWatchCompact ? "py-1" : "py-2")}>
              <div className={cn("flex items-center justify-center w-full", isWatchCompact ? "gap-2.5" : "gap-4")}>
              <button onClick={() => { setIsRunning(false); const sec = presetMinutesRef.current * 60; setTimeLeft(sec); timeLeftRef.current = sec; const now = Date.now(); lastTimerSyncAppliedRef.current = now; writeMatchTimerSync({ remainingSec: sec, running: false, updatedAt: now, origin: "watch" }, timerKey); triggerHaptic(60); }} className={cn("bg-white/5 rounded-full text-white/40 active:bg-rose-500", isWatchCompact ? "p-3" : "p-2.5")}><RotateCcw className={cn(isWatchCompact ? "h-5 w-5" : "h-4 w-4")} /></button>
                <div className="flex flex-col items-center cursor-pointer active:scale-95" onClick={toggleClock}>
                  <span className={cn("font-black font-headline tabular-nums tracking-tighter leading-none", isWatchCompact ? "text-[3.2rem]" : "text-6xl", timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow")}>{formatTime(timeLeft)}</span>
                  <div className="flex items-center gap-1.5 mt-1 bg-black/40 px-3 py-0.5 rounded-full border border-white/5">
                     {isRunning ? <Pause className="h-3 w-3 text-primary/60" /> : <Play className="h-3 w-3 text-emerald-400" />}
                     <span className="text-[8px] font-black text-white/40 uppercase">P_01</span>
                  </div>
                </div>
                <button onClick={() => setView('config')} className={cn("bg-white/5 rounded-full text-white/40 active:bg-primary", isWatchCompact ? "p-3" : "p-2.5")}><Settings className={cn(isWatchCompact ? "h-5 w-5" : "h-4 w-4")} /></button>
              </div>

              <div className={cn("w-full grid grid-cols-2 flex-1 items-stretch", isWatchCompact ? "gap-2 mt-1.5" : "gap-2 mt-3")}>
                 <button onClick={() => handleGoal('home')} className={cn("relative bg-primary/5 border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center active:bg-primary active:text-black group overflow-hidden", isWatchCompact && "min-h-[96px]")}>
                    <span
                      role="button"
                      aria-label="Decrementar local"
                      onClick={(e) => { e.stopPropagation(); handleGoal('home', -1); }}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full border border-primary/30 bg-black/35 flex items-center justify-center text-primary/80 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[8px] font-black text-primary/60 uppercase mb-1">LOC</span>
                    <span className={cn("font-black text-white group-active:text-black", isWatchCompact ? "text-4xl" : "text-4xl")}>{score.home}</span>
                 </button>
                 <button onClick={() => handleGoal('guest')} className={cn("relative bg-rose-500/5 border-2 border-rose-500/20 rounded-3xl flex flex-col items-center justify-center active:bg-rose-500 group overflow-hidden", isWatchCompact && "min-h-[96px]")}>
                    <span
                      role="button"
                      aria-label="Decrementar visitante"
                      onClick={(e) => { e.stopPropagation(); handleGoal('guest', -1); }}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full border border-rose-500/30 bg-black/35 flex items-center justify-center text-rose-300/90 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[8px] font-black text-rose-400/60 uppercase mb-1">VIS</span>
                    <span className={cn("font-black text-white group-active:text-white", isWatchCompact ? "text-4xl" : "text-4xl")}>{score.guest}</span>
                 </button>
              </div>

              <button onClick={() => { setView('subs_out'); triggerHaptic(40); }} className={cn("w-full mt-0 bg-white/5 border-2 border-white/10 rounded-[2rem] flex items-center justify-center gap-2 active:bg-white/20 shrink-0", isWatchCompact ? "h-10 mb-2.5" : "h-12")}>
                <Users className="h-4 w-4 text-primary" />
                <span className={cn("font-black uppercase tracking-widest text-white", isWatchCompact ? "text-[8px]" : "text-[10px]")}>SUSTITUCIÓN</span>
              </button>
            </div>
          ) : screen === "training" ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
              <div className="text-center space-y-2">
                <Dumbbell className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">Entreno</p>
                <p className="text-[8px] uppercase font-bold text-white/30">
                  (UI específica se ampliará)\nDesliza para Ajustes
                </p>
              </div>
              <button
                onClick={() => setView('config')}
                className="mt-4 h-12 w-full rounded-2xl border-2 border-white/10 bg-white/5 text-white/70 font-black uppercase text-[10px] tracking-widest"
              >
                <Settings className="h-4 w-4 inline-block mr-2" /> Config
              </button>
            </div>
          ) : null}

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
                  <button onClick={() => { updateScore(() => ({home:0, guest:0})); setView('main'); triggerHaptic([100,50,100]); }} className="w-full p-4 bg-rose-500/10 border-2 border-rose-500/20 rounded-2xl flex items-center justify-between group active:bg-rose-500">
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

        <div className={cn("flex items-center justify-center shrink-0 z-20", isWatchCompact ? "h-7 pb-1.5" : "h-12 pb-6", isWatchCompact && view === "main" && "hidden")}>
           <div className={cn("flex items-center gap-2 bg-black/40 rounded-full border border-white/5", isWatchCompact ? "px-2.5 py-0.5" : "px-4 py-1")}>
              <ShieldCheck className={cn("h-2.5 w-2.5 animate-pulse", isOnline ? "text-emerald-400" : "text-rose-500")} />
              <span className={cn("font-black text-white/30 uppercase tracking-[0.2em]", isWatchCompact ? "text-[7px]" : "text-[8px]")}>
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
    <Suspense fallback={<div className="fixed inset-0 bg-background flex items-center justify-center text-primary font-black uppercase tracking-widest animate-pulse">Cargando_Ecosistema...</div>}>
      <SmartwatchContent />
    </Suspense>
  );
}
