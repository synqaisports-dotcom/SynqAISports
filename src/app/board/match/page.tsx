
"use client";

import { useState, useEffect, useMemo, useRef, memo, useCallback } from "react";
import { 
  Trophy, 
  Clock, 
  Save, 
  LayoutGrid, 
  Play, 
  Pause, 
  RotateCcw, 
  Users,
  Plus,
  Watch,
  Activity,
  ArrowRight,
  Maximize2,
  Trash2,
  MousePointer2,
  Paintbrush,
  MoveHorizontal,
  ChevronUp,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Menu,
  Zap
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

type TacticalPhase = "defensa" | "tda" | "salida" | "ataque" | "tad";

interface PlayerPos {
  id: string;
  number: number;
  name: string;
  team: "local" | "visitor";
  x: number;
  y: number;
}

const MemoizedPlayerChip = memo(PlayerChip);

export default function MatchBoardPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [homePhase, setHomePhase] = useState<TacticalPhase>("defensa");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("defensa");
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");
  const [homeShift, setHomeShift] = useState<"left" | "center" | "right">("center");
  const [guestShift, setGuestShift] = useState<"left" | "center" | "right">("center");
  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [pairingCode, setPairingCode] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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

    const hp = hForm.map((pos, idx) => {
      let finalX = (0.05 + (pos.x * 0.9)) * 100;
      let finalY = pos.y * 100;
      if (idx === 0) { finalX = 5; finalY = 50; } 
      else {
        finalY = finalY + shiftX(homeShift);
      }
      return { id: `local-${idx}`, number: idx + 1, name: `JUGADOR ${idx + 1}`, team: "local" as const, x: finalX, y: finalY };
    });

    const gp = gForm.map((pos, idx) => {
      let finalX = (0.95 - (pos.x * 0.9)) * 100;
      let finalY = (1 - pos.y) * 100;
      if (idx === 0) { finalX = 95; finalY = 50; }
      else {
        finalY = finalY - shiftX(guestShift);
      }
      return { id: `visitor-${idx}`, number: idx + 1, name: `RIVAL ${idx + 1}`, team: "visitor" as const, x: finalX, y: finalY };
    });

    setPlayers([...hp, ...gp]);
  }, [fieldType, homeFormation, guestFormation, homeShift, guestShift]);

  useEffect(() => { calculatePositions(); }, [calculatePositions]);

  const handlePointerDownPlayer = (e: React.PointerEvent, id: string) => {
    if (isPaintMode) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlayers(prev => prev.map(p => p.id === draggingId ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative touch-none select-none" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      {/* MARCADOR CENTRAL - v15.1.0 */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-2 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl transition-all scale-90 md:scale-100">
        <div className="flex flex-col items-start border-r border-white/10 pr-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[8px] font-black text-primary tracking-widest uppercase">MATCH_LIVE</span>
          </div>
          <h1 className="text-[10px] font-headline font-black text-white italic uppercase tracking-tight leading-none">DIRECTO</h1>
        </div>

        <div className="flex items-center gap-8 px-4 bg-black/20 border border-white/5 rounded-2xl py-1.5 min-w-[200px] justify-center">
          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-white/40 uppercase mb-1">LOCAL</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-white/20 hover:text-white text-xs">-</button>
              <span className="text-2xl font-black text-white tabular-nums">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-white/20 hover:text-white text-xs">+</button>
            </div>
          </div>
          
          <div className="text-xl font-black text-white/20 italic self-end pb-1">VS</div>

          <div className="flex flex-col items-center">
            <span className="text-[7px] font-black text-white/40 uppercase mb-1">VISITANTE</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-white/20 hover:text-white text-xs">-</button>
              <span className="text-2xl font-black text-white tabular-nums">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-white/20 hover:text-white text-xs">+</button>
            </div>
          </div>
        </div>
      </header>

      {/* ISLA DE TELEMETRÍA Y GUARDADO (TOP-RIGHT) - v15.2.0 */}
      <div className="fixed top-4 right-6 z-[100] flex items-center gap-3 animate-in slide-in-from-right-4 duration-700">
        
        {/* BOTÓN VINCULACIÓN WATCH (EXTRAÍDO Y FUNCIONAL) */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-2xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 group">
              <Watch className="h-5 w-5 group-hover:animate-pulse" />
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

        <div className="flex items-center gap-4 px-4 py-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center min-w-[70px]">
            <span className={cn("text-2xl font-black font-headline tabular-nums tracking-tighter", isRunning ? "text-primary cyan-text-glow" : "text-white/40")}>
              {formatTime(timeLeft)}
            </span>
            <button onClick={() => setIsRunning(!isRunning)} className="text-[7px] font-black uppercase text-primary/60 tracking-widest hover:text-primary">{isRunning ? 'PAUSE' : 'START'}</button>
          </div>
        </div>

        <Button className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-2xl cyan-glow border-none shadow-xl hover:scale-105 transition-all">
          GUARDAR
        </Button>
      </div>

      {/* ÁREA DE JUEGO */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center pt-20 pb-28">
        <TacticalField theme="cyan" fieldType={fieldType} containerRef={fieldRef}>
          <canvas ref={canvasRef} className={cn("absolute inset-0 z-30 pointer-events-none", isPaintMode && "pointer-events-auto")} />
          <div className="absolute inset-0 z-20">
            {players.map(p => (
              <MemoizedPlayerChip key={p.id} team={p.team} number={p.number} label={p.name} x={p.x} y={p.y} isDragging={draggingId === p.id} onPointerDown={(e) => handlePointerDownPlayer(e, p.id)} />
            ))}
          </div>
        </TacticalField>
      </main>

      {/* CONTROLES INFERIORES ANCLADOS */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-[150] pointer-events-none">
        <div className="flex items-end justify-between w-full max-w-[1600px] mx-auto">
          
          {/* ISLA LOCAL - ANCLADA IZQUIERDA */}
          <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-primary/20 p-3 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-left-4 shadow-2xl scale-[0.85] lg:scale-100 origin-bottom-left">
            <div className="flex flex-col gap-1 border-r border-white/10 pr-4">
              <span className="text-[7px] font-black text-primary italic uppercase tracking-widest leading-none">LOCAL_SQUAD</span>
              <Select value={homeFormation} onValueChange={setHomeFormation}>
                <SelectTrigger className="h-8 w-28 bg-black border-primary/20 text-white font-black uppercase text-[9px] rounded-xl focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setHomePhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-3 rounded-xl text-[8px] font-black uppercase transition-all",
                      homePhase === p.toLowerCase() ? "bg-primary text-black cyan-glow" : "text-white/20 hover:bg-white/5 border border-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                <button onClick={() => setHomeShift("left")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", homeShift === 'left' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setHomeShift("center")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", homeShift === 'center' ? 'bg-primary/20 text-primary' : 'text-white/10')}><div className="h-1.5 w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setHomeShift("right")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", homeShift === 'right' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* ISLA HERRAMIENTAS - CENTRO */}
          <div className="pointer-events-auto bg-black/90 backdrop-blur-2xl border border-white/10 p-2 rounded-2xl flex items-center gap-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-4 scale-[0.85] lg:scale-100 origin-bottom">
            <button onClick={() => setIsPaintMode(false)} className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", !isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20 hover:text-white/40")}>
              <MousePointer2 className="h-5 w-5" />
            </button>
            <button onClick={() => setIsPaintMode(true)} className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20 hover:text-white/40")}>
              <Paintbrush className="h-5 w-5" />
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <div className="flex gap-1.5">
              {["#00f2ff", "#f43f5e", "#facc15"].map(c => (
                <button key={c} onClick={() => setCurrentColor(c)} className={cn("h-5 w-5 rounded-full border-2 transition-all", currentColor === c ? "border-white scale-110" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <button className="text-rose-500/40 hover:text-rose-500 p-2"><Trash2 className="h-5 w-5" /></button>
          </div>

          {/* ISLA VISITANTE - ANCLADA DERECHA */}
          <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-rose-500/20 p-3 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-right-4 shadow-2xl scale-[0.85] lg:scale-100 origin-bottom-right">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setGuestPhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-8 px-3 rounded-xl text-[8px] font-black uppercase transition-all",
                      guestPhase === p.toLowerCase() ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "text-white/20 hover:bg-white/5 border border-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                <button onClick={() => setGuestShift("left")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", guestShift === 'left' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setGuestShift("center")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", guestShift === 'center' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><div className="h-1.5 w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setGuestShift("right")} className={cn("flex-1 h-6 rounded-lg flex items-center justify-center transition-all", guestShift === 'right' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
              <span className="text-[7px] font-black text-rose-500 italic uppercase tracking-widest leading-none text-right">VISIT_SQUAD</span>
              <Select value={guestFormation} onValueChange={setGuestFormation}>
                <SelectTrigger className="h-8 w-28 bg-black border-rose-500/20 text-white font-black uppercase text-[9px] rounded-xl focus:ring-0">
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

      {/* BOTONES AUXILIARES */}
      <button className="fixed top-1/2 right-6 -translate-y-1/2 h-10 w-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/20 hover:text-primary transition-all shadow-xl z-[160] active:scale-95">
        <Settings2 className="h-5 w-5" />
      </button>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed bottom-32 right-6 h-12 w-12 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-110 transition-all z-[160] active:scale-95">
            <Users className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white sm:max-w-md">
          <SheetHeader className="p-6 border-b border-white/5">
            <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">ROSTER_LIVE</SheetTitle>
          </SheetHeader>
          <div className="p-6 overflow-y-auto h-full space-y-3">
            {players.filter(p => p.team === 'local').map(p => (
              <div key={p.id} className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
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
