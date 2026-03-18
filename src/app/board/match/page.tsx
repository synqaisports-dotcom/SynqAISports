
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
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { PlayerChip } from "@/components/board/PlayerChip";
import { FORMATIONS_DATA } from "@/lib/formations";
import { useAuth } from "@/lib/auth-context";
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
 * MatchBoardPage - v18.0.0
 * PROTOCOLO_DEFENSIVE_MIDFIELD_LOCK:
 * - Restricción de 50% en fase DEF para que nadie pase del medio campo.
 * - Ajuste de offset defensivo para repliegue en área grande.
 */
export default function MatchBoardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
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
  
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<{x: number, y: number}[] | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
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

  const calculatePositions = useCallback(() => {
    const formationsForField = FORMATIONS_DATA[fieldType];
    const hForm = formationsForField[homeFormation] || formationsForField["4-3-3"];
    const gForm = formationsForField[guestFormation] || formationsForField["4-3-3"];

    const shiftX = (side: "left" | "center" | "right") => {
      if (side === "left") return -5;
      if (side === "right") return 5;
      return 0;
    };

    const phaseOffset = (phase: TacticalPhase) => {
      switch(phase) {
        case 'def': return -20; // Repliegue a área propia
        case 'tda': return -5;  
        case 'sal': return 10;  
        case 'atk': return 25;  
        default: return 0;
      }
    };

    const hp = hForm.map((pos, idx) => {
      let finalX = (0.05 + (pos.x * 0.9)) * 100;
      let finalY = pos.y * 100;
      if (idx === 0) { finalX = 5; finalY = 50; } 
      else {
        finalY = finalY + shiftX(homeShift);
        finalX = finalX + phaseOffset(homePhase);
        // CONSTRAINT: Ningún jugador pasa del centro del campo en DEFENSA
        if (homePhase === 'def') finalX = Math.min(50, finalX);
        finalX = Math.max(5, Math.min(95, finalX));
      }
      return { id: `local-${idx}`, number: idx + 1, name: `JUGADOR ${idx + 1}`, team: "local" as const, x: finalX, y: finalY };
    });

    const gp = gForm.map((pos, idx) => {
      let finalX = (0.95 - (pos.x * 0.9)) * 100;
      let finalY = (1 - pos.y) * 100;
      if (idx === 0) { finalX = 95; finalY = 50; }
      else {
        finalY = finalY - shiftX(guestShift);
        finalX = finalX - phaseOffset(guestPhase);
        // CONSTRAINT: Ningún jugador pasa del centro del campo en DEFENSA
        if (guestPhase === 'def') finalX = Math.max(50, finalX);
        finalX = Math.max(5, Math.min(95, finalX));
      }
      return { id: `visitor-${idx}`, number: idx + 1, name: `RIVAL ${idx + 1}`, team: "visitor" as const, x: finalX, y: finalY };
    });

    setPlayers([...hp, ...gp]);
  }, [fieldType, homeFormation, guestFormation, homeShift, guestShift, homePhase, guestPhase]);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (parent) {
      if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;

    const drawLine = (points: {x:number, y:number}[], color: string) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(points[0].x / 100 * canvas.width, points[0].y / 100 * canvas.height);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x / 100 * canvas.width, points[i].y / 100 * canvas.height);
      }
      ctx.stroke();
    };

    drawings.forEach(d => drawLine(d.points, d.color));
    if (activeDrawing) drawLine(activeDrawing, currentColor);
  }, [drawings, activeDrawing, currentColor, fieldType]);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative touch-none select-none" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl transition-all scale-[0.8] lg:scale-100">
        <div className="flex items-center gap-1 px-1 border-r border-white/10 pr-2 mr-1">
          <div className="flex items-center gap-1.5 px-1.5">
            {["#00f2ff", "#f43f5e", "#facc15"].map(c => (
              <button key={c} onClick={() => setCurrentColor(c)} className={cn("h-4 w-4 rounded-full border transition-all duration-300", currentColor === c ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />
          <button onClick={() => setDrawings([])} className="text-rose-500/40 hover:text-rose-500 p-1.5 transition-colors duration-300 active:scale-90" title="Borrar Trazos">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-primary transition-all active:scale-90 border-r border-white/10 pr-2 mr-1"
          title={isFullscreen ? "Minimizar" : "Pantalla Completa"}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
        <div className="flex items-center gap-2 pr-2">
          <Trophy className="h-3 w-3 text-primary animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-primary tracking-widest uppercase">MATCH_LIVE</span>
            <h1 className="text-[8px] font-headline font-black text-white italic uppercase tracking-tight leading-none">DIRECTO</h1>
          </div>
        </div>
      </header>

      <div className="fixed top-4 left-24 z-[100] flex items-center gap-3 px-3 py-1 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-700 scale-[0.8] lg:scale-100">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-white/40 uppercase">LOC</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-white/20 hover:text-white text-[8px]">-</button>
              <span className="text-xl font-black text-white tabular-nums">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-white/20 hover:text-white text-[8px]">+</button>
            </div>
          </div>
          <div className="text-xs font-black text-white/20 italic">VS</div>
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-white/40 uppercase">VIS</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-white/20 hover:text-white text-[8px]">-</button>
              <span className="text-xl font-black text-white tabular-nums">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-white/20 hover:text-white text-[8px]">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 animate-in slide-in-from-right-4 duration-700 scale-[0.8] lg:scale-100">
        <Dialog>
          <DialogTrigger asChild>
            <button className="h-10 w-10 rounded-xl bg-black/60 backdrop-blur-2xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 group">
              <Watch className="h-4 w-4 group-hover:animate-pulse" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[#04070c]/98 backdrop-blur-3xl border-primary/20 text-white max-w-sm rounded-[2rem] shadow-[0_0_50px_rgba(0,242,255,0.2)]">
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

        <div className="flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl">
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

        <Button className="h-10 bg-primary text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl cyan-glow border-none shadow-xl hover:scale-105 transition-all duration-300">
          GUARDAR
        </Button>
      </div>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center pt-20 pb-28">
        <TacticalField theme="cyan" fieldType={fieldType} containerRef={fieldRef}>
          <canvas ref={canvasRef} onPointerDown={handleCanvasPointerDown} className="absolute inset-0 z-30 pointer-events-auto" />
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

      <div className="fixed bottom-6 left-0 right-0 px-6 z-[150] pointer-events-none">
        <div className="flex items-end justify-between w-full max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <Select value={homeFormation} onValueChange={setHomeFormation}>
                <SelectTrigger className="h-8 w-24 bg-black border-primary/10 text-white font-black uppercase text-[9px] rounded-lg focus:ring-0 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setHomePhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-3 rounded-lg text-[8px] font-black uppercase transition-all duration-300",
                      homePhase === p.toLowerCase() ? "bg-primary text-black cyan-glow" : "text-white/20 hover:bg-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-primary/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setHomeShift("left")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", homeShift === 'left' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronLeft className="h-3 w-3" /></button>
                <button onClick={() => setHomeShift("center")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", homeShift === 'center' ? 'bg-primary/20 text-primary' : 'text-white/10')}><div className="h-1.5 w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setHomeShift("right")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", homeShift === 'right' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
                <button onClick={() => setGuestShift("left")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", guestShift === 'left' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronLeft className="h-3 w-3" /></button>
                <button onClick={() => setGuestShift("center")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", guestShift === 'center' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><div className="h-1.5 w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setGuestShift("right")} className={cn("h-7 w-7 rounded-md flex items-center justify-center transition-all duration-300", guestShift === 'right' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setGuestPhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-3 rounded-lg text-[8px] font-black uppercase transition-all duration-300",
                      guestPhase === p.toLowerCase() ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "text-white/20 hover:bg-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 transition-all duration-500">
              <Select value={guestFormation} onValueChange={setGuestFormation}>
                <SelectTrigger className="h-8 w-24 bg-black border-rose-500/10 text-white font-black uppercase text-[9px] rounded-lg focus:ring-0 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed bottom-32 right-6 h-12 w-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-110 transition-all duration-300 z-[160] active:scale-95">
            <Users className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white sm:max-w-md">
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
