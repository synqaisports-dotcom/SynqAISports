
"use client";

import { useState, useEffect, useRef, memo, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  MATCH_BOARD_SOURCE_KEY,
  resolveMatchBoardSource,
  loadLocalLineupForMatchBoard,
  type MatchBoardSource,
} from "@/lib/match-board-bootstrap";
import { ensureWatchPairingCode } from "@/lib/watch-pairing";
import {
  MATCH_TIMER_SYNC_KEY,
  matchTimerSyncKey,
  readMatchTimerSync,
  shouldApplyRemoteTimer,
  writeMatchTimerSync,
  readMatchTimerPresetMinutes,
  writeMatchTimerPresetMinutes,
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
  readContinuityContext,
  subscribeContinuityContext,
  writeContinuityContext,
} from "@/lib/continuity-context";
import {
  BOARD_HIGH_PERFORMANCE_KEY,
  BOARD_PERF_CHANGE_EVENT,
  resolveBoardVisualProfile,
} from "@/lib/board-performance";

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
 * MatchBoardPage - v69.0.0
 * PROTOCOL_FIELD_ALIGNMENT: Ajuste de límites para evitar que jugadores salgan del campo.
 * PROTOCOLO_VISITOR_FLOW: Invertido orden de transiciones para equipo visitante.
 *
 * Entrada dual: ?source=elite (Operaciones / metodología) | ?source=sandbox (Mis partidos promo).
 * Equipo local: elite → synq_players | sandbox → synq_promo_team. Cronómetro ↔ smartwatch: localStorage (otras pestañas).
 */
