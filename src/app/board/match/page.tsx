
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
  ChevronDown, 
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
  ChevronUp
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type TacticalPhase = "defensa" | "tda" | "salida" | "ataque" | "tad";
type LateralShift = "left" | "center" | "right";

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
  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // LÓGICA DE TIEMPO
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

  // CÁLCULO DE POSICIONES TÁCTICAS
  const calculatePositions = useCallback(() => {
    const formationsForField = FORMATIONS_DATA[fieldType];
    const hForm = formationsForField[homeFormation] || formationsForField["4-3-3"];
    const gForm = formationsForField[guestFormation] || formationsForField["4-3-3"];

    const hp = hForm.map((pos, idx) => {
      let finalX = (0.05 + (pos.x * 0.9)) * 100;
      let finalY = pos.y * 100;
      if (idx === 0) { finalX = 5; finalY = 50; } // Portero
      return { id: `local-${idx}`, number: idx + 1, name: `JUGADOR ${idx + 1}`, team: "local" as const, x: finalX, y: finalY };
    });

    const gp = gForm.map((pos, idx) => {
      let finalX = (0.95 - (pos.x * 0.9)) * 100;
      let finalY = (1 - pos.y) * 100;
      if (idx === 0) { finalX = 95; finalY = 50; } // Portero
      return { id: `visitor-${idx}`, number: idx + 1, name: `RIVAL ${idx + 1}`, team: "visitor" as const, x: finalX, y: finalY };
    });

    setPlayers([...hp, ...gp]);
  }, [fieldType, homeFormation, guestFormation]);

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
    <div className="flex-1 flex flex-col bg-black overflow-hidden relative touch-none" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      {/* 1. CABECERA DE COMPETICIÓN (SEGÚN IMAGEN) */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-8 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
        <div className="flex flex-col items-start border-r border-white/10 pr-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[8px] font-black text-primary tracking-[0.4em] uppercase">MATCH_LIVE</span>
          </div>
          <h1 className="text-sm font-headline font-black text-white italic uppercase tracking-tighter leading-none">PARTIDO</h1>
        </div>

        <div className="flex items-center gap-6 px-6 bg-black/40 border border-white/5 rounded-2xl py-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-white/20 hover:text-white">-</button>
            <span className="text-2xl font-black text-white tabular-nums">{score.home}</span>
            <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-white/20 hover:text-white">+</button>
          </div>
          
          <div className="flex flex-col items-center min-w-[80px]">
            <span className={cn("text-2xl font-black font-headline tabular-nums tracking-tighter", isRunning ? "text-primary cyan-text-glow" : "text-white/40")}>
              {formatTime(timeLeft)}
            </span>
            <button onClick={() => setIsRunning(!isRunning)} className="text-[7px] font-black uppercase text-primary/60 tracking-widest">{isRunning ? 'PAUSE' : 'START'}</button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-white/20 hover:text-white">-</button>
            <span className="text-2xl font-black text-white tabular-nums">{score.guest}</span>
            <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-white/20 hover:text-white">+</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
            <Watch className="h-5 w-5" />
          </button>
          <Button className="h-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow border-none">
            <Save className="h-4 w-4 mr-2" /> GUARDAR
          </Button>
        </div>
      </header>

      {/* 2. CAMPO TÁCTICO */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        <TacticalField theme="cyan" fieldType={fieldType} containerRef={fieldRef}>
          <canvas ref={canvasRef} className={cn("absolute inset-0 z-30 pointer-events-none", isPaintMode && "pointer-events-auto")} />
          <div className="absolute inset-0 z-20">
            {players.map(p => (
              <MemoizedPlayerChip key={p.id} team={p.team} number={p.number} label={p.name} x={p.x} y={p.y} isDragging={draggingId === p.id} onPointerDown={(e) => handlePointerDownPlayer(e, p.id)} />
            ))}
          </div>
        </TacticalField>
      </main>

      {/* 3. BARRA DE MANDO UNIFICADA (SEGÚN IMAGEN) */}
      <div className="fixed bottom-0 left-0 right-0 h-28 bg-[#04070c]/90 backdrop-blur-3xl border-t border-white/5 z-[150] px-8 flex items-center justify-between">
        
        {/* LADO LOCAL */}
        <div className="flex-1 flex items-center gap-8 max-w-[40%]">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-primary italic uppercase tracking-widest ml-1">LOCAL_SQUAD</span>
            <Select value={homeFormation} onValueChange={setHomeFormation}>
              <SelectTrigger className="h-10 w-32 bg-black border-white/10 text-white font-black uppercase text-[10px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-primary/20">
                {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black">{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {["DEF", "TDA", "SALIDA", "ATK"].map(p => (
              <button 
                key={p} 
                onClick={() => setHomePhase(p.toLowerCase() as TacticalPhase)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
                  homePhase === p.toLowerCase() ? "bg-primary text-black cyan-glow" : "text-white/20 hover:bg-white/5"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* TORRE DE HERRAMIENTAS CENTRAL (DOCK VERTICAL) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="bg-black/90 border border-white/10 rounded-full w-14 py-4 flex flex-col items-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <button onClick={() => setIsPaintMode(false)} className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all", !isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20")}>
              <MousePointer2 className="h-5 w-5" />
            </button>
            <button onClick={() => setIsPaintMode(true)} className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all", isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20")}>
              <Paintbrush className="h-5 w-5" />
            </button>
            <div className="w-6 h-[1px] bg-white/10" />
            <div className="flex flex-col gap-2">
              {["#00f2ff", "#f43f5e", "#facc15", "#ffffff"].map(c => (
                <button key={c} onClick={() => setCurrentColor(c)} className={cn("h-4 w-4 rounded-full border-2 transition-all", currentColor === c ? "border-white scale-110" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="w-6 h-[1px] bg-white/10" />
            <button onClick={() => {}} className="text-rose-500/40 hover:text-rose-500"><Trash2 className="h-5 w-5" /></button>
            <div className="absolute inset-0 bg-primary/5 scan-line opacity-20 pointer-events-none" />
          </div>
        </div>

        {/* LADO VISITANTE */}
        <div className="flex-1 flex items-center justify-end gap-8 max-w-[40%]">
          <div className="flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {["DEF", "TDA", "SALIDA", "ATK", "TAD"].map(p => (
              <button 
                key={p} 
                onClick={() => setGuestPhase(p.toLowerCase() as TacticalPhase)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all",
                  guestPhase === p.toLowerCase() ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "text-white/20 hover:bg-white/5"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="space-y-2 text-right">
            <span className="text-[10px] font-black text-rose-500 italic uppercase tracking-widest mr-1">VISIT_SQUAD</span>
            <Select value={guestFormation} onValueChange={setGuestFormation}>
              <SelectTrigger className="h-10 w-32 bg-black border-white/10 text-white font-black uppercase text-[10px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-rose-500/20">
                {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black">{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* BOTONES AUXILIARES */}
      <button className="fixed bottom-32 left-8 h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-primary transition-all shadow-2xl z-[160]">
        <Maximize2 className="h-5 w-5" />
      </button>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed bottom-32 right-8 h-14 w-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-110 transition-all z-[160]">
            <Users className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white sm:max-w-md">
          <SheetHeader className="p-6 border-b border-white/5">
            <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">ROSTER_LIVE</SheetTitle>
          </SheetHeader>
          <div className="p-6 overflow-y-auto h-full">
            <div className="space-y-4">
              {players.filter(p => p.team === 'local').map(p => (
                <div key={p.id} className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-black text-white italic">#{p.number} {p.name}</span>
                  <Badge className="bg-primary/10 text-primary text-[8px] font-black">ACTIVO</Badge>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
