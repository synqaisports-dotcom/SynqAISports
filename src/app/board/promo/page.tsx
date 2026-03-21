
"use client";

import { useState, useRef, useEffect, useCallback, Suspense, memo } from "react";
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
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  controlPoint?: Point; 
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

const isCircular = (type: DrawingTool) => 
  ['player', 'ball', 'circle', 'seta'].includes(type);

const AdSlot = memo(({ orientation = 'horizontal' }: { orientation: 'horizontal' | 'vertical' }) => {
  useEffect(() => {
    synqSync.trackEvent('ad_impression', { format: orientation, placement: 'promo_board_multiplex', timestamp: new Date().toISOString() });
  }, [orientation]);
  const handleAdClick = () => { synqSync.trackEvent('ad_click', { format: orientation, placement: 'promo_board_multiplex' }); };
  return (
    <div onClick={handleAdClick} className={cn("bg-primary/5 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center rounded-2xl overflow-hidden group transition-all hover:bg-primary/[0.08] pointer-events-auto shadow-[0_0_20px_rgba(0,242,255,0.05)] relative cursor-pointer", orientation === 'horizontal' ? "h-16 w-full max-w-[728px]" : "w-40 h-[600px]")}>
      <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[6px] font-black px-2 py-0.5 uppercase tracking-widest italic z-20">Multiplex_Ad_Node</div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-1/2 w-full animate-[refresh-scan_3s_linear_infinite] pointer-events-none z-10" />
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        <RefreshCw className="h-5 w-5 text-primary/40 group-hover:text-primary transition-all mb-2 animate-spin-slow" />
        <span className="text-[8px] font-black text-primary/60 uppercase tracking-[0.3em] italic">Dynamic_Sync_Broadcast</span>
        <span className="text-[6px] text-white/20 mt-1 uppercase font-bold tracking-widest">Auto-Refresh: Active • Latency: 0ms</span>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
    </div>
  );
});

AdSlot.displayName = "AdSlot";

