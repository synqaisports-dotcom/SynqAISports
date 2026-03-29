
"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense, memo } from "react";
import { 
  Zap, 
  Trash2, 
  Save,
  Columns3,
  LayoutGrid,
  Maximize2,
  Minimize2,
  X,
  Target,
  ClipboardList,
  ArrowRight,
  Copy,
  PencilLine,
  Type,
  Move,
  LayoutDashboard,
  Users,
  Square,
  Megaphone,
  RefreshCw,
  Library,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Boxes,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar, DrawingTool } from "@/components/board/BoardToolbar";
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
  SheetDescription,
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import { FORMATIONS_DATA } from "@/lib/formations";
import { CANVAS_PLAYER_NORM_WIDTH } from "@/lib/board-drawing";
import {
  BOARD_HIGH_PERFORMANCE_KEY,
  BOARD_PERF_CHANGE_EVENT,
  resolveBoardVisualProfile,
  createRedrawRaf,
  type RedrawRafHandle,
} from "@/lib/board-performance";
import Link from "next/link";
import Script from "next/script";

function resolveSandboxBasePath(): "/sandbox" | "/sandbox/app" | "/dashboard/promo" {
  if (typeof window === "undefined") return "/dashboard/promo";
  const p = window.location.pathname || "";
  if (p.startsWith("/sandbox/app")) return "/sandbox/app";
  return p.startsWith("/sandbox") ? "/sandbox" : "/dashboard/promo";
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  controlPoint?: Point;
  controlPoint2?: Point;
  color: string;
  rotation: number;
  lineStyle: 'solid' | 'dashed';
  number?: number;
  opacity: number;
  text?: string;
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

const STAGES = ["Debutantes", "Prebenjamín", "Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Senior"];

const isMaterial = (type: DrawingTool) =>
  ['player', 'ball', 'cone', 'seta', 'ladder', 'hurdle', 'minigoal', 'pica', 'barrier'].includes(type);

const isStrokeTool = (type: DrawingTool) =>
  ['freehand', 'rect', 'circle', 'arrow', 'double-arrow', 'zigzag', 'cross-arrow', 'text'].includes(type);

function buildZigzagPolylinePx(ax: number, ay: number, bx: number, by: number): Point[] {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 2) return [{ x: ax, y: ay }, { x: bx, y: by }];
  const nx = -dy / len;
  const ny = dx / len;
  const segments = Math.max(18, Math.min(56, Math.floor(len / 6)));
  const cycles = Math.max(2, Math.min(8, Math.round((len / 420) * 7)));
  const amp = Math.min(len * 0.13, 22);
  const pts: Point[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(t * Math.PI * 2 * cycles) * amp;
    pts.push({ x: ax + dx * t + nx * wave, y: ay + dy * t + ny * wave });
  }
  return pts;
}

function createDraftStroke(
  tool: DrawingTool,
  color: string,
  lineStyle: 'solid' | 'dashed',
  start: Point,
): DrawingElement {
  const id = `draft-${Date.now()}`;
  const base = {
    id,
    type: tool,
    color,
    rotation: 0,
    lineStyle,
    opacity: 1,
  };
  if (tool === 'freehand') {
    return { ...base, points: [{ x: start.x, y: start.y }] };
  }
  if (tool === 'text') {
    return { ...base, points: [{ x: start.x, y: start.y }, { x: start.x, y: start.y }], text: 'TEXTO TÁCTICO' };
  }
  return { ...base, points: [{ x: start.x, y: start.y }, { x: start.x, y: start.y }] };
}

const isCircular = (type: DrawingTool) =>
  ['player', 'ball', 'circle', 'seta'].includes(type);

const FIELD_REF_SHORT_PX = 460;

function materialViewportScale(cssW: number, cssH: number): number {
  const s = Math.min(cssW, cssH);
  if (s < 8) return 1;
  return Math.min(1.32, Math.max(0.82, FIELD_REF_SHORT_PX / s));
}

type ElementBoundsPx = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

function getElementBoundsRaw(element: DrawingElement, widthPx: number, heightPx: number): ElementBoundsPx {
  const p = element.points.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
  const minX = Math.min(...p.map(pt => pt.x));
  const minY = Math.min(...p.map(pt => pt.y));
  const maxX = Math.max(...p.map(pt => pt.x));
  const maxY = Math.max(...p.map(pt => pt.y));
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function scaleMaterialBoundsAboutCenter(b: ElementBoundsPx, scale: number): ElementBoundsPx {
  if (Math.abs(scale - 1) < 1e-6) return b;
  const nw = b.width * scale;
  const nh = b.height * scale;
  return {
    centerX: b.centerX,
    centerY: b.centerY,
    width: nw,
    height: nh,
    minX: b.centerX - nw / 2,
    maxX: b.centerX + nw / 2,
    minY: b.centerY - nh / 2,
    maxY: b.centerY + nh / 2,
  };
}

function getElementBounds(
  element: DrawingElement,
  widthPx: number,
  heightPx: number,
  cssWidth: number,
  cssHeight: number,
): ElementBoundsPx {
  const base = getElementBoundsRaw(element, widthPx, heightPx);
  if (!isMaterial(element.type)) return base;
  const sc = materialViewportScale(cssWidth, cssHeight);
  return scaleMaterialBoundsAboutCenter(base, sc);
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "";
const ADSENSE_SLOT_H = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HORIZONTAL ?? "";

const AdSlot = memo(({ orientation = 'horizontal' }: { orientation: 'horizontal' | 'vertical' }) => {
  const pushedRef = useRef(false);
  useEffect(() => {
    synqSync.trackEvent('ad_impression', { source: "sandbox", format: orientation, placement: 'promo_board_multiplex', timestamp: new Date().toISOString() });
  }, [orientation]);
  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H || orientation !== "horizontal" || pushedRef.current) return;
    let tries = 0;
    const maxTries = 40;
    const t = window.setInterval(() => {
      tries += 1;
      const w = window as unknown as { adsbygoogle?: unknown[] };
      if (!w.adsbygoogle) {
        if (tries >= maxTries) window.clearInterval(t);
        return;
      }
      try {
        w.adsbygoogle.push({});
        pushedRef.current = true;
        window.clearInterval(t);
      } catch {
        if (tries >= maxTries) window.clearInterval(t);
      }
    }, 150);
    return () => window.clearInterval(t);
  }, [orientation]);
  const handleAdClick = () => { synqSync.trackEvent('ad_click', { source: "sandbox", format: orientation, placement: 'promo_board_multiplex' }); };
  if (ADSENSE_CLIENT && ADSENSE_SLOT_H && orientation === "horizontal") {
    return (
      <div onClick={handleAdClick} className="min-h-16 w-full rounded-2xl overflow-hidden bg-black/30 border border-primary/20 pointer-events-auto">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={ADSENSE_SLOT_H}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    );
  }
  return (
    <div onClick={handleAdClick} className={cn("bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center rounded-2xl overflow-hidden group transition-all hover:bg-primary/[0.08] pointer-events-auto shadow-[0_0_20px_rgba(0,242,255,0.05)] relative cursor-pointer", orientation === 'horizontal' ? "h-16 w-full" : "w-40 h-[600px]")}>
      <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[6px] font-black px-2 py-0.5 uppercase tracking-widest italic z-20">AdMob / AdSense</div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-1/2 w-full animate-[refresh-scan_3s_linear_infinite] pointer-events-none z-10" />
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        <RefreshCw className="h-4 w-4 text-primary/40 group-hover:text-primary transition-all mb-1 animate-spin-slow" />
        <span className="text-[7px] font-black text-primary/60 uppercase tracking-[0.2em] italic truncate">Slot demo (configura .env)</span>
        <span className="text-[5px] text-white/20 uppercase font-bold tracking-widest">NEXT_PUBLIC_GOOGLE_ADSENSE_*</span>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
    </div>
  );
});