function MatchBoardInner() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clubScopeId = profile?.clubId ?? "global-hq";
  
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [presetMinutes, setPresetMinutes] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [homePhase, setHomePhase] = useState<TacticalPhase>("def");
  const [guestPhase, setGuestPhase] = useState<TacticalPhase>("def");
  const [homeFormation, setHomeFormation] = useState("4-3-3");
  const [guestFormation, setGuestFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<PlayerPos[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [pairingCode, setPairingCode] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false);
  
  // PERFORMANCE CONTROL
  const [isLegacyDevice, setIsLegacyDevice] = useState(false);
  const [renderScale, setRenderScale] = useState(1.0); 
  
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [activeDrawing, setActiveDrawing] = useState<{x: number, y: number}[] | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const timeLeftRef = useRef(45 * 60);
  const presetMinutesRef = useRef(45);
  const lastTimerSyncAppliedRef = useRef(0);
  const lastScoreSyncAppliedRef = useRef(0);
  const draggingIdRef = useRef<string | null>(null);
  useEffect(() => {
    draggingIdRef.current = draggingId;
  }, [draggingId]);
  const matchMoveRafRef = useRef<number | null>(null);
  const pendingMatchDragRef = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    return () => {
      if (matchMoveRafRef.current != null) cancelAnimationFrame(matchMoveRafRef.current);
    };
  }, []);

  const [matchSource, setMatchSource] = useState<MatchBoardSource>("elite");
  const [activeMatchLabel, setActiveMatchLabel] = useState<string>("");
  const [localHomeNames, setLocalHomeNames] = useState<string[]>([]);
  const [timerSyncKey, setTimerSyncKey] = useState<string>(MATCH_TIMER_SYNC_KEY);
  const [scoreSyncKey, setScoreSyncKey] = useState<string>(MATCH_SCORE_SYNC_KEY);
  const safeFieldType: FieldType = FORMATIONS_DATA[fieldType] ? fieldType : "f11";
  const continuityCtx = useMemo(() => readContinuityContext(clubScopeId), [clubScopeId]);

  useEffect(() => {
    const ctx = continuityCtx;
    if (!ctx) {
      setTimerSyncKey(MATCH_TIMER_SYNC_KEY);
      setScoreSyncKey(MATCH_SCORE_SYNC_KEY);
      return;
    }
    setTimerSyncKey(
      matchTimerSyncKey({
        clubId: ctx.clubId,
        teamId: ctx.teamId,
        mcc: ctx.mcc,
        session: ctx.session,
        mode: ctx.mode,
      }),
    );
    setScoreSyncKey(
      matchScoreSyncKey({
        clubId: ctx.clubId,
        teamId: ctx.teamId,
        mcc: ctx.mcc,
        session: ctx.session,
        mode: ctx.mode,
      }),
    );
  }, [continuityCtx]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const unsub = subscribeContinuityContext(clubScopeId, (ctx) => {
      if (!ctx) {
        setTimerSyncKey(MATCH_TIMER_SYNC_KEY);
        setScoreSyncKey(MATCH_SCORE_SYNC_KEY);
        return;
      }
      setTimerSyncKey(
        matchTimerSyncKey({
          clubId: ctx.clubId,
          teamId: ctx.teamId,
          mcc: ctx.mcc,
          session: ctx.session,
          mode: ctx.mode,
        }),
      );
      setScoreSyncKey(
        matchScoreSyncKey({
          clubId: ctx.clubId,
          teamId: ctx.teamId,
          mcc: ctx.mcc,
          session: ctx.session,
          mode: ctx.mode,
        }),
      );
    });
    return () => unsub();
  }, [clubScopeId]);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const apply = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const p = resolveBoardVisualProfile(dpr);
      setIsLegacyDevice(p.perfLite);
      setRenderScale(p.renderScale);
    };
    apply();
    window.addEventListener(BOARD_PERF_CHANGE_EVENT, apply);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === BOARD_HIGH_PERFORMANCE_KEY) apply();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(BOARD_PERF_CHANGE_EVENT, apply);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const q = searchParams.get("source");
    const matchIdParam = String(searchParams.get("matchId") || "").trim();
    const stored = typeof window !== "undefined" ? localStorage.getItem(MATCH_BOARD_SOURCE_KEY) : null;
    const src = resolveMatchBoardSource(q, stored);
    setMatchSource(src);
    try {
      localStorage.setItem(MATCH_BOARD_SOURCE_KEY, src);
    } catch {
      /* noop */
    }
    const { names, fieldType: ftBoot } = loadLocalLineupForMatchBoard(src);
    setLocalHomeNames(names);
    if (ftBoot && q === "sandbox") setFieldType(ftBoot);

    // Si llegamos desde "Mis partidos", forzamos contexto de continuidad al partido seleccionado.
    if (src === "sandbox" && matchIdParam) {
      const prev = readContinuityContext(clubScopeId);
      const teamId = prev?.teamId || "promo_team";
      writeContinuityContext({
        clubId: clubScopeId,
        mode: "match",
        teamId,
        mcc: `SBX_MATCH_${matchIdParam}`,
        session: `SBX_${matchIdParam.slice(-6)}`,
      });
    }
  }, [searchParams, clubScopeId]);

  useEffect(() => {
    if (matchSource !== "sandbox") {
      setActiveMatchLabel("");
      return;
    }
    const matchIdParam = String(searchParams.get("matchId") || "").trim();
    const fromCtxMcc = String(continuityCtx?.mcc || "");
    const inferredId = fromCtxMcc.startsWith("SBX_MATCH_") ? fromCtxMcc.replace("SBX_MATCH_", "") : "";
    const targetId = matchIdParam || inferredId;
    if (!targetId) {
      setActiveMatchLabel("Partido no seleccionado");
      return;
    }
    try {
      const raw = localStorage.getItem("synq_promo_vault");
      const vault = raw ? JSON.parse(raw) : null;
      const list = Array.isArray(vault?.matches) ? vault.matches : [];
      const match = list.find((m: any) => String(m?.id ?? "") === targetId);
      if (!match) {
        setActiveMatchLabel(`Partido #${targetId}`);
        return;
      }
      const date = String(match.date || "").trim() || "Pendiente fecha";
      const rival = String(match.rivalName || "").trim() || "Rival pendiente";
      setActiveMatchLabel(`${date} · vs ${rival}`);
    } catch {
      setActiveMatchLabel(`Partido #${targetId}`);
    }
  }, [matchSource, searchParams, continuityCtx?.mcc]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "synq_promo_team" && e.key !== "synq_players") return;
      const storedSrc = localStorage.getItem(MATCH_BOARD_SOURCE_KEY);
      const resolved = resolveMatchBoardSource(null, storedSrc);
      const { names } = loadLocalLineupForMatchBoard(resolved);
      setLocalHomeNames(names);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Mantener un preset de minutos para que `reset` no vuelva siempre a 45.
  useEffect(() => {
    const mins = readMatchTimerPresetMinutes(45);
    setPresetMinutes(mins);
    presetMinutesRef.current = mins;
    const sec = mins * 60;
    setTimeLeft(sec);
    timeLeftRef.current = sec;
  }, []);

  useEffect(() => {
    const p = readMatchTimerSync(timerSyncKey);
    if (shouldApplyRemoteTimer(p, lastTimerSyncAppliedRef.current) && Date.now() - p.updatedAt < 3 * 60 * 60 * 1000) {
      lastTimerSyncAppliedRef.current = p.updatedAt;
      setTimeLeft(Math.max(0, p.remainingSec));
      setIsRunning(p.running);
    }

    const onTimerStorage = (e: StorageEvent) => {
      if (e.key !== timerSyncKey || !e.newValue) return;
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
  }, [timerSyncKey]);

  useEffect(() => {
    const p = readMatchScoreSync(scoreSyncKey);
    if (shouldApplyRemoteScore(p, lastScoreSyncAppliedRef.current) && Date.now() - p.updatedAt < 3 * 60 * 60 * 1000) {
      lastScoreSyncAppliedRef.current = p.updatedAt;
      setScore({ home: Math.max(0, p.home), guest: Math.max(0, p.guest) });
    }

    const onScoreStorage = (e: StorageEvent) => {
      if (e.key !== scoreSyncKey || !e.newValue) return;
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
  }, [scoreSyncKey]);

  const changeScore = useCallback((deltaHome: number, deltaGuest: number) => {
    setScore((prev) => {
      const safe = { home: Math.max(0, prev.home + deltaHome), guest: Math.max(0, prev.guest + deltaGuest) };
      const now = Date.now();
      lastScoreSyncAppliedRef.current = now;
      writeMatchScoreSync({ ...safe, updatedAt: now, origin: "board" }, scoreSyncKey);
      return safe;
    });
  }, [scoreSyncKey]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

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
    setPairingCode(ensureWatchPairingCode(null));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev <= 0 ? 0 : prev - 1;
          const now = Date.now();
          lastTimerSyncAppliedRef.current = now;
          writeMatchTimerSync({ remainingSec: next, running: true, updatedAt: now, origin: "board" }, timerSyncKey);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSyncKey]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetPresetTime = (minutes: number) => {
    setIsRunning(false);
    setPresetMinutes(minutes);
    presetMinutesRef.current = minutes;
    writeMatchTimerPresetMinutes(minutes);
    const sec = minutes * 60;
    setTimeLeft(sec);
    timeLeftRef.current = sec;
    const now = Date.now();
    lastTimerSyncAppliedRef.current = now;
    writeMatchTimerSync({ remainingSec: sec, running: false, updatedAt: now, origin: "board" }, timerSyncKey);
    toast({
      title: "TIEMPO_AJUSTADO",
      description: `Cronómetro configurado a ${minutes} minutos.`,
    });
  };

  const calculatePositions = useCallback(() => {
    if (isAnyDialogOpen) return;
    const formationsForField = FORMATIONS_DATA[safeFieldType] || FORMATIONS_DATA.f11;
    const fallbackFormation = Object.keys(formationsForField)[0];
    const homeShape =
      homeFormation === "NINGUNA"
        ? []
        : formationsForField[homeFormation] || (fallbackFormation ? formationsForField[fallbackFormation] : []);
    const guestShape =
      guestFormation === "NINGUNA"
        ? []
        : formationsForField[guestFormation] || (fallbackFormation ? formationsForField[fallbackFormation] : []);
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
    
    // Márgenes de seguridad más estrictos (10% - 90%) para evitar que se salgan de las líneas
    const minSafeX = 8;
    const maxSafeX = 92;
    const minSafeY = 8;
    const maxSafeY = 92;

    const hp = homeShape.map((pos, idx) => {
      let finalX = (0.05 + (pos.x * 0.9)) * 100;
      let finalY = pos.y * 100;
      if (idx === 0) { finalX = 8; finalY = 50; } 
      else {
        finalX = finalX + phaseOffset(homePhase);
        if (homePhase === 'def') finalX = Math.min(50, finalX);
        finalX = Math.max(minSafeX, Math.min(maxSafeX, finalX));
        finalY = Math.max(minSafeY, Math.min(maxSafeY, finalY));
      }
      const nm = localHomeNames[idx]?.trim();
      return {
        id: `local-${idx}`,
        number: idx + 1,
        name: nm ? nm.toUpperCase() : `JUGADOR ${idx + 1}`,
        team: "local" as const,
        x: finalX,
        y: finalY,
      };
    });
    const gp = guestShape.map((pos, idx) => {
      let finalX = (0.95 - (pos.x * 0.9)) * 100;
      let finalY = (1 - pos.y) * 100;
      if (idx === 0) { finalX = 92; finalY = 50; }
      else {
        finalX = finalX - phaseOffset(guestPhase);
        if (guestPhase === 'def') finalX = Math.max(50, finalX);
        finalX = Math.max(minSafeX, Math.min(maxSafeX, finalX));
        finalY = Math.max(minSafeY, Math.min(maxSafeY, finalY));
      }
      return { id: `visitor-${idx}`, number: idx + 1, name: `RIVAL ${idx + 1}`, team: "visitor" as const, x: finalX, y: finalY };
    });
    setPlayers([...hp, ...gp]);
  }, [safeFieldType, homeFormation, guestFormation, homePhase, guestPhase, isAnyDialogOpen, localHomeNames]);

  useEffect(() => { calculatePositions(); }, [calculatePositions]);

  const handlePointerDownPlayer = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActiveDrawing([{x, y}]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (draggingId) {
      pendingMatchDragRef.current = { x, y };
      if (matchMoveRafRef.current == null) {
        matchMoveRafRef.current = requestAnimationFrame(() => {
          matchMoveRafRef.current = null;
          const pt = pendingMatchDragRef.current;
          const id = draggingIdRef.current;
          if (!pt || !id) return;
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === id
                ? { ...p, x: Math.max(0, Math.min(100, pt.x)), y: Math.max(0, Math.min(100, pt.y)) }
                : p,
            ),
          );
        });
      }
    } else if (activeDrawing) {
      setActiveDrawing((prev) => [...(prev || []), { x, y }]);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (matchMoveRafRef.current != null) {
      cancelAnimationFrame(matchMoveRafRef.current);
      matchMoveRafRef.current = null;
    }
    const pt = pendingMatchDragRef.current;
    const id = draggingIdRef.current;
    if (pt && id) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, x: Math.max(0, Math.min(100, pt.x)), y: Math.max(0, Math.min(100, pt.y)) }
            : p,
        ),
      );
    }
    pendingMatchDragRef.current = null;

    if (draggingId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggingId(null);
    } else if (activeDrawing) {
      setDrawings((prev) => [...prev, { points: activeDrawing, color: currentColor }]);
      setActiveDrawing(null);
    }
  };

  const handleSaveMatch = () => {
    const raw = localStorage.getItem("synq_promo_vault");
    const vault = JSON.parse(raw || '{"matches": []}');
    const fromUrl = String(searchParams.get("matchId") || "").trim();
    const fromCtx = (() => {
      const mcc = String(continuityCtx?.mcc || "");
      return mcc.startsWith("SBX_MATCH_") ? mcc.replace("SBX_MATCH_", "") : "";
    })();
    const targetId = fromUrl || fromCtx;

    if (!targetId) {
      toast({
        variant: "destructive",
        title: "PARTIDO_NO_IDENTIFICADO",
        description: "Abre la pizarra desde Mis partidos para guardar sobre un partido existente.",
      });
      return;
    }

    const current = Array.isArray(vault.matches) ? vault.matches : [];
    let updated = false;
    const nextMatches = current.map((m: any) => {
      if (String(m?.id ?? "") !== targetId) return m;
      updated = true;
      return {
        ...m,
        score: {
          home: Math.max(0, Number(score.home) || 0),
          guest: Math.max(0, Number(score.guest) || 0),
        },
        status: "Played",
      };
    });

    if (!updated) {
      toast({
        variant: "destructive",
        title: "PARTIDO_NO_ENCONTRADO",
        description: "No se encontró el partido en Mis partidos. Reabre desde la card correcta.",
      });
      return;
    }

    localStorage.setItem("synq_promo_vault", JSON.stringify({ ...vault, matches: nextMatches }));
    toast({ title: "PARTIDO_SINCRO_EXITOSA", description: "Marcador guardado en el partido seleccionado." });
  };

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3 * renderScale;
    const drawLine = (points: {x:number, y:number}[], color: string) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(points[0].x / 100 * canvas.width, points[0].y / 100 * canvas.height);
      if (points.length === 2) { ctx.lineTo(points[1].x / 100 * canvas.width, points[1].y / 100 * canvas.height); } 
      else {
        for (let i = 1; i < points.length - 2; i++) {
          const xc = ((points[i].x + points[i + 1].x) / 2) / 100 * canvas.width;
          const yc = ((points[i].y + points[i + 1].y) / 2) / 100 * canvas.height;
          ctx.quadraticCurveTo(points[i].x / 100 * canvas.width, points[i].y / 100 * canvas.height, xc, yc);
        }
        ctx.quadraticCurveTo(points[points.length - 2].x / 100 * canvas.width, points[points.length - 2].y / 100 * canvas.height, points[points.length - 1].x / 100 * canvas.width, points[points.length - 1].y / 100 * canvas.height);
      }
      ctx.stroke();
    };
    drawings.forEach(d => drawLine(d.points, d.color));
    if (activeDrawing) drawLine(activeDrawing, currentColor);
  }, [drawings, activeDrawing, currentColor, renderScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    const handleResize = () => {
      const parent = canvas.parentElement; if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width; const h = rect.height;
      canvas.width = w * renderScale;
      canvas.height = h * renderScale;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      redrawAll();
    };
    const obs = new ResizeObserver(handleResize);
    obs.observe(canvas.parentElement);
    handleResize();
    return () => obs.disconnect();
  }, [redrawAll, renderScale]);

  if (!mounted) return null;

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-black overflow-hidden relative touch-none select-none",
      isLegacyDevice && "perf-lite"
    )} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      
      {/* MARCADOR DE GOLES */}
      <div
        className={cn(
          "fixed top-4 z-[100] flex items-center gap-3 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl duration-700 md:scale-100 glass-panel",
          matchSource === "sandbox"
            ? "left-1/2 -translate-x-1/2 animate-in slide-in-from-top-3 scale-[0.9] origin-top"
            : "left-20 lg:left-32 animate-in slide-in-from-left-4 scale-[0.9] origin-top-left",
        )}
      >
        {matchSource === "sandbox" ? (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-primary/20 bg-black/70 px-3 py-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-primary/80">
              {activeMatchLabel || "Partido activo"}
            </span>
          </div>
        ) : null}
        <Badge
          variant="outline"
          className={cn(
            "text-[6px] font-black uppercase shrink-0 border-white/20",
            matchSource === "sandbox" ? "text-primary border-primary/30" : "text-amber-500/80 border-amber-500/30",
          )}
        >
          {matchSource === "sandbox" ? "Sandbox" : "Élite"}
        </Badge>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-primary/40 uppercase">LOC</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changeScore(-1, 0)}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg border border-primary/20 bg-primary/10 text-primary/70 hover:text-primary hover:bg-primary/20 text-sm lg:text-base font-black transition-all active:scale-95"
              >
                -
              </button>
              <span className="text-xl font-black text-primary cyan-text-glow tabular-nums">{score.home}</span>
              <button
                onClick={() => changeScore(1, 0)}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg border border-primary/20 bg-primary/10 text-primary/70 hover:text-primary hover:bg-primary/20 text-sm lg:text-base font-black transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-xs font-black text-white/20 italic">VS</div>
          <div className="flex flex-col items-center">
            <span className="text-[6px] font-black text-rose-400/40 uppercase">VIS</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changeScore(0, -1)}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/20 text-sm lg:text-base font-black transition-all active:scale-95"
              >
                -
              </button>
              <span className="text-xl font-black text-rose-500 rose-text-glow tabular-nums">{score.guest}</span>
              <button
                onClick={() => changeScore(0, 1)}
                className="h-8 w-8 lg:h-9 lg:w-9 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/20 text-sm lg:text-base font-black transition-all active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-6 left-6 z-[200] lg:block hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const p = window.location.pathname || "";
            const target = p.startsWith("/sandbox/app")
              ? "/sandbox/app/matches"
              : p.startsWith("/sandbox")
                ? "/sandbox"
                : "/dashboard";
            router.replace(target);
          }}
          className="h-10 w-10 rounded-xl bg-black/60 backdrop-blur-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 glass-panel"
          title="Volver"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </div>

      {/* TELEMETRÍA, TIEMPO Y GUARDADO */}
      <div
        className={cn(
          "fixed z-[100] flex items-center gap-2 animate-in slide-in-from-right-4 duration-700 scale-[0.75] origin-top-right lg:scale-100",
          matchSource === "sandbox"
            ? "top-14 right-2 sm:top-4 sm:right-4"
            : "top-4 right-4",
        )}
      >
        <Button 
          onClick={handleSaveMatch}
          className="h-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:scale-105 transition-all border-none hidden sm:flex"
        >
          <Save className="h-4 w-4 mr-2" /> GUARDAR
        </Button>
        {matchSource === "sandbox" ? (
          <button
            onClick={() => {
              const p = window.location.pathname || "";
              const base = p.startsWith("/sandbox/app") ? "/sandbox/app/mobile-continuity" : "/dashboard/mobile-continuity";
              router.push(`${base}?mode=match&tab=watch`);
            }}
            className="h-10 px-3 rounded-xl bg-black/60 backdrop-blur-xl border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all shadow-2xl active:scale-95 glass-panel text-[10px] font-black uppercase tracking-widest"
            title="Ajustes Watch"
            type="button"
          >
            <Watch className="h-4 w-4 mr-1.5" />
            Watch
          </button>
        ) : null}

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
                Mismo código que en Config. Watch (Élite o Sandbox). La pizarra y /smartwatch sincronizan cronómetro y marcador entre pestañas vía almacén local.
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
              type="button"
              onClick={() => {
                setIsRunning((r) => {
                  const next = !r;
                  queueMicrotask(() => {
                    const now = Date.now();
                    lastTimerSyncAppliedRef.current = now;
                    writeMatchTimerSync({
                      remainingSec: timeLeftRef.current,
                      running: next,
                      updatedAt: now,
                      origin: "board",
                    }, timerSyncKey);
                  });
                  return next;
                });
              }} 
              className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-300 active:scale-90",
                isRunning ? "text-amber-400 hover:bg-amber-400/10" : "text-emerald-400 hover:bg-emerald-400/10"
              )}
              title={isRunning ? "Pausar" : "Iniciar"}
            >
              {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button 
              type="button"
              onClick={() => {
                setIsRunning(false);
                const sec = presetMinutesRef.current * 60;
                setTimeLeft(sec);
                timeLeftRef.current = sec;
                const now = Date.now();
                lastTimerSyncAppliedRef.current = now;
                writeMatchTimerSync({ remainingSec: sec, running: false, updatedAt: now, origin: "board" }, timerSyncKey);
              }} 
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
              title="Resetear"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes} isHalfField={false} containerRef={fieldRef}>
          <canvas 
            ref={canvasRef} 
            onPointerDown={handleCanvasPointerDown} 
            className="absolute inset-0 z-30 pointer-events-auto"
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
                  {Object.keys(FORMATIONS_DATA[safeFieldType] || FORMATIONS_DATA.f11).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
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
                <Select
                  value={safeFieldType}
                  onValueChange={(v: FieldType) => setFieldType(FORMATIONS_DATA[v] ? v : "f11")}
                >
                  <SelectTrigger
                    title="Tipo de campo"
                    className="h-8 w-[4.25rem] lg:w-[5rem] bg-black/50 border-white/10 text-[7px] lg:text-[8px] font-black uppercase text-primary rounded-lg focus:ring-0 px-1.5 shrink-0"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    <SelectItem value="f11" className="text-[9px] font-black uppercase">
                      F11
                    </SelectItem>
                    <SelectItem value="f7" className="text-[9px] font-black uppercase">
                      F7
                    </SelectItem>
                    <SelectItem value="futsal" className="text-[9px] font-black uppercase">
                      Futsal
                    </SelectItem>
                  </SelectContent>
                </Select>
                <button 
                  type="button"
                  onClick={() => setShowLanes(!showLanes)}
                  className={cn("h-8 px-2 lg:px-3 rounded-lg flex items-center gap-1.5 lg:gap-2 transition-all text-[8px] lg:text-[9px] font-black uppercase", showLanes ? "bg-primary/20 text-primary" : "text-white/20 hover:text-white")}
                >
                  <Columns3 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  <span className="hidden md:inline">Carriles</span>
                </button>
                <button type="button" onClick={toggleFullscreen} className="h-8 w-8 flex items-center justify-center text-white/40 hover:text-primary transition-all active:scale-90">
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
              <Select value={guestFormation} onValueChange={setGuestFormation}>
                <SelectTrigger className="h-8 w-20 lg:w-24 bg-black border-rose-500/10 text-white font-black uppercase text-[9px] lg:text-[10px] rounded-lg focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-rose-500/20">
                  <SelectItem value="NINGUNA" className="text-[10px] font-black uppercase text-rose-500 italic">LIMPIAR</SelectItem>
                  {Object.keys(FORMATIONS_DATA[safeFieldType] || FORMATIONS_DATA.f11).map(f => <SelectItem key={f} value={f} className="text-[10px] font-black uppercase">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-black/80 backdrop-blur-xl border border-rose-500/20 p-1 rounded-xl shadow-xl flex items-center h-10 lg:h-11 glass-panel">
              <div className="flex gap-0.5 lg:gap-1">
                {["ATK", "SAL", "TDA", "DEF"].map(p => (
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

export default function MatchBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-1 items-center justify-center bg-black text-primary font-black uppercase tracking-widest animate-pulse">
          Cargando_Pizarra...
        </div>
      }
    >
      <MatchBoardInner />
    </Suspense>
  );
}