function PromoBoardContent() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const exerciseId = searchParams.get("id");

  const [renderScale, setRenderScale] = useState(1.0);
  const [isLegacyDevice, setIsLegacyDevice] = useState(false);

  const showAds = profile?.plan === 'free' || profile?.role === 'promo_coach' || profile?.role === 'superadmin';

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

  const [saveFormData, setSaveFormData] = useState({
    title: "", stage: "Alevín", dimension: "Táctica", objective: "", description: ""
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'curving' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      const isT5 = /AGS2/.test(ua);
      const lowCPU = (window.navigator.hardwareConcurrency || 8) <= 8;
      if (isT5 || lowCPU) { setIsLegacyDevice(true); setRenderScale(0.75); }
    }
    const savedTeam = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
    const savedVault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
    setVault(savedVault);
    
    if (savedTeam) { 
      setTeamConfig(savedTeam); 
      if (!exerciseId) setFieldType(savedTeam.type || "f11"); 
    }
    
    if (exerciseId) {
      const target = savedVault.exercises?.find((e: any) => e.id.toString() === exerciseId);
      if (target) { 
        setElements(target.elements || []); 
        setFieldType(target.fieldType || "f11"); 
        setSaveFormData(target.metadata || saveFormData); 
      }
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

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const rotatePoint = (point: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle); const sin = Math.sin(angle);
    const dx = point.x - center.x; const dy = point.y - center.y;
    return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos };
  };

  const getElementBounds = (element: DrawingElement, widthPx: number, heightPx: number) => {
    const p = element.points.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const minX = Math.min(...p.map(pt => pt.x)); const minY = Math.min(...p.map(pt => pt.y));
    const maxX = Math.max(...p.map(pt => pt.x)); const maxY = Math.max(...p.map(pt => pt.y));
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  };

  const loadTeamFromSandbox = () => {
    const savedTeam = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
    if (!savedTeam) { toast({ variant: "destructive", title: "ERROR_SINCRO", description: "Configure su equipo primero." }); return; }
    setFieldType(savedTeam.type || "f11");
    const canvasRatio = canvasRef.current ? (canvasRef.current.width / canvasRef.current.height) : 1.5;
    const defW = 0.05; const defH = defW * canvasRatio;
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
    const p = pRaw.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const bounds = getElementBounds(element, widthPx, heightPx);
    const { centerX, centerY, width, height, minX, minY, maxX, maxY } = bounds;
    ctx.save(); ctx.globalAlpha = element.opacity; ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
    ctx.strokeStyle = element.color; ctx.fillStyle = hexToRgba(element.color, 0.15); ctx.lineWidth = 3 * renderScale; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (element.lineStyle === 'dashed') ctx.setLineDash([10 * renderScale, 5 * renderScale]); else ctx.setLineDash([]);
    switch (element.type) {
      case 'text': ctx.save(); ctx.setLineDash([]); ctx.fillStyle = element.color; ctx.font = `bold ${Math.floor(height || 24)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(element.text || "TEXTO TÁCTICO", centerX, centerY); ctx.restore(); break;
      case 'freehand': if (p.length < 3) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); if (p.length === 2) ctx.lineTo(p[1].x, p[1].y); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length - 2; i++) { const xc = (p[i].x + p[i + 1].x) / 2; const yc = (p[i].y + p[i + 1].y) / 2; ctx.quadraticCurveTo(p[i].x, p[i].y, xc, yc); } ctx.quadraticCurveTo(p[p.length - 2].x, p[p.length - 2].y, p[p.length - 1].x, p[p.length - 1].y); ctx.stroke(); } break;
      case 'rect': ctx.beginPath(); ctx.rect(minX, minY, width, height); ctx.fill(); ctx.stroke(); break;
      case 'circle': ctx.beginPath(); const radius = Math.min(width, height) / 2; ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); break;
      case 'arrow': case 'double-arrow': case 'zigzag': ctx.beginPath(); if (element.controlPoint) { const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx }; ctx.moveTo(p[0].x, p[0].y); ctx.quadraticCurveTo(cp.x, cp.y, p[1].x, p[1].y); } else { ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y); } ctx.stroke(); const head = 15 * renderScale; let angle = element.controlPoint ? Math.atan2(p[1].y - (element.controlPoint.y * heightPx), p[1].x - (element.controlPoint.x * widthPx)) : Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x); ctx.setLineDash([]); const drawH = (tx: number, ty: number, ang: number) => { ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - head * Math.cos(ang - Math.PI / 6), ty - head * Math.sin(ang - Math.PI / 6)); ctx.moveTo(tx, ty); ctx.lineTo(tx - head * Math.cos(ang + Math.PI / 6), ty - head * Math.sin(ang + Math.PI / 6)); ctx.stroke(); }; drawH(p[1].x, p[1].y, angle); if (element.type === 'double-arrow') { const startAngle = element.controlPoint ? Math.atan2(p[0].y - (element.controlPoint.y * heightPx), p[0].x - (element.controlPoint.x * widthPx)) : angle + Math.PI; drawH(p[0].x, p[0].y, startAngle); } break;
      case 'cross-arrow': ctx.save(); ctx.translate(centerX, centerY); const cSize = Math.min(width, height) / 2; const thickness = cSize * 0.35; const arrowHead = cSize * 0.4; const dCB = (isV: boolean) => { ctx.beginPath(); if (isV) { ctx.moveTo(-thickness/2, -cSize + arrowHead); ctx.lineTo(thickness/2, -cSize + arrowHead); ctx.lineTo(thickness/2, cSize - arrowHead); ctx.lineTo(-thickness/2, cSize - arrowHead); } else { ctx.moveTo(-cSize + arrowHead, -thickness/2); ctx.lineTo(cSize - arrowHead, -thickness/2); ctx.lineTo(cSize - arrowHead, thickness/2); ctx.lineTo(-cSize + arrowHead, thickness/2); } ctx.closePath(); const barGrad = ctx.createLinearGradient(isV ? -thickness/2 : -cSize, isV ? -cSize : -thickness/2, isV ? thickness/2 : cSize, isV ? cSize : thickness/2); barGrad.addColorStop(0, element.color); barGrad.addColorStop(0.5, '#ffffffaa'); barGrad.addColorStop(1, hexToRgba(element.color, 0.8)); ctx.fillStyle = barGrad; ctx.fill(); ctx.stroke(); }; const dAH = (tx: number, ty: number, rot: number) => { ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-arrowHead, arrowHead); ctx.lineTo(arrowHead, arrowHead); ctx.closePath(); const headGrad = ctx.createLinearGradient(-arrowHead, 0, arrowHead, arrowHead); headGrad.addColorStop(0, element.color); headGrad.addColorStop(0.5, '#ffffffaa'); headGrad.addColorStop(1, hexToRgba(element.color, 0.8)); ctx.fillStyle = headGrad; ctx.fill(); ctx.stroke(); ctx.restore(); }; dCB(false); dCB(true); dAH(0, -cSize, 0); dAH(cSize, 0, Math.PI/2); dAH(0, cSize, Math.PI); dAH(-cSize, 0, -Math.PI/2); ctx.restore(); break;
      case 'player': ctx.save(); ctx.shadowBlur = 20 * renderScale; ctx.shadowColor = hexToRgba(element.color, 0.4); const pRadius = Math.min(width, height) / 2; ctx.beginPath(); ctx.arc(centerX, centerY, pRadius, 0, Math.PI * 2); const pGrad = ctx.createRadialGradient(centerX - pRadius/3, centerY - pRadius/3, 0, centerX, centerY, pRadius); pGrad.addColorStop(0, '#ffffff44'); pGrad.addColorStop(0.5, hexToRgba(element.color, 0.3)); pGrad.addColorStop(1, hexToRgba(element.color, 0.1)); ctx.fillStyle = pGrad; ctx.fill(); ctx.strokeStyle = element.color; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(pRadius * 0.64)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText((element.number || 1).toString(), centerX, centerY + (pRadius * 0.04)); if (teamConfig && element.number) { const playerName = teamConfig.starters[element.number - 1]; if (playerName) { ctx.setLineDash([]); ctx.font = `bold ${Math.floor(pRadius * 0.35)}px Space Grotesk`; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillText(playerName, centerX, centerY + pRadius + 12 * renderScale); } } ctx.restore(); break;
      case 'ball': ctx.save(); ctx.translate(centerX, centerY); const bRadius = Math.min(width, height) / 2; ctx.scale(bRadius/40, bRadius/40); ctx.beginPath(); ctx.arc(0, 5, 40, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill(); const bG = ctx.createRadialGradient(-15, -15, 0, 0, 0, 40); bG.addColorStop(0, '#ffffff'); bG.addColorStop(1, '#E2E8F0'); ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fillStyle = bG; ctx.fill(); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke(); ctx.beginPath(); [[50,10,35,25], [50,10,65,25], [50,90,35,75], [50,90,65,75], [10,50,25,35], [10,50,25,65], [90,50,75,35], [90,50,75,65]].forEach(pat => { ctx.moveTo(pat[0]-50, pat[1]-50); ctx.lineTo(pat[2]-50, pat[3]-50); }); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); break;
      case 'cone': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/50, height/50); ctx.beginPath(); ctx.ellipse(0, 15, 25, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 12, 20, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#ea580c'; ctx.fill(); const cGrad = ctx.createLinearGradient(-20, 0, 20, 0); cGrad.addColorStop(0, '#ea580c'); cGrad.addColorStop(0.5, '#fb923c'); cGrad.addColorStop(1, '#9a3412'); ctx.beginPath(); ctx.moveTo(-15, 12); ctx.lineTo(15, 12); ctx.lineTo(2, -30); ctx.lineTo(-2, -30); ctx.closePath(); ctx.fillStyle = cGrad; ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -5, 16, 6); ctx.fillRect(-4, -20, 8, 4); ctx.restore(); break;
      case 'seta': ctx.save(); ctx.translate(centerX, centerY); const sSize = Math.min(width, height); ctx.scale(sSize/44, sSize/20); ctx.beginPath(); ctx.ellipse(0, 5, 22, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2); const sG = ctx.createRadialGradient(0, -5, 0, 0, 0, 22); sG.addColorStop(0, '#ffffff'); sG.addColorStop(0.3, element.color); sG.addColorStop(1, hexToRgba(element.color, 0.8)); ctx.fillStyle = sG; ctx.fill(); ctx.restore(); break;
      case 'ladder': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/200, height/50); ctx.strokeStyle = '#334155'; ctx.lineWidth = 5 * renderScale; ctx.strokeRect(-100, -25, 200, 50); ctx.lineWidth = 3 * renderScale; ctx.strokeStyle = element.color; for(let x=-100; x<=100; x+=40) { ctx.beginPath(); ctx.moveTo(x, -25); ctx.lineTo(x, 25); ctx.stroke(); } ctx.restore(); break;
      case 'hurdle': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/60, height/30); ctx.strokeStyle = element.color; ctx.lineWidth = 6 * renderScale; ctx.beginPath(); ctx.moveTo(-30, 15); ctx.lineTo(-30, -15); ctx.lineTo(30, -15); ctx.lineTo(30, 15); ctx.stroke(); ctx.restore(); break;
      case 'minigoal': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/100, height/60); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-50, -30, 100, 60); ctx.setLineDash([3 * renderScale, 3 * renderScale]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1 * renderScale; for(let i=-50; i<50; i+=10) { ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 30); ctx.stroke(); } for(let j=-30; j<30; j+=10) { ctx.beginPath(); ctx.moveTo(-50, j); ctx.lineTo(50, j); ctx.stroke(); } ctx.setLineDash([]); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 5 * renderScale; ctx.strokeRect(-50, -30, 100, 60); ctx.restore(); break;
      case 'pica': ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/36, height/80); ctx.beginPath(); ctx.arc(0, 30, 18, 0, Math.PI * 2); ctx.fillStyle = '#334155'; ctx.fill(); ctx.fillStyle = element.color; ctx.fillRect(-4, -40, 8, 70); ctx.restore(); break;
      case 'barrier': ctx.save(); ctx.translate(centerX, centerY); const bw = width / 3; for (let i = -1; i <= 1; i++) { ctx.save(); ctx.translate(i * bw * 0.8, 0); ctx.beginPath(); ctx.ellipse(0, 0, bw/2, height/2, 0, 0, Math.PI * 2); const bGrad = ctx.createLinearGradient(-bw/2, 0, bw/2, 0); bGrad.addColorStop(0, hexToRgba(element.color, 0.8)); bGrad.addColorStop(0.5, element.color); bGrad.addColorStop(1, hexToRgba(element.color, 0.6)); ctx.fillStyle = bGrad; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1 * renderScale; ctx.stroke(); ctx.restore(); } ctx.restore(); break;
    }
    if (isSelected) {
      ctx.restore(); ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
      ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2 * renderScale; ctx.setLineDash([6 * renderScale, 4 * renderScale]); const pad = 12 * renderScale; 
      ctx.strokeRect(minX - pad, minY - pad, width + pad * 2, height + pad * 2);
      ctx.setLineDash([]); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.5 * renderScale;
      const handles = [{ x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad }, { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY }, { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }];
      handles.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, 8 * renderScale, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      const rotY = minY - pad - 45 * renderScale; ctx.beginPath(); ctx.moveTo(centerX, minY - pad); ctx.lineTo(centerX, rotY); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(centerX, rotY, 10 * renderScale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (element.controlPoint && ['arrow', 'double-arrow', 'zigzag'].includes(element.type)) { const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx }; ctx.restore(); ctx.save(); ctx.setLineDash([4 * renderScale, 4 * renderScale]); ctx.strokeStyle = '#3b82f6aa'; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(cp.x, cp.y); ctx.stroke(); ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cp.x, cp.y, 10 * renderScale, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * renderScale; ctx.stroke(); }
    } ctx.restore();
  }, [hexToRgba, teamConfig, renderScale]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sorted = [...elements].sort((a, b) => {
      if (a.type === 'text' && b.type !== 'text') return 1; if (a.type !== 'text' && b.type === 'text') return -1;
      const aMat = isMaterial(a.type); const bMat = isMaterial(b.type); if (aMat && !bMat) return 1; if (!aMat && bMat) return -1; return 0;
    });
    sorted.forEach(el => drawElement(ctx, el, selectedIds.includes(el.id)));
  }, [elements, selectedIds, drawElement]);

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
    const canvasRatio = canvasRef.current ? (canvasRef.current.width / canvasRef.current.height) : 1.5;
    const defW = tool === 'ladder' ? 0.15 : (tool === 'minigoal' || tool === 'cross-arrow' ? 0.1 : tool === 'barrier' ? 0.12 : tool === 'text' ? 0.3 : 0.05);
    const defH = isCircular(tool) ? (defW * canvasRatio) : (tool === 'ladder' ? 0.05 : (tool === 'minigoal' || tool === 'cross-arrow' ? 0.08 : tool === 'barrier' ? 0.12 : 0.05));
    const newEl: DrawingElement = { id: `el-${Date.now()}`, type: tool, points: [{ x: 0.5 - defW/2, y: 0.5 - defH/2 }, { x: 0.5 + defW/2, y: 0.5 + defH/2 }], controlPoint: ['arrow', 'double-arrow', 'zigzag'].includes(tool) ? { x: 0.5, y: 0.45 } : undefined, color: currentColor, rotation: 0, lineStyle: 'solid' as const, number: pNum, opacity: 1.0, text: tool === 'text' ? "CONSIGNA TÁCTICA" : undefined };
    setElements(prev => [...prev, newEl]); setSelectedIds([newEl.id]); setActiveTool('select');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    startPoint.current = point; lastPoint.current = point; isDrawing.current = true; const wPx = rect.width; const hPx = rect.height;
    if (selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const bounds = getElementBounds(el, wPx, hPx);
        if (el.controlPoint) { const cpPx = { x: el.controlPoint.x * wPx, y: el.controlPoint.y * hPx }; if (Math.sqrt(Math.pow(point.x * wPx - cpPx.x, 2) + Math.pow(point.y * hPx - cpPx.y, 2)) < 25) { interactionMode.current = 'curving'; return; } }
        const rotHandlePx = rotatePoint({ x: bounds.centerX, y: bounds.minY - 45 * renderScale }, { x: bounds.centerX, y: bounds.centerY }, el.rotation);
        if (Math.sqrt(Math.pow(point.x * wPx - rotHandlePx.x, 2) + Math.pow(point.y * hPx - rotHandlePx.y, 2)) < 25) { interactionMode.current = 'rotating'; return; }
        const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
        const pad = 12 * renderScale; const handles = [{ x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad }, { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY }, { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }];
        const hIdx = handles.findIndex(h => Math.sqrt(Math.pow(local.x - h.x, 2) + Math.pow(local.y - h.y, 2)) < 20);
        if (hIdx !== -1) { interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return; }
      }
    }
    const clicked = [...elements].reverse().find(el => { const b = getElementBounds(el, wPx, hPx); const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: b.centerX, y: b.centerY }, -el.rotation); const hitPadding = el.type === 'text' ? 25 : 15; return local.x >= b.minX - hitPadding && local.x <= b.maxX + hitPadding && local.y >= b.minY - hitPadding && local.y <= b.maxY + hitPadding; });
    if (clicked) { if (e.shiftKey) setSelectedIds(prev => prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]); else setSelectedIds([clicked.id]); setActiveTool('select'); interactionMode.current = 'dragging'; } else setSelectedIds([]); redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }; const wPx = rect.width; const hPx = rect.height;
    if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => { if (el.id !== selectedIds[0]) return el; const bounds = getElementBounds(el, wPx, hPx); const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation); const next = [...el.points]; const h = activeHandleIndex.current!; if (isCircular(el.type)) { const dxPx = Math.abs(local.x - bounds.centerX) * 2; const dyPx = dxPx; next[0] = { x: (bounds.centerX - dxPx/2) / wPx, y: (bounds.centerY - dyPx/2) / hPx }; next[1] = { x: (bounds.centerX + dxPx/2) / wPx, y: (bounds.centerY + dyPx/2) / hPx }; } else if (isMaterial(el.type)) { const ratio = bounds.width / bounds.height; const dx = Math.abs(local.x - bounds.centerX) * 2; const dy = dx / ratio; next[0] = { x: (bounds.centerX - dx/2) / wPx, y: (bounds.centerY - dy/2) / hPx }; next[1] = { x: (bounds.centerX + dx/2) / wPx, y: (bounds.centerY + dy/2) / hPx }; } else { const p0Px = { x: next[0].x * wPx, y: next[0].y * hPx }; const p1Px = { x: next[1].x * wPx, y: next[1].y * hPx }; if ([0, 3, 5].includes(h)) p0Px.x = local.x; if ([2, 4, 7].includes(h)) p1Px.x = local.x; if ([0, 1, 2].includes(h)) p0Px.y = local.y; if ([5, 6, 7].includes(h)) p1Px.y = local.y; next[0] = { x: p0Px.x / wPx, y: p0Px.y / hPx }; next[1] = { x: p1Px.x / wPx, y: p1Px.y / hPx }; } return { ...el, points: next }; }));
    } else if (interactionMode.current === 'curving' && selectedIds.length === 1) setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, controlPoint: point } : el));
    else if (interactionMode.current === 'rotating' && selectedIds.length === 1) { const el = elements.find(e => e.id === selectedIds[0]); if (el) { const b = getElementBounds(el, wPx, hPx); const angle = Math.atan2(point.y * hPx - b.centerY, point.x * wPx - b.centerX) + Math.PI / 2; setElements(prev => prev.map(e => e.id === selectedIds[0] ? { ...e, rotation: angle } : e)); } } 
    else if (interactionMode.current === 'dragging' && selectedIds.length > 0 && lastPoint.current) { const dx = point.x - lastPoint.current.x; const dy = point.y - lastPoint.current.y; setElements(prev => prev.map(el => { if (!selectedIds.includes(el.id)) return el; const next = { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }; if (el.controlPoint) next.controlPoint = { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy }; return next; })); lastPoint.current = point; } 
    redrawAll();
  };

  const handlePointerUp = () => { isDrawing.current = false; interactionMode.current = 'none'; activeHandleIndex.current = null; };

  const handleSaveToBlock = (block: string) => {
    if (!saveFormData.title) { toast({ variant: "destructive", title: "ERROR", description: "Asigne un título antes de guardar." }); return; }
    const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
    const newExercise = { id: Date.now(), block, elements, fieldType, metadata: saveFormData };
    vault.exercises = [newExercise, ...(vault.exercises || [])];
    localStorage.setItem("synq_promo_vault", JSON.stringify(vault));
    setVault(vault);
    toast({ title: "SINCRO_LOCAL", description: `Ejercicio blindado en slot ${block.toUpperCase()}.` });
    setIsSaveSheetOpen(false);
  };

  const loadExercise = (ex: any) => {
    setElements(ex.elements || []);
    setFieldType(ex.fieldType || "f11");
    setSaveFormData(ex.metadata || saveFormData);
    toast({ title: "EJERCICIO_CARGADO", description: `Sincronizando: ${ex.metadata?.title || 'SIN_TITULO'}` });
  };

  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;

  return (
    <div className={cn("h-full w-full flex flex-col bg-black overflow-hidden relative touch-none select-none", isLegacyDevice && "perf-lite")}>
      {showAds && isHalfField && (
        <>
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-[100] animate-in slide-in-from-left-4 duration-1000 hidden xl:block"><AdSlot orientation="vertical" /></div>
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[100] animate-in slide-in-from-right-4 duration-1000 hidden xl:block"><AdSlot orientation="vertical" /></div>
        </>
      )}

      {/* ICONOS FLOTANTES LATERALES - PROTOCOLO_TABLET_SIDE_ACCESS */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-4 pointer-events-none">
        {/* MI EQUIPO */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-14 w-14 rounded-2xl bg-black/60 backdrop-blur-2xl border border-primary/20 text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto group glass-panel">
              <Users className="h-6 w-6 group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-[8px] font-black text-black">11</span>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#04070c]/98 backdrop-blur-3xl border-r border-primary/20 text-white w-full sm:max-w-md shadow-[20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
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
              <Button variant="outline" onClick={loadTeamFromSandbox} className="w-full h-14 border-primary/20 bg-primary/5 text-primary font-black uppercase text-[10px] rounded-2xl hover:bg-primary hover:text-black transition-all mb-6">
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
                  <Button variant="link" className="text-primary text-[10px] font-black uppercase p-0" asChild><Link href="/dashboard/promo/team">Configurar Ahora</Link></Button>
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

        {/* MATERIAL TÉCNICO */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-14 w-14 rounded-2xl bg-black/60 backdrop-blur-2xl border border-primary/20 text-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto group glass-panel">
              <Boxes className="h-6 w-6 group-hover:animate-pulse" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-[#04070c]/98 backdrop-blur-3xl border-r border-primary/20 text-white w-full sm:max-w-xs shadow-[20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
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
              <div className="pointer-events-auto">
                <BoardToolbar theme="cyan" variant="materials" orientation="vertical" activeTool={activeTool} onToolSelect={(t) => { addElementAtCenter(t); setSelectedIds([]); }} className="border-none bg-transparent shadow-none w-full" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-4 pointer-events-none">
        {/* MIS TAREAS */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-14 w-14 rounded-2xl bg-black/60 backdrop-blur-2xl border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto group glass-panel">
              <Library className="h-6 w-6 group-hover:animate-pulse" />
              <div className="absolute -top-1 -left-1 h-4 w-4 bg-amber-500 rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-[8px] font-black text-black">{vault.exercises?.length || 0}</span>
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
            <div className="p-8 border-b border-white/5 bg-black/40">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Vault_Registry_v1.0</span>
                </div>
                <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter">MIS <span className="text-amber-500">TAREAS</span></SheetTitle>
              </SheetHeader>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
              {vault.exercises && vault.exercises.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {vault.exercises.map((ex: any) => (
                    <div 
                      key={ex.id} 
                      onClick={() => loadExercise(ex)}
                      className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-amber-500/40 hover:bg-amber-500/5 cursor-pointer transition-all relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[7px] border-amber-500/20 text-amber-500 font-black px-2">{ex.block?.toUpperCase() || 'SANDBOX'}</Badge>
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{ex.fieldType?.toUpperCase() || 'F11'}</span>
                      </div>
                      <h4 className="text-sm font-black text-white uppercase italic group-hover:amber-text-glow transition-all">{ex.metadata?.title || `Tarea_${ex.id.toString().slice(-4)}`}</h4>
                      <p className="text-[9px] font-bold text-white/30 uppercase mt-1 line-clamp-1">{ex.metadata?.objective || 'Sin objetivo definido'}</p>
                      <div className="absolute inset-0 bg-amber-500/5 scan-line opacity-0 group-hover:opacity-20 pointer-events-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center space-y-4 border-2 border-dashed border-white/5 rounded-3xl opacity-40">
                  <Zap className="h-10 w-10 mx-auto text-white/20" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Almacén Sandbox vacío</p>
                  <p className="text-[8px] text-white/40 uppercase italic">Guarda tu primer ejercicio para visualizarlo aquí.</p>
                </div>
              )}
            </div>
            <div className="p-8 bg-black/60 border-t border-white/5 flex flex-col gap-4">
              <Button className="w-full h-14 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]" asChild><Link href="/dashboard/promo/tasks">Gestionar Biblioteca</Link></Button>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full h-12 text-amber-500/40 font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-amber-500/5 transition-all">CERRAR</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        {/* HERRAMIENTAS DE DIBUJO */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="h-14 w-14 rounded-2xl bg-black/60 backdrop-blur-2xl border border-amber-500/20 text-amber-500 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto group glass-panel">
              <Pencil className="h-6 w-6 group-hover:animate-pulse" />
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
              <div className="pointer-events-auto">
                <BoardToolbar theme="cyan" variant="training" orientation="vertical" activeTool={activeTool} onToolSelect={(t) => { if(t === 'select') { setActiveTool('select'); setSelectedIds([]); } else addElementAtCenter(t); }} onClear={() => { setElements([]); setSelectedIds([]); }} className="border-none bg-transparent shadow-none w-full" />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* HEADER TÁCTICO FLOTANTE COMPACTO */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-4 w-full max-w-4xl">
        <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-2xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 pr-3 border-r border-white/10 shrink-0">
            <button onClick={toggleFullscreen} className="h-8 w-8 flex items-center justify-center text-primary/40 hover:text-primary transition-all active:scale-90" title={isFullscreen ? "Minimizar" : "Pantalla Completa"}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
            <div className="flex flex-col"><div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary animate-pulse" /><span className="text-[7px] font-black text-primary tracking-widest uppercase italic">Promo_Mode</span></div><h1 className="text-[10px] font-headline font-black text-white italic uppercase leading-none">{exerciseId ? 'Edición' : 'Sandbox'}</h1></div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}><SelectTrigger className="w-[100px] h-8 bg-white/5 border-primary/20 rounded-lg text-[7px] font-black uppercase text-primary focus:ring-0 px-2"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="f11" className="text-[8px] font-black">F11</SelectItem><SelectItem value="f7" className="text-[8px] font-black">F7</SelectItem><SelectItem value="futsal" className="text-[8px] font-black">FUTSAL</SelectItem></SelectContent></Select>
            <button onClick={() => setIsHalfField(!isHalfField)} className={cn("h-8 px-2 border border-primary/20 text-[7px] font-black uppercase rounded-lg transition-all", isHalfField ? "bg-primary text-black" : "text-primary/40")}><Square className="h-3 w-3 mr-1" /> {isHalfField ? 'Campo Total' : 'Medio Campo'}</button>
            <Button variant="ghost" onClick={() => setShowLanes(!showLanes)} className={cn("h-8 px-2 border border-primary/20 text-[7px] font-black uppercase rounded-lg", showLanes ? "bg-primary text-black" : "text-primary/40")}><Columns3 className="h-3 w-3 mr-1" /> Carriles</Button>
          </div>
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
          <Button onClick={() => setIsSaveSheetOpen(true)} className="h-8 bg-primary text-black font-black uppercase text-[7px] tracking-widest px-4 rounded-lg blue-glow border-none"><Save className="h-3 w-3 mr-1.5" /> GUARDAR</Button>
        </div>
        {showAds && !isHalfField && ( <div className="animate-in fade-in duration-1000 hidden md:block"><AdSlot orientation="horizontal" /></div> )}
      </header>

      {/* BOTÓN DE RETORNO AL DASHBOARD */}
      <div className="fixed top-6 left-6 z-[200] lg:block hidden">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-12 w-12 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/10 text-white/40 hover:text-primary transition-all shadow-xl">
          <LayoutDashboard className="h-5 w-5" />
        </Button>
      </div>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden touch-none">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes} isHalfField={isHalfField}>
          <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} />
        </TacticalField>
      </main>

      {/* FICHA TÉCNICA DE GUARDADO */}
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
