
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
  ChevronLeft, 
  ChevronRight, 
  Minimize2, 
  Users,
  Settings,
  Plus,
  CheckCircle2,
  Camera,
  Dna,
  Eye,
  Megaphone,
  Watch,
  Activity,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  X,
  UserPlus,
  Unplug,
  Database,
  Cloud,
  MoveHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { PlayerChip } from "@/components/board/PlayerChip";
import { FORMATIONS_DATA } from "@/lib/formations";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
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
  SheetDescription, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const MOCK_TEAMS = [
  { id: "t1", name: "Infantil A", field: "f11" as FieldType },
  { id: "t2", name: "Alevín B", field: "f7" as FieldType },
  { id: "t5", name: "Equipo Futsal", field: "futsal" as FieldType },
];

const MOCK_PLAYERS_BY_TEAM: Record<string, any[]> = {
  t1: [
    { number: 1, name: "MARC S.", pos: "POR", isStarter: true },
    { number: 2, name: "JUAN P.", pos: "LD", isStarter: true },
    { number: 3, name: "ÁLEX M.", pos: "LI", isStarter: true },
    { number: 4, name: "SERGIO R.", pos: "DFC", isStarter: true },
    { number: 5, name: "HUGO G.", pos: "DFC", isStarter: true },
    { number: 6, name: "MARIO V.", pos: "MCD", isStarter: true },
    { number: 8, name: "LUCAS F.", pos: "MC", isStarter: true },
    { number: 10, name: "ADRIÁN L.", pos: "MCO", isStarter: true },
    { number: 7, name: "DANI C.", pos: "ED", isStarter: true },
    { number: 11, name: "IVÁN B.", pos: "EI", isStarter: true },
    { number: 9, name: "IKER J.", pos: "DC", isStarter: true },
    { number: 12, name: "PABLO V.", pos: "POR", isStarter: false },
    { number: 14, name: "RAÚL G.", pos: "DFC", isStarter: false },
    { number: 15, name: "KOKE M.", pos: "MC", isStarter: false },
    { number: 19, name: "FERRAN T.", pos: "DC", isStarter: false },
  ],
};

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
  const isMobile = useIsMobile();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [selectedTeamId, setSelectedTeamId] = useState("t1");
  
  const [teamRoster, setTeamRoster] = useState<any[]>([]);
  const [homePhase, setHomePhase] = useState<TacticalPhase>("defensa");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("defensa");
  const [homeLateral, setHomeLateral] = useState<LateralShift>("center");
  const [guestLateral, setGuestLateral] = useState<LateralShift>("center");
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  const isPromo = profile?.plan === "free" || profile?.role === "promo_coach";

  useEffect(() => {
    if (isPromo) {
      const savedTeam = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
      if (savedTeam) {
        const type = savedTeam.type as FieldType;
        setFieldType(type);
        const availableFormations = Object.keys(FORMATIONS_DATA[type]);
        setHomeFormation(availableFormations[0]);
        setGuestFormation(availableFormations[0]);
        const mappedRoster = [
          ...savedTeam.starters.map((name: string, i: number) => ({ number: i + 1, name: name || `JUGADOR ${i+1}`, pos: "FLD", isStarter: true })),
          ...savedTeam.substitutes.map((name: string, i: number) => ({ number: savedTeam.starters.length + i + 1, name: name || `SUPLENTE ${i+1}`, pos: "SUB", isStarter: false }))
        ];
        setTeamRoster(mappedRoster);
      }
    } else if (MOCK_PLAYERS_BY_TEAM[selectedTeamId]) {
      setTeamRoster(MOCK_PLAYERS_BY_TEAM[selectedTeamId]);
    }
  }, [isPromo, selectedTeamId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) { setIsRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculatePositions = (team: "local" | "visitor", formation: string, phase: TacticalPhase, lateral: LateralShift, currentRoster: any[]) => {
    const formationsForField = FORMATIONS_DATA[fieldType];
    const baseCoords = formationsForField[formation] || formationsForField[Object.keys(formationsForField)[0]];
    const starters = currentRoster.filter(p => p.isStarter);
    
    return baseCoords.map((pos, idx) => {
      let finalX, finalY;
      const isGK = pos.x < 0.1; const isDEF = pos.x >= 0.1 && pos.x < 0.4; const isMID = pos.x >= 0.4 && pos.x < 0.7; const isATK = pos.x >= 0.7;
      let phaseShift = 0; let yShift = 0;
      
      if (!isGK) {
        if (lateral === "left") yShift = -0.15; else if (lateral === "right") yShift = 0.15;
        
        if (phase === "defensa") { if (isDEF) phaseShift = -0.12; else if (isMID) phaseShift = -0.22; else if (isATK) phaseShift = -0.35; }
        else if (phase === "tda") { if (isDEF) phaseShift = 0.05; else if (isMID) phaseShift = 0.08; else if (isATK) phaseShift = 0.12; }
        else if (phase === "ataque") { if (isDEF) phaseShift = 0.15; else if (isMID) phaseShift = 0.20; else if (isATK) phaseShift = 0.28; }
        else if (phase === "tad") { if (isDEF) phaseShift = -0.05; else if (isMID) phaseShift = -0.08; else if (isATK) phaseShift = -0.12; }
        else if (phase === "salida") { if (isDEF) { phaseShift = -0.10; yShift = idx % 2 === 0 ? -0.2 : 0.2; } }
      }
      
      if (team === "local") { 
        finalX = (0.05 + (pos.x * 0.9) + phaseShift) * 100; 
        finalY = (pos.y + yShift) * 100; 
        if (isGK) { finalX = 5; finalY = 50; } 
      }
      else { 
        finalX = (0.95 - (pos.x * 0.9) - phaseShift) * 100; 
        finalY = ((1 - pos.y) - yShift) * 100; 
        if (isGK) { finalX = 95; finalY = 50; } 
      }
      
      const playerInfo = team === "local" ? starters[idx] : null;
      return { id: `${team}-${idx}`, number: playerInfo?.number || (idx + 1), name: playerInfo?.name || "", team, x: Math.max(2, Math.min(98, finalX)), y: Math.max(5, Math.min(95, finalY)) };
    });
  };

  useEffect(() => {
    const hp = calculatePositions("local", homeFormation, homePhase, homeLateral, teamRoster);
    const gp = calculatePositions("visitor", guestFormation, guestPhase, guestLateral, teamRoster);
    setPlayers([...hp, ...gp]);
  }, [homeFormation, homePhase, homeLateral, guestFormation, guestPhase, guestLateral, fieldType, teamRoster]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight;
    const ctx = canvas.getContext('2d'); if (ctx) { ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.lineWidth = 4; }
  }, []);

  useEffect(() => { if (!mounted) return; initCanvas(); window.addEventListener('resize', initCanvas); return () => window.removeEventListener('resize', initCanvas); }, [mounted, initCanvas]);

  const handlePointerDownPlayer = (e: React.PointerEvent, id: string) => { if (isPaintMode) return; e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); setDraggingId(id); };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPaintMode) return; if (!draggingId || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect(); const x = ((e.clientX - rect.left) / rect.width) * 100; const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPlayers(prev => prev.map(p => p.id === draggingId ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p));
  };
  const handlePointerUp = (e: React.PointerEvent) => { if (draggingId) { (e.target as HTMLElement).releasePointerCapture(e.pointerId); setDraggingId(null); } };

  const formations = useMemo(() => Object.keys(FORMATIONS_DATA[fieldType]), [fieldType]);

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden font-body relative touch-none" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      {/* CABECERA FLOTANTE */}
      <header className="fixed top-4 lg:top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 lg:gap-4 px-4 lg:px-6 py-2 lg:py-3 bg-black/60 backdrop-blur-2xl border border-primary/30 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 lg:gap-4 pr-2 lg:pr-4 border-r border-white/10 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[7px] lg:text-[8px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-xs lg:text-sm font-headline font-black text-white italic uppercase tracking-tighter leading-none truncate">Partido</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 px-2 lg:px-4 bg-primary/5 border border-primary/20 rounded-2xl py-1 lg:py-1.5 shadow-inner">
          <div className="flex items-center gap-1 lg:gap-2">
            <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="text-primary/40 text-sm">-</button>
            <span className="text-lg lg:text-xl font-black text-white tabular-nums min-w-[15px] lg:min-w-[20px] text-center">{score.home}</span>
            <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="text-primary/40 text-sm">+</button>
          </div>
          <div className="flex flex-col items-center">
            <span className={cn("text-lg lg:text-xl font-black font-headline tabular-nums tracking-tighter", timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow")}>{formatTime(timeLeft)}</span>
            <button onClick={() => setIsRunning(!isRunning)} className="text-[6px] lg:text-[7px] font-black uppercase text-primary/60">{isRunning ? 'PAUSE' : 'START'}</button>
          </div>
          <div className="flex items-center gap-1 lg:gap-2">
            <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="text-primary/40 text-sm">-</button>
            <span className="text-lg lg:text-xl font-black text-white tabular-nums min-w-[15px] lg:min-w-[20px] text-center">{score.guest}</span>
            <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="text-primary/40 text-sm">+</button>
          </div>
        </div>

        <div className="flex gap-1 lg:gap-2 shrink-0">
          <button onClick={() => setIsPairingModalOpen(true)} className="h-8 w-8 lg:h-10 lg:w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group hover:bg-primary hover:text-black transition-all">
            <Watch className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <Button className="h-8 lg:h-10 bg-primary text-black font-black uppercase text-[7px] lg:text-[9px] tracking-widest px-3 lg:px-6 rounded-xl cyan-glow">
            <Save className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1 lg:mr-2" /> GUARDAR
          </Button>
        </div>
      </header>

      {/* ISLA CONTROL LOCAL (BOTTOM LEFT) */}
      <div className="fixed bottom-4 lg:bottom-10 left-4 lg:left-10 z-[100] pointer-events-none scale-90 lg:scale-100 origin-bottom-left">
        <div className="pointer-events-auto glass-panel p-3 lg:p-4 border-primary/30 flex items-center gap-3 lg:gap-6 rounded-[2rem] animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="space-y-1 lg:space-y-1.5 border-r border-white/10 pr-3 lg:pr-4">
            <span className="hidden lg:block text-[8px] font-black text-primary uppercase tracking-widest text-center italic">LOCAL_SQUAD</span>
            <Select value={homeFormation} onValueChange={setHomeFormation}>
              <SelectTrigger className="h-8 lg:h-9 bg-black/40 border-primary/20 text-primary font-black uppercase text-[8px] lg:text-[9px] rounded-xl w-24 lg:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-primary/20">
                {formations.map(f => <SelectItem key={f} value={f} className="text-[10px] font-black">{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-0.5 lg:gap-1 border-r border-white/10 pr-3 lg:pr-4">
            {["defensa", "tda", "salida", "ataque", "tad"].map(p => (
              <button key={p} onClick={() => setHomePhase(p as TacticalPhase)} className={cn("px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[7px] lg:text-[8px] font-black uppercase transition-all", homePhase === p ? "bg-primary text-black" : "text-white/20 hover:bg-white/5")}>{p === 'defensa' ? 'DEF' : p === 'ataque' ? 'ATK' : p.toUpperCase()}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <span className="hidden xl:block text-[7px] font-black text-white/20 uppercase">BASCULACIÓN</span>
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
              {["left", "center", "right"].map(l => (
                <button key={l} onClick={() => setHomeLateral(l as LateralShift)} className={cn("h-7 w-8 lg:h-8 lg:w-10 rounded-lg flex items-center justify-center transition-all", homeLateral === l ? "bg-primary text-black" : "text-white/20")}>
                  <MoveHorizontal className={cn("h-3 w-3 lg:h-3.5 lg:w-3.5", l === 'left' ? 'rotate-180' : l === 'center' ? 'scale-75' : '')} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ISLA CONTROL VISITANTE (BOTTOM RIGHT) */}
      <div className="fixed bottom-4 lg:bottom-10 right-4 lg:right-10 z-[100] pointer-events-none scale-90 lg:scale-100 origin-bottom-right">
        <div className="pointer-events-auto glass-panel p-3 lg:p-4 border-rose-500/30 flex items-center gap-3 lg:gap-6 rounded-[2rem] animate-in slide-in-from-bottom-4 shadow-2xl">
          <div className="flex items-center gap-2 lg:gap-3 border-r border-white/10 pr-3 lg:pr-4">
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl">
              {["left", "center", "right"].map(l => (
                <button key={l} onClick={() => setGuestLateral(l as LateralShift)} className={cn("h-7 w-8 lg:h-8 lg:w-10 rounded-lg flex items-center justify-center transition-all", guestLateral === l ? "bg-rose-500 text-white" : "text-white/20")}>
                  <MoveHorizontal className={cn("h-3 w-3 lg:h-3.5 lg:w-3.5", l === 'left' ? 'rotate-180' : l === 'center' ? 'scale-75' : '')} />
                </button>
              ))}
            </div>
            <span className="hidden xl:block text-[7px] font-black text-white/20 uppercase">BASCULACIÓN</span>
          </div>

          <div className="flex items-center gap-0.5 lg:gap-1 border-r border-white/10 pr-3 lg:pr-4">
            {["defensa", "tda", "salida", "ataque", "tad"].map(p => (
              <button key={p} onClick={() => setGuestPhase(p as TacticalPhase)} className={cn("px-2 lg:px-3 py-1 lg:py-1.5 rounded-lg text-[7px] lg:text-[8px] font-black uppercase transition-all", guestPhase === p ? "bg-rose-500 text-white" : "text-white/20 hover:bg-white/5")}>{p === 'defensa' ? 'DEF' : p === 'ataque' ? 'ATK' : p.toUpperCase()}</button>
            ))}
          </div>

          <div className="space-y-1 lg:space-y-1.5 border-l border-white/10 pl-3 lg:pl-4">
            <span className="hidden lg:block text-[8px] font-black text-rose-500 uppercase tracking-widest text-center italic">VISIT_SQUAD</span>
            <Select value={guestFormation} onValueChange={setGuestFormation}>
              <SelectTrigger className="h-8 lg:h-9 bg-black/40 border-rose-500/20 text-rose-500 font-black uppercase text-[8px] lg:text-[9px] rounded-xl w-24 lg:w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                {formations.map(f => <SelectItem key={f} value={f} className="text-[10px] font-black">{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden">
        <TacticalField theme="cyan" fieldType={fieldType} containerRef={fieldRef}>
          <canvas ref={canvasRef} className={cn("absolute inset-0 z-30 pointer-events-none", isPaintMode && "pointer-events-auto")} />
          <div className="absolute inset-0 z-20">
            {players.map(p => (
              <MemoizedPlayerChip key={p.id} team={p.team} number={p.number} label={p.name} x={p.x} y={p.y} isDragging={draggingId === p.id} onPointerDown={(e) => handlePointerDownPlayer(e, p.id)} />
            ))}
          </div>
        </TacticalField>
      </main>

      {/* TOOLBAR CENTRAL */}
      <BoardToolbar variant="match" isPaintMode={isPaintMode} onTogglePaintMode={setIsPaintMode} onColorSelect={setCurrentColor} onClear={() => {}} activeColor={currentColor} className="fixed bottom-4 lg:bottom-10 left-1/2 -translate-x-1/2 z-[150] scale-90 lg:scale-100 shadow-2xl" />

      {/* ROSTER TOGGLE */}
      <div className="fixed bottom-24 lg:bottom-32 right-4 lg:right-10 z-[100]">
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl bg-primary text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-all cyan-glow">
              <Users className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </SheetTrigger>
          <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white sm:max-w-md">
            <SheetHeader className="p-6 border-b border-white/5">
              <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">ROSTER_LIVE</SheetTitle>
            </SheetHeader>
            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-4">
                {teamRoster.filter(p => p.isStarter).map(p => (
                  <div key={p.number} className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-black text-white italic">#{p.number} {p.name}</span>
                    <Badge className="bg-primary/10 text-primary text-[8px] font-black">TITULAR</Badge>
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
