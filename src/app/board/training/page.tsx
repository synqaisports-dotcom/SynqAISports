
"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense, memo } from "react";
import { 
  Sparkles, 
  Save, 
  LayoutGrid, 
  Trash2, 
  Copy, 
  Plus,
  Columns3,
  Layers,
  Activity,
  X,
  Type,
  Maximize2,
  Minimize2,
  PencilLine,
  ArrowRight,
  Square,
  RefreshCw,
  Boxes,
  Library,
  Target,
  ClipboardList,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar, DrawingTool } from "@/components/board/BoardToolbar";
import { synqSync } from "@/lib/sync-service";
import { canShowAds } from "@/lib/ads-policy";
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
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STORAGE_METHODOLOGY_NEURAL, STORAGE_TRAINING_NEURAL } from "@/lib/neural-warehouse";
import { CANVAS_PLAYER_NORM_WIDTH } from "@/lib/board-drawing";
import { useAuth } from "@/lib/auth-context";
import {
  BOARD_HIGH_PERFORMANCE_KEY,
  BOARD_PERF_CHANGE_EVENT,
  resolveBoardVisualProfile,
  createRedrawRaf,
  type RedrawRafHandle,
} from "@/lib/board-performance";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  /** Primera manija de curvatura (Bezier / cuadrática legacy). */
  controlPoint?: Point; 
  /** Segunda manija (solo flechas: Bezier cúbica a lo largo del trazo). */
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

/** Herramientas que se pintan arrastrando en el lienzo (no se crean solas al pulsar). */
const isStrokeTool = (type: DrawingTool) =>
  ['freehand', 'rect', 'circle', 'arrow', 'double-arrow', 'zigzag', 'cross-arrow', 'text'].includes(type);

/** Polyline en píxeles: ondas perpendiculares al segmento (slalom entre picas). */
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

/** Lado corto del lienzo CSS de referencia (~desktop); en pantallas más pequeñas los materiales se dibujan más grandes sin cambiar el JSON guardado. */
const FIELD_REF_SHORT_PX = 460;
/** Metadato guardado con elementos: siempre fracciones 0–1 del rectángulo del canvas táctico (= proporción sobre el campo mostrado). */
const BOARD_COORD_SPACE = "canvas_normalized_v1" as const;

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

const AdSlot = memo(({ orientation = 'horizontal', source = "sandbox" }: { orientation: 'horizontal' | 'vertical'; source?: "sandbox" | "elite" }) => {
  useEffect(() => {
    synqSync.trackEvent('ad_impression', { source, format: orientation, placement: 'training_board_multiplex', timestamp: new Date().toISOString() });
  }, [orientation, source]);
  const handleAdClick = () => { synqSync.trackEvent('ad_click', { source, format: orientation, placement: 'training_board_multiplex' }); };
  return (
    <div onClick={handleAdClick} className={cn("bg-amber-500/5 border-2 border-dashed border-amber-500/20 flex flex-col items-center justify-center rounded-2xl overflow-hidden group transition-[background-color,border-color,color,opacity,transform] hover:bg-amber-500/[0.08] pointer-events-auto shadow-[0_0_20px_rgba(245,158,11,0.05)] relative cursor-pointer", orientation === 'horizontal' ? "h-16 w-full" : "w-40 h-[600px]")}>
      <div className="absolute top-0 left-0 bg-amber-500/20 text-amber-500 text-[6px] font-black px-2 py-0.5 uppercase tracking-widest italic z-20">Multiplex_Ad_Node</div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-1/2 w-full animate-[refresh-scan_3s_linear_infinite] pointer-events-none z-10" />
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        <RefreshCw className="h-4 w-4 text-amber-500/40 group-hover:text-amber-500 transition-[background-color,border-color,color,opacity,transform] mb-1 animate-spin-slow" />
        <span className="text-[7px] font-black text-amber-500/60 uppercase tracking-[0.2em] italic truncate">Sync_Broadcast</span>
        <span className="text-[5px] text-white/20 uppercase font-bold tracking-widest">Auto-Refresh: Active</span>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
    </div>
  );
});

AdSlot.displayName = "AdSlot";