AdSlot.displayName = "AdSlot";

function PromoBoardContent() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParamsHook = useSearchParams();
  const router = useRouter();
  const exerciseId = searchParamsHook.get("id");
  const basePath = resolveSandboxBasePath();

  const [renderScale, setRenderScale] = useState(1.0);
  const [isLegacyDevice, setIsLegacyDevice] = useState(false);
  const [boardCanvasShadows, setBoardCanvasShadows] = useState(true);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [dprFactor, setDprFactor] = useState(1);

  const showAds =
    !profile ||
    profile.plan === "free" ||
    profile.role === "promo_coach" ||
    profile.role === "superadmin";

  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [isHalfField, setIsHalfField] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [isDashed, setIsDashed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [teamConfig, setTeamConfig] = useState<any>(null);
  const [vault, setVault] = useState<any>({ exercises: [] });

  const [isTeamSheetOpen, setIsTeamSheetOpen] = useState(false);
  const [isMaterialsSheetOpen, setIsMaterialsSheetOpen] = useState(false);
  const [isDrawingSheetOpen, setIsDrawingSheetOpen] = useState(false);
  const [isVaultSheetOpen, setIsVaultSheetOpen] = useState(false);

  const [saveFormData, setSaveFormData] = useState({
    title: "", stage: "Alevín", dimension: "Táctica", objective: "", description: ""
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const dragSelectionRef = useRef<string[]>([]);
  const draftStrokeRef = useRef<DrawingElement | null>(null);
  const curveControlDragging = useRef<1 | 2 | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'curving' | 'creating' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      setDprFactor(dpr);
      const coarse =
        typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)").matches : false;
      setIsCoarsePointer(coarse);
      const p = resolveBoardVisualProfile(dpr);
      setRenderScale(p.renderScale);
      setIsLegacyDevice(p.perfLite);
      setBoardCanvasShadows(p.canvasShadows);
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
    if (typeof window === "undefined") return;
    const savedTeam = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
    const savedVault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { exercises: [] });
    setVault(savedVault);
    if (savedTeam) {
      setTeamConfig(savedTeam);
      if (!exerciseId) setFieldType(savedTeam.type || "f11");
    }
  }, [exerciseId]);

  useEffect(() => {
    if (!exerciseId || typeof window === "undefined") return;
    const savedVault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { exercises: [] });
    const target = savedVault.exercises?.find((e: any) => e.id.toString() === exerciseId);
    if (target) {
      setElements(target.elements || []);
      setFieldType(target.fieldType || "f11");
      setSaveFormData((prev) => ({ ...prev, ...(target.metadata || {}) }));
    }
  }, [exerciseId]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen().catch(() => {}); } 
    else { if (document.exitFullscreen) document.exitFullscreen().catch(() => {}); }
  }, []);

  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  const rotatePoint = (point: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    const dx = point.x - center.x; const dy = point.y - center.y;
    return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos };
  };

  const loadTeamFromSandbox = () => {
    const savedTeam = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
    if (!savedTeam) { toast({ variant: "destructive", title: "ERROR_SINCRO", description: "Configure su equipo primero." }); return; }
    setTeamConfig(savedTeam);
    setFieldType(savedTeam.type || "f11");
    const canvasRatio = canvasRef.current ? (canvasRef.current.width / canvasRef.current.height) : 1.5;
    const defW = CANVAS_PLAYER_NORM_WIDTH;
    const defH = defW * canvasRatio;
    const formationsForField = FORMATIONS_DATA[savedTeam.type || "f11"];
    const defaultFormation = savedTeam.type === "futsal" ? "1-2-1" : savedTeam.type === "f7" ? "3-2-1" : "4-3-3";
    const positions = formationsForField[defaultFormation];
    const teamElements: DrawingElement[] = savedTeam.starters.filter((name: string) => name.trim() !== "").map((name: string, i: number) => {
      const pos = positions[i] || { x: 0.1 + (i * 0.05), y: 0.1 + (i * 0.05) };
      return { id: `el-team-${Date.now()}-${i}`, type: 'player' as const, points: [{ x: pos.x - defW/2, y: pos.y - defH/2 }, { x: pos.x + defW/2, y: pos.y + defH/2 }], color: currentColor, rotation: 0, lineStyle: 'solid' as const, number: i + 1, opacity: 1.0 };
    });
    if (teamElements.length === 0) { toast({ variant: "destructive", title: "SINCRO_VACÍA", description: "No hay nombres de titulares." }); return; }
    setElements(prev => [...prev, ...teamElements]);
    toast({ title: "SINCRO_EQUIPO_OK", description: `Se han volcado los titulares en el campo.` });
  };

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const pRaw = element.points; if (pRaw.length < 1) return;
    const widthPx = ctx.canvas.width; const heightPx = ctx.canvas.height;
    const cssW = ctx.canvas.clientWidth || widthPx;
    const cssH = ctx.canvas.clientHeight || heightPx;
    const p = pRaw.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const bounds = getElementBounds(element, widthPx, heightPx, cssW, cssH);
    const { centerX, centerY, width, height, minX, minY, maxX, maxY } = bounds;
    ctx.save(); ctx.globalAlpha = element.opacity; ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
    ctx.strokeStyle = element.color; ctx.fillStyle = hexToRgba(element.color, 0.15); ctx.lineWidth = 3 * renderScale; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (element.lineStyle === 'dashed') ctx.setLineDash([10 * renderScale, 5 * renderScale]); else ctx.setLineDash([]);
    switch (element.type) {
      case 'text': ctx.save(); ctx.setLineDash([]); ctx.fillStyle = element.color; ctx.font = `bold ${Math.floor(height || 24)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(element.text || "TEXTO TÁCTICO", centerX, centerY); ctx.restore(); break;
      case 'freehand': if (p.length < 3) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); if (p.length === 2) ctx.lineTo(p[1].x, p[1].y); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length - 2; i++) { const xc = (p[i].x + p[i + 1].x) / 2; const yc = (p[i].y + p[i + 1].y) / 2; ctx.quadraticCurveTo(p[i].x, p[i].y, xc, yc); } ctx.quadraticCurveTo(p[p.length - 2].x, p[p.length - 2].y, p[p.length - 1].x, p[p.length - 1].y); ctx.stroke(); } break;
      case 'rect': ctx.beginPath(); ctx.rect(minX, minY, width, height); ctx.fill(); ctx.stroke(); break;
      case 'circle': ctx.beginPath(); const radius = Math.min(width, height) / 2; ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); break;
      case 'zigzag': {
        ctx.beginPath();
        if (element.points.length > 2) {
          ctx.moveTo(p[0].x, p[0].y);
          for (let zi = 1; zi < p.length; zi++) ctx.lineTo(p[zi].x, p[zi].y);
        } else if (p.length >= 2) {
          const wavePx = buildZigzagPolylinePx(p[0].x, p[0].y, p[1].x, p[1].y);
          ctx.moveTo(wavePx[0].x, wavePx[0].y);
          for (let zi = 1; zi < wavePx.length; zi++) ctx.lineTo(wavePx[zi].x, wavePx[zi].y);
        }
        ctx.stroke();
        break;
      }
      case 'arrow':
      case 'double-arrow': {
        const p0 = p[0], p1 = p[p.length - 1] ?? p[1];
        if (!p1) break;
        ctx.beginPath();
        if (element.controlPoint && element.controlPoint2) {
          const c1 = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          const c2 = { x: element.controlPoint2.x * widthPx, y: element.controlPoint2.y * heightPx };
          ctx.moveTo(p0.x, p0.y);
          ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p1.x, p1.y);
        } else if (element.controlPoint) {
          const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(cp.x, cp.y, p1.x, p1.y);
        } else {
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
        }
        ctx.stroke();
        const head = 15 * renderScale;
        ctx.setLineDash([]);
        let angleEnd = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        if (element.controlPoint && element.controlPoint2) {
          const c2x = element.controlPoint2.x * widthPx, c2y = element.controlPoint2.y * heightPx;
          angleEnd = Math.atan2(3 * (p1.y - c2y), 3 * (p1.x - c2x));
        } else if (element.controlPoint) {
          const cpx = element.controlPoint.x * widthPx, cpy = element.controlPoint.y * heightPx;
          angleEnd = Math.atan2(2 * (p1.y - cpy), 2 * (p1.x - cpx));
        }
        const drawH = (tx: number, ty: number, ang: number) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang - Math.PI / 6), ty - head * Math.sin(ang - Math.PI / 6));
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang + Math.PI / 6), ty - head * Math.sin(ang + Math.PI / 6));
          ctx.stroke();
        };
        drawH(p1.x, p1.y, angleEnd);
        if (element.type === 'double-arrow') {
          let startAngle = angleEnd + Math.PI;
          if (element.controlPoint && element.controlPoint2) {
            const c1x = element.controlPoint.x * widthPx, c1y = element.controlPoint.y * heightPx;
            startAngle = Math.atan2(3 * (c1y - p0.y), 3 * (c1x - p0.x)) + Math.PI;
          } else if (element.controlPoint) {
            const cpx = element.controlPoint.x * widthPx, cpy = element.controlPoint.y * heightPx;
            startAngle = Math.atan2(p0.y - cpy, p0.x - cpx) + Math.PI;
          }
          drawH(p0.x, p0.y, startAngle);
        }
        break;
      }
      case 'cross-arrow': ctx.save(); ctx.translate(centerX, centerY); const cSize = Math.min(width, height) / 2; const thickness = cSize * 0.35; const arrowHead = cSize * 0.4; const dCB = (isV: boolean) => { ctx.beginPath(); if (isV) { ctx.moveTo(-thickness/2, -cSize + arrowHead); ctx.lineTo(thickness/2, -cSize + arrowHead); ctx.lineTo(thickness/2, cSize - arrowHead); ctx.lineTo(-thickness/2, cSize - arrowHead); } else { ctx.moveTo(-cSize + arrowHead, -thickness/2); ctx.lineTo(cSize - arrowHead, -thickness/2); ctx.lineTo(cSize - arrowHead, thickness/2); ctx.lineTo(-cSize + arrowHead, thickness/2); } ctx.closePath(); const barGrad = ctx.createLinearGradient(isV ? -thickness/2 : -cSize, isV ? -cSize : -thickness/2, isV ? thickness/2 : cSize, isV ? cSize : thickness/2); barGrad.addColorStop(0, element.color); barGrad.addColorStop(0.5, '#ffffff44'); barGrad.addColorStop(1, hexToRgba(element.color, 0.8)); ctx.fillStyle = barGrad; ctx.fill(); ctx.stroke(); }; const dAH = (tx: number, ty: number, rot: number) => { ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-arrowHead, arrowHead); ctx.lineTo(arrowHead, arrowHead); ctx.closePath(); const headGrad = ctx.createLinearGradient(-arrowHead, 0, arrowHead, arrowHead); headGrad.addColorStop(0, element.color); headGrad.addColorStop(0.5, '#ffffff44'); headGrad.addColorStop(1, hexToRgba(element.color, 0.8)); ctx.fillStyle = headGrad; ctx.fill(); ctx.stroke(); ctx.restore(); }; dCB(false); dCB(true); dAH(0, -cSize, 0); dAH(cSize, 0, Math.PI/2); dAH(0, cSize, Math.PI); dAH(-cSize, 0, -Math.PI/2); ctx.restore(); break;
      case 'player': ctx.save(); if (boardCanvasShadows) { ctx.shadowBlur = 20 * renderScale; ctx.shadowColor = hexToRgba(element.color, 0.4); } else { ctx.shadowBlur = 0; } const pRadius = Math.min(width, height) / 2; ctx.beginPath(); ctx.arc(centerX, centerY, pRadius, 0, Math.PI * 2); const pGrad = ctx.createRadialGradient(centerX - pRadius/3, centerY - pRadius/3, 0, centerX, centerY, pRadius); pGrad.addColorStop(0, '#ffffff44'); pGrad.addColorStop(0.5, hexToRgba(element.color, 0.3)); pGrad.addColorStop(1, hexToRgba(element.color, 0.1)); ctx.fillStyle = pGrad; ctx.fill(); ctx.strokeStyle = element.color; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(pRadius * 0.64)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((element.number || 1).toString(), centerX, centerY + (pRadius * 0.04)); if (teamConfig && element.number) { const playerName = teamConfig.starters?.[element.number - 1]; if (playerName) { ctx.setLineDash([]); ctx.font = `bold ${Math.floor(pRadius * 0.35)}px Space Grotesk`; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(playerName, centerX, centerY + pRadius + 12 * renderScale); } } ctx.restore(); break;
      case 'ball': {
        ctx.save();
        ctx.translate(centerX, centerY);
        const bRadius = Math.min(width, height) / 2;
        const s = Math.max(0.01, bRadius / 40);
        ctx.scale(s, s);
        if (boardCanvasShadows) {
          ctx.beginPath();
          ctx.ellipse(0, 6, 40, 10, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.fill();
        }
        const bg = ctx.createRadialGradient(-15, -15, 0, 0, 0, 40);
        bg.addColorStop(0, "#ffffff");
        bg.addColorStop(0.35, "#f8fafc");
        bg.addColorStop(1, "#cbd5e1");
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "rgba(15,23,42,0.35)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        [[0, -40, 0, -15], [35, -18, 14, -8], [22, 32, 9, 12], [-22, 32, -9, 12], [-35, -18, -14, -8]].forEach((pat) => {
          ctx.beginPath();
          ctx.moveTo(pat[0], pat[1]);
          ctx.lineTo(pat[2], pat[3]);
          ctx.stroke();
        });
        ctx.fillStyle = hexToRgba(element.color, 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, 39, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'cone': {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(width / 50, height / 50);
        ctx.beginPath();
        ctx.ellipse(0, 14, 26, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fill();
        const cGrad = ctx.createLinearGradient(-18, 0, 18, 0);
        cGrad.addColorStop(0, "#9a3412");
        cGrad.addColorStop(0.35, "#ea580c");
        cGrad.addColorStop(0.65, "#fb923c");
        cGrad.addColorStop(1, "#9a3412");
        ctx.beginPath();
        ctx.moveTo(-16, 12);
        ctx.lineTo(16, 12);
        ctx.lineTo(3, -30);
        ctx.lineTo(-3, -30);
        ctx.closePath();
        ctx.fillStyle = cGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, 10);
        ctx.lineTo(-1, -24);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-10, -2, 20, 6);
        ctx.fillRect(-7, -18, 14, 4);
        ctx.beginPath();
        ctx.ellipse(0, 12, 18, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'seta': {
        ctx.save();
        ctx.translate(centerX, centerY);
        const sSize = Math.max(18, Math.min(width, height));
        const rx = sSize * 0.5;
        const ry = sSize * 0.2;
        ctx.beginPath();
        ctx.ellipse(0, ry * 1.45, rx * 0.95, ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.24)";
        ctx.fill();
        const discGrad = ctx.createRadialGradient(-rx * 0.35, -ry * 0.7, 0, 0, 0, rx);
        discGrad.addColorStop(0, "#ffffff");
        discGrad.addColorStop(0.28, hexToRgba(element.color, 0.95));
        discGrad.addColorStop(1, hexToRgba(element.color, 0.75));
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = discGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.45)";
        ctx.lineWidth = Math.max(1, 1.6 * renderScale);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, ry * 0.1, rx * 0.84, ry * 0.45, 0, 0, Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = Math.max(1, 1.1 * renderScale);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(-rx * 0.2, -ry * 0.35, rx * 0.18, ry * 0.18, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.60)";
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'ladder': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/200, height/50); ctx.strokeStyle = '#334155'; ctx.lineWidth = 5 * renderScale; ctx.strokeRect(-100, -25, 200, 50); ctx.lineWidth = 3 * renderScale; ctx.strokeStyle = element.color; for(let x=-100; x<=100; x+=40) { ctx.beginPath(); ctx.moveTo(x, -25); ctx.lineTo(x, 25); ctx.stroke(); } ctx.restore(); break;
      case 'hurdle': {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(width / 60, height / 30);
        ctx.beginPath();
        ctx.rect(-30, 14, 60, 6);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();
        ctx.strokeStyle = hexToRgba(element.color, 0.95);
        ctx.lineWidth = 6 * renderScale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-26, 14);
        ctx.lineTo(-26, -12);
        ctx.moveTo(26, 14);
        ctx.lineTo(26, -12);
        ctx.stroke();
        const barY1 = -8;
        const barY2 = -1;
        ctx.lineWidth = 7 * renderScale;
        ctx.strokeStyle = element.color;
        ctx.beginPath();
        ctx.moveTo(-24, barY1);
        ctx.lineTo(24, barY1);
        ctx.moveTo(-24, barY2);
        ctx.lineTo(24, barY2);
        ctx.stroke();
        ctx.lineWidth = 4 * renderScale;
        ctx.strokeStyle = "rgba(15,23,42,0.35)";
        ctx.beginPath();
        ctx.moveTo(-20, 14);
        ctx.lineTo(20, 14);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'minigoal': {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(width / 110, height / 66);
        ctx.beginPath();
        ctx.ellipse(0, 34, 52, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(-50, -30, 100, 60);
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1.1 * renderScale;
        for (let i = -40; i <= 40; i += 12) {
          ctx.beginPath();
          ctx.moveTo(i, -30);
          ctx.lineTo(i, 30);
          ctx.stroke();
        }
        for (let j = -24; j <= 24; j += 12) {
          ctx.beginPath();
          ctx.moveTo(-50, j);
          ctx.lineTo(50, j);
          ctx.stroke();
        }
        const frameGrad = ctx.createLinearGradient(-50, 0, 50, 0);
        frameGrad.addColorStop(0, "#e5e7eb");
        frameGrad.addColorStop(0.5, "#ffffff");
        frameGrad.addColorStop(1, "#d1d5db");
        ctx.strokeStyle = frameGrad;
        ctx.lineWidth = 6 * renderScale;
        ctx.strokeRect(-50, -30, 100, 60);
        ctx.strokeStyle = "rgba(148,163,184,0.8)";
        ctx.lineWidth = 3 * renderScale;
        ctx.beginPath();
        ctx.moveTo(-50, -30);
        ctx.lineTo(-58, -36);
        ctx.lineTo(58, -36);
        ctx.lineTo(50, -30);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'pica': {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(width / 44, height / 110);
        const baseGrad = ctx.createLinearGradient(-18, 24, 18, 38);
        baseGrad.addColorStop(0, "#0ea5e9");
        baseGrad.addColorStop(1, "#1e3a8a");
        ctx.beginPath();
        ctx.moveTo(-18, 34);
        ctx.lineTo(18, 34);
        ctx.lineTo(12, 18);
        ctx.lineTo(-12, 18);
        ctx.closePath();
        ctx.fillStyle = baseGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.45)";
        ctx.lineWidth = 2 * renderScale;
        ctx.stroke();
        const poleGrad = ctx.createLinearGradient(-3, -42, 3, 18);
        poleGrad.addColorStop(0, "#fef08a");
        poleGrad.addColorStop(0.5, "#fde047");
        poleGrad.addColorStop(1, "#eab308");
        ctx.fillStyle = poleGrad;
        ctx.fillRect(-3, -58, 6, 76);
        ctx.strokeStyle = "rgba(120,53,15,0.35)";
        ctx.lineWidth = 1.5 * renderScale;
        ctx.strokeRect(-3, -58, 6, 76);
        ctx.beginPath();
        ctx.moveTo(0, -62);
        ctx.lineTo(3, -58);
        ctx.lineTo(-3, -58);
        ctx.closePath();
        ctx.fillStyle = "#fef9c3";
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'barrier': 
        ctx.save(); 
        ctx.translate(centerX, centerY); 
        const dummyW = width / 3; 
        for (let i = -1; i <= 1; i++) { 
          ctx.save(); 
          ctx.translate(i * dummyW * 0.9, 0); 
          ctx.beginPath(); 
          ctx.arc(0, -height/3, dummyW/3.5, 0, Math.PI * 2); 
          ctx.fillStyle = element.color; 
          ctx.fill(); 
          ctx.strokeStyle = '#000'; 
          ctx.lineWidth = 1 * renderScale; 
          ctx.stroke();
          ctx.beginPath(); 
          ctx.moveTo(-dummyW/2, height/2);
          ctx.lineTo(-dummyW/2, -height/8);
          ctx.quadraticCurveTo(-dummyW/2, -height/4, 0, -height/4);
          ctx.quadraticCurveTo(dummyW/2, -height/4, dummyW/2, -height/8);
          ctx.lineTo(dummyW/2, height/2);
          ctx.closePath();
          const bGrad = ctx.createLinearGradient(-dummyW/2, 0, dummyW/2, 0); 
          bGrad.addColorStop(0, hexToRgba(element.color, 0.8)); 
          bGrad.addColorStop(0.5, '#ffffff66'); 
          bGrad.addColorStop(1, hexToRgba(element.color, 0.6)); 
          ctx.fillStyle = bGrad; 
          ctx.fill(); 
          ctx.stroke(); 
          ctx.restore(); 
        } 
        ctx.restore(); 
        break;
    }
    if (isSelected) {
      const matScSel = isMaterial(element.type) ? materialViewportScale(cssW, cssH) : 1;
      ctx.restore(); ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
      ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2 * renderScale; ctx.setLineDash([6 * renderScale, 4 * renderScale]); const pad = 12 * renderScale * matScSel;
      ctx.strokeRect(minX - pad, minY - pad, width + pad * 2, height + pad * 2);
      ctx.setLineDash([]); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.5 * renderScale;
      const handles = [
        { x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad },
        { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY },
        { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }
      ];
      handles.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, 8 * renderScale * matScSel, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      const rotY = minY - pad - 45 * renderScale * matScSel; ctx.beginPath(); ctx.moveTo(centerX, minY - pad); ctx.lineTo(centerX, rotY); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(centerX, rotY, 10 * renderScale * matScSel, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (['arrow', 'double-arrow'].includes(element.type) && element.controlPoint && element.points.length >= 2) {
        const p0a = element.points[0], p1a = element.points[1];
        const P0 = { x: p0a.x * widthPx, y: p0a.y * heightPx };
        const P1 = { x: p1a.x * widthPx, y: p1a.y * heightPx };
        const cp1 = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
        ctx.setLineDash([4 * renderScale, 4 * renderScale]);
        ctx.strokeStyle = '#3b82f6aa';
        ctx.beginPath();
        ctx.moveTo(P0.x, P0.y);
        ctx.lineTo(cp1.x, cp1.y);
        if (element.controlPoint2) {
          const cp2 = { x: element.controlPoint2.x * widthPx, y: element.controlPoint2.y * heightPx };
          ctx.moveTo(cp2.x, cp2.y);
          ctx.lineTo(P1.x, P1.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const dot = (cx: number, cy: number) => {
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(cx, cy, 10 * renderScale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2 * renderScale;
          ctx.stroke();
        };
        dot(cp1.x, cp1.y);
        if (element.controlPoint2) {
          dot(element.controlPoint2.x * widthPx, element.controlPoint2.y * heightPx);
        }
      }
    } ctx.restore();
  }, [hexToRgba, teamConfig, renderScale, boardCanvasShadows]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Orden de capas:
    // 1) Dibujos (strokes) abajo
    // 2) Materiales (jugadores/conos/etc.) siempre encima de los dibujos
    // 3) Texto arriba del todo
    const strokes: DrawingElement[] = [];
    const materials: DrawingElement[] = [];
    const texts: DrawingElement[] = [];
    for (const el of elements) {
      if (el.type === "text") texts.push(el);
      else if (isMaterial(el.type)) materials.push(el);
      else strokes.push(el);
    }
    strokes.forEach((el) => drawElement(ctx, el, selectedIds.includes(el.id)));
    const draft = draftStrokeRef.current;
    if (draft) drawElement(ctx, draft, false);
    materials.forEach((el) => drawElement(ctx, el, selectedIds.includes(el.id)));
    texts.forEach((el) => drawElement(ctx, el, selectedIds.includes(el.id)));
  }, [elements, selectedIds, drawElement]);

  const redrawAllRef = useRef(redrawAll);
  redrawAllRef.current = redrawAll;
  const redrawRafRef = useRef<RedrawRafHandle | null>(null);
  useEffect(() => {
    redrawRafRef.current = createRedrawRaf(() => redrawAllRef.current());
    return () => redrawRafRef.current?.cancel();
  }, []);

  const scheduleCanvasRedraw = () => redrawRafRef.current?.schedule();
  const flushCanvasRedraw = () => redrawRafRef.current?.flush();

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || !canvas.parentElement) return;
    const handleResize = () => {
      const parent = canvas.parentElement; if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const w = rect.width; const h = rect.height;
      canvas.width = w * renderScale; canvas.height = h * renderScale;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      redrawAll();
    };
    const obs = new ResizeObserver(handleResize);
    obs.observe(canvas.parentElement); handleResize();
    return () => obs.disconnect();
  }, [redrawAll, renderScale]);

  const addElementAtCenter = (tool: DrawingTool) => {
    const pNum = tool === 'player' ? elements.filter(e => e.type === 'player').length + 1 : undefined;
    const canvasRatio =
      canvasRef.current && canvasRef.current.height > 0
        ? canvasRef.current.width / canvasRef.current.height
        : 1.5;
    const playerScale = tool === "player" ? 1.18 : 1;
    const defW =
      tool === "player" ? CANVAS_PLAYER_NORM_WIDTH * playerScale :
      tool === "ladder" ? 0.15 :
      tool === "minigoal" || tool === "cross-arrow" ? 0.1 :
      tool === "barrier" ? 0.12 :
      tool === "hurdle" ? 0.075 :
      tool === "pica" ? 0.055 :
      tool === "cone" ? 0.06 :
      tool === "ball" ? 0.065 :
      tool === "seta" ? 0.065 :
      tool === "text" ? 0.3 :
      0.05;
    const defH =
      isCircular(tool)
        ? defW * canvasRatio
        : tool === "ladder"
          ? 0.05
          : tool === "minigoal" || tool === "cross-arrow"
            ? 0.08
            : tool === "barrier"
              ? 0.12
              : tool === "hurdle"
                ? 0.055
                : tool === "pica"
                  ? 0.095
                  : tool === "cone"
                    ? 0.06
                    : 0.05;
    const p0 = { x: 0.5 - defW / 2, y: 0.5 - defH / 2 };
    const p1 = { x: 0.5 + defW / 2, y: 0.5 + defH / 2 };
    let controlPoint: Point | undefined;
    let controlPoint2: Point | undefined;
    if (tool === 'arrow' || tool === 'double-arrow') {
      controlPoint = { x: p0.x + (p1.x - p0.x) * 0.33, y: p0.y + (p1.y - p0.y) * 0.33 };
      controlPoint2 = { x: p0.x + (p1.x - p0.x) * 0.67, y: p0.y + (p1.y - p0.y) * 0.67 };
    }
    const newEl: DrawingElement = {
      id: `el-${Date.now()}`,
      type: tool,
      points: [p0, p1],
      controlPoint,
      controlPoint2,
      color: currentColor,
      rotation: 0,
      lineStyle: 'solid' as const,
      number: pNum,
      opacity: 1.0,
      text: tool === 'text' ? "CONSIGNA TÁCTICA" : undefined,
    };
    setElements(prev => [...prev, newEl]); setSelectedIds([newEl.id]); setActiveTool('select');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    startPoint.current = point; lastPoint.current = point; isDrawing.current = true; const wPx = rect.width; const hPx = rect.height;
    if (selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const bounds = getElementBounds(el, wPx, hPx, wPx, hPx);
        const matSc = isMaterial(el.type) ? materialViewportScale(wPx, hPx) : 1;
        const hitThreshold = isCoarsePointer ? 28 : 20;
        const handleThreshold = isCoarsePointer ? 16 : 11;
        if (['arrow', 'double-arrow'].includes(el.type) && el.controlPoint) {
          const cp1Px = { x: el.controlPoint.x * wPx, y: el.controlPoint.y * hPx };
          const d1 = Math.hypot(point.x * wPx - cp1Px.x, point.y * hPx - cp1Px.y);
          let picked: 0 | 1 | 2 = 0;
          if (el.controlPoint2) {
            const cp2Px = { x: el.controlPoint2.x * wPx, y: el.controlPoint2.y * hPx };
            const d2 = Math.hypot(point.x * wPx - cp2Px.x, point.y * hPx - cp2Px.y);
            if (d2 < hitThreshold && d2 <= d1) picked = 2;
            else if (d1 < hitThreshold) picked = 1;
          } else if (d1 < hitThreshold) picked = 1;
          if (picked) {
            interactionMode.current = 'curving';
            curveControlDragging.current = picked as 1 | 2;
            return;
          }
        }
        const rotHandlePx = rotatePoint(
          { x: bounds.centerX, y: bounds.minY - (45 * (renderScale / dprFactor)) * matSc },
          { x: bounds.centerX, y: bounds.centerY },
          el.rotation
        );
        if (Math.sqrt(Math.pow(point.x * wPx - rotHandlePx.x, 2) + Math.pow(point.y * hPx - rotHandlePx.y, 2)) < hitThreshold) { interactionMode.current = 'rotating'; return; }
        const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
        const pad = 12 * (renderScale / dprFactor) * matSc;
        const handles = [
          { x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad },
          { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY },
          { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }
        ];
        const insideBody =
          local.x >= bounds.minX &&
          local.x <= bounds.maxX &&
          local.y >= bounds.minY &&
          local.y <= bounds.maxY;
        const hIdx = handles.findIndex(h => Math.sqrt(Math.pow(local.x - h.x, 2) + Math.pow(local.y - h.y, 2)) < handleThreshold);
        // Jugadores: no permitimos redimensionar (solo mover/rotar)
        if (hIdx !== -1 && el.type !== "player") { interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return; }
        if (insideBody) {
          dragSelectionRef.current = [el.id];
          interactionMode.current = 'dragging';
          return;
        }
      }
    }
    const clicked = [...elements].reverse().find(el => { const b = getElementBounds(el, wPx, hPx, wPx, hPx); const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: b.centerX, y: b.centerY }, -el.rotation); const hitPadding = el.type === 'text' ? (isCoarsePointer ? 35 : 25) : (isCoarsePointer ? 25 : 15); return local.x >= b.minX - hitPadding && local.x <= b.maxX + hitPadding && local.y >= b.minY - hitPadding && local.y <= b.maxY + hitPadding; });
    if (clicked) {
      if (e.shiftKey) {
        setSelectedIds(prev => {
          const next = prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id];
          dragSelectionRef.current = next;
          return next;
        });
      } else {
        setSelectedIds([clicked.id]);
        dragSelectionRef.current = [clicked.id];
      }
      setActiveTool('select');
      interactionMode.current = 'dragging';
    } else if (isStrokeTool(activeTool)) {
      setSelectedIds([]);
      dragSelectionRef.current = [];
      interactionMode.current = 'creating';
      draftStrokeRef.current = createDraftStroke(activeTool, currentColor, isDashed ? 'dashed' : 'solid', point);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch { /* noop */ }
    } else {
      setSelectedIds([]);
      dragSelectionRef.current = [];
    }
    scheduleCanvasRedraw();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }; const wPx = rect.width; const hPx = rect.height;
    if (interactionMode.current === 'creating' && draftStrokeRef.current) {
      const d = draftStrokeRef.current;
      if (d.type === 'freehand') {
        const pts = [...d.points];
        const last = pts[pts.length - 1];
        const min = isCoarsePointer ? 0.004 : 0.0025;
        const dist = Math.hypot(point.x - last.x, point.y - last.y);
        if (pts.length === 1 && dist < min * 0.4) {
          draftStrokeRef.current = { ...d, points: [{ x: point.x, y: point.y }] };
        } else if (dist > min) {
          pts.push({ x: point.x, y: point.y });
          draftStrokeRef.current = { ...d, points: pts };
        } else {
          pts[pts.length - 1] = { x: point.x, y: point.y };
          draftStrokeRef.current = { ...d, points: pts };
        }
      } else {
        draftStrokeRef.current = { ...d, points: [{ ...d.points[0] }, { x: point.x, y: point.y }] };
      }
      scheduleCanvasRedraw();
      return;
    }
    if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedIds[0]) return el;
        if (el.type === "player") return el;
        const sc = isMaterial(el.type) ? materialViewportScale(wPx, hPx) : 1;
        const boundsRaw = getElementBoundsRaw(el, wPx, hPx);
        const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: boundsRaw.centerX, y: boundsRaw.centerY }, -el.rotation);
        const next = [...el.points];
        const h = activeHandleIndex.current!;
        if (isCircular(el.type)) {
          const dxPx = Math.abs(local.x - boundsRaw.centerX) * 2;
          const rawD = dxPx / sc;
          next[0] = { x: (boundsRaw.centerX - rawD / 2) / wPx, y: (boundsRaw.centerY - rawD / 2) / hPx };
          next[1] = { x: (boundsRaw.centerX + rawD / 2) / wPx, y: (boundsRaw.centerY + rawD / 2) / hPx };
        } else if (isMaterial(el.type)) {
          const ratio = boundsRaw.width / Math.max(1e-6, boundsRaw.height);
          const dx = Math.abs(local.x - boundsRaw.centerX) * 2;
          const rawDx = dx / sc;
          const rawDy = rawDx / ratio;
          next[0] = { x: (boundsRaw.centerX - rawDx / 2) / wPx, y: (boundsRaw.centerY - rawDy / 2) / hPx };
          next[1] = { x: (boundsRaw.centerX + rawDx / 2) / wPx, y: (boundsRaw.centerY + rawDy / 2) / hPx };
        } else {
          const p0Px = { x: next[0].x * wPx, y: next[0].y * hPx };
          const p1Px = { x: next[1].x * wPx, y: next[1].y * hPx };
          if ([0, 3, 5].includes(h)) p0Px.x = local.x;
          if ([2, 4, 7].includes(h)) p1Px.x = local.x;
          if ([0, 1, 2].includes(h)) p0Px.y = local.y;
          if ([5, 6, 7].includes(h)) p1Px.y = local.y;
          next[0] = { x: p0Px.x / wPx, y: p0Px.y / hPx };
          next[1] = { x: p1Px.x / wPx, y: p1Px.y / hPx };
        }
        return { ...el, points: next };
      }));
    } else if (interactionMode.current === 'curving' && selectedIds.length === 1) {
      const which = curveControlDragging.current;
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedIds[0]) return el;
          if (which === 2) return { ...el, controlPoint2: point };
          return { ...el, controlPoint: point };
        }),
      );
    }
    else if (interactionMode.current === 'rotating' && selectedIds.length === 1) { const el = elements.find(e => e.id === selectedIds[0]); if (el) { const b = getElementBounds(el, wPx, hPx, wPx, hPx); const angle = Math.atan2(point.y * hPx - b.centerY, point.x * wPx - b.centerX) + Math.PI / 2; setElements(prev => prev.map(e => e.id === selectedIds[0] ? { ...e, rotation: angle } : e)); } }
    else if (interactionMode.current === 'dragging' && lastPoint.current) { const idsToMove = dragSelectionRef.current.length ? dragSelectionRef.current : selectedIds; if (idsToMove.length > 0) { const dx = point.x - lastPoint.current.x; const dy = point.y - lastPoint.current.y; setElements(prev => prev.map(el => { if (!idsToMove.includes(el.id)) return el; const next = { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }; if (el.controlPoint) next.controlPoint = { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy }; if (el.controlPoint2) next.controlPoint2 = { x: el.controlPoint2.x + dx, y: el.controlPoint2.y + dy }; return next; })); lastPoint.current = point; } }
    scheduleCanvasRedraw();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (interactionMode.current === 'creating' && draftStrokeRef.current) {
      const d = draftStrokeRef.current;
      draftStrokeRef.current = null;
      const minLen = 0.006;
      const id = `el-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
      let finalEl: DrawingElement | null = null;
      if (d.type === 'freehand') {
        let pts = [...d.points];
        if (pts.length === 1) {
          const a = pts[0];
          pts = [a, { x: a.x + 0.004, y: a.y + 0.004 }];
        }
        if (pts.length >= 2) {
          finalEl = { ...d, id, points: pts };
        }
      } else {
        const p0 = d.points[0];
        const p1 = d.points[1];
        if (Math.hypot(p1.x - p0.x, p1.y - p0.y) >= minLen) {
          let next: DrawingElement = { ...d, id, points: [{ ...p0 }, { ...p1 }] };
          if (next.type === 'zigzag') {
            next = { ...next, controlPoint: undefined, controlPoint2: undefined };
          } else if (next.type === 'arrow' || next.type === 'double-arrow') {
            const a = next.points[0], b = next.points[1];
            next = {
              ...next,
              controlPoint: { x: a.x + (b.x - a.x) * 0.33, y: a.y + (b.y - a.y) * 0.33 },
              controlPoint2: { x: a.x + (b.x - a.x) * 0.67, y: a.y + (b.y - a.y) * 0.67 },
            };
          }
          finalEl = next;
        }
      }
      if (finalEl) {
        setElements((prev) => [...prev, finalEl!]);
        setSelectedIds([finalEl!.id]);
      }
      try {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { /* noop */ }
    }
    isDrawing.current = false;
    interactionMode.current = 'none';
    activeHandleIndex.current = null;
    curveControlDragging.current = null;
    dragSelectionRef.current = [];
    queueMicrotask(() => flushCanvasRedraw());
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (interactionMode.current === 'creating') {
      draftStrokeRef.current = null;
      try {
        if (e.currentTarget instanceof HTMLElement) e.currentTarget.releasePointerCapture(e.pointerId);
      } catch { /* noop */ }
    }
    isDrawing.current = false;
    interactionMode.current = 'none';
    activeHandleIndex.current = null;
    curveControlDragging.current = null;
    dragSelectionRef.current = [];
    flushCanvasRedraw();
  };

  const handleSaveToBlock = (block: string) => {
    if (!saveFormData.title) { toast({ variant: "destructive", title: "ERROR", description: "Asigne un título antes de guardar." }); return; }
    const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { exercises: [] });
    const newExercise = {
      id: Date.now(),
      block,
      elements,
      fieldType,
      metadata: saveFormData,
      savedAt: new Date().toISOString(),
    };
    vault.exercises = [newExercise, ...(vault.exercises || [])];
    localStorage.setItem("synq_promo_vault", JSON.stringify(vault));
    setVault(vault);
    toast({ title: "SINCRO_LOCAL", description: `Ejercicio blindado en slot ${block.toUpperCase()}.` });
    setIsSaveSheetOpen(false);
  };

  const loadExercise = (ex: any) => {
    setElements(ex.elements || []);
    setFieldType(ex.fieldType || "f11");
    setSaveFormData((prev) => ({ ...prev, ...(ex.metadata || {}) }));
    toast({ title: "EJERCICIO_CARGADO", description: `Sincronizando: ${ex.metadata?.title || 'SIN_TITULO'}` });
  };

  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;

  return (
    <div className={cn("h-full w-full flex flex-col bg-black overflow-hidden relative touch-none select-none", isLegacyDevice && "perf-lite")}>
      {ADSENSE_CLIENT ? (
        <Script
          id="promo-adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
        />
      ) : null}

      {showAds && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-7xl px-6 flex gap-4 pointer-events-none animate-in fade-in duration-1000">
          <div className="flex-1 pointer-events-auto"><AdSlot orientation="horizontal" /></div>
          <div className="flex-1 pointer-events-auto"><AdSlot orientation="horizontal" /></div>
        </div>
      )}

      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 w-full max-w-5xl px-4 pointer-events-none">
        <div className="flex items-center gap-2 md:gap-4 px-4 py-2 md:px-6 md:py-3 bg-black/60 backdrop-blur-2xl border border-primary/30 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-2 scale-[0.8] md:scale-90 lg:scale-100 origin-top pointer-events-auto">
          
          <div className="flex items-center gap-3 pr-3 border-r border-white/10 shrink-0">
            <button onClick={toggleFullscreen} className="h-8 w-8 flex items-center justify-center text-primary/40 hover:text-primary transition-all active:scale-95" title={isFullscreen ? "Minimizar" : "Pantalla Completa"}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
            <div className="flex flex-col"><div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary animate-pulse" /><span className="text-[7px] font-black text-primary tracking-widest uppercase italic">Promo_Mode</span></div><h1 className="text-[10px] font-headline font-black text-white italic uppercase leading-none">{exerciseId ? 'Edición' : 'Sandbox'}</h1></div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <Sheet open={isTeamSheetOpen} onOpenChange={setIsTeamSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-all group relative">
                  <Users className="h-4 w-4 group-hover:animate-pulse" />
                  <div className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-0.5 bg-primary rounded-full border border-black flex items-center justify-center">
                    <span className="text-[7px] font-black text-black tabular-nums">
                      {teamConfig?.starters?.filter((n: string) => n?.trim?.() !== "").length ?? 0}
                    </span>
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#04070c]/98 backdrop-blur-3xl border-r border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Squad_Roster_v1.0</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">MI <span className="text-primary">EQUIPO</span></SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      const raw = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
                      if (!raw) {
                        toast({ variant: "destructive", title: "SIN_DATOS", description: "No hay equipo en localStorage." });
                        return;
                      }
                      setTeamConfig(raw);
                      if (!exerciseId) setFieldType(raw.type || "f11");
                      toast({ title: "EQUIPO_ACTUALIZADO", description: "Datos recargados desde el almacén local." });
                    }}
                    className="w-full h-12 border border-white/10 bg-white/5 text-white/80 font-black uppercase text-[9px] rounded-2xl hover:bg-white/10 mb-2"
                  >
                    Recargar desde localStorage
                  </Button>
                  <Button variant="outline" onClick={() => { loadTeamFromSandbox(); setIsTeamSheetOpen(false); }} className="w-full h-14 border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] rounded-2xl hover:bg-primary hover:text-black transition-all mb-6">
                    <Users className="h-4 w-4 mr-2" /> Volcar Titulares al Campo
                  </Button>
                  {teamConfig ? (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest ml-1 mb-4 italic">Lista de Jugadores Sincronizada</p>
                      {teamConfig.starters.filter((n: string) => n.trim() !== "").map((name: string, i: number) => (
                        <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-primary/5 hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-primary/40 group-hover:text-primary transition-colors">#{i+1}</span>
                            <span className="text-xs font-black text-white uppercase italic group-hover:cyan-text-glow transition-all">{name}</span>
                          </div>
                          <Badge variant="outline" className="text-[7px] border-primary/10 text-primary/40">PROMO_NODE</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                      <Users className="h-10 w-10 mx-auto text-white/20" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Sin configuración de equipo</p>
                      <Button variant="link" className="text-primary text-[10px] font-black uppercase p-0" asChild>
                        <Link href={`${basePath}/team`}>Configurar Ahora</Link>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-8 bg-black/60 border-t border-white/5">
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full h-14 border border-primary/20 text-primary/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/5">OCULTAR_PANEL</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={isMaterialsSheetOpen} onOpenChange={setIsMaterialsSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center transition-all group">
                  <Boxes className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#04070c]/98 backdrop-blur-3xl border-r border-primary/20 text-white w-full sm:max-w-xs shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Equipment_Studio</span>
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">MATERIAL</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <BoardToolbar 
                    theme="cyan" 
                    variant="materials" 
                    orientation="vertical" 
                    activeTool={activeTool} 
                    onToolSelect={(t) => { 
                      addElementAtCenter(t); 
                      setSelectedIds([]); 
                      setIsMaterialsSheetOpen(false); 
                    }} 
                    className="border-none bg-transparent shadow-none w-full" 
                    showLabels 
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />
          
          <div className="flex items-center gap-2">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}><SelectTrigger className="w-[100px] h-8 bg-white/5 border-primary/20 rounded-lg text-[7px] font-black uppercase text-primary focus:ring-0 px-2"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="f11" className="text-[8px] font-black">F11</SelectItem><SelectItem value="f7" className="text-[8px] font-black">F7</SelectItem><SelectItem value="futsal" className="text-[8px] font-black">FUTSAL</SelectItem></SelectContent></Select>
            <button onClick={() => setIsHalfField(!isHalfField)} className={cn("h-8 px-2 border border-primary/20 text-[7px] font-black uppercase rounded-lg transition-all", isHalfField ? "bg-primary text-black" : "text-primary/40")}><Square className="h-3 w-3 mr-1" /> {isHalfField ? 'Campo Total' : 'Medio Campo'}</button>
            <Button variant="ghost" onClick={() => setShowLanes(!showLanes)} className={cn("h-8 px-2 border border-primary/20 text-[7px] font-black uppercase rounded-lg", showLanes ? "bg-primary text-black" : "text-primary/40")}><Columns3 className="h-3 w-3 mr-1" /> Carriles</Button>
          </div>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-2">
            <Sheet open={isDrawingSheetOpen} onOpenChange={setIsDrawingSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all group relative">
                  <PencilLine className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xs shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Drawing_Studio</span>
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">HERRAMIENTAS</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <BoardToolbar 
                    theme="cyan" 
                    variant="training" 
                    orientation="vertical" 
                    activeTool={activeTool} 
                    onToolSelect={(t) => { 
                      if (t === 'select') { 
                        setActiveTool('select'); 
                        setSelectedIds([]); 
                      } else if (isMaterial(t)) {
                        addElementAtCenter(t);
                      } else {
                        setActiveTool(t);
                        setSelectedIds([]);
                      }
                      setIsDrawingSheetOpen(false); 
                    }} 
                    onClear={() => { 
                      setElements([]); 
                      setSelectedIds([]); 
                      setIsDrawingSheetOpen(false);
                    }} 
                    className="border-none bg-transparent shadow-none w-full" 
                    showLabels 
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={isVaultSheetOpen} onOpenChange={setIsVaultSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all group relative">
                  <Library className="h-4 w-4 group-hover:animate-pulse" />
                  <div className="absolute -top-1 -left-1 h-4 w-4 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-[8px] font-black text-black">{vault.exercises?.length || 0}</span>
                  </div>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Vault_Registry_v1.0</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">MIS <span className="text-primary">TAREAS</span></SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                  {vault.exercises && vault.exercises.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {vault.exercises.map((ex: any) => (
                        <div key={ex.id} onClick={() => { loadExercise(ex); setIsVaultSheetOpen(false); }} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-[7px] border-primary/20 text-primary font-black px-2">{ex.block?.toUpperCase() || 'SANDBOX'}</Badge>
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{ex.fieldType?.toUpperCase() || 'F11'}</span>
                          </div>
                          <h4 className="text-sm font-black text-white uppercase italic group-hover:cyan-text-glow transition-all">{ex.metadata?.title || `Tarea_${ex.id.toString().slice(-4)}`}</h4>
                          <p className="text-[9px] font-bold text-white/30 uppercase mt-1 line-clamp-1">{ex.metadata?.objective || 'Sin objetivo definido'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                      <Zap className="h-10 w-10 mx-auto text-white/20" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Almacén Sandbox vacío</p>
                    </div>
                  )}
                </div>
                <div className="p-8 bg-black/60 border-t border-white/5">
                  <Button
                    className="w-full h-14 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-[0_0_20px_rgba(0,242,255,0.14)]"
                    asChild
                  >
                    <Link href={`${basePath}/tasks`}>Gestionar Biblioteca</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="h-6 w-[1px] bg-white/10 mx-1" />

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 border-l border-white/10 pl-3 animate-in zoom-in-95 duration-200">
              {selectedElements.length === 1 && selectedElements[0].type === 'text' ? (
                <div className="flex items-center gap-2 px-2 bg-black/40 border border-primary/30 rounded-lg"><Type className="h-3 w-3 text-primary" /><Input value={selectedElements[0].text || ""} onChange={(e) => setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, text: e.target.value.toUpperCase() } : el))} className="h-7 w-32 bg-transparent border-none text-primary font-black uppercase text-[8px] focus-visible:ring-0 p-0" /></div>
              ) : (
                <div className="flex gap-1">{COLORS.map(c => ( <button key={c.id} onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))} className={cn("h-4 w-4 rounded-full border border-white/20", selectedElements.every(el => el.color === c.value) && "border-white scale-110")} style={{ backgroundColor: c.value }} /> ))}</div>
              )}
              <button onClick={() => { const next = !isDashed; setIsDashed(next); setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, lineStyle: next ? 'dashed' : 'solid'} : el)); }} className={cn("h-8 px-2 border rounded-lg text-[7px] font-black uppercase", isDashed ? "bg-primary text-black" : "border-primary/20 text-primary/40")}>{isDashed ? 'Discontinua' : 'Continua'}</button>
              <div className="w-16 px-2"><Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0]/100} : el))} className="w-full" /></div>
              <button onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-rose-500/60 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <Button onClick={() => setIsSaveSheetOpen(true)} className="h-10 bg-primary text-black font-black uppercase text-[7px] tracking-widest px-4 rounded-lg blue-glow border-none"><Save className="h-3 w-3 mr-1.5" /> GUARDAR</Button>
        </div>
      </header>

      <div className="fixed top-6 left-6 z-[200] lg:block hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const p = window.location.pathname || "";
            const target = p.startsWith("/sandbox/app")
              ? "/sandbox/app/tasks"
              : p.startsWith("/sandbox")
                ? "/sandbox/tasks"
                : "/dashboard/promo/tasks";
            router.replace(target);
          }}
          className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 text-white/40 hover:text-primary transition-all shadow-xl"
        >
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </div>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden touch-none">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes} isHalfField={isHalfField}>
          <canvas
            ref={canvasRef}
            className={cn(
              "absolute inset-0 z-30 pointer-events-auto touch-none",
              isStrokeTool(activeTool) ? "cursor-crosshair" : "cursor-default",
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
          />
        </TacticalField>
      </main>

      <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40"><SheetHeader className="space-y-4"><div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-primary animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Technical_Sheet_Sync_v1.1</span></div><SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">VINCULAR <span className="text-primary">DATOS</span></SheetTitle></SheetHeader></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"><div className="space-y-6"><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Título del Ejercicio</Label><Input value={saveFormData.title} onChange={(e) => setSaveFormData({...saveFormData, title: e.target.value.toUpperCase()})} placeholder="EJ: SALIDA DE BALÓN 4-3-3" className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary text-lg" /></div><div className="grid grid-cols-2 gap-6"><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Etapa Federativa</Label><Select value={saveFormData.stage} onValueChange={(v) => setSaveFormData({...saveFormData, stage: v})}><SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20">{STAGES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>)}</SelectContent></Select></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Dimensión</Label><Select value={saveFormData.dimension} onValueChange={(v) => setSaveFormData({...saveFormData, dimension: v})}><SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem><SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem><SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem></SelectContent></Select></div></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Objetivo Táctico Primario</Label><div className="relative"><Target className="absolute left-3 top-3.5 h-4 w-4 text-primary/40" /><Input value={saveFormData.objective} onChange={(e) => setSaveFormData({...saveFormData, objective: e.target.value.toUpperCase()})} placeholder="EJ: GENERAR SUPERIORIDAD" className="pl-10 h-12 bg-black/40 border-primary/20 rounded-xl font-bold uppercase text-xs text-primary" /></div></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Consignas para el Equipo</Label><Textarea value={saveFormData.description} onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})} placeholder="Explique la dinámica..." className="min-h-[120px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" /></div></div><div className="space-y-4 pt-4 border-t border-white/5"><Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">BLOQUE METODOLÓGICO LOCAL</Label><div className="grid grid-cols-3 gap-2"><Button onClick={() => handleSaveToBlock('warmup')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">WARMUP</Button><Button onClick={() => handleSaveToBlock('main')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">MAIN</Button><Button onClick={() => handleSaveToBlock('cooldown')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">COOL</Button></div></div></div>
          <div className="p-8 bg-black/60 border-t border-white/5"><SheetClose asChild><Button variant="ghost" className="w-full h-16 border border-primary/20 text-primary/60 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-primary/5">CERRAR_TERMINAL</Button></SheetClose></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function PromoBoardPage() {
  return <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-primary font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando_Sandbox...</div>}><PromoBoardContent /></Suspense>;
}
