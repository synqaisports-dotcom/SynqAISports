
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
  Search,
  Dna,
  ArrowUpRight,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";
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
  SheetDescription,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const TIME_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "25 min", value: 25 },
  { label: "30 min", value: 30 },
  { label: "35 min", value: 35 },
  { label: "45 min", value: 45 },
];

const POSITION_COLORS: Record<string, string> = {
  "POR": "text-blue-400 border-blue-500/20 bg-blue-500/10",
  "DFC": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "LD": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "LI": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "DEF": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "MC": "text-primary border-primary/20 bg-primary/10",
  "MCD": "text-primary border-primary/20 bg-primary/10",
  "MCO": "text-primary border-primary/20 bg-primary/10",
  "MID": "text-primary border-primary/20 bg-primary/10",
  "DC": "text-rose-400 border-rose-500/20 bg-rose-500/10",
  "ED": "text-rose-400 border-rose-500/20 bg-rose-500/10",
  "EI": "text-rose-400 border-rose-500/20 bg-rose-500/10",
  "ATK": "text-rose-400 border-rose-500/20 bg-rose-500/10",
  "FIXO": "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  "ALA": "text-primary border-primary/20 bg-primary/10",
  "PIVOT": "text-rose-400 border-rose-500/20 bg-rose-500/10",
};

const MOCK_TEAMS = [
  { id: "t1", name: "Infantil A (Cantera)", field: "f11" as FieldType },
  { id: "t2", name: "Alevín B (Cantera)", field: "f7" as FieldType },
  { id: "t3", name: "Cadete C (Cantera)", field: "f11" as FieldType },
  { id: "t4", name: "Benjamín D (Cantera)", field: "f7" as FieldType },
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
  t2: [
    { number: 1, name: "PAU R.", pos: "POR", isStarter: true },
    { number: 2, name: "ERIC T.", pos: "DEF", isStarter: true },
    { number: 3, name: "POL S.", pos: "DEF", isStarter: true },
    { number: 4, name: "BIEL M.", pos: "DEF", isStarter: true },
    { number: 6, name: "NIL G.", pos: "MID", isStarter: true },
    { number: 8, name: "ARNAU F.", pos: "MID", isStarter: true },
    { number: 9, name: "JAN L.", pos: "ATK", isStarter: true },
    { number: 10, name: "MARC Q.", pos: "ATK", isStarter: false },
    { number: 12, name: "TEO B.", pos: "MID", isStarter: false },
  ],
  t5: [
    { number: 1, name: "ALBERTO", pos: "POR", isStarter: true },
    { number: 5, name: "CARLOS", pos: "FIXO", isStarter: true },
    { number: 7, name: "JAVI", pos: "ALA", isStarter: true },
    { number: 8, name: "MANU", pos: "ALA", isStarter: true },
    { number: 10, name: "RAÚL", pos: "PIVOT", isStarter: true },
    { number: 12, name: "BORJA", pos: "ALA", isStarter: false },
    { number: 14, name: "DANI", pos: "FIXO", isStarter: false },
  ]
};

