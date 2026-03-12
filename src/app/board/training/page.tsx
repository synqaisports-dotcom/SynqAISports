
"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { 
  Sparkles, 
  Save, 
  LayoutGrid, 
  Trash2, 
  MousePointer2, 
  Copy, 
  Pencil,
  Plus,
  Columns3,
  Layers,
  Activity,
  Circle,
  Flag,
  UserCircle,
  X,
  Type,
  Maximize2,
  ChevronDown,
  Move,
  Upload,
  PencilLine,
  Palette,
  Undo2,
  Redo2,
  Video,
  ArrowUpRight,
  MousePointerClick,
  ClipboardList,
  Target,
  Clock,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar, DrawingTool } from "@/components/board/BoardToolbar";
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
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Point {
  x: number; // 0.0 to 1.0 (Normalized)
  y: number; // 0.0 to 1.0 (Normalized)
}

interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  controlPoint?: Point; // Para curvatura de flechas/zigzag
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

function TrainingBoardContent() {
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [elements, setElements] = useState<DrawingElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'curving' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  // Formulario de Ficha Técnica
  const [saveFormData, setSaveFormData] = useState({
    title: "",
    stage: "Alevín",
    dimension: "Táctica",
    objective: "",
    description: ""
  });

  const isFromForm = searchParams.get("source") === "form";

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const rotatePoint = (point: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos
    };
  };

  const getElementBounds = (element: DrawingElement, widthPx: number, heightPx: number) => {
    const p = element.points.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const minX = Math.min(...p.map(pt => pt.x));
    const minY = Math.min(...p.map(pt => pt.y));
    const maxX = Math.max(...p.map(pt => pt.x));
    const maxY = Math.max(...p.map(pt => pt.y));
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  };

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const pRaw = element.points;
    if (pRaw.length < 1) return;

    const widthPx = ctx.canvas.width;
    const heightPx = ctx.canvas.height;
    
    const p = pRaw.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const bounds = getElementBounds(element, widthPx, heightPx);
    const { centerX, centerY, width, height, minX, minY, maxX, maxY } = bounds;

    ctx.save();
    ctx.globalAlpha = element.opacity;
    ctx.translate(centerX, centerY);
    ctx.rotate(element.rotation);
    ctx.translate(-centerX, -centerY);

    ctx.strokeStyle = element.color;
    ctx.fillStyle = hexToRgba(element.color, 0.15);
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    if (element.lineStyle === 'dashed') {
      ctx.setLineDash([10, 5]);
    } else {
      ctx.setLineDash([]);
    }

    switch (element.type) {
      case 'text':
        ctx.save();
        ctx.setLineDash([]);
        ctx.fillStyle = element.color;
        ctx.font = `bold ${Math.floor(height || 24)}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.text || "TEXTO TÁCTICO", centerX, centerY);
        ctx.restore();
        break;
      case 'freehand':
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
        ctx.stroke();
        break;
      case 'rect':
        ctx.beginPath();
        ctx.rect(minX, minY, width, height);
        ctx.fill();
        ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath();
        const rx = width / 2;
        const ry = height / 2;
        ctx.ellipse(centerX, centerY, rx, ry, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'arrow':
      case 'double-arrow':
      case 'zigzag':
        ctx.beginPath();
        if (element.controlPoint) {
          const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          ctx.moveTo(p[0].x, p[0].y);
          ctx.quadraticCurveTo(cp.x, cp.y, p[1].x, p[1].y);
        } else {
          ctx.moveTo(p[0].x, p[0].y);
          ctx.lineTo(p[1].x, p[1].y);
        }
        ctx.stroke();

        const head = 15;
        let angle;
        if (element.controlPoint) {
          const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          angle = Math.atan2(p[1].y - cp.y, p[1].x - cp.x);
        } else {
          angle = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        }
        
        ctx.setLineDash([]);
        const drawH = (tx: number, ty: number, ang: number) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang - Math.PI / 6), ty - head * Math.sin(ang - Math.PI / 6));
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang + Math.PI / 6), ty - head * Math.sin(ang + Math.PI / 6));
          ctx.stroke();
        };
        drawH(p[1].x, p[1].y, angle);
        if (element.type === 'double-arrow') {
          const startAngle = element.controlPoint 
            ? Math.atan2(p[0].y - (element.controlPoint.y * heightPx), p[0].x - (element.controlPoint.x * widthPx))
            : angle + Math.PI;
          drawH(p[0].x, p[0].y, startAngle);
        }
        break;
      case 'cross-arrow':
        ctx.save();
        ctx.translate(centerX, centerY);
        const cSize = Math.min(width, height) / 2;
        const thickness = cSize * 0.35;
        const arrowHead = cSize * 0.4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        const drawCrossBar = (isVert: boolean) => {
          ctx.beginPath();
          if (isVert) {
            ctx.moveTo(-thickness/2, -cSize + arrowHead); ctx.lineTo(thickness/2, -cSize + arrowHead);
            ctx.lineTo(thickness/2, cSize - arrowHead); ctx.lineTo(-thickness/2, cSize - arrowHead);
          } else {
            ctx.moveTo(-cSize + arrowHead, -thickness/2); ctx.lineTo(cSize - arrowHead, -thickness/2);
            ctx.lineTo(cSize - arrowHead, thickness/2); ctx.lineTo(-cSize + arrowHead, thickness/2);
          }
          ctx.closePath();
          const barGrad = ctx.createLinearGradient(isVert ? -thickness/2 : -cSize, isVert ? -cSize : -thickness/2, isVert ? thickness/2 : cSize, isVert ? cSize : thickness/2);
          barGrad.addColorStop(0, element.color); barGrad.addColorStop(0.5, '#ffffffaa'); barGrad.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = barGrad; ctx.fill(); ctx.stroke();
        };
        const drawArrowHead = (tx: number, ty: number, rot: number) => {
          ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot); ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(-arrowHead, arrowHead); ctx.lineTo(arrowHead, arrowHead); ctx.closePath();
          const headGrad = ctx.createLinearGradient(-arrowHead, 0, arrowHead, arrowHead);
          headGrad.addColorStop(0, element.color); headGrad.addColorStop(0.5, '#ffffffaa'); headGrad.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = headGrad; ctx.fill(); ctx.stroke(); ctx.restore();
        };
        drawCrossBar(false); drawCrossBar(true);
        drawArrowHead(0, -cSize, 0); drawArrowHead(cSize, 0, Math.PI/2);
        drawArrowHead(0, cSize, Math.PI); drawArrowHead(-cSize, 0, -Math.PI/2);
        ctx.restore();
        break;
      case 'player':
        ctx.save();
        ctx.shadowBlur = 20; ctx.shadowColor = hexToRgba(element.color, 0.4);
        ctx.beginPath(); ctx.ellipse(centerX, centerY, width/2, height/2, 0, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(centerX - width/6, centerY - height/6, 0, centerX, centerY, width/2);
        pGrad.addColorStop(0, '#ffffff44'); pGrad.addColorStop(0.5, hexToRgba(element.color, 0.3)); pGrad.addColorStop(1, hexToRgba(element.color, 0.1));
        ctx.fillStyle = pGrad; ctx.fill(); ctx.strokeStyle = element.color; ctx.stroke();
        ctx.fillStyle = '#fff'; 
        ctx.font = `bold ${Math.floor(height * 0.32)}px Space Grotesk`; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle';
        ctx.fillText((element.number || 1).toString(), centerX, centerY + (height * 0.02));
        ctx.restore();
        break;
      case 'barrier':
        ctx.save();
        ctx.translate(centerX, centerY);
        const bw = width / 3;
        for (let i = -1; i <= 1; i++) {
          ctx.save();
          ctx.translate(i * bw * 0.8, 0);
          ctx.beginPath(); ctx.ellipse(0, 0, bw/2, height/2, 0, 0, Math.PI * 2);
          const bGrad = ctx.createLinearGradient(-bw/2, 0, bw/2, 0);
          bGrad.addColorStop(0, hexToRgba(element.color, 0.8)); bGrad.addColorStop(0.5, element.color); bGrad.addColorStop(1, hexToRgba(element.color, 0.6));
          ctx.fillStyle = bGrad; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
        break;
      case 'ball':
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(width/80, height/80);
        ctx.beginPath(); ctx.arc(0, 5, 40, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
        const bG = ctx.createRadialGradient(-15, -15, 0, 0, 0, 40);
        bG.addColorStop(0, '#ffffff'); bG.addColorStop(1, '#E2E8F0');
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fillStyle = bG; ctx.fill();
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        [[50,10,35,25], [50,10,65,25], [50,90,35,75], [50,90,65,75], [10,50,25,35], [10,50,25,65], [90,50,75,35], [90,50,75,65]].forEach(pat => { ctx.moveTo(pat[0]-50, pat[1]-50); ctx.lineTo(pat[2]-50, pat[3]-50); });
        ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        break;
      case 'cone':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/50, height/50);
        ctx.beginPath(); ctx.ellipse(0, 15, 25, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 12, 20, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#ea580c'; ctx.fill();
        const cGrad = ctx.createLinearGradient(-20, 0, 20, 0);
        cGrad.addColorStop(0, '#ea580c'); cGrad.addColorStop(0.5, '#fb923c'); cGrad.addColorStop(1, '#9a3412');
        ctx.beginPath(); ctx.moveTo(-15, 12); ctx.lineTo(15, 12); ctx.lineTo(2, -30); ctx.lineTo(-2, -30); ctx.closePath();
        ctx.fillStyle = cGrad; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -5, 16, 6); ctx.fillRect(-4, -20, 8, 4);
        ctx.restore();
        break;
      case 'seta':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/44, height/20);
        ctx.beginPath(); ctx.ellipse(0, 5, 22, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
        const sG = ctx.createRadialGradient(0, -5, 0, 0, 0, 22);
        sG.addColorStop(0, '#ffffff'); sG.addColorStop(0.3, element.color); sG.addColorStop(1, hexToRgba(element.color, 0.8));
        ctx.fillStyle = sG; ctx.fill(); ctx.restore();
        break;
      case 'ladder':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/200, height/50);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 5; ctx.strokeRect(-100, -25, 200, 50);
        ctx.lineWidth = 3; ctx.strokeStyle = element.color;
        for(let x=-100; x<=100; x+=40) { ctx.beginPath(); ctx.moveTo(x, -25); ctx.lineTo(x, 25); ctx.stroke(); }
        ctx.restore();
        break;
      case 'hurdle':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/60, height/30);
        ctx.strokeStyle = element.color; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(-30, 15); ctx.lineTo(-30, -15); ctx.lineTo(30, -15); ctx.lineTo(30, 15); ctx.stroke();
        ctx.restore();
        break;
      case 'minigoal':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/100, height/60);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-50, -30, 100, 60);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for(let i=-50; i<50; i+=10) { ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 30); ctx.stroke(); }
        for(let j=-30; j<30; j+=10) { ctx.beginPath(); ctx.moveTo(-50, j); ctx.lineTo(50, j); ctx.stroke(); }
        ctx.setLineDash([]); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 5; ctx.strokeRect(-50, -30, 100, 60);
        ctx.restore();
        break;
      case 'pica':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/36, height/80);
        ctx.beginPath(); ctx.arc(0, 30, 18, 0, Math.PI * 2); ctx.fillStyle = '#334155'; ctx.fill();
        ctx.fillStyle = element.color; ctx.fillRect(-4, -40, 8, 70);
        ctx.restore();
        break;
    }

    if (isSelected) {
      ctx.restore(); ctx.save();
      ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
      ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      const pad = 10;
      ctx.strokeRect(minX - pad, minY - pad, width + pad * 2, height + pad * 2);
      ctx.setLineDash([]); ctx.fillStyle = '#ffffff';
      const handles = [
        { x: minX - pad, y: minY - pad }, { x: centerX, y: minY - pad }, { x: maxX + pad, y: minY - pad },
        { x: minX - pad, y: centerY }, { x: maxX + pad, y: centerY },
        { x: minX - pad, y: maxY + pad }, { x: centerX, y: maxY + pad }, { x: maxX + pad, y: maxY + pad },
      ];
      handles.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      
      const rotY = minY - pad - 40;
      ctx.beginPath(); ctx.moveTo(centerX, minY - pad); ctx.lineTo(centerX, rotY); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(centerX, rotY, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();

      if (element.controlPoint && ['arrow', 'double-arrow', 'zigzag'].includes(element.type)) {
        const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
        ctx.restore(); ctx.save();
        ctx.setLineDash([4, 4]); ctx.strokeStyle = '#3b82f6aa';
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(cp.x, cp.y); ctx.stroke();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cp.x, cp.y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    ctx.restore();
  }, [hexToRgba]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const sortedElements = [...elements].sort((a, b) => {
      const aMat = isMaterial(a.type);
      const bMat = isMaterial(b.type);
      if (aMat && !bMat) return 1; 
      if (!aMat && bMat) return -1;
      return 0;
    });

    sortedElements.forEach(el => drawElement(ctx, el, selectedIds.includes(el.id)));
  }, [elements, selectedIds, drawElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        redrawAll();
      }
    });
    observer.observe(canvas.parentElement!);
    return () => observer.disconnect();
  }, [redrawAll]);

  useEffect(() => {
    redrawAll();
  }, [elements, selectedIds, fieldType, showLanes, redrawAll]);

  const addElementAtCenter = (tool: DrawingTool) => {
    const pNum = tool === 'player' ? elements.filter(e => e.type === 'player').length + 1 : undefined;
    
    const isMat = isMaterial(tool);
    const defW = tool === 'ladder' ? 0.15 : (tool === 'minigoal' || tool === 'cross-arrow' ? 0.1 : tool === 'barrier' ? 0.12 : 0.05);
    const defH = tool === 'ladder' ? 0.05 : (tool === 'minigoal' || tool === 'cross-arrow' ? 0.08 : tool === 'barrier' ? 0.12 : 0.05);
    
    const newElement: DrawingElement = { 
      id: `el-${Date.now()}`, 
      type: tool, 
      points: [{ x: 0.5 - defW/2, y: 0.5 - defH/2 }, { x: 0.5 + defW/2, y: 0.5 + defH/2 }],
      controlPoint: ['arrow', 'double-arrow', 'zigzag'].includes(tool) ? { x: 0.5, y: 0.45 } : undefined,
      color: currentColor, 
      rotation: 0, 
      lineStyle: 'solid', 
      number: pNum,
      opacity: 1.0,
      text: tool === 'text' ? "TEXTO TÁCTICO" : undefined
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedIds([newElement.id]);
    setActiveTool('select');

    if (tool === 'text') {
      setTimeout(() => {
        const val = window.prompt("INTRODUZCA TEXTO TÁCTICO:", "TEXTO TÁCTICO");
        if (val) {
          setElements(prev => prev.map(el => el.id === newElement.id ? { ...el, text: val.toUpperCase() } : el));
        }
      }, 100);
    }
  };

  const handleEditText = useCallback(() => {
    const elId = selectedIds[0];
    const el = elements.find(e => e.id === elId);
    if (el && el.type === 'text') {
      const val = window.prompt("EDITAR TEXTO TÁCTICO:", el.text);
      if (val !== null) {
        setElements(prev => prev.map(e => e.id === elId ? { ...e, text: val.toUpperCase() } : e));
      }
    }
  }, [elements, selectedIds]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { 
      x: (e.clientX - rect.left) / rect.width, 
      y: (e.clientY - rect.top) / rect.height 
    };
    startPoint.current = point; lastPoint.current = point; isDrawing.current = true;

    const widthPx = rect.width;
    const heightPx = rect.height;

    if (selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const bounds = getElementBounds(el, widthPx, heightPx);
        const { centerX, centerY, minX, minY } = bounds;
        const pad = 10;
        
        if (el.controlPoint) {
          const cpPx = { x: el.controlPoint.x * widthPx, y: el.controlPoint.y * heightPx };
          const distToCP = Math.sqrt(Math.pow(point.x * widthPx - cpPx.x, 2) + Math.pow(point.y * heightPx - cpPx.y, 2));
          if (distToCP < 20) {
            interactionMode.current = 'curving'; return;
          }
        }

        const localPoint = rotatePoint(
          { x: point.x * widthPx, y: point.y * heightPx }, 
          { x: centerX, y: centerY }, 
          -el.rotation
        );
        
        const rotHandlePx = rotatePoint({ x: centerX, y: minY - pad - 40 }, { x: centerX, y: centerY }, el.rotation);
        const distToRot = Math.sqrt(Math.pow(point.x * widthPx - rotHandlePx.x, 2) + Math.pow(point.y * heightPx - rotHandlePx.y, 2));
        
        if (distToRot < 20) {
          interactionMode.current = 'rotating'; return;
        }

        const handles = [
          { x: minX - pad, y: minY - pad }, { x: centerX, y: minY - pad }, { x: bounds.maxX + pad, y: minY - pad },
          { x: minX - pad, y: centerY }, { x: bounds.maxX + pad, y: centerY },
          { x: minX - pad, y: bounds.maxY + pad }, { x: centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad },
        ];
        const hIdx = handles.findIndex(h => Math.sqrt(Math.pow(localPoint.x - h.x, 2) + Math.pow(localPoint.y - h.y, 2)) < 15);
        if (hIdx !== -1) {
          interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return;
        }
      }
    }

    const clicked = [...elements].reverse().find(el => {
      const bounds = getElementBounds(el, widthPx, heightPx);
      const local = rotatePoint({ x: point.x * widthPx, y: point.y * heightPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
      return local.x >= bounds.minX - 10 && local.x <= bounds.maxX + 10 && local.y >= bounds.minY - 10 && local.y <= bounds.maxY + 10;
    });

    if (clicked) {
      const isAlreadySelected = selectedIds.includes(clicked.id);
      if (e.shiftKey) {
        setSelectedIds(prev => prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]);
      } else if (!isAlreadySelected) {
        setSelectedIds([clicked.id]);
      }
      
      // PROTOCOLO_EDICION_DIRECTA: Si es texto y ya está seleccionado, permitir edición por pulsación
      if (clicked.type === 'text' && isAlreadySelected && !e.shiftKey) {
        setTimeout(() => {
          const val = window.prompt("EDITAR TEXTO TÁCTICO:", clicked.text);
          if (val !== null) {
            setElements(prev => prev.map(e => e.id === clicked.id ? { ...e, text: val.toUpperCase() } : e));
          }
        }, 100);
      }

      setActiveTool('select'); 
      interactionMode.current = 'dragging';
    } else {
      setSelectedIds([]);
    }
    redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { 
      x: (e.clientX - rect.left) / rect.width, 
      y: (e.clientY - rect.top) / rect.height 
    };
    const widthPx = rect.width;
    const heightPx = rect.height;

    if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedIds[0]) return el;
        const bounds = getElementBounds(el, widthPx, heightPx);
        const localPoint = rotatePoint({ x: point.x * widthPx, y: point.y * heightPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
        const next = [...el.points];
        const h = activeHandleIndex.current!;
        
        if (isMaterial(el.type)) {
          const ratio = bounds.width / bounds.height;
          const dx = Math.abs(localPoint.x - bounds.centerX) * 2;
          const dy = dx / ratio;
          next[0] = { x: (bounds.centerX - dx/2) / widthPx, y: (bounds.centerY - dy/2) / heightPx };
          next[1] = { x: (bounds.centerX + dx/2) / widthPx, y: (bounds.centerY + dy/2) / heightPx };
        } else {
          const p0Px = { x: next[0].x * widthPx, y: next[0].y * heightPx };
          const p1Px = { x: next[1].x * widthPx, y: next[1].y * heightPx };
          if ([0, 3, 5].includes(h)) p0Px.x = localPoint.x;
          if ([2, 4, 7].includes(h)) p1Px.x = localPoint.x;
          if ([0, 1, 2].includes(h)) p0Px.y = localPoint.y;
          if ([5, 6, 7].includes(h)) p1Px.y = localPoint.y;
          next[0] = { x: p0Px.x / widthPx, y: p0Px.y / heightPx };
          next[1] = { x: p1Px.x / widthPx, y: p1Px.y / heightPx };
        }
        return { ...el, points: next };
      }));
    } else if (interactionMode.current === 'curving' && selectedIds.length === 1) {
      setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, controlPoint: point } : el));
    } else if (interactionMode.current === 'rotating' && selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const bounds = getElementBounds(el, widthPx, heightPx);
        const angle = Math.atan2(point.y * heightPx - bounds.centerY, point.x * widthPx - bounds.centerX) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedIds[0] ? { ...e, rotation: angle } : e));
      }
    } else if (interactionMode.current === 'dragging' && selectedIds.length > 0 && lastPoint.current) {
      const dx = point.x - lastPoint.current.x; const dy = point.y - lastPoint.current.y;
      setElements(prev => prev.map(el => {
        if (!selectedIds.includes(el.id)) return el;
        const next = { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        if (el.controlPoint) next.controlPoint = { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy };
        return next;
      }));
      lastPoint.current = point;
    }
    redrawAll();
  };

  const handlePointerUp = () => {
    isDrawing.current = false; interactionMode.current = 'none'; activeHandleIndex.current = null;
  };

  const handleConfirmSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveFormData.title) {
      toast({ variant: "destructive", title: "ERROR", description: "Debe asignar un título al ejercicio." });
      return;
    }
    
    toast({ title: "SINCRO_EXITOSA", description: `El ejercicio "${saveFormData.title}" se ha guardado en su cuaderno de campo.` });
    setIsSaveSheetOpen(false);
    
    if (isFromForm) setTimeout(() => router.back(), 1500);
  };

  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Tactical_Precision_v9.7.4</span>
            </div>
            <h1 className="text-lg lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">Estudio Élite</h1>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[160px] h-11 bg-white/5 border-amber-500/20 rounded-xl text-[10px] font-black uppercase text-amber-500">
                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                <SelectItem value="f11" className="text-[10px] font-black uppercase">Fútbol 11</SelectItem>
                <SelectItem value="f7" className="text-[10px] font-black uppercase">Fútbol 7</SelectItem>
                <SelectItem value="futsal" className="text-[10px] font-black uppercase">Fútbol Sala</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowLanes(!showLanes)} className={cn("h-11 px-4 border-amber-500/20 text-[10px] font-black uppercase", showLanes ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-white/5 text-amber-500/40")}>
              <Columns3 className="h-4 w-4 mr-2" /> Carriles
            </Button>

            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 pl-4 border-l border-white/10 animate-in slide-in-from-left-4 fade-in duration-300">
                <div className="flex gap-1.5 p-1 bg-black/40 border border-white/5 rounded-xl mr-2">
                  {COLORS.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))} 
                      className={cn("h-6 w-6 rounded-full border-2 transition-all", selectedElements.every(el => el.color === c.value) ? "border-white scale-110" : "border-transparent opacity-40 hover:opacity-100")} 
                      style={{ backgroundColor: c.value }} 
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-2 w-32 px-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Opacidad</span>
                    <span className="text-[8px] font-black text-amber-500">{Math.round(commonOpacity * 100)}%</span>
                  </div>
                  <Slider 
                    value={[commonOpacity * 100]} min={10} max={100} step={1}
                    onValueChange={(val) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: val[0] / 100} : el))}
                    className="w-full"
                  />
                </div>

                {selectedElements.length === 1 && (
                  <>
                    {!isMaterial(selectedElements[0].type) && selectedElements[0].type !== 'text' && (
                      <Button 
                        variant="outline" size="sm" 
                        className={cn("h-9 border-white/10 text-[9px] font-black uppercase", selectedElements[0].lineStyle === 'dashed' ? 'bg-amber-500 text-black' : 'text-white/40')}
                        onClick={() => setElements(prev => prev.map(el => el.id === selectedIds[0] ? {...el, lineStyle: el.lineStyle === 'solid' ? 'dashed' : 'solid'} : el))}
                      >
                        {selectedElements[0].lineStyle === 'dashed' ? 'Discontinua' : 'Sólida'}
                      </Button>
                    )}
                    {selectedElements[0].type === 'text' && (
                      <Button variant="outline" size="sm" onClick={handleEditText} className="h-9 border-amber-500/20 bg-amber-500/5 text-amber-500 font-black uppercase text-[9px]">
                        <Pencil className="h-3 w-3 mr-2" /> Editar Texto
                      </Button>
                    )}
                    {selectedElements[0].type === 'player' && (
                      <Input 
                        type="number" value={selectedElements[0].number || 1} 
                        onChange={(e) => setElements(prev => prev.map(el => el.id === selectedIds[0] ? {...el, number: parseInt(e.target.value)} : el))} 
                        className="h-9 w-12 bg-black/40 border-amber-500/20 text-amber-500 font-black text-xs text-center rounded-lg" 
                      />
                    )}
                  </>
                )}

                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 text-white/40 hover:text-white" onClick={() => {
                    const next = selectedElements.map(el => ({ ...el, id: `el-${Date.now()}-${Math.random()}`, points: el.points.map(p => ({ x: p.x + 0.02, y: p.y + 0.02 })) }));
                    setElements(prev => [...prev, ...next]); setSelectedIds(next.map(e => e.id));
                  }}><Copy className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 border-rose-500/20 text-rose-500/40 hover:text-rose-500" onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => setIsSaveSheetOpen(true)} className="h-11 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.3)] border-none">
          <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Guardar Táctica</span>
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex items-center justify-center relative overflow-hidden touch-none">
          <TacticalField theme="amber" fieldType={fieldType} showLanes={showLanes}>
            <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} />
          </TacticalField>
        </main>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-end gap-12 px-12 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <BoardToolbar theme="amber" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(tool) => { addElementAtCenter(tool); setSelectedIds([]); }} className="border-2 shadow-2xl" />
          </div>
          <div className="pointer-events-auto">
            <BoardToolbar theme="amber" variant="training" orientation="horizontal" activeTool={activeTool} onToolSelect={(tool) => { if (tool === 'select') { setActiveTool('select'); setSelectedIds([]); } else { addElementAtCenter(tool); } }} onClear={() => { setElements([]); setSelectedIds([]); }} className="border-2 shadow-2xl" />
          </div>
        </div>
      </div>

      {/* SHEET DE FICHA TÉCNICA (EVITAR FICHA VACÍA) */}
      <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Technical_Sheet_Sync_v1.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                VINCULAR <span className="text-amber-500">DATOS</span>
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-amber-500/40 tracking-widest text-left italic">
                Complete los parámetros metodológicos para su cuaderno de campo.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleConfirmSave} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Título del Ejercicio</Label>
                <Input 
                  required
                  value={saveFormData.title}
                  onChange={(e) => setSaveFormData({...saveFormData, title: e.target.value.toUpperCase()})}
                  placeholder="EJ: SALIDA DE BALÓN 4-3-3" 
                  className="h-14 bg-white/5 border-amber-500/20 rounded-2xl font-bold uppercase focus:border-amber-500 text-amber-500 text-lg" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Etapa Federativa</Label>
                  <Select value={saveFormData.stage} onValueChange={(v) => setSaveFormData({...saveFormData, stage: v})}>
                    <SelectTrigger className="h-12 bg-white/5 border-amber-500/20 rounded-xl text-white font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                      {STAGES.map(s => (
                        <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Dimensión</Label>
                  <Select value={saveFormData.dimension} onValueChange={(v) => setSaveFormData({...saveFormData, dimension: v})}>
                    <SelectTrigger className="h-12 bg-white/5 border-amber-500/20 rounded-xl text-white font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                      <SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem>
                      <SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem>
                      <SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Objetivo Táctico Primario</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3.5 h-4 w-4 text-amber-500/40" />
                  <Input 
                    value={saveFormData.objective}
                    onChange={(e) => setSaveFormData({...saveFormData, objective: e.target.value.toUpperCase()})}
                    placeholder="EJ: GENERAR SUPERIORIDAD POR DENTRO" 
                    className="pl-10 h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase text-xs text-amber-500" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Descripción / Consignas</Label>
                <Textarea 
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})}
                  placeholder="Explique la dinámica del ejercicio y las reglas de provocación..." 
                  className="min-h-[120px] bg-white/5 border-amber-500/20 rounded-2xl font-bold text-amber-500 placeholder:text-amber-500/20" 
                />
              </div>
            </div>

            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-amber-500" />
                <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest italic">Protocolo de Registro</span>
              </div>
              <p className="text-[9px] text-amber-500/40 leading-relaxed font-bold uppercase italic">
                El diagrama táctico actual se capturará como el activo visual principal para esta ficha técnica.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/60 border-t border-white/5">
            <Button onClick={handleConfirmSave} className="w-full h-16 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl amber-glow shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              GUARDAR_EN_CUADERNO <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function TrainingBoardPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-amber-500 font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando_Estudio...</div>}>
      <TrainingBoardContent />
    </Suspense>
  );
}
