
"use client";

import { useState, useEffect, useMemo, useRef, memo, useCallback } from "react";
import { 
  Trophy, 
  Clock, 
  RotateCcw, 
  Users, 
  Plus,
  Watch,
  Activity,
  Maximize2,
  Minimize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Pause,
  Play,
  LayoutDashboard,
  Square,
  Megaphone,
  X,
  Save,
  Columns3,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { PlayerChip } from "@/components/board/PlayerChip";
import { FORMATIONS_DATA } from "@/lib/formations";
import { useAuth } from "@/lib/auth-context";
import { synqSync } from "@/lib/sync-service";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type TacticalPhase = "def" | "tda" | "sal" | "atk";

interface PlayerPos {
  id: string;
  number: number;
  name: string;
  team: "local" | "visitor";
  x: number;
  y: number;
}

interface DrawingLine {
  points: {x: number, y: number}[];
  color: string;
}

const MemoizedPlayerChip = memo(PlayerChip);

/**
 * MatchBoardPage - v55.0.0
 * PROTOCOL_PERFORMANCE_OVERRIDE: Implementación de Opción 1 (GPU Relief).
 * Detecta Huawei MediaPad T5 (AGS2) y desactiva filtros backdrop-blur.
 * Estructura de renderScale lista para Opción 2.
 */
export default function MatchBoardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [homePhase, setHomePhase] = useState<TacticalPhase>("def");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("def");
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");
  const [homeShift, setHomeShift] = useState<"left" | "center" | "right">("center");
  const [guestShift, setGuestShift] = useState<"left" | "center" | "right">("center");
  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [pairingCode, setPairingCode] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false);
  
  // PERFORMANCE CONTROL
  const [isLegacyDevice, setIsLegacyDevice] = useState(false);
  const [renderScale, setRenderScale] = useState(1.0); // Preparación Opción 2
  
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<{x: number, y: number}[] | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    setMounted(true); 
    
    // DETECTOR DE HARDWARE LEGACY (Huawei MediaPad T5 / AGS2)
    const ua = window.navigator.userAgent;
    const isT5 = /AGS2/.test(ua);
    const lowCPU = (window.navigator.hardwareConcurrency || 8) <= 8;
    
    if (isT5 || lowCPU) {
      console.log("[SynqAI] Detectado hardware legacy. Activando Protocolo de Alivio GPU.");
      setIsLegacyDevice(true);
      // setRenderScale(0.75); // Descomentar para activar Opción 2
    }
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let code = localStorage.getItem("synq_watch_pairing_code");
    if (!code) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem("synq_watch_pairing_code", code);
    }
    setPairingCode(code);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetPresetTime = (minutes: number) => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
    toast({
      title: "TIEMPO_AJUSTADO",
      description: `Cronómetro configurado a ${minutes} minutos.`,
    });
  };

  const calculatePositions = useCallback(() => {
    if (isAnyDialogOpen) return;

    const formationsForField = FORMATIONS_DATA[fieldType];

    const shiftX = (side: "left" | "center" | "right") => {
      if (side === "left") return -5;
      if (side === "right") return 5;
      return 0;
    };

    const phaseOffset = (phase: TacticalPhase) => {
      switch(phase) {
        case 'def': return -11.5;
        case 'tda': return 2;  
        case 'sal': return 10;  
        case 'atk': return 7;  
        default: return 0;
      }
    };

    const hp = homeFormation === "NINGUNA" ? [] : (formationsForField[homeFormation] || formationsForField["4-3-3"]).map((pos, idx) => {
      let finalX = (0.05 + (pos.x * 0.9)) * 100;
      let finalY = pos.y * 100;
      if (idx === 0) { finalX = 5; finalY = 50; } 
      else {
        finalY = finalY + shiftX(homeShift);
        finalX = finalX + phaseOffset(homePhase);
        if (homePhase === 'def') finalX = Math.min(50, finalX);
        finalX = Math.max(5, Math.min(95, finalX));
      }
      return { id: `local-${idx}`, number: idx + 1, name: `JUGADOR ${idx + 1}`, team: "local" as const, x: finalX, y: finalY };
    });

    const gp = guestFormation === "NINGUNA" ? [] : (formationsForField[guestFormation] || formationsForField["4-3-3"]).map((pos, idx) => {
      let finalX = (0.95 - (pos.x * 0.9)) * 100;
      let finalY = (1 - pos.y) * 100;
      if (idx === 0) { finalX = 95; finalY = 50; }
      else {
        finalY = finalY - shiftX(guestShift);
        finalX = finalX - phaseOffset(guestPhase);
        if (guestPhase === 'def') finalX = Math.max(50, finalX);
        finalX = Math.max(5, Math.min(95, finalX));
      }
      return { id: `visitor-${idx}`, number: idx + 1, name: `RIVAL ${idx + 1}`, team: "visitor" as const, x: finalX, y: finalY };
    });

    setPlayers([...hp, ...gp]);
  }, [fieldType, homeFormation, guestFormation, homeShift, guestShift, homePhase, guestPhase, isAnyDialogOpen]);

  useEffect(() => { calculatePositions(); }, [calculatePositions]);

  const handlePointerDownPlayer = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActiveDrawing([{x, y}]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (draggingId) {
      setPlayers(prev => prev.map(p => p.id === draggingId ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p));
    } else if (activeDrawing) {
      setActiveDrawing(prev => [...(prev || []), {x, y}]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    } else if (activeDrawing) {
      setDrawings(prev => [...prev, { points: activeDrawing, color: currentColor }]);
      setActiveDrawing(null);
    }
  };

  const handleSaveMatch = () => {
    const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"matches": []}');
    const newMatchResult = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      score,
      status: 'Played',
      rivalName: 'RIVAL_SINCRO'
    };
    vault.matches = [newMatchResult, ...(vault.matches || [])];
    localStorage.setItem("synq_promo_vault", JSON.stringify(vault));
    
    toast({
      title: "PARTIDO_SINCRO_EXITOSA",
      description: "Los datos del encuentro han sido blindados en el historial local.",
    });
  };

  useEffect(() => {
    if (isAnyDialogOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      const targetW = parent.clientWidth * renderScale;
      const targetH = parent.clientHeight * renderScale;
      
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3 * renderScale;

    const drawLine = (points: {x:number, y:number}[], color: string) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(points[0].x / 100 * canvas.width, points[0].y / 100 * canvas.height);

      if (points.length === 2) {
        ctx.lineTo(points[1].x / 100 * canvas.width, points[1].y / 100 * canvas.height);
      } else {
        for (let i = 1; i < points.length - 2; i++) {
          const xc = ((points[i].x + points[i + 1].x) / 2) / 100 * canvas.width;
          const yc = ((points[i].y + points[i + 1].y) / 2) / 100 * canvas.height;
          ctx.quadraticCurveTo(points[i].x / 100 * canvas.width, points[i].y / 100 * canvas.height, xc, yc);
        }
        ctx.quadraticCurveTo(
          points[points.length - 2].x / 100 * canvas.width, 
          points[points.length - 2].y / 100 * canvas.height, 
          points[points.length - 1].x / 100 * canvas.width, 
          points[points.length - 1].y / 100 * canvas.height
        );
      }
      ctx.stroke();
    };

    drawings.forEach(d => drawLine(d.points, d.color));
    if (activeDrawing) drawLine(activeDrawing, currentColor);
  }, [drawings, activeDrawing, currentColor, fieldType, isAnyDialogOpen, renderScale]);

  if (!mounted) return null;

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-black overflow-hidden relative touch-none select-none",
      isLegacyDevice && "perf-lite"
    )} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      {/* MARCADOR DE GOLES */}
      <div className="fixed top-4 left-20 lg:left-32 z-[100] flex items-center gap-3 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-700 scale-[0.75] origin-top-left lg:scale-100 glass-panel">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-primary/40 uppercase">LOC</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-primary/20 hover:text-primary text-[8px]">-</button>
              <span className="text-xl font-black text-primary cyan-text-glow tabular-nums">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-primary/20 hover:text-primary text-[8px]">+</button>
            </div>
          </div>
          <div className="text-xs font-black text-white/20 italic">VS</div>
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-rose-400/40 uppercase">VIS</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-rose-500/20 hover:text-rose-500 text-[8px]">-</button>
              <span className="text-xl font-black text-rose-500 rose-text-glow tabular-nums">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-rose-500/20 hover:text-rose-500 text-[8px]">+</button>
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRÍA, TIEMPO Y GUARDADO */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 animate-in slide-in-from-right-4 duration-700 scale-[0.75] origin-top-right lg:scale-100">
        <Button 
          onClick={handleSaveMatch}
          className="h-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:scale-105 transition-all border-none hidden sm:flex"
        >
          <Save className="h-4 w-4 mr-2" /> GUARDAR
        </Button>

        <Dialog onOpenChange={setIsAnyDialogOpen}>
          <DialogTrigger asChild>
            <button className="h-10 w-10 rounded-xl bg-black/60 backdrop-blur-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 group glass-panel">
              <Watch className="h-4 w-4 group-hover:animate-pulse" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#04070c]/98 backdrop-blur-xl border-primary/20 text-white max-w-sm rounded-[2rem] shadow-[0_0_50px_rgba(0,242,255,0.2)]">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Watch_Link_Protocol</span>
              </div>
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">VINCULAR RELOJ</DialogTitle>
            </DialogHeader>
            <div className="py-10 flex flex-col items-center gap-6">
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl w-full text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
                <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4">Código de Emparejamiento</p>
                <span className="text-5xl font-black font-headline tracking-[0.2em] text-primary cyan-text-glow italic relative z-10">
                  {pairingCode}
                </span>
              </div>
              <p className="text-[10px] text-white/40 text-center uppercase font-bold tracking-widest leading-loose italic">
                Introduzca este código en su Smartwatch para sincronizar la telemetría y el cronómetro master en tiempo real.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-xl border border-primary/30 rounded-xl shadow-2xl transition-all glass-panel">
          <div className="flex items-center gap-1 border-r border-white/10 pr-1">
            <Select onValueChange={(v) => handleSetPresetTime(parseInt(v))}>
              <SelectTrigger className="h-7 w-8 bg-transparent border-none text-primary/40 hover:text-primary transition-all p-0 focus:ring-0">
                <Timer className="h-3.5 w-3.5" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-primary/20">
                {[15, 20, 25, 30, 35, 40, 45].map(m => (
                  <SelectItem key={m} value={m.toString()} className="text-[10px] font-black uppercase">{m} MIN</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className={cn("text-xl font-black font-headline tabular-nums tracking-tighter transition-all duration-500", isRunning ? "text-primary cyan-text-glow" : "text-white/40")}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-1 border-l border-white/10 pl-2">
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-300 active:scale-90",
                isRunning ? "text-amber-400 hover:bg-amber-400/10" : "text-emerald-400 hover:bg-emerald-400/10"
              )}
              title={isRunning ? "Pausar" : "Iniciar"}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(45 * 60); }} 
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
              title="Resetear"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center pt-20 pb-28">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes} isHalfField={false} containerRef={fieldRef}>
          <canvas 
            ref={canvasRef} 
            onPointerDown={handleCanvasPointerDown} 
            className="absolute inset-0 z-30 pointer-events-auto"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute inset-0 z-40 pointer-events-none">
            {players.map(p => (
              <MemoizedPlayerChip 
                key={p.id} 
                team={p.team} 
                number={p.number} 
                label={p.name} 
                x={p.x} 
                y={p.y} 
                isDragging={draggingId === p.id} 
                onPointerDown={(e) => handlePointerDownPlayer(e, p.id)} 
                className="pointer-events-auto"
              />
            ))}
          </div>
        </TacticalField>
      </main>

      {/* CONTROLES TÁCTICOS INFERIORES - OPTIMIZACIÓN v49.0.0 */}
      <div className="fixed bottom-6 left-0 right-0 px-2 lg:px-4 z-[150] pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto gap-1.5 lg:gap-3 lg:scale-100 scale-85 origin-bottom">
          
          {/* BLOQUE LOCAL (IZQUIERDA) */}
          <div className="flex items-center gap-1.5 lg:gap-2 pointer-events-auto shrink-0">
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 transition-all glass-panel">
              <Select value={homeFormation} onValueChange={setHomeFormation}>
                <SelectTrigger className="h-8 w-20 lg:w-24 bg-black border-primary/10 text-white font-black uppercase text-[9px] lg:text-[10px] rounded-lg focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  <SelectItem value="NINGUNA" className="text-[10px] font-black uppercase text-rose-500 italic">LIMPIAR</SelectItem>
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <div className="flex gap-0.5 lg:gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setHomePhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-2 lg:px-2.5 rounded-lg text-[8px] lg:text-[9px] font-black uppercase transition-all",
                      homePhase === p.toLowerCase() ? "bg-primary text-black cyan-glow" : "text-white/20 hover:bg-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setHomeShift("left")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", homeShift === 'left' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" /></button>
                <button onClick={() => setHomeShift("center")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", homeShift === 'center' ? 'bg-primary/20 text-primary' : 'text-white/10')}><div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-current" /></button>
                <button onClick={() => setHomeShift("right")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", homeShift === 'right' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" /></button>
              </div>
            </div>
          </div>

          {/* MANDO CENTRAL (CENTRO) - COMPACTADO */}
          <div className="flex-1 flex justify-center pointer-events-auto min-w-0">
            <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 h-10 lg:h-11 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl max-w-full overflow-hidden glass-panel">
              <div className="flex items-center gap-1.5 lg:gap-2 pr-2 lg:pr-3 border-r border-white/10 shrink-0">
                {["#00f2ff", "#f43f5e", "#facc15"].map(c => (
                  <button key={c} onClick={() => setCurrentColor(c)} className={cn("h-4 w-4 lg:h-5 lg:w-5 rounded-full border-2 transition-all", currentColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
                ))}
                <button onClick={() => setDrawings([])} className="text-rose-500/40 hover:text-rose-500 p-1 lg:p-1.5 transition-all active:scale-90" title="Borrar">
                  <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 lg:gap-3 px-1 border-r border-white/10 pr-2 lg:pr-3 shrink-0">
                <button 
                  onClick={() => setShowLanes(!showLanes)}
                  className={cn("h-8 px-2 lg:px-3 rounded-lg flex items-center gap-1.5 lg:gap-2 transition-all text-[8px] lg:text-[9px] font-black uppercase", showLanes ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white")}
                >
                  <Columns3 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  <span className="hidden md:inline">Carriles</span>
                </button>
                <button onClick={toggleFullscreen} className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-primary transition-all active:scale-90">
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <Maximize2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 lg:gap-3 pr-1 shrink-0 overflow-hidden">
                <Trophy className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary animate-pulse shrink-0" />
                <div className="flex flex-col leading-none">
                  <span className="text-[6px] lg:text-[7px] font-black text-primary tracking-widest uppercase">MATCH</span>
                  <h1 className="text-[8px] lg:text-[10px] font-headline font-black text-white italic uppercase tracking-tight mt-0.5 truncate">LIVE</h1>
                </div>
              </div>
            </div>
          </div>

          {/* BLOQUE VISITANTE (DERECHA) - ESPEJO Y COMPACTO */}
          <div className="flex items-center gap-1.5 lg:gap-2 pointer-events-auto shrink-0">
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setGuestShift("left")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", guestShift === 'left' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" /></button>
                <button onClick={() => setGuestShift("center")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", guestShift === 'center' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-current" /></button>
                <button onClick={() => setGuestShift("right")} className={cn("h-7 w-7 lg:h-8 lg:w-8 rounded-md flex items-center justify-center transition-all", guestShift === 'right' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" /></button>
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <div className="flex gap-0.5 lg:gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setGuestPhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-2 lg:px-2.5 rounded-lg text-[8px] lg:text-[9px] font-black uppercase transition-all",
                      guestPhase === p.toLowerCase() ? "bg-rose-500 text-black rose-glow" : "text-white/20 hover:bg-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <Select value={guestFormation} onValueChange={setGuestFormation}>
                <SelectTrigger className="h-8 w-20 lg:w-24 bg-black border-rose-500/10 text-white font-black uppercase text-[9px] lg:text-[10px] rounded-lg focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                  <SelectItem value="NINGUNA" className="text-[10px] font-black uppercase text-rose-500 italic">LIMPIAR</SelectItem>
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ROSTER LATERAL */}
      <Sheet onOpenChange={setIsAnyDialogOpen}>
        <SheetTrigger asChild>
          <button className="fixed bottom-20 right-4 lg:bottom-24 lg:right-6 h-10 w-10 lg:h-12 lg:w-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-110 transition-all duration-300 z-[160] active:scale-95">
            <Users className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="bg-[#04070c]/98 backdrop-blur-xl border-l border-primary/20 text-white sm:max-w-md">
          <SheetHeader className="p-6 border-b border-white/5">
            <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">ROSTER_LIVE</SheetTitle>
          </SheetHeader>
          <div className="p-6 overflow-y-auto h-full space-y-3">
            {players.filter(p => p.team === 'local').map(p => (
              <div key={p.id} className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between transition-all duration-300 hover:bg-primary/10">
                <span className="text-[10px] font-black text-white italic">#{p.number} {p.name}</span>
                <Badge className="bg-primary/10 text-primary text-[7px] font-black uppercase">EN CAMPO</Badge>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
