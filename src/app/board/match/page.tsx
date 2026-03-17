
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
  Menu
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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
      
      {/* CABECERA COMPACTADA PARA TABLET (REDUCCIÓN ALTURA) */}
      <header className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 md:px-6 py-1.5 bg-black/80 md:bg-black/60 md:backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl scale-90 lg:scale-100 transition-all">
        <div className="flex flex-col items-start border-r border-white/10 pr-3 md:pr-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-2.5 w-2.5 text-primary animate-pulse" />
            <span className="text-[6px] md:text-[7px] font-black text-primary tracking-widest uppercase">MATCH_LIVE</span>
          </div>
          <h1 className="text-[8px] md:text-[10px] font-headline font-black text-white italic uppercase tracking-tight leading-none">DIRECTO</h1>
        </div>

        <div className="flex items-center gap-3 md:gap-4 px-3 md:px-4 bg-black/20 border border-white/5 rounded-xl py-1 md:py-1.5">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-white/20 hover:text-white text-[10px]">-</button>
            <span className="text-sm md:text-lg font-black text-white tabular-nums">{score.home}</span>
            <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-white/20 hover:text-white text-[10px]">+</button>
          </div>
          
          <div className="flex flex-col items-center min-w-[50px] md:min-w-[60px]">
            <span className={cn("text-base md:text-xl font-black font-headline tabular-nums tracking-tighter", isRunning ? "text-primary cyan-text-glow" : "text-white/40")}>
              {formatTime(timeLeft)}
            </span>
            <button onClick={() => setIsRunning(!isRunning)} className="text-[5px] md:text-[6px] font-black uppercase text-primary/60 tracking-widest">{isRunning ? 'PAUSE' : 'START'}</button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-white/20 hover:text-white text-[10px]">-</button>
            <span className="text-sm md:text-lg font-black text-white tabular-nums">{score.guest}</span>
            <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-white/20 hover:text-white text-[10px]">+</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
            <Watch className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <Button className="h-7 md:h-8 bg-primary text-black font-black uppercase text-[7px] md:text-[8px] tracking-widest px-3 md:px-4 rounded-lg cyan-glow border-none">
            GUARDAR
          </Button>
        </div>
      </header>

      {/* CAMPO TÁCTICO - CENTRADO CON MARGEN DE SEGURIDAD */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center pt-16 pb-24">
        <TacticalField theme="cyan" fieldType={fieldType} containerRef={fieldRef}>
          <canvas ref={canvasRef} className={cn("absolute inset-0 z-30 pointer-events-none", isPaintMode && "pointer-events-auto")} />
          <div className="absolute inset-0 z-20">
            {players.map(p => (
              <MemoizedPlayerChip key={p.id} team={p.team} number={p.number} label={p.name} x={p.x} y={p.y} isDragging={draggingId === p.id} onPointerDown={(e) => handlePointerDownPlayer(e, p.id)} />
            ))}
          </div>
        </TacticalField>
      </main>

      {/* ISLAS DE MANDO FLOTANTES - ESCALA COMPACTA 0.8x PARA TABLET */}
      <div className="fixed bottom-4 left-0 right-0 px-4 md:px-6 z-[150] pointer-events-none">
        <div className="flex items-end justify-between w-full max-w-[1400px] mx-auto">
          
          {/* ISLA LOCAL - ANCLADA IZQUIERDA */}
          <div className="pointer-events-auto bg-black/80 md:bg-black/60 md:backdrop-blur-2xl border border-primary/20 p-2 md:p-3 rounded-2xl md:rounded-[1.5rem] flex items-center gap-3 md:gap-4 animate-in slide-in-from-left-4 shadow-2xl scale-[0.85] lg:scale-100 origin-bottom-left">
            <div className="flex flex-col gap-1 border-r border-white/10 pr-3">
              <span className="text-[6px] md:text-[7px] font-black text-primary italic uppercase tracking-widest leading-none">LOCAL_SQUAD</span>
              <Select value={homeFormation} onValueChange={setHomeFormation}>
                <SelectTrigger className="h-6 md:h-7 w-20 md:w-24 bg-black border-primary/20 text-white font-black uppercase text-[7px] md:text-[8px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-primary/20">
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[8px] font-black">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 md:gap-2">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setHomePhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-6 md:h-7 px-2 md:px-2.5 rounded-lg text-[6px] md:text-[7px] font-black uppercase transition-all",
                      homePhase === p.toLowerCase() ? "bg-primary text-black cyan-glow" : "text-white/20 hover:bg-white/5 border border-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                <button onClick={() => setHomeShift("left")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", homeShift === 'left' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronLeft className="h-3 w-3" /></button>
                <button onClick={() => setHomeShift("center")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", homeShift === 'center' ? 'bg-primary/20 text-primary' : 'text-white/10')}><div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setHomeShift("right")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", homeShift === 'right' ? 'bg-primary/20 text-primary' : 'text-white/10')}><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
          </div>

          {/* ISLA HERRAMIENTAS - CENTRO */}
          <div className="pointer-events-auto bg-black/90 md:bg-black/80 md:backdrop-blur-2xl border border-white/10 p-1.5 md:p-2 rounded-xl md:rounded-2xl flex items-center gap-1.5 md:gap-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-4 scale-[0.85] lg:scale-100 origin-bottom">
            <button onClick={() => setIsPaintMode(false)} className={cn("h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl flex items-center justify-center transition-all", !isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20 hover:text-white/40")}>
              <MousePointer2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
            <button onClick={() => setIsPaintMode(true)} className={cn("h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl flex items-center justify-center transition-all", isPaintMode ? "bg-primary text-black cyan-glow" : "text-white/20 hover:text-white/40")}>
              <Paintbrush className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
            <div className="w-[1px] h-5 md:h-6 bg-white/10 mx-0.5 md:mx-1" />
            <div className="flex gap-1 md:gap-1.5">
              {["#00f2ff", "#f43f5e", "#facc15"].map(c => (
                <button key={c} onClick={() => setCurrentColor(c)} className={cn("h-3.5 w-3.5 md:h-4 md:w-4 rounded-full border-2 transition-all", currentColor === c ? "border-white scale-110" : "border-transparent opacity-40")} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="w-[1px] h-5 md:h-6 bg-white/10 mx-0.5 md:mx-1" />
            <button className="text-rose-500/40 hover:text-rose-500 p-1.5 md:p-2"><Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" /></button>
          </div>

          {/* ISLA VISITANTE - ANCLADA DERECHA */}
          <div className="pointer-events-auto bg-black/80 md:bg-black/60 md:backdrop-blur-2xl border border-rose-500/20 p-2 md:p-3 rounded-2xl md:rounded-[1.5rem] flex items-center gap-3 md:gap-4 animate-in slide-in-from-right-4 shadow-2xl scale-[0.85] lg:scale-100 origin-bottom-right">
            <div className="flex flex-col gap-1.5 md:gap-2">
              <div className="flex gap-1">
                {["DEF", "TDA", "SAL", "ATK"].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setGuestPhase(p.toLowerCase() as TacticalPhase)}
                    className={cn(
                      "h-6 md:h-7 px-2 md:px-2.5 rounded-lg text-[6px] md:text-[7px] font-black uppercase transition-all",
                      guestPhase === p.toLowerCase() ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]" : "text-white/20 hover:bg-white/5 border border-white/5"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
                <button onClick={() => setGuestShift("left")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", guestShift === 'left' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronLeft className="h-3 w-3" /></button>
                <button onClick={() => setGuestShift("center")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", guestShift === 'center' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-current" /></button>
                <button onClick={() => setGuestShift("right")} className={cn("flex-1 h-4 md:h-5 rounded-md flex items-center justify-center transition-all", guestShift === 'right' ? 'bg-rose-500/20 text-rose-500' : 'text-white/10')}><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
              <span className="text-[6px] md:text-[7px] font-black text-rose-500 italic uppercase tracking-widest leading-none text-right">VISIT_SQUAD</span>
              <Select value={guestFormation} onValueChange={setGuestFormation}>
                <SelectTrigger className="h-6 md:h-7 w-20 md:w-24 bg-black border-rose-500/20 text-white font-black uppercase text-[7px] md:text-[8px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black border-rose-500/20">
                  {Object.keys(FORMATIONS_DATA[fieldType]).map(f => <SelectItem key={f} value={f} className="text-[8px] font-black">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>
      </div>

      {/* BOTONES AUXILIARES LATERALES - MICRO ESCALA PARA NO TAPAR ÁREAS */}
      <button className="fixed top-1/2 right-4 md:right-6 -translate-y-1/2 h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-black/60 md:backdrop-blur-md border border-white/10 flex items-center justify-center text-white/20 hover:text-primary transition-all shadow-xl z-[160] active:scale-95 scale-[0.8] lg:scale-100">
        <Settings2 className="h-4 w-4 md:h-5 md:w-5" />
      </button>

      <Sheet>
        <SheetTrigger asChild>
          <button className="fixed bottom-24 md:bottom-32 right-4 md:right-6 h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-110 transition-all z-[160] active:scale-95 scale-[0.8] lg:scale-100">
            <Users className="h-4 w-4 md:h-5 md:w-5" />
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
                <Badge className="bg-primary/10 text-primary text-[7px] font-black">EN CAMPO</Badge>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