type TacticalPhase = "defensa" | "tda" | "ataque" | "tad" | "salida";
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
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [selectedTeamId, setSelectedTeamId] = useState("t1");
  
  const [teamRoster, setTeamRoster] = useState<any[]>(MOCK_PLAYERS_BY_TEAM["t1"]);
  
  const [homePhase, setHomePhase] = useState<TacticalPhase>("defensa");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("defensa");
  
  const [homeLateral, setHomeLateral] = useState<LateralShift>("center");
  const [guestLateral, setGuestLateral] = useState<LateralShift>("center");
  
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");

  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Estados para el motor de dibujo fluido
  const [isPaintMode, setIsPaintMode] = useState(false);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const fieldRef = useRef<HTMLDivElement>(null);

  const hasClub = !!profile?.clubId;
  const isCoach = profile?.role === "coach" || profile?.role === "club_admin" || profile?.role === "superadmin";
  const showTeamSelector = hasClub && isCoach;

  const [localTeamData, setLocalTeamData] = useState({
    name: "",
    shortName: "",
    primaryColor: "#00f2ff"
  });

  useEffect(() => {
    if (MOCK_PLAYERS_BY_TEAM[selectedTeamId]) {
      setTeamRoster(MOCK_PLAYERS_BY_TEAM[selectedTeamId]);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    const defaultFormations: Record<FieldType, string> = {
      f11: "4-3-3",
      f7: "3-2-1",
      futsal: "1-2-1"
    };
    setHomeFormation(defaultFormations[fieldType]);
    setGuestFormation(defaultFormations[fieldType]);
  }, [fieldType]);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetPreset = (minutes: string) => {
    setIsRunning(false);
    setTimeLeft(parseInt(minutes) * 60);
  };

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    if (team) {
      setFieldType(team.field);
    }
  };

  const calculatePositions = (team: "local" | "visitor", formation: string, phase: TacticalPhase, lateral: LateralShift, currentRoster: any[]) => {
    const baseCoords = FORMATIONS_DATA[fieldType][formation] || FORMATIONS_DATA[fieldType][Object.keys(FORMATIONS_DATA[fieldType])[0]];
    const innerAreaLimit = 19.5; 
    const outerAreaLimit = 80.5;

    const starters = currentRoster.filter(p => p.isStarter);

    return baseCoords.map((pos, idx) => {
      let finalX, finalY;
      
      const isGK = pos.x < 0.1;
      const isDEF = pos.x >= 0.1 && pos.x < 0.4;
      const isMID = pos.x >= 0.4 && pos.x < 0.7;
      const isATK = pos.x >= 0.7;

      let phaseShift = 0;
      let yShift = 0;

      if (!isGK) {
        if (lateral === "left") yShift = -0.15;
        else if (lateral === "right") yShift = 0.15;

        if (phase === "defensa") {
          if (isDEF) phaseShift = -0.12;
          else if (isMID) phaseShift = -0.22;
          else if (isATK) phaseShift = -0.35;
        } else if (phase === "tda") {
          if (isDEF) phaseShift = 0.05;
          else if (isMID) phaseShift = 0.08;
          else if (isATK) phaseShift = 0.12;
        } else if (phase === "ataque") {
          if (isDEF) phaseShift = 0.15;
          else if (isMID) phaseShift = 0.20;
          else if (isATK) phaseShift = 0.28;
        } else if (phase === "tad") {
          if (isDEF) phaseShift = -0.05;
          else if (isMID) phaseShift = -0.08;
          else if (isATK) phaseShift = -0.12;
        } else if (phase === "salida") {
          if (isDEF) {
            phaseShift = -0.10; 
            yShift = idx % 2 === 0 ? -0.2 : 0.2; 
          }
        }
      }

      if (team === "local") {
        finalX = (0.05 + (pos.x * 0.9) + (isGK ? 0 : phaseShift)) * 100;
        finalY = (pos.y + (isGK ? 0 : yShift)) * 100;

        if (!isGK) {
          finalX = Math.max(finalX, innerAreaLimit);
          finalX = Math.min(finalX, outerAreaLimit);
          
          if (phase === "ataque") {
            if (isMID) finalX = Math.min(finalX, 72);
            if (isDEF) finalX = Math.min(finalX, 55);
          }
        } else {
          finalX = 5;
          finalY = 50;
        }
      } else {
        finalX = (0.95 - (pos.x * 0.9) - (isGK ? 0 : phaseShift)) * 100;
        finalY = ((1 - pos.y) - (isGK ? 0 : yShift)) * 100;

        if (!isGK) {
          finalX = Math.min(finalX, outerAreaLimit);
          finalX = Math.max(finalX, innerAreaLimit);
          
          if (phase === "ataque") {
            if (isMID) finalX = Math.max(finalX, 28);
            if (isDEF) finalX = Math.max(finalX, 45);
          }
        } else {
          finalX = 95;
          finalY = 50;
        }
      }

      finalX = Math.max(2, Math.min(98, finalX));
      finalY = Math.max(5, Math.min(95, finalY));
      
      const playerInfo = team === "local" ? starters[idx] : null;

      return {
        id: `${team}-${idx}`,
        number: playerInfo?.number || (idx + 1),
        name: playerInfo?.name || "",
        team,
        x: finalX,
        y: finalY
      };
    });
  };

  useEffect(() => {
    const hp = calculatePositions("local", homeFormation, homePhase, homeLateral, teamRoster);
    const gp = calculatePositions("visitor", guestFormation, guestPhase, guestLateral, teamRoster);
    setPlayers([...hp, ...gp]);
  }, [homeFormation, homePhase, homeLateral, guestFormation, guestPhase, guestLateral, fieldType, teamRoster]);

  // LÓGICA DE DIBUJO FLUIDO (MARKER EFFECT)
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
    }
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  const startDrawing = (e: React.PointerEvent) => {
    if (!isPaintMode) return;
    isDrawing.current = true;
    const rect = canvasRef.current!.getBoundingClientRect();
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing.current || !isPaintMode || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.moveTo(lastPoint.current!.x, lastPoint.current!.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    lastPoint.current = currentPoint;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPaintMode) {
      draw(e);
      return;
    }
    if (!draggingId || !fieldRef.current) return;

    const rect = fieldRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPlayers(prev => prev.map(p => 
      p.id === draggingId ? { ...p, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : p
    ));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPaintMode) {
      stopDrawing();
      return;
    }
    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const handleSubstitution = (subNum: number, starterNum: number) => {
    setTeamRoster(prev => {
      const subIdx = prev.findIndex(p => p.number === subNum);
      const starterIdx = prev.findIndex(p => p.number === starterNum);
      
      if (subIdx === -1 || starterIdx === -1) return prev;
      
      const newRoster = [...prev];
      const sub = { ...newRoster[subIdx], isStarter: true };
      const starter = { ...newRoster[starterIdx], isStarter: false };
      
      newRoster[subIdx] = starter;
      newRoster[starterIdx] = sub;
      
      return newRoster;
    });
  };

  const currentFormations = useMemo(() => Object.keys(FORMATIONS_DATA[fieldType]), [fieldType]);
  const starters = teamRoster.filter(p => p.isStarter);
  const substitutes = teamRoster.filter(p => !p.isStarter);

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col bg-black overflow-hidden font-body relative touch-none",
        isPaintMode ? "cursor-crosshair" : ""
      )}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <header className="h-20 border-b border-primary/20 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-3 lg:gap-6 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-3 w-3 lg:h-4 lg:w-4 text-primary animate-pulse" />
              <span className="text-[8px] lg:text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-sm lg:text-lg font-headline font-black text-white italic tracking-tighter uppercase leading-none truncate">Partido</h1>
          </div>

          {showTeamSelector && (
            <div className="hidden sm:block">
              <Select value={selectedTeamId} onValueChange={handleTeamChange}>
                <SelectTrigger className="w-[140px] lg:w-[180px] h-9 lg:h-10 bg-primary/5 border-primary/30 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                    <SelectValue placeholder="Mis Equipos" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {MOCK_TEAMS.map(team => (
                    <SelectItem key={team.id} value={team.id} className="text-[9px] font-black uppercase">
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
                <SelectTrigger className="w-[110px] lg:w-[140px] h-9 lg:h-10 bg-white/5 border-primary/20 rounded-xl text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
                    <SelectValue placeholder="Campo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  <SelectItem value="f11" className="text-[9px] font-black uppercase">Fútbol 11</SelectItem>
                  <SelectItem value="f7" className="text-[9px] font-black uppercase">Fútbol 7</SelectItem>
                  <SelectItem value="futsal" className="text-[9px] font-black uppercase">Fútbol Sala</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <button className="h-9 lg:h-10 w-9 lg:w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                  {hasClub ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                {hasClub ? (
                  <>
                    <div className="p-10 border-b border-white/5 bg-black/40">
                      <SheetHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Dna className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Plantilla_Scanned_v2.5</span>
                        </div>
                        <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                          ROSTER <span className="text-primary">ACTIVO</span>
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase font-bold text-primary/40 tracking-widest text-left italic">
                          Arrastra un suplente sobre un titular para sustituir.
                        </SheetDescription>
                      </SheetHeader>
                    </div>
                    
                    <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
                      <section className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Titulares ({starters.length})</h3>
                        </div>
                        <div className="space-y-2">
                          {starters.map((player) => (
                            <PlayerListItem 
                              key={player.number} 
                              player={player} 
                              onDrop={(subNum) => handleSubstitution(subNum, player.number)}
                            />
                          ))}
                        </div>
                      </section>

                      {substitutes.length > 0 && (
                        <section className="space-y-4">
                          <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                            <Users className="h-3 w-3 text-white/20" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">Suplentes ({substitutes.length})</h3>
                          </div>
                          <div className="space-y-2">
                            {substitutes.map((player) => (
                              <PlayerListItem 
                                key={player.number} 
                                player={player} 
                                isSub 
                              />
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                    
                    <div className="p-10 bg-black/40 border-t border-white/5">
                       <Button className="w-full h-14 bg-primary/5 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-primary hover:text-black transition-all">GESTIONAR ALTAS</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-10 border-b border-white/5 bg-black/40">
                      <SheetHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Plus className="h-4 w-4 text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Local_Asset_Factory</span>
                        </div>
                        <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                          CREAR <span className="text-primary">EQUIPO</span>
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase font-bold text-primary/40 tracking-widest text-left italic">
                          Defina su identidad local.
                        </SheetDescription>
                      </SheetHeader>
                    </div>
                    <div className="flex-1 p-10 space-y-10 overflow-y-auto custom-scrollbar">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Nombre del Equipo</Label>
                          <Input 
                            placeholder="EJ: RAYO VALLECANO" 
                            className="h-14 bg-white/5 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary" 
                            value={localTeamData.name}
                            onChange={(e) => setLocalTeamData({...localTeamData, name: e.target.value.toUpperCase()})}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Siglas / Corto</Label>
                          <Input 
                            placeholder="EJ: RAY" 
                            maxLength={3}
                            className="h-14 bg-white/5 border-primary/20 rounded-2xl font-black text-center text-xl focus:border-primary text-primary"
                            value={localTeamData.shortName}
                            onChange={(e) => setLocalTeamData({...localTeamData, shortName: e.target.value.toUpperCase()})}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Escudo_Identidad</Label>
                          <div className="h-32 border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-2 group hover:border-primary/40 cursor-pointer transition-all bg-primary/5">
                             <Camera className="h-6 w-6 text-primary/40 group-hover:text-primary transition-all" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">Subir Digital Asset</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-10 bg-black/40 border-t border-white/5">
                      <Button className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl cyan-glow">GUARDAR_EQUIPO_LOCAL</Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 px-3 lg:px-6 py-1.5 lg:py-2 bg-primary/5 border border-primary/20 rounded-[2rem] shadow-[0_0_30px_rgba(0,242,255,0.05)] mx-2">
          <div className="flex items-center gap-1 lg:gap-3">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest hidden lg:block">L</span>
            <div className="flex items-center gap-1 lg:gap-2">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">-</button>
              <span className="text-base lg:text-xl font-black font-headline text-white tabular-nums min-w-[12px] lg:min-w-[16px] text-center">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">+</button>
            </div>
          </div>

          <div className="w-[1px] h-8 lg:h-10 bg-white/10 mx-1 lg:mx-2" />

          <div className="flex flex-col items-center justify-center min-w-[100px] lg:min-w-[120px]">
            <div className="flex items-center gap-1 lg:gap-2 mb-0.5">
              <span className={cn(
                "text-base lg:text-xl font-black font-headline tabular-nums tracking-tighter transition-all",
                timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow"
              )}>
                {formatTime(timeLeft)}
              </span>
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-5 w-5 lg:h-6 lg:w-6 rounded-full flex items-center justify-center transition-all",
                  isRunning ? "bg-amber-500 text-black" : "bg-primary text-black"
                )}
              >
                {isRunning ? <Pause className="h-2.5 w-2.5 lg:h-3 lg:w-3" /> : <Play className="h-2.5 w-2.5 lg:h-3 lg:w-3 ml-0.5" />}
              </button>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3">
              <Select onValueChange={handleSetPreset}>
                <SelectTrigger className="h-4 lg:h-5 bg-transparent border-none p-0 text-[7px] lg:text-[8px] font-black uppercase text-white/20 hover:text-primary transition-colors focus:ring-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2 w-2 lg:h-2.5 lg:w-2.5" />
                    <span>Preset</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {TIME_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value.toString()} className="text-[9px] font-black uppercase">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => { setIsRunning(false); setTimeLeft(45 * 60); }} className="text-[7px] lg:text-[8px] font-black text-white/20 hover:text-rose-400 uppercase flex items-center gap-1 transition-colors">
                <RotateCcw className="h-2 w-2 lg:h-2.5 lg:w-2.5" /> Reset
              </button>
            </div>
          </div>

          <div className="w-[1px] h-8 lg:h-10 bg-white/10 mx-1 lg:mx-2" />

          <div className="flex items-center gap-1 lg:gap-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">-</button>
              <span className="text-base lg:text-xl font-black font-headline text-white tabular-nums min-w-[12px] lg:min-w-[16px] text-center">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">+</button>
            </div>
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest hidden lg:block">V</span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <Button className="h-9 lg:h-11 bg-primary text-black font-black uppercase text-[8px] lg:text-[10px] tracking-[0.2em] px-3 lg:px-6 rounded-xl cyan-glow border-none hover:scale-105 transition-all">
            <Save className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        <BoardToolbar 
          variant="match"
          isPaintMode={isPaintMode}
          onTogglePaintMode={setIsPaintMode}
          onColorSelect={setCurrentColor}
          onClear={clearCanvas}
          activeColor={currentColor}
          className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[60] hidden sm:flex" 
        />
        
        <main className="flex-1 relative overflow-hidden" ref={fieldRef}>
          <TacticalField theme="cyan" fieldType={fieldType}>
            {/* CAPA DE DIBUJO FLUIDO (MARKER) */}
            <canvas 
              ref={canvasRef}
              className={cn(
                "absolute inset-0 z-30 pointer-events-none",
                isPaintMode && "pointer-events-auto"
              )}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />

            {/* JUGADORES (BLOQUEADOS EN MODO PINTURA) */}
            <div className={cn("absolute inset-0 z-20", isPaintMode && "pointer-events-none")}>
              {players.map(p => (
                <MemoizedPlayerChip 
                  key={p.id} 
                  team={p.team} 
                  number={p.number} 
                  label={p.name}
                  x={p.x} 
                  y={p.y} 
                  isDragging={draggingId === p.id}
                  onPointerDown={(e) => {
                    if (isPaintMode) return;
                    e.stopPropagation();
                    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                    setDraggingId(p.id);
                  }}
                />
              ))}
            </div>
          </TacticalField>

          <div className="absolute top-4 lg:top-6 left-4 lg:left-6 right-4 lg:right-6 flex justify-between pointer-events-none z-40">
            <div className="pointer-events-auto flex flex-col gap-2 lg:gap-3">
              <div className="glass-panel p-1 border-primary/30 flex items-center gap-1 lg:gap-2 rounded-2xl">
                <div className="bg-primary/10 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl border border-primary/20">
                  <span className="text-[8px] lg:text-[10px] font-black text-primary uppercase italic tracking-tighter">LOCAL</span>
                </div>
                <Select value={homeFormation} onValueChange={setHomeFormation}>
                  <SelectTrigger className="h-8 lg:h-9 w-20 lg:w-24 bg-transparent border-none text-[8px] lg:text-[10px] font-bold text-white/60 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    {currentFormations.map(f => <SelectItem key={f} value={f} className="text-[9px] font-black uppercase">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-0.5 lg:gap-1 bg-black/40 p-0.5 lg:p-1 rounded-xl border border-white/5 ml-1 lg:ml-2">
                  <PhaseButton label="DEF" active={homePhase === "defensa"} onClick={() => setHomePhase("defensa")} color="cyan" />
                  <PhaseButton label="T.D.A" active={homePhase === "tda"} onClick={() => setHomePhase("tda")} color="cyan" />
                  <PhaseButton label="S.B" active={homePhase === "salida"} onClick={() => setHomePhase("salida")} color="cyan" />
                  <PhaseButton label="ATQ" active={homePhase === "ataque"} onClick={() => setHomePhase("ataque")} color="cyan" />
                  <PhaseButton label="T.A.D" active={homePhase === "tad"} onClick={() => setHomePhase("tad")} color="cyan" />
                </div>
              </div>
              <div className="flex gap-1.5 lg:gap-2 justify-center bg-black/40 backdrop-blur-md p-1 lg:p-1.5 rounded-2xl border border-white/5 self-start ml-1">
                <button onClick={() => setHomeLateral("left")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", homeLateral === "left" ? "bg-primary text-black" : "text-white/20 hover:text-white")}><ChevronLeft className="h-3 w-3 lg:h-3.5 lg:w-3.5" /></button>
                <button onClick={() => setHomeLateral("center")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", homeLateral === "center" ? "bg-primary text-black" : "text-white/20 hover:text-white")}><Minimize2 className="h-3 w-3 lg:h-3.5 lg:w-3.5 rotate-90" /></button>
                <button onClick={() => setHomeLateral("right")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", homeLateral === "right" ? "bg-primary text-black" : "text-white/20 hover:text-white")}><ChevronRight className="h-3 w-3 lg:h-3.5 lg:w-3.5" /></button>
                <span className="text-[7px] lg:text-[8px] font-black text-primary/40 uppercase tracking-widest px-1.5 lg:px-2 flex items-center">Basculación</span>
              </div>
            </div>

            <div className="pointer-events-auto flex flex-col items-end gap-2 lg:gap-3">
              <div className="glass-panel p-1 border-rose-500/30 flex flex-row-reverse items-center gap-1 lg:gap-2 rounded-2xl">
                <div className="bg-rose-500/10 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl border border-rose-500/20">
                  <span className="text-[8px] lg:text-[10px] font-black text-rose-500 uppercase italic tracking-tighter">VISITANTE</span>
                </div>
                <Select value={guestFormation} onValueChange={setGuestFormation}>
                  <SelectTrigger className="h-8 lg:h-9 w-20 lg:w-24 bg-transparent border-none text-[8px] lg:text-[10px] font-bold text-white/60 text-right focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                    {currentFormations.map(f => <SelectItem key={f} value={f} className="text-[9px] font-black uppercase">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-0.5 lg:gap-1 bg-black/40 p-0.5 lg:p-1 rounded-xl border border-white/5 mr-1 lg:ml-2">
                  <PhaseButton label="T.A.D" active={guestPhase === "tad"} onClick={() => setGuestPhase("tad")} color="red" />
                  <PhaseButton label="ATQ" active={guestPhase === "ataque"} onClick={() => setGuestPhase("ataque")} color="red" />
                  <PhaseButton label="S.B" active={guestPhase === "salida"} onClick={() => setGuestPhase("salida")} color="red" />
                  <PhaseButton label="T.D.A" active={guestPhase === "tda"} onClick={() => setGuestPhase("tda")} color="red" />
                  <PhaseButton label="DEF" active={guestPhase === "defensa"} onClick={() => setGuestPhase("defensa")} color="red" />
                </div>
              </div>
              <div className="flex flex-row-reverse gap-1.5 lg:gap-2 justify-center bg-black/40 backdrop-blur-md p-1 lg:p-1.5 rounded-2xl border border-white/5 self-end mr-1">
                <button onClick={() => guestLateral === "left" ? setGuestLateral("center") : setGuestLateral("left")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", guestLateral === "left" ? "bg-rose-500 text-white" : "text-white/20 hover:text-white")}><ChevronRight className="h-3 w-3 lg:h-3.5 lg:w-3.5" /></button>
                <button onClick={() => setGuestLateral("center")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", guestLateral === "center" ? "bg-rose-500 text-white" : "text-white/20 hover:text-white")}><Minimize2 className="h-3 w-3 lg:h-3.5 lg:w-3.5 rotate-90" /></button>
                <button onClick={() => guestLateral === "right" ? setGuestLateral("center") : setGuestLateral("right")} className={cn("p-1 lg:p-1.5 rounded-lg transition-all", guestLateral === "right" ? "bg-rose-500 text-white" : "text-white/20 hover:text-white")}><ChevronLeft className="h-3 w-3 lg:h-3.5 lg:w-3.5" /></button>
                <span className="text-[7px] lg:text-[8px] font-black text-rose-500/40 uppercase tracking-widest px-1.5 lg:px-2 flex items-center">Basculación</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function PhaseButton({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color: "cyan" | "red" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-1.5 lg:px-2.5 py-1 lg:py-1.5 rounded-lg text-[7px] lg:text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
        active 
          ? (color === "cyan" 
              ? "bg-primary text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]" 
              : "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]")
          : "text-white/20 hover:text-white/40 hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );
}

function PlayerListItem({ player, isSub, onDrop }: { player: any, isSub?: boolean, onDrop?: (subNum: number) => void }) {
  const posStyle = POSITION_COLORS[player.pos] || "text-white/40 border-white/10 bg-white/5";
  const [isOver, setIsOver] = useState(false);
  
  return (
    <div 
      className={cn(
        "p-4 bg-primary/5 border rounded-2xl flex items-center justify-between group transition-all cursor-default",
        isSub ? "border-white/5 opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing" : "border-primary/10 hover:border-primary/40",
        isOver && !isSub && "border-primary bg-primary/20 scale-[1.02] shadow-[0_0_20px_rgba(0,242,255,0.2)]"
      )}
      draggable={isSub}
      onDragStart={(e) => {
        if (isSub) {
          e.dataTransfer.setData("text/plain", player.number.toString());
          e.dataTransfer.effectAllowed = "move";
        }
      }}
      onDragOver={(e) => {
        if (!isSub) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsOver(true);
        }
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        if (!isSub && onDrop) {
          e.preventDefault();
          setIsOver(false);
          const subNum = parseInt(e.dataTransfer.getData("text/plain") || "0");
          if (subNum && subNum !== player.number) {
            onDrop(subNum);
          }
        }
      }}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 rounded-xl bg-black border flex items-center justify-center text-[10px] font-black italic shadow-lg group-hover:scale-110 transition-transform",
          isSub ? "border-white/10 text-white/40" : "border-primary/20 text-primary"
        )}>
          {player.number}
        </div>
        <div className="flex flex-col">
          <span className={cn(
            "text-xs font-black uppercase italic group-hover:cyan-text-glow transition-all",
            isSub ? "text-white/40" : "text-white"
          )}>
            {player.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className={cn("text-[7px] font-black uppercase rounded-lg px-2 py-0", posStyle)}>
              {player.pos}
            </Badge>
            {!isSub && <span className="text-[7px] font-bold text-primary/40 uppercase tracking-widest">TITULAR_NODE</span>}
          </div>
        </div>
      </div>
      <Badge variant="outline" className={cn(
        "font-black text-[8px] rounded-full",
        isSub ? "border-white/5 text-white/10" : "border-primary/20 text-primary"
      )}>
        {isSub ? 'SUB' : 'SINC_OK'}
      </Badge>
    </div>
  );
}