function TrainingBoardContent() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sourceParam = searchParams.get("source");
  const shouldOpenLibraryForm = sourceParam === "form";
  const editIdParam = searchParams.get("editId");
  const titleParam = searchParams.get("title");
  const stageParam = searchParams.get("stage");
  const dimensionParam = searchParams.get("dimension");
  const objectiveParam = searchParams.get("objective");
  const descriptionParam = searchParams.get("description");
  const boardFieldTypeParam = searchParams.get("boardFieldType");
  const boardShowLanesParam = searchParams.get("boardShowLanes");
  const boardIsHalfFieldParam = searchParams.get("boardIsHalfField");
  const PENDING_LIBRARY_PREFILL_KEY = "synq_methodology_library_prefill_from_board_v1";
  const STORAGE_METHODOLOGY_LIBRARY_DRAFTS = "synq_methodology_library_drafts";
  
  const [renderScale, setRenderScale] = useState(1.0);
  const [isLegacyDevice, setIsLegacyDevice] = useState(false);
  const [boardCanvasShadows, setBoardCanvasShadows] = useState(true);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [dprFactor, setDprFactor] = useState(1);

  const adsMode = profile?.role === "promo_coach" ? "sandbox" : "elite";
  const showAds = canShowAds({
    surface: "training_board",
    mode: adsMode,
    role: profile?.role,
  });

  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [isHalfField, setIsHalfField] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [isDashed, setIsDashed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
  /** 1 = controlPoint, 2 = controlPoint2 (solo flechas). */
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

  // Si abrimos la pizarra desde la Biblioteca para editar (editId),
  // pre-rellenamos campos y cargamos el dibujo guardado en la tarea.
  useEffect(() => {
    if (!editIdParam) return;
    if (typeof window === "undefined") return;

    const safeParse = (raw: string | null): any[] => {
      try {
        const parsed = JSON.parse(raw ?? "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const drafts = safeParse(localStorage.getItem(STORAGE_METHODOLOGY_LIBRARY_DRAFTS));
    const official = safeParse(localStorage.getItem(STORAGE_METHODOLOGY_NEURAL));
    const all = [...drafts, ...official];
    const found = all.find((x: any) => x && typeof x.id === "string" && x.id === editIdParam);
    if (!found) return;

    const nextElements = Array.isArray(found.elements) ? (found.elements as DrawingElement[]) : [];
    setElements(nextElements);

    const nextFieldType = (found.board?.fieldType ?? "f11") as FieldType;
    const validFieldTypes: FieldType[] = ["f11", "f7", "futsal"];
    setFieldType(validFieldTypes.includes(nextFieldType) ? nextFieldType : "f11");
    setShowLanes(Boolean(found.board?.showLanes));
    setIsHalfField(Boolean(found.board?.isHalfField));

    setSaveFormData({
      title: found.title ?? "",
      stage: found.stage ?? "Alevín",
      dimension: found.dimension ?? "Táctica",
      objective: found.objectives ?? "",
      description: found.description ?? "",
    });

    setSelectedIds([]);
    setActiveTool("select");
    // Nota UX: no mostramos toast para evitar ruido al entrar a editar.
  }, [editIdParam]);

  // Overrides desde la Biblioteca aunque no hayas pulsado “Guardar” en el sheet:
  // si llegan campos por querystring, los usamos para evitar que al pulsar “GUARDAR”
  // tengamos campos vacíos.
  useEffect(() => {
    const hasAnyField =
      titleParam != null ||
      stageParam != null ||
      dimensionParam != null ||
      objectiveParam != null ||
      descriptionParam != null ||
      boardFieldTypeParam != null ||
      boardShowLanesParam != null ||
      boardIsHalfFieldParam != null;

    if (!hasAnyField) return;

    const validFieldTypes: FieldType[] = ["f11", "f7", "futsal"];
    if (boardFieldTypeParam) {
      const nextFieldType = validFieldTypes.includes(boardFieldTypeParam as FieldType)
        ? (boardFieldTypeParam as FieldType)
        : "f11";
      setFieldType(nextFieldType);
    }
    if (boardShowLanesParam != null) setShowLanes(boardShowLanesParam === "1");
    if (boardIsHalfFieldParam != null) setIsHalfField(boardIsHalfFieldParam === "1");

    setSaveFormData((prev) => ({
      ...prev,
      title: titleParam ?? prev.title,
      stage: stageParam ?? prev.stage,
      dimension: dimensionParam ?? prev.dimension,
      objective: objectiveParam ?? prev.objective,
      description: descriptionParam ?? prev.description,
    }));
  }, [
    titleParam,
    stageParam,
    dimensionParam,
    objectiveParam,
    descriptionParam,
    boardFieldTypeParam,
    boardShowLanesParam,
    boardIsHalfFieldParam,
  ]);

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
      case 'player': ctx.save(); if (boardCanvasShadows) { ctx.shadowBlur = 20 * renderScale; ctx.shadowColor = hexToRgba(element.color, 0.4); } else { ctx.shadowBlur = 0; } const pRadius = Math.min(width, height) / 2; ctx.beginPath(); ctx.arc(centerX, centerY, pRadius, 0, Math.PI * 2); const pGrad = ctx.createRadialGradient(centerX - pRadius/3, centerY - pRadius/3, 0, centerX, centerY, pRadius); pGrad.addColorStop(0, '#ffffff44'); pGrad.addColorStop(0.5, hexToRgba(element.color, 0.3)); pGrad.addColorStop(1, hexToRgba(element.color, 0.1)); ctx.fillStyle = pGrad; ctx.fill(); ctx.strokeStyle = element.color; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(pRadius * 0.64)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((element.number || 1).toString(), centerX, centerY + (pRadius * 0.04)); ctx.restore(); break;
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

        // Bola (degradado + borde)
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

        // Paneles (más limpios, estilo balón real)
        ctx.strokeStyle = "rgba(15,23,42,0.35)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();
        [[0, -40, 0, -15], [35, -18, 14, -8], [22, 32, 9, 12], [-22, 32, -9, 12], [-35, -18, -14, -8]].forEach(
          (pat) => {
            ctx.beginPath();
            ctx.moveTo(pat[0], pat[1]);
            ctx.lineTo(pat[2], pat[3]);
            ctx.stroke();
          }
        );

        // Tinte opcional del equipo (muy sutil)
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

        // Sombra
        ctx.beginPath();
        ctx.ellipse(0, 14, 26, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.30)";
        ctx.fill();

        // Cuerpo
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

        // Brillo
        ctx.beginPath();
        ctx.moveTo(-7, 10);
        ctx.lineTo(-1, -24);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        ctx.fill();

        // Bandas blancas (más "pro" que rectángulos planos)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-10, -2, 20, 6);
        ctx.fillRect(-7, -18, 14, 4);

        // Base
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

        // Sombra base
        ctx.beginPath();
        ctx.ellipse(0, ry * 1.45, rx * 0.95, ry * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.24)";
        ctx.fill();

        // Disco principal de la seta (marcador plano)
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

        // Borde frontal para dar sensación de volumen
        ctx.beginPath();
        ctx.ellipse(0, ry * 0.1, rx * 0.84, ry * 0.45, 0, 0, Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = Math.max(1, 1.1 * renderScale);
        ctx.stroke();

        // Punto/brillo central (acabado "plástico")
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

        // Patín/sombra
        ctx.beginPath();
        ctx.rect(-30, 14, 60, 6);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();

        // Postes
        ctx.strokeStyle = hexToRgba(element.color, 0.95);
        ctx.lineWidth = 6 * renderScale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-26, 14);
        ctx.lineTo(-26, -12);
        ctx.moveTo(26, 14);
        ctx.lineTo(26, -12);
        ctx.stroke();

        // Traviesa superior
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

        // Base (remate)
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

        // sombra
        ctx.beginPath();
        ctx.ellipse(0, 34, 52, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();

        // red de fondo (más limpia)
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

        // marco principal
        const frameGrad = ctx.createLinearGradient(-50, 0, 50, 0);
        frameGrad.addColorStop(0, "#e5e7eb");
        frameGrad.addColorStop(0.5, "#ffffff");
        frameGrad.addColorStop(1, "#d1d5db");
        ctx.strokeStyle = frameGrad;
        ctx.lineWidth = 6 * renderScale;
        ctx.strokeRect(-50, -30, 100, 60);

        // detalle de profundidad lateral
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

        // base (como tu referencia: más ancha y con inclinación)
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

        // palo
        const poleGrad = ctx.createLinearGradient(-3, -42, 3, 18);
        poleGrad.addColorStop(0, "#fef08a");
        poleGrad.addColorStop(0.5, "#fde047");
        poleGrad.addColorStop(1, "#eab308");
        ctx.fillStyle = poleGrad;
        ctx.fillRect(-3, -58, 6, 76);
        ctx.strokeStyle = "rgba(120,53,15,0.35)";
        ctx.lineWidth = 1.5 * renderScale;
        ctx.strokeRect(-3, -58, 6, 76);

        // punta superior
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
  }, [hexToRgba, renderScale, boardCanvasShadows]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sorted = [...elements].sort((a, b) => {
      if (a.type === 'text' && b.type !== 'text') return 1; if (a.type !== 'text' && b.type === 'text') return -1;
      const aMat = isMaterial(a.type); const bMat = isMaterial(b.type); if (aMat && !bMat) return 1; if (!aMat && bMat) return -1; return 0;
    });
    sorted.forEach(el => drawElement(ctx, el, selectedIds.includes(el.id)));
    const draft = draftStrokeRef.current;
    if (draft) {
      drawElement(ctx, draft, false);
    }
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
    const defW =
      tool === "player" ? CANVAS_PLAYER_NORM_WIDTH :
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
        if (hIdx !== -1) { interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return; }
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
      } catch {
        /* captura opcional (algunos navegadores / stylus) */
      }
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
      } catch {
        /* noop */
      }
    }
    isDrawing.current = false;
    interactionMode.current = 'none';
    activeHandleIndex.current = null;
    curveControlDragging.current = null;
    dragSelectionRef.current = [];
    queueMicrotask(() => flushCanvasRedraw());
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveFormData.title) {
      toast({ variant: "destructive", title: "ERROR", description: "Asigne un título." });
      return;
    }
    try {
      if (shouldOpenLibraryForm) {
        const canvas = canvasRef.current;
        if (!canvas) {
          toast({
            variant: "destructive",
            title: "ERROR",
            description: "No se pudo exportar el canvas.",
          });
          return;
        }

        const MATERIAL_TYPE_TO_ITEM: Partial<Record<DrawingTool, string>> = {
          ball: "Balón",
          cone: "Cono",
          seta: "Seta",
          ladder: "Escalera",
          hurdle: "Valla",
          minigoal: "Miniportería",
          pica: "Pica",
          barrier: "Barrera",
        };

        const materialCounts = elements.reduce<Record<string, number>>((acc, el) => {
          if (el.type === "player" || el.type === "text") return acc;
          const item = MATERIAL_TYPE_TO_ITEM[el.type];
          if (!item) return acc;
          acc[item] = (acc[item] ?? 0) + 1;
          return acc;
        }, {});

        const materials = Object.entries(materialCounts).map(([item, quantity]) => ({
          id: `mat-${Date.now()}-${item}`,
          item,
          quantity,
          unit: "ud",
        }));

        // El overlay `canvas` solo contiene los elementos dibujados. El `TacticalField`
        // (líneas/fondo) está hecho con CSS/divs, así que para la miniatura necesitamos
        // "fusionar" un fondo aproximado + overlay.
        let photoUrl = canvas.toDataURL("image/png");

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext("2d");

        if (exportCtx) {
          const w = exportCanvas.width;
          const h = exportCanvas.height;

          const isFutsal = fieldType === "futsal";
          exportCtx.fillStyle = isFutsal ? "#0a2e5c" : "#143d14";
          exportCtx.fillRect(0, 0, w, h);

          // Textura suave (aprox.)
          exportCtx.save();
          if (!isFutsal) {
            exportCtx.globalAlpha = 0.14;
            exportCtx.fillStyle = "rgba(0,0,0,0.35)";
            const stripe = Math.max(6, Math.floor(w / 80));
            for (let x = 0; x < w; x += stripe) {
              exportCtx.fillRect(x, 0, Math.max(1, Math.floor(stripe / 2)), h);
            }
          } else {
            const g = exportCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
            g.addColorStop(0, "rgba(255,255,255,0.06)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            exportCtx.fillStyle = g;
            exportCtx.fillRect(0, 0, w, h);
          }
          exportCtx.restore();

          // Caja del campo (contain por ratio)
          const ratio = isHalfField ? 1.5 : (isFutsal ? 2.0 : 1.54);
          const boxW = Math.min(w, h * ratio);
          const boxH = boxW / ratio;
          const boxX = (w - boxW) / 2;
          const boxY = (h - boxH) / 2;

          exportCtx.save();
          if (isHalfField) {
            exportCtx.beginPath();
            exportCtx.rect(boxX, boxY, boxW, boxH);
            exportCtx.clip();
          }

          // Borde
          exportCtx.save();
          exportCtx.strokeStyle = "rgba(255,255,255,0.20)";
          exportCtx.lineWidth = Math.max(1.5, 2 * (renderScale / dprFactor));
          exportCtx.strokeRect(boxX, boxY, boxW, boxH);
          exportCtx.restore();

          // Línea central
          exportCtx.save();
          exportCtx.strokeStyle = "rgba(255,255,255,0.20)";
          exportCtx.lineWidth = Math.max(1.2, 1.4 * (renderScale / dprFactor));
          exportCtx.beginPath();
          if (isHalfField) {
            exportCtx.moveTo(boxX, boxY + boxH / 2);
            exportCtx.lineTo(boxX + boxW, boxY + boxH / 2);
          } else {
            exportCtx.moveTo(boxX + boxW / 2, boxY);
            exportCtx.lineTo(boxX + boxW / 2, boxY + boxH);
          }
          exportCtx.stroke();
          exportCtx.restore();

          // Círculo central
          exportCtx.save();
          exportCtx.strokeStyle = "rgba(255,255,255,0.20)";
          exportCtx.lineWidth = Math.max(1, 1.2 * (renderScale / dprFactor));
          const cx = boxX + boxW / 2;
          const cy = boxY + boxH / 2;
          const r = boxH * (isFutsal ? 0.075 : 0.09);
          exportCtx.beginPath();
          exportCtx.arc(cx, cy, r, 0, Math.PI * 2);
          exportCtx.stroke();
          exportCtx.restore();

          // Carriles (aprox.)
          if (showLanes && !isHalfField) {
            exportCtx.save();
            exportCtx.strokeStyle = "rgba(255,255,255,0.20)";
            exportCtx.setLineDash([10 * (renderScale / dprFactor), 6 * (renderScale / dprFactor)]);
            exportCtx.lineWidth = Math.max(1, 1.2 * (renderScale / dprFactor));
            const l1 = boxX + boxW * 0.2;
            const l2 = boxX + boxW * 0.8;
            exportCtx.beginPath();
            exportCtx.moveTo(l1, boxY);
            exportCtx.lineTo(l1, boxY + boxH);
            exportCtx.moveTo(l2, boxY);
            exportCtx.lineTo(l2, boxY + boxH);
            exportCtx.stroke();
            exportCtx.restore();
          }

          exportCtx.restore();

          // Overlay encima
          exportCtx.drawImage(canvas, 0, 0);

          photoUrl = exportCanvas.toDataURL("image/png");
        }

        localStorage.setItem(
          PENDING_LIBRARY_PREFILL_KEY,
          JSON.stringify({
            kind: PENDING_LIBRARY_PREFILL_KEY,
            editingId: editIdParam ?? undefined,
            stage: saveFormData.stage,
            dimension: saveFormData.dimension,
            title: saveFormData.title,
            objectives: saveFormData.objective,
            description: saveFormData.description,
            photoUrl,
            materials,
            elements,
            boardCoordSpace: BOARD_COORD_SPACE,
            board: {
              fieldType,
              showLanes,
              isHalfField,
            },
          })
        );

        setIsSaveSheetOpen(false);
        toast({
          title: "CREANDO_TAREA_MAESTRA",
          description: "Abriendo el formulario de la biblioteca con tu captura...",
        });
        router.push("/dashboard/methodology/exercise-library");
        return;
      }

      const raw =
        localStorage.getItem(STORAGE_TRAINING_NEURAL) || '{"exercises":[]}';
      const vault = JSON.parse(raw) as { exercises?: unknown[] };
      if (!Array.isArray(vault.exercises)) vault.exercises = [];
      vault.exercises.unshift({
        id: Date.now(),
        fieldType,
        elements,
        metadata: saveFormData,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_TRAINING_NEURAL, JSON.stringify(vault));
    } catch {
      toast({
        variant: "destructive",
        title: "ERROR",
        description: "No se pudo guardar en el almacén neural local.",
      });
      return;
    }
    toast({
      title: "SINCRO_EXITOSA",
      description: `Ejercicio "${saveFormData.title}" en almacén neural (training).`,
    });
    setIsSaveSheetOpen(false);
  };

  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;
  const duplicateSelected = () => {
    if (!selectedIds.length) return;
    const offset = 0.02; // pequeño desplazamiento para distinguir copia/original
    setElements((prev) => {
      const ids = new Set(selectedIds);
      let nextPlayerNumber =
        prev
          .filter((e) => e.type === "player" && Number.isFinite(Number(e.number)))
          .reduce((max, e) => Math.max(max, Number(e.number ?? 0)), 0) + 1;
      const clones = prev
        .filter((el) => ids.has(el.id))
        .map((el) => ({
          ...el,
          id: `el-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
          points: el.points.map((p) => ({ x: p.x + offset, y: p.y + offset })),
          controlPoint: el.controlPoint
            ? { x: el.controlPoint.x + offset, y: el.controlPoint.y + offset }
            : undefined,
          controlPoint2: el.controlPoint2
            ? { x: el.controlPoint2.x + offset, y: el.controlPoint2.y + offset }
            : undefined,
          number:
            el.type === "player"
              ? nextPlayerNumber++
              : el.number,
        }));
      setSelectedIds(clones.map((c) => c.id));
      return [...prev, ...clones];
    });
  };

  return (
    <div className={cn("h-full w-full flex flex-col bg-black overflow-hidden relative touch-none select-none", isLegacyDevice && "perf-lite")}>
      
      {showAds && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-7xl px-6 flex gap-4 pointer-events-none animate-in fade-in duration-1000">
          <div className="flex-1 pointer-events-auto"><AdSlot orientation="horizontal" /></div>
          <div className="flex-1 pointer-events-auto"><AdSlot orientation="horizontal" /></div>
        </div>
      )}

      <header className="fixed top-2 sm:top-4 lg:top-6 left-0 right-0 z-[100] flex justify-center px-2 sm:px-3 pointer-events-none">
        {/* pl-* deja hueco al botón “Dashboard” del layout de /board (siempre visible) */}
        <div className="pointer-events-auto w-full max-w-6xl pl-20 pr-2 sm:pr-3 min-w-0">
          <div className="flex flex-col gap-2 sm:gap-1.5 min-w-0 px-2 py-2 sm:px-3 sm:py-2.5 md:px-5 md:py-3 bg-black/60 backdrop-blur-2xl border border-amber-500/30 rounded-2xl sm:rounded-[1.75rem] md:rounded-[2rem] shadow-2xl animate-in slide-in-from-top-2 origin-top">
            <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 md:gap-x-2 md:gap-y-2 min-w-0">
          
          <div className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-3 border-r border-white/10 shrink-0 max-[380px]:pr-2">
            <button onClick={toggleFullscreen} className="h-8 w-8 shrink-0 flex items-center justify-center text-amber-500/40 hover:text-amber-500 transition-[background-color,border-color,color,opacity,transform] active:scale-95" title={isFullscreen ? "Minimizar" : "Pantalla Completa"}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
            <div className="flex flex-col min-w-0">
              <div className="hidden sm:flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse shrink-0" />
                <span className="text-[7px] font-black text-amber-500 tracking-widest uppercase italic truncate">Master_Studio</span>
              </div>
              <div className="flex sm:hidden items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse shrink-0" />
                <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase italic truncate">Studio</span>
              </div>
              <h1 className="text-[9px] sm:text-[10px] font-headline font-black text-white italic uppercase leading-tight truncate max-w-[7rem] sm:max-w-none">Diseño Élite</h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 px-0 shrink-0">
            <Sheet open={isMaterialsSheetOpen} onOpenChange={setIsMaterialsSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center transition-[background-color,border-color,color,opacity,transform] group">
                  <Boxes className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#04070c]/98 backdrop-blur-3xl border-r border-amber-500/20 text-white w-full sm:max-w-xs shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Equipment_Studio</span>
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">MATERIAL</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <BoardToolbar 
                    theme="amber" 
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

          <div className="hidden sm:block h-6 w-px bg-white/10 mx-0.5 shrink-0 self-stretch min-h-[1.5rem]" />
          
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 min-w-0">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[4.5rem] sm:w-[100px] h-8 bg-white/5 border-amber-500/20 rounded-lg text-[7px] font-black uppercase text-amber-500 focus:ring-0 px-1.5 sm:px-2 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                <SelectItem value="f11" className="text-[8px] font-black">F11</SelectItem>
                <SelectItem value="f7" className="text-[8px] font-black">F7</SelectItem>
                <SelectItem value="futsal" className="text-[8px] font-black">FUTSAL</SelectItem>
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={() => setIsHalfField(!isHalfField)}
              title={isHalfField ? "Ver campo completo" : "Medio campo"}
              className={cn(
                "h-8 px-1.5 sm:px-2 border border-amber-500/20 text-[7px] font-black uppercase rounded-lg transition-[background-color,border-color,color,opacity,transform] inline-flex items-center justify-center gap-1 shrink-0",
                isHalfField ? "bg-amber-500 text-black" : "text-amber-500/40",
              )}
            >
              <Square className="h-3 w-3 shrink-0" />
              <span className="hidden md:inline">{isHalfField ? "Campo total" : "Medio campo"}</span>
            </button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowLanes(!showLanes)}
              title="Carriles"
              className={cn(
                "h-8 px-1.5 sm:px-2 border border-amber-500/20 text-[7px] font-black uppercase rounded-lg shrink-0",
                showLanes ? "bg-amber-500 text-black hover:bg-amber-500 hover:text-black" : "text-amber-500/40",
              )}
            >
              <Columns3 className="h-3 w-3 shrink-0 md:mr-1" />
              <span className="hidden md:inline">Carriles</span>
            </Button>
          </div>

          <div className="hidden md:block h-6 w-px bg-white/10 mx-0.5 shrink-0 self-stretch min-h-[1.5rem]" />

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Sheet open={isDrawingSheetOpen} onOpenChange={setIsDrawingSheetOpen}>
              <SheetTrigger asChild>
                <button className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-[background-color,border-color,color,opacity,transform] group relative">
                  <PencilLine className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-xs shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Drawing_Studio</span>
                    </div>
                    <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">HERRAMIENTAS</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <BoardToolbar 
                    theme="amber" 
                    variant="training" 
                    orientation="vertical" 
                    activeTool={activeTool} 
                    onToolSelect={(t) => { 
                      if(t === 'select') { 
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
                <button className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-[background-color,border-color,color,opacity,transform] group relative">
                  <Library className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Master_Library_v1.0</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">BIBLIOTECA <span className="text-amber-500">TAREAS</span></SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
                  <div className="p-10 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                    <Library className="h-10 w-10 mx-auto text-white/20" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Sincronizando con base de datos del club...</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-2 mt-0.5 sm:border-t-0 sm:pt-0 sm:mt-0 sm:pl-2 sm:border-l border-white/10 w-full sm:w-auto animate-in zoom-in-95 duration-200">
              {selectedElements.length === 1 && selectedElements[0].type === 'text' ? (
                <div className="flex items-center gap-2 px-2 bg-black/40 border border-amber-500/30 rounded-lg max-w-full">
                  <Type className="h-3 w-3 text-amber-500 shrink-0" />
                  <Input value={selectedElements[0].text || ""} onChange={(e) => setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, text: e.target.value.toUpperCase() } : el))} className="h-7 w-[min(12rem,45vw)] bg-transparent border-none text-amber-500 font-black uppercase text-[8px] focus-visible:ring-0 p-0 min-w-0" />
                </div>
              ) : (
                <div className="flex gap-1 flex-wrap justify-center">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))}
                      className={cn("h-4 w-4 rounded-full border border-white/20 shrink-0", selectedElements.every(el => el.color === c.value) && "border-white scale-110")}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => { const next = !isDashed; setIsDashed(next); setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, lineStyle: next ? 'dashed' : 'solid'} : el)); }}
                className={cn("h-8 px-2 border rounded-lg text-[7px] font-black uppercase shrink-0", isDashed ? "bg-amber-500 text-black" : "border-amber-500/20 text-amber-500/40")}
              >
                <span className="hidden sm:inline">{isDashed ? "Discontinua" : "Continua"}</span>
                <span className="sm:hidden">{isDashed ? "Disec." : "Cont."}</span>
              </button>
              <div className="w-14 sm:w-16 px-1 shrink-0">
                <Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0]/100} : el))} className="w-full" />
              </div>
              <button type="button" onClick={duplicateSelected} className="text-amber-500/70 hover:text-amber-500 p-1" title="Duplicar selección"><Copy className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-rose-500/60 hover:text-rose-500 p-1" title="Eliminar"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
          <Button
            type="button"
            onClick={() => setIsSaveSheetOpen(true)}
            className="h-9 sm:h-10 inline-flex items-center gap-1 sm:gap-1.5 bg-amber-500 text-black font-black uppercase text-[7px] tracking-widest px-2.5 sm:px-4 rounded-lg amber-glow border-none shrink-0"
          >
            <Save className="h-3 w-3 shrink-0" />
            <span>Guardar</span>
          </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden touch-none pt-14 sm:pt-16 lg:pt-10">
        <TacticalField theme="amber" fieldType={fieldType} showWatermark showLanes={showLanes} isHalfField={isHalfField}>
          <canvas
            ref={canvasRef}
            className={cn(
              'absolute inset-0 z-30 pointer-events-auto touch-none',
              isStrokeTool(activeTool) ? 'cursor-crosshair' : 'cursor-default',
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={(e) => {
              if (interactionMode.current === 'creating') {
                draftStrokeRef.current = null;
                try {
                  if (e.currentTarget instanceof HTMLElement) e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {
                  /* noop */
                }
              }
              isDrawing.current = false;
              interactionMode.current = 'none';
              activeHandleIndex.current = null;
              curveControlDragging.current = null;
              dragSelectionRef.current = [];
              flushCanvasRedraw();
            }}
          />
        </TacticalField>
      </main>

      <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40"><SheetHeader className="space-y-4"><div className="flex items-center gap-3"><ClipboardList className="h-5 w-5 text-amber-500 animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Academic_Task_Sync_v2.0</span></div><SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">VINCULAR <span className="text-amber-500">TAREA</span></SheetTitle></SheetHeader></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8"><div className="space-y-6"><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Título del Ejercicio</Label><Input value={saveFormData.title} onChange={(e) => setSaveFormData({...saveFormData, title: e.target.value.toUpperCase()})} placeholder="EJ: SALIDA DE BALÓN 4-3-3" className="h-14 bg-black/40 border-amber-500/20 rounded-2xl font-bold uppercase focus:border-amber-500 text-amber-500 text-lg" /></div><div className="grid grid-cols-2 gap-6"><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Etapa Federativa</Label><Select value={saveFormData.stage} onValueChange={(v) => setSaveFormData({...saveFormData, stage: v})}><SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20">{STAGES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>)}</SelectContent></Select></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Dimensión</Label><Select value={saveFormData.dimension} onValueChange={(v) => setSaveFormData({...saveFormData, dimension: v})}><SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem><SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem><SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem></SelectContent></Select></div></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Objetivo Táctico Primario</Label><div className="relative"><Target className="absolute left-3 top-3.5 h-4 w-4 text-amber-500/40" /><Input value={saveFormData.objective} onChange={(e) => setSaveFormData({...saveFormData, objective: e.target.value.toUpperCase()})} placeholder="EJ: GENERAR SUPERIORIDAD" className="pl-10 h-12 bg-black/40 border-amber-500/20 rounded-xl font-bold uppercase text-xs text-amber-500" /></div></div><div className="space-y-3"><Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Descripción / Consignas</Label><Textarea value={saveFormData.description} onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})} placeholder="Explique la dinámica..." className="min-h-[120px] bg-black/40 border-primary/20 rounded-2xl font-bold text-amber-500" /></div></div></div>
          <div className="p-8 bg-black/60 border-t border-white/5"><Button onClick={handleConfirmSave} className="w-full h-16 bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl amber-glow">BLINDAR_EN_BIBLIOTECA <ArrowRight className="h-4 w-4 ml-3" /></Button></div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function TrainingBoardPage() {
  return <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-amber-500 font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando_Estudio_Pro...</div>}><TrainingBoardContent /></Suspense>;
}
