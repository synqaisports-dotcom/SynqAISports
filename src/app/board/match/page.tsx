
"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, Clock, Save, LayoutGrid, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { PlayerChip } from "@/components/board/PlayerChip";
import { FORMATIONS_DATA } from "@/lib/formations";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const TIME_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "25 min", value: 25 },
  { label: "30 min", value: 30 },
  { label: "35 min", value: 35 },
  { label: "45 min", value: 45 },
];

type TacticalPhase = "defensa" | "tda" | "ataque" | "tad";

export default function MatchBoardPage() {
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  
  const [homePhase, setHomePhase] = useState<TacticalPhase>("defensa");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("defensa");
  
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");

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

  const getPlayerPositions = (team: "local" | "visitor", formation: string, phase: TacticalPhase) => {
    const baseCoords = FORMATIONS_DATA[fieldType][formation] || FORMATIONS_DATA[fieldType][Object.keys(FORMATIONS_DATA[fieldType])[0]];
    
    // Coordenadas críticas (Margen 4% + Área 15.5%)
    const ownAreaLimit = 0.195;
    const oppAreaLimit = 0.805;

    return baseCoords.map((pos, idx) => {
      let finalX, finalY;
      
      // Factor de desplazamiento por fase (Bloque)
      let phaseShift = 0;
      if (phase === "defensa") phaseShift = -0.15;
      if (phase === "tda") phaseShift = 0.05;
      if (phase === "ataque") phaseShift = 0.25;
      if (phase === "tad") phaseShift = -0.05;

      if (team === "local") {
        // Mapeo Local (Izquierda a Derecha)
        // Escalamos el 0-1 de la formación a todo el campo útil (0.05 a 0.95)
        finalX = 0.05 + (pos.x * 0.9) + phaseShift;
        finalY = pos.y;

        // RESTRICCIONES TÁCTICAS SOLICITADAS
        if (phase === "ataque") {
          // En ataque, los delanteros no pasan del área grande rival
          finalX = Math.min(finalX, oppAreaLimit);
        }
        if (phase === "defensa") {
          // En defensa, los defensas no pasan del área grande propia (se quedan al borde)
          if (pos.x < 0.4) { // Jugadores de perfil defensivo
            finalX = Math.max(finalX, 0.05); // No salirse por el fondo
            finalX = Math.min(finalX, ownAreaLimit);
          }
        }
      } else {
        // Mapeo Visitante (Derecha a Izquierda - Espejo)
        finalX = 0.95 - (pos.x * 0.9) - phaseShift;
        finalY = 1 - pos.y;

        // RESTRICCIONES TÁCTICAS SOLICITADAS (Espejo)
        if (phase === "ataque") {
          // El ataque visitante va hacia la izquierda (área rival en 0.195)
          finalX = Math.max(finalX, ownAreaLimit);
        }
        if (phase === "defensa") {
          // La defensa visitante protege su área derecha (área propia en 0.805)
          if (pos.x < 0.4) {
            finalX = Math.min(finalX, 0.95);
            finalX = Math.max(finalX, oppAreaLimit);
          }
        }
      }

      // Clamp final de seguridad para evitar que salgan del canvas
      finalX = Math.max(0.02, Math.min(0.98, finalX));
      
      return {
        id: `${team}-${idx}`,
        number: idx + 1,
        x: finalX * 100,
        y: finalY * 100
      };
    });
  };

  const homePlayers = useMemo(() => getPlayerPositions("local", homeFormation, homePhase), [homeFormation, homePhase, fieldType]);
  const guestPlayers = useMemo(() => getPlayerPositions("visitor", guestFormation, guestPhase), [guestFormation, guestPhase, fieldType]);

  const currentFormations = useMemo(() => Object.keys(FORMATIONS_DATA[fieldType]), [fieldType]);

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden font-body relative">
      <header className="h-20 border-b border-primary/20 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-6 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Match_Live</span>
            </div>
            <h1 className="text-lg font-headline font-black text-white italic tracking-tighter uppercase leading-none truncate">Partido</h1>
          </div>

          <div className="hidden lg:block">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[140px] h-10 bg-white/5 border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
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
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 bg-primary/5 border border-primary/20 rounded-[2rem] shadow-[0_0_30px_rgba(0,242,255,0.05)]">
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">L</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, home: Math.max(0, s.home - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">-</button>
              <span className="text-2xl font-black font-headline text-white tabular-nums min-w-[20px] text-center">{score.home}</span>
              <button onClick={() => setScore(s => ({...s, home: s.home + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">+</button>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-white/10 mx-2" />

          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn(
                "text-2xl font-black font-headline tabular-nums tracking-tighter transition-all",
                timeLeft === 0 ? "text-rose-500 animate-pulse" : "text-primary cyan-text-glow"
              )}>
                {formatTime(timeLeft)}
              </span>
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                  isRunning ? "bg-amber-500 text-black" : "bg-primary text-black"
                )}
              >
                {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Select onValueChange={handleSetPreset}>
                <SelectTrigger className="h-5 bg-transparent border-none p-0 text-[8px] font-black uppercase text-white/20 hover:text-primary transition-colors focus:ring-0">
                  <div className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span>Preset</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  {TIME_PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value.toString()} className="text-[9px] font-black uppercase">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => { setIsRunning(false); setTimeLeft(45 * 60); }} className="text-[8px] font-black text-white/20 hover:text-rose-400 uppercase flex items-center gap-1 transition-colors">
                <RotateCcw className="h-2.5 w-2.5" /> Reset
              </button>
            </div>
          </div>

          <div className="w-[1px] h-10 bg-white/10 mx-2" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setScore(s => ({...s, guest: Math.max(0, s.guest - 1)}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">-</button>
              <span className="text-2xl font-black font-headline text-white tabular-nums min-w-[20px] text-center">{score.guest}</span>
              <button onClick={() => setScore(s => ({...s, guest: s.guest + 1}))} className="h-6 w-6 flex items-center justify-center rounded-lg border border-primary/10 text-primary/40 hover:text-primary transition-all">+</button>
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest hidden sm:block">V</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] px-6 rounded-xl cyan-glow border-none hover:scale-105 transition-all">
            <Save className="h-4 w-4 mr-2" /> <span className="hidden md:inline">Guardar</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        <BoardToolbar theme="cyan" className="absolute left-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex" />
        
        <main className="flex-1 relative overflow-hidden">
          <TacticalField theme="cyan" fieldType={fieldType}>
            {homePlayers.map(p => (
              <PlayerChip key={p.id} team="local" number={p.number} x={p.x} y={p.y} />
            ))}
            {guestPlayers.map(p => (
              <PlayerChip key={p.id} team="visitor" number={p.number} x={p.x} y={p.y} />
            ))}
          </TacticalField>

          <div className="absolute top-6 left-24 right-24 flex justify-between pointer-events-none z-40">
            <div className="pointer-events-auto flex items-center gap-3">
              <div className="glass-panel p-1 border-primary/30 flex items-center gap-2 rounded-2xl">
                <div className="bg-primary/10 px-3 py-2 rounded-xl border border-primary/20">
                  <span className="text-[10px] font-black text-primary uppercase italic tracking-tighter">LOCAL</span>
                </div>
                <Select value={homeFormation} onValueChange={setHomeFormation}>
                  <SelectTrigger className="h-9 w-24 bg-transparent border-none text-[10px] font-bold text-white/60 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    {currentFormations.map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-2xl">
                <PhaseButton label="DEF" active={homePhase === "defensa"} onClick={() => setHomePhase("defensa")} color="cyan" />
                <PhaseButton label="T.D.A" active={homePhase === "tda"} onClick={() => setHomePhase("tda")} color="cyan" />
                <PhaseButton label="ATQ" active={homePhase === "ataque"} onClick={() => setHomePhase("ataque")} color="cyan" />
                <PhaseButton label="T.A.D" active={homePhase === "tad"} onClick={() => setHomePhase("tad")} color="cyan" />
              </div>
            </div>

            <div className="pointer-events-auto flex flex-row-reverse items-center gap-3">
              <div className="glass-panel p-1 border-rose-500/30 flex flex-row-reverse items-center gap-2 rounded-2xl">
                <div className="bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                  <span className="text-[10px] font-black text-rose-500 uppercase italic tracking-tighter">VISITANTE</span>
                </div>
                <Select value={guestFormation} onValueChange={setGuestFormation}>
                  <SelectTrigger className="h-9 w-24 bg-transparent border-none text-[10px] font-bold text-white/60 text-right focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                    {currentFormations.map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-2xl">
                <PhaseButton label="T.A.D" active={guestPhase === "tad"} onClick={() => setGuestPhase("tad")} color="red" />
                <PhaseButton label="ATQ" active={guestPhase === "ataque"} onClick={() => setGuestPhase("ataque")} color="red" />
                <PhaseButton label="T.D.A" active={guestPhase === "tda"} onClick={() => setGuestPhase("tda")} color="red" />
                <PhaseButton label="DEF" active={guestPhase === "defensa"} onClick={() => setGuestPhase("defensa")} color="red" />
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
        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-300",
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
