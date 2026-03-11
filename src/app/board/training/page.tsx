
"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { 
  Sparkles, 
  Save, 
  LayoutGrid, 
  Link as LinkIcon, 
  Trash2, 
  MousePointer2, 
  Copy, 
  Pencil,
  Spline,
  Minus,
  Columns3,
  Settings2,
  Palette,
  Layers,
  Library,
  Settings,
  Activity,
  Circle,
  Flag,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar, DrawingTool } from "@/components/board/BoardToolbar";
import { AssetPanel } from "@/components/board/AssetPanel";
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
} from "@/components/ui/sheet";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  rotation: number;
  lineStyle: 'solid' | 'dashed';
  number?: number;
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

function TrainingBoardContent() {
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [elements, setElements] = useState<DrawingElement[]>([]);
  const currentElement = useRef<DrawingElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  const isFromForm = searchParams.get("source") === "form";

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getDistance = (p1: Point, p2: Point) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

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

  const drawArrowhead = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
  };

  const drawWaveLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const dist = getDistance(from, to);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const amplitude = 10;
    const wavelength = 40; 
    
    ctx.moveTo(from.x, from.y);
    for (let d = 0; d <= dist; d += 2) {
      const x = from.x + Math.cos(angle) * d;
      const y = from.y + Math.sin(angle) * d;
      const perpAngle = angle + Math.PI / 2;
      const waveOffset = Math.sin(d * (Math.PI * 2 / wavelength)) * amplitude;
      const finalX = x + Math.cos(perpAngle) * waveOffset;
      const finalY = y + Math.sin(perpAngle) * waveOffset;
      ctx.lineTo(finalX, finalY);
    }
  };

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const p = element.points;
    if (p.length < 1) return;

    // CÁLCULO DEL CENTRO GEOMÉTRICO (PROTOCOLO v8.6.0)
    let centerX, centerY;
    const isSinglePoint = ['ball', 'cone', 'seta', 'pica', 'player'].includes(element.type);
    
    if (isSinglePoint) {
      centerX = p[0].x;
      centerY = p[0].y;
    } else {
      const minX = Math.min(...p.map(pt => pt.x));
      const minY = Math.min(...p.map(pt => pt.y));
      const maxX = Math.max(...p.map(pt => pt.x));
      const maxY = Math.max(...p.map(pt => pt.y));
      centerX = (minX + maxX) / 2;
      centerY = (minY + maxY) / 2;
    }

    ctx.save();
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

    ctx.beginPath();
    switch (element.type) {
      case 'freehand':
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
        ctx.stroke();
        break;
      case 'rect':
        if (!p[1]) break;
        ctx.rect(p[0].x, p[0].y, p[1].x - p[0].x, p[1].y - p[0].y);
        ctx.fill();
        ctx.stroke();
        break;
      case 'circle':
        if (!p[1]) break;
        const circRadius = getDistance(p[0], p[1]);
        ctx.arc(p[0].x, p[0].y, circRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'zigzag':
        if (!p[1]) break;
        drawWaveLine(ctx, p[0], p[1]);
        ctx.stroke();
        break;
      case 'arrow':
        if (!p[1]) break;
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([]);
        drawArrowhead(ctx, p[0], p[1]);
        ctx.stroke();
        break;
      case 'double-arrow':
        if (!p[1]) break;
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([]);
        drawArrowhead(ctx, p[0], p[1]);
        drawArrowhead(ctx, p[1], p[0]);
        ctx.stroke();
        break;
      case 'player':
        const pr = p[1] ? getDistance(p[0], p[1]) : 25;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = hexToRgba(element.color, 0.4);
        ctx.beginPath();
        ctx.arc(p[0].x, p[0].y, pr, 0, Math.PI * 2);
        const playerGrad = ctx.createRadialGradient(p[0].x - pr/3, p[0].y - pr/3, 0, p[0].x, p[0].y, pr);
        playerGrad.addColorStop(0, '#ffffff44');
        playerGrad.addColorStop(0.5, hexToRgba(element.color, 0.3));
        playerGrad.addColorStop(1, hexToRgba(element.color, 0.1));
        ctx.fillStyle = playerGrad;
        ctx.fill();
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(pr * 0.8)}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((element.number || 1).toString(), p[0].x, p[0].y);
        ctx.restore();
        break;
      case 'ball':
        const br = p[1] ? getDistance(p[0], p[1]) : 15;
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.beginPath();
        ctx.arc(0, br * 0.1, br, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        const ballGrad = ctx.createRadialGradient(-br * 0.4, -br * 0.4, 0, 0, 0, br);
        ballGrad.addColorStop(0, 'white');
        ballGrad.addColorStop(1, '#E2E8F0');
        ctx.beginPath();
        ctx.arc(0, 0, br, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        const s = br / 40;
        ctx.moveTo(0, -40*s); ctx.lineTo(-15*s, -25*s);
        ctx.moveTo(0, -40*s); ctx.lineTo(15*s, -25*s);
        ctx.moveTo(0, 40*s); ctx.lineTo(-15*s, 25*s);
        ctx.moveTo(0, 40*s); ctx.lineTo(15*s, 25*s);
        ctx.moveTo(-40*s, 0); ctx.lineTo(-25*s, -15*s);
        ctx.moveTo(-40*s, 0); ctx.lineTo(-25*s, 15*s);
        ctx.moveTo(40*s, 0); ctx.lineTo(25*s, -15*s);
        ctx.moveTo(40*s, 0); ctx.lineTo(25*s, 15*s);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 15*s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      case 'cone':
        const cr = p[1] ? getDistance(p[0], p[1]) : 25;
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        // Sombra
        ctx.beginPath();
        ctx.ellipse(0, cr * 0.6, cr * 1.2, cr * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fill();
        // Base elíptica
        ctx.beginPath();
        ctx.ellipse(0, cr * 0.5, cr, cr * 0.4, 0, 0, Math.PI * 2);
        const coneBaseGrad = ctx.createRadialGradient(0, cr * 0.4, 0, 0, cr * 0.5, cr);
        coneBaseGrad.addColorStop(0, '#ff9800');
        coneBaseGrad.addColorStop(1, '#e65100');
        ctx.fillStyle = coneBaseGrad;
        ctx.fill();
        // Cuerpo con rayas
        const ch = cr * 2.2;
        const bodyGrad = ctx.createLinearGradient(-cr, 0, cr, 0);
        bodyGrad.addColorStop(0, '#e65100');
        bodyGrad.addColorStop(0.4, '#ffb74d');
        bodyGrad.addColorStop(0.6, '#ffb74d');
        bodyGrad.addColorStop(1, '#bf360c');
        const drawSegment = (yT: number, yB: number, wT: number, wB: number, col: string) => {
          ctx.beginPath();
          ctx.moveTo(-wT, yT); ctx.lineTo(wT, yT);
          ctx.quadraticCurveTo(wT, yT + 5, wB, yB);
          ctx.lineTo(-wB, yB);
          ctx.quadraticCurveTo(-wT, yT + 5, -wT, yT);
          ctx.fillStyle = col; ctx.fill();
        };
        drawSegment(cr*0.5-ch*0.3, cr*0.5, cr*0.6, cr*0.8, bodyGrad); // Base orange
        drawSegment(cr*0.5-ch*0.5, cr*0.5-ch*0.3, cr*0.45, cr*0.6, '#ffffff'); // Stripe 1
        drawSegment(cr*0.5-ch*0.7, cr*0.5-ch*0.5, cr*0.3, cr*0.45, bodyGrad); // Mid orange
        drawSegment(cr*0.5-ch*0.9, cr*0.5-ch*0.7, cr*0.15, cr*0.3, '#ffffff'); // Stripe 2
        ctx.beginPath(); // Top
        ctx.moveTo(-cr*0.15, cr*0.5-ch*0.9); ctx.lineTo(cr*0.15, cr*0.5-ch*0.9);
        ctx.quadraticCurveTo(0, cr*0.5-ch-5, -cr*0.15, cr*0.5-ch*0.9);
        ctx.fillStyle = bodyGrad; ctx.fill();
        ctx.restore();
        break;
      case 'seta':
        const sr = p[1] ? getDistance(p[0], p[1]) : 22;
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.beginPath();
        ctx.ellipse(0, sr/4, sr, sr/2.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, sr, sr/2.2, 0, 0, Math.PI * 2);
        const setaG = ctx.createRadialGradient(0, -sr/4, 0, 0, 0, sr);
        setaG.addColorStop(0, '#ffffff');
        setaG.addColorStop(0.3, element.color);
        setaG.addColorStop(1, hexToRgba(element.color, 0.8));
        ctx.fillStyle = setaG; ctx.fill();
        ctx.restore();
        break;
      case 'ladder':
        if (!p[1]) break;
        const ld = getDistance(p[0], p[1]);
        const sw = 45;
        ctx.save();
        ctx.translate(centerX, centerY);
        const la = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.rotate(la);
        ctx.translate(-ld/2, 0);
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 5;
        ctx.strokeRect(0, -sw/2, ld, sw);
        ctx.lineWidth = 3; ctx.strokeStyle = element.color;
        for(let d=0; d<=ld; d+=30) {
          ctx.beginPath(); ctx.moveTo(d, -sw/2); ctx.lineTo(d, sw/2); ctx.stroke();
        }
        ctx.restore();
        break;
      case 'hurdle':
        if (!p[1]) break;
        const hw = getDistance(p[0], p[1]);
        ctx.save();
        ctx.translate(centerX, centerY);
        const ha = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.rotate(ha);
        ctx.translate(-hw/2, 0);
        ctx.strokeStyle = element.color; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, 15); ctx.lineTo(0, -15); ctx.lineTo(hw, -15); ctx.lineTo(hw, 15); ctx.stroke();
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 3;
        ctx.strokeRect(-6, 12, 12, 6); ctx.strokeRect(hw-6, 12, 12, 6);
        ctx.restore();
        break;
      case 'minigoal':
        if (!p[1]) break;
        const gw = getDistance(p[0], p[1]);
        ctx.save();
        ctx.translate(centerX, centerY);
        const ga = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.rotate(ga);
        ctx.translate(-gw/2, 0);
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, -gw/3, gw, gw/1.5);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for(let i=0; i<gw; i+=10) { ctx.moveTo(i, -gw/3); ctx.lineTo(i, gw/3); }
        for(let j=-gw/3; j<gw/3; j+=10) { ctx.moveTo(0, j); ctx.lineTo(gw, j); }
        ctx.stroke();
        ctx.setLineDash([]); ctx.strokeStyle = '#F8FAFC'; ctx.lineWidth = 5;
        ctx.strokeRect(0, -gw/3, gw, gw/1.5);
        ctx.restore();
        break;
      case 'pica':
        const pir = p[1] ? getDistance(p[0], p[1]) : 18;
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.beginPath(); ctx.arc(0, pir*0.8, pir*0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#334155'; ctx.fill();
        const pG = ctx.createLinearGradient(-4, 0, 4, 0);
        pG.addColorStop(0, element.color); pG.addColorStop(0.5, '#ffffff'); pG.addColorStop(1, element.color);
        ctx.fillStyle = pG; ctx.fillRect(-4, -pir*2.5, 8, pir*3.2);
        ctx.restore();
        break;
    }

    if (isSelected && element.type !== 'freehand') {
      ctx.restore();
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(element.rotation);
      ctx.translate(-centerX, -centerY);

      ctx.strokeStyle = '#ffffffaa';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      
      const selPad = 15;
      const minX = Math.min(...p.map(pt => pt.x));
      const minY = Math.min(...p.map(pt => pt.y));
      const maxX = Math.max(...p.map(pt => pt.x));
      const maxY = Math.max(...p.map(pt => pt.y));

      if (element.type === 'rect' && p[1]) {
        ctx.strokeRect(p[0].x, p[0].y, p[1].x - p[0].x, p[1].y - p[0].y);
      } else {
        ctx.strokeRect(minX - selPad, minY - selPad, (maxX - minX) + selPad * 2, (maxY - minY) + selPad * 2);
      }

      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      let handles: Point[] = [];
      if (element.type === 'rect' && p[1]) {
        handles = [{ x: p[0].x, y: p[0].y }, { x: p[1].x, y: p[0].y }, { x: p[1].x, y: p[1].y }, { x: p[0].x, y: p[1].y }];
      } else {
        handles = [p[0], p[p.length-1]];
      }
      handles.forEach(hp => {
        ctx.beginPath(); ctx.arc(hp.x, hp.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });

      const rotY = minY - 50;
      ctx.beginPath(); ctx.moveTo(centerX, minY); ctx.lineTo(centerX, rotY); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(centerX, rotY, 10, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }, [hexToRgba, getDistance]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(el => drawElement(ctx, el, el.id === selectedId));
    if (currentElement.current) {
      drawElement(ctx, currentElement.current, false);
    }
  }, [elements, selectedId, drawElement]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    redrawAll();
  }, [redrawAll]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => initCanvas());
    observer.observe(canvas.parentElement!);
    initCanvas();
    return () => observer.disconnect();
  }, [initCanvas]);

  useEffect(() => {
    redrawAll();
  }, [elements, selectedId, redrawAll]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    startPoint.current = point;
    lastPoint.current = point;
    isDrawing.current = true;

    if (selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el && el.type !== 'freehand') {
        let cx, cy;
        const isS = ['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type);
        if (isS) { cx = el.points[0].x; cy = el.points[0].y; }
        else {
          const minX = Math.min(...el.points.map(pt => pt.x));
          const minY = Math.min(...el.points.map(pt => pt.y));
          const maxX = Math.max(...el.points.map(pt => pt.x));
          const maxY = Math.max(...el.points.map(pt => pt.y));
          cx = (minX + maxX) / 2; cy = (minY + maxY) / 2;
        }
        
        const localPoint = rotatePoint(point, {x: cx, y: cy}, -el.rotation);
        const minY = Math.min(...el.points.map(pt => pt.y));
        const rotY = minY - 50;
        if (getDistance(point, rotatePoint({x: cx, y: rotY}, {x: cx, y: cy}, el.rotation)) < 25) {
          interactionMode.current = 'rotating'; return;
        }

        let handles: Point[] = [];
        if (el.type === 'rect') {
          handles = [{ x: el.points[0].x, y: el.points[0].y }, { x: el.points[1].x, y: el.points[0].y }, { x: el.points[1].x, y: el.points[1].y }, { x: el.points[0].x, y: el.points[1].y }];
        } else {
          handles = [el.points[0], el.points[el.points.length - 1]];
        }
        const handleIdx = handles.findIndex(hp => getDistance(localPoint, hp) < 20);
        if (handleIdx !== -1) {
          interactionMode.current = 'resizing'; activeHandleIndex.current = handleIdx; return;
        }
      }
    }

    const clickedEl = [...elements].reverse().find(el => {
      const p = el.points;
      let cx, cy;
      const isS = ['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type);
      if (isS) { cx = p[0].x; cy = p[0].y; }
      else {
        const minX = Math.min(...p.map(pt => pt.x));
        const minY = Math.min(...p.map(pt => pt.y));
        const maxX = Math.max(...p.map(pt => pt.x));
        const maxY = Math.max(...p.map(pt => pt.y));
        cx = (minX + maxX) / 2; cy = (minY + maxY) / 2;
      }
      
      const localPoint = rotatePoint(point, {x: cx, y: cy}, -el.rotation);
      if (el.type === 'rect') {
        const minX = Math.min(...p.map(pt => pt.x));
        const minY = Math.min(...p.map(pt => pt.y));
        const maxX = Math.max(...p.map(pt => pt.x));
        const maxY = Math.max(...p.map(pt => pt.y));
        return localPoint.x >= minX && localPoint.x <= maxX && localPoint.y >= minY && localPoint.y <= maxY;
      }
      if (el.type === 'circle') return getDistance(localPoint, p[0]) <= getDistance(p[0], p[1]);
      if (el.type === 'freehand') return p.some(fp => getDistance(point, fp) < 20);
      const rad = p[1] ? getDistance(p[0], p[1]) : 30;
      return getDistance(localPoint, p[0]) < rad + 10;
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id); setActiveTool('select'); interactionMode.current = 'dragging';
    } else {
      if (activeTool !== 'select') {
        setSelectedId(null); setIsPropertiesOpen(false); interactionMode.current = 'drawing';
        const isS = ['ball', 'cone', 'seta', 'pica', 'player'].includes(activeTool);
        let playerNum; if(activeTool === 'player') playerNum = elements.filter(e => e.type === 'player').length + 1;
        currentElement.current = { 
          id: `el-${Date.now()}`, type: activeTool, points: isS ? [point, {x: point.x + 30, y: point.y}] : [point, point], 
          color: currentColor, rotation: 0, lineStyle: 'solid', number: playerNum
        };
      } else {
        setSelectedId(null); setIsPropertiesOpen(false); interactionMode.current = 'none';
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (interactionMode.current === 'drawing' && currentElement.current) {
      if (activeTool === 'freehand') currentElement.current.points.push(point);
      else currentElement.current.points[1] = point;
    } else if (interactionMode.current === 'resizing' && selectedId && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedId) return el;
        let cx, cy;
        const isS = ['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type);
        if (isS) { cx = el.points[0].x; cy = el.points[0].y; }
        else {
          const minX = Math.min(...el.points.map(pt => pt.x));
          const minY = Math.min(...el.points.map(pt => pt.y));
          const maxX = Math.max(...el.points.map(pt => pt.x));
          const maxY = Math.max(...el.points.map(pt => pt.y));
          cx = (minX + maxX) / 2; cy = (minY + maxY) / 2;
        }
        const localPoint = rotatePoint(point, {x: cx, y: cy}, -el.rotation);
        const newPoints = [...el.points];
        if (el.type === 'rect') {
          if (activeHandleIndex.current === 0) { newPoints[0].x = localPoint.x; newPoints[0].y = localPoint.y; }
          if (activeHandleIndex.current === 1) { newPoints[1].x = localPoint.x; newPoints[0].y = localPoint.y; }
          if (activeHandleIndex.current === 2) { newPoints[1].x = localPoint.x; newPoints[1].y = localPoint.y; }
          if (activeHandleIndex.current === 3) { newPoints[0].x = localPoint.x; newPoints[1].y = localPoint.y; }
        } else {
          newPoints[activeHandleIndex.current === 0 ? 0 : newPoints.length - 1] = localPoint;
        }
        return { ...el, points: newPoints };
      }));
    } else if (interactionMode.current === 'rotating' && selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el) {
        let cx, cy;
        const isS = ['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type);
        if (isS) { cx = el.points[0].x; cy = el.points[0].y; }
        else {
          const minX = Math.min(...el.points.map(pt => pt.x));
          const minY = Math.min(...el.points.map(pt => pt.y));
          const maxX = Math.max(...el.points.map(pt => pt.x));
          const maxY = Math.max(...el.points.map(pt => pt.y));
          cx = (minX + maxX) / 2; cy = (minY + maxY) / 2;
        }
        const angle = Math.atan2(point.y - cy, point.x - cx) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedId ? { ...e, rotation: angle } : e));
      }
    } else if (interactionMode.current === 'dragging' && selectedId && lastPoint.current) {
      const dx = point.x - lastPoint.current.x;
      const dy = point.y - lastPoint.current.y;
      setElements(prev => prev.map(el => {
        if (el.id !== selectedId) return el;
        return { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      }));
      lastPoint.current = point;
    }
    redrawAll();
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (interactionMode.current === 'drawing' && currentElement.current) {
      setElements(prev => [...prev, currentElement.current!]);
      setSelectedId(currentElement.current.id);
      setActiveTool('select');
    }
    currentElement.current = null; interactionMode.current = 'none'; activeHandleIndex.current = null; lastPoint.current = null;
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) { setSelectedId(null); setIsPropertiesOpen(false); }
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id); if (!el) return;
    const newEl: DrawingElement = { ...el, id: `el-${Date.now()}`, points: el.points.map(p => ({ x: p.x + 30, y: p.y + 30 })) };
    setElements(prev => [...prev, newEl]); setSelectedId(newEl.id);
  };

  const changeElementColor = (id: string, color: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, color } : el));
  };

  const handleSave = () => {
    toast({ title: isFromForm ? "DIAGRAMA_VINCULADO" : "DIAGRAMA_GUARDADO", description: "Ejercicio sincronizado correctamente." });
    if (isFromForm) setTimeout(() => router.back(), 1500);
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Tactical_Precision_v8.6</span>
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
          </div>
        </div>
        <Button onClick={handleSave} className="h-11 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.3)] border-none">
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
            <BoardToolbar theme="amber" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(tool) => { setActiveTool(tool); setSelectedId(null); setIsPropertiesOpen(false); }} className="border-2 shadow-2xl" />
          </div>
          <div className="pointer-events-auto">
            <BoardToolbar theme="amber" variant="training" orientation="horizontal" activeTool={activeTool} hasSelection={!!selectedId} onOpenProperties={() => setIsPropertiesOpen(true)} onToolSelect={(tool) => { setActiveTool(tool); if (tool !== 'select') { setSelectedId(null); setIsPropertiesOpen(false); } }} onClear={() => { setElements([]); setSelectedId(null); setIsPropertiesOpen(false); }} className="border-2 shadow-2xl" />
          </div>
        </div>

        <Sheet open={isPropertiesOpen || isLibraryOpen} onOpenChange={(open) => { if(!open) { setIsPropertiesOpen(false); setIsLibraryOpen(false); } }}>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md p-0 flex flex-col">
            {isPropertiesOpen && selectedElement ? (
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-white/5 bg-amber-500/5">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Settings2 className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase text-amber-500">Node_Properties_v8.6</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic uppercase">Propiedades</SheetTitle>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto p-10 space-y-12">
                  <section className="space-y-6">
                    <Label className="text-[10px] font-black uppercase text-white/40">Paleta Técnica</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {COLORS.map(c => (
                        <button key={c.id} onClick={() => changeElementColor(selectedId!, c.value)} className={cn("h-14 rounded-2xl border-2 transition-all", selectedElement.color === c.value ? "border-white scale-105" : "border-white/5 opacity-40")} style={{ backgroundColor: c.value }} />
                      ))}
                    </div>
                  </section>
                  {selectedElement.type === 'player' && (
                    <section className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-white/40">Dorsal Atleta</Label>
                      <Input type="number" value={selectedElement.number || 1} onChange={(e) => setElements(prev => prev.map(el => el.id === selectedId ? {...el, number: parseInt(e.target.value)} : el))} className="h-12 bg-white/5 border-amber-500/20 text-amber-500 font-black text-xl text-center" />
                    </section>
                  )}
                  <section className="space-y-6">
                    <Label className="text-[10px] font-black uppercase text-white/40">Acciones de Objeto</Label>
                    <div className="grid gap-4">
                      <Button variant="outline" className="h-16 bg-white/5 border-white/10 text-white/60 font-black uppercase text-[11px]" onClick={() => duplicateElement(selectedId!)}>Duplicar Nodo <Copy className="ml-auto h-5 w-5" /></Button>
                      <Button variant="outline" className="h-16 bg-rose-500/5 border-rose-500/20 text-rose-500 font-black uppercase text-[11px]" onClick={() => deleteElement(selectedId!)}>Eliminar <Trash2 className="ml-auto h-5 w-5" /></Button>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="p-8"><p className="text-[10px] font-black text-white/20 uppercase tracking-[1em] text-center">Sincronizando Biblioteca...</p></div>
            )}
          </SheetContent>
        </Sheet>
      </div>
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
