
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
  UserCircle,
  Hash,
  X,
  Type,
  Maximize2,
  Cloudy,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
  opacity: number;
  text?: string;
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

const isMaterial = (type: DrawingTool) => 
  ['player', 'ball', 'cone', 'seta', 'ladder', 'hurdle', 'minigoal', 'pica', 'barrier'].includes(type);

function TrainingBoardContent() {
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const getElementBounds = (element: DrawingElement) => {
    const p = element.points;
    if (element.type === 'freehand') {
      const minX = Math.min(...p.map(pt => pt.x));
      const minY = Math.min(...p.map(pt => pt.y));
      const maxX = Math.max(...p.map(pt => pt.x));
      const maxY = Math.max(...p.map(pt => pt.y));
      return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
    }
    const minX = Math.min(p[0].x, p[1].x);
    const minY = Math.min(p[0].y, p[1].y);
    const maxX = Math.max(p[0].x, p[1].x);
    const maxY = Math.max(p[0].y, p[1].y);
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  };

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const p = element.points;
    if (p.length < 1) return;

    const bounds = getElementBounds(element);
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
        if (isSelected) {
          ctx.strokeStyle = hexToRgba(element.color, 0.3);
          ctx.strokeRect(minX, minY, width, height);
        }
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
      case 'zigzag':
        ctx.beginPath();
        const dist = getDistance(p[0], p[1]);
        const angle = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        const amp = 10;
        const wlen = 40; 
        ctx.moveTo(p[0].x, p[0].y);
        for (let d = 0; d <= dist; d += 2) {
          const x = p[0].x + Math.cos(angle) * d;
          const y = p[0].y + Math.sin(angle) * d;
          const perp = angle + Math.PI / 2;
          const offset = Math.sin(d * (Math.PI * 2 / wlen)) * amp;
          ctx.lineTo(x + Math.cos(perp) * offset, y + Math.sin(perp) * offset);
        }
        ctx.stroke();
        break;
      case 'arrow':
      case 'double-arrow':
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        const head = 15;
        const a = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.setLineDash([]);
        const drawH = (tx: number, ty: number, ang: number) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang - Math.PI / 6), ty - head * Math.sin(ang - Math.PI / 6));
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang + Math.PI / 6), ty - head * Math.sin(ang + Math.PI / 6));
          ctx.stroke();
        };
        drawH(p[1].x, p[1].y, a);
        if (element.type === 'double-arrow') drawH(p[0].x, p[0].y, a + Math.PI);
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
            ctx.moveTo(-thickness/2, -cSize + arrowHead);
            ctx.lineTo(thickness/2, -cSize + arrowHead);
            ctx.lineTo(thickness/2, cSize - arrowHead);
            ctx.lineTo(-thickness/2, cSize - arrowHead);
          } else {
            ctx.moveTo(-cSize + arrowHead, -thickness/2);
            ctx.lineTo(cSize - arrowHead, -thickness/2);
            ctx.lineTo(cSize - arrowHead, thickness/2);
            ctx.lineTo(-cSize + arrowHead, thickness/2);
          }
          ctx.closePath();
          const barGrad = ctx.createLinearGradient(isVert ? -thickness/2 : -cSize, isVert ? -cSize : -thickness/2, isVert ? thickness/2 : cSize, isVert ? cSize : thickness/2);
          barGrad.addColorStop(0, element.color);
          barGrad.addColorStop(0.5, '#ffffffaa');
          barGrad.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = barGrad;
          ctx.fill();
          ctx.stroke();
        };

        const drawArrowHead = (tx: number, ty: number, rot: number) => {
          ctx.save();
          ctx.translate(tx, ty);
          ctx.rotate(rot);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-arrowHead, arrowHead);
          ctx.lineTo(arrowHead, arrowHead);
          ctx.closePath();
          const headGrad = ctx.createLinearGradient(-arrowHead, 0, arrowHead, arrowHead);
          headGrad.addColorStop(0, element.color);
          headGrad.addColorStop(0.5, '#ffffffaa');
          headGrad.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = headGrad;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        };

        drawCrossBar(false);
        drawCrossBar(true);
        drawArrowHead(0, -cSize, 0);
        drawArrowHead(cSize, 0, Math.PI/2);
        drawArrowHead(0, cSize, Math.PI);
        drawArrowHead(-cSize, 0, -Math.PI/2);
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
        const patterns = [[50,10,35,25], [50,10,65,25], [50,90,35,75], [50,90,65,75], [10,50,25,35], [10,50,25,65], [90,50,75,35], [90,50,75,65]];
        patterns.forEach(p => { ctx.moveTo(p[0]-50, p[1]-50); ctx.lineTo(p[2]-50, p[3]-50); });
        ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
        break;
      case 'cone':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/50, height/50);
        ctx.beginPath(); ctx.ellipse(0, 15, 25, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 12, 20, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#ea580c'; ctx.fill();
        const bodyG = ctx.createLinearGradient(-20, 0, 20, 0);
        bodyG.addColorStop(0, '#ea580c'); bodyG.addColorStop(0.5, '#fb923c'); bodyG.addColorStop(1, '#9a3412');
        ctx.beginPath(); ctx.moveTo(-15, 12); ctx.lineTo(15, 12); ctx.lineTo(2, -30); ctx.lineTo(-2, -30); ctx.closePath();
        ctx.fillStyle = bodyG; ctx.fill();
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

    if (isSelected && element.type !== 'freehand') {
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
    }
    ctx.restore();
  }, [hexToRgba, getDistance]);

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
    if (currentElement.current) drawElement(ctx, currentElement.current, false);
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const point = { x: centerX, y: centerY };
    
    let pNum; 
    if(tool === 'player') pNum = elements.filter(e => e.type === 'player').length + 1;
    
    const defW = tool === 'ladder' ? 120 : (tool === 'minigoal' ? 80 : tool === 'barrier' ? 100 : tool === 'cross-arrow' ? 80 : 40);
    const defH = tool === 'ladder' ? 40 : (tool === 'minigoal' ? 50 : tool === 'barrier' ? 100 : tool === 'cross-arrow' ? 80 : 40);
    
    const newElement: DrawingElement = { 
      id: `el-${Date.now()}`, 
      type: tool, 
      points: [{x: point.x - defW/2, y: point.y - defH/2}, {x: point.x + defW/2, y: point.y + defH/2}],
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
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    startPoint.current = point; lastPoint.current = point; isDrawing.current = true;

    if (selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el && el.type !== 'freehand') {
        const { centerX, centerY, minX, minY, maxX, maxY } = getElementBounds(el);
        const pad = 10;
        const local = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);
        
        if (getDistance(point, rotatePoint({x: centerX, y: minY - pad - 40}, {x: centerX, y: centerY}, el.rotation)) < 20) {
          interactionMode.current = 'rotating'; return;
        }

        const handles = [
          { x: minX - pad, y: minY - pad }, { x: centerX, y: minY - pad }, { x: maxX + pad, y: minY - pad },
          { x: minX - pad, y: centerY }, { x: maxX + pad, y: centerY },
          { x: minX - pad, y: maxY + pad }, { x: centerX, y: maxY + pad }, { x: maxX + pad, y: maxY + pad },
        ];
        const hIdx = handles.findIndex(h => getDistance(local, h) < 15);
        if (hIdx !== -1) {
          interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return;
        }
      }
    }

    const sortedForPicking = [...elements].sort((a, b) => {
      const aMat = isMaterial(a.type);
      const bMat = isMaterial(b.type);
      if (aMat && !bMat) return 1; 
      if (!aMat && bMat) return -1;
      return 0;
    });

    const clicked = sortedForPicking.reverse().find(el => {
      const { centerX, centerY, minX, minY, maxX, maxY } = getElementBounds(el);
      const local = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);
      if (el.type === 'freehand') return el.points.some(p => getDistance(point, p) < 20);
      return local.x >= minX - 10 && local.x <= maxX + 10 && local.y >= minY - 10 && local.y <= maxY + 10;
    });

    if (clicked) {
      if (e.shiftKey) {
        setSelectedIds(prev => prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]);
      } else {
        if (!selectedIds.includes(clicked.id)) {
          setSelectedIds([clicked.id]);
        }
      }
      setActiveTool('select'); 
      interactionMode.current = 'dragging';
    } else {
      if (activeTool !== 'select') {
        setSelectedIds([]); interactionMode.current = 'drawing';
        currentElement.current = { 
          id: `el-${Date.now()}`, type: activeTool, points: [point, point],
          color: currentColor, rotation: 0, lineStyle: 'solid', opacity: 1.0,
          text: activeTool === 'text' ? "TEXTO TÁCTICO" : undefined
        };
      } else {
        setSelectedIds([]);
      }
    }
    redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (interactionMode.current === 'drawing' && currentElement.current) {
      if (activeTool === 'freehand') currentElement.current.points.push(point);
      else currentElement.current.points[1] = point;
    } else if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedIds[0]) return el;
        const { centerX, centerY, width: oldW, height: oldH } = getElementBounds(el);
        const local = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);
        const next = [...el.points];
        const h = activeHandleIndex.current!;
        const material = isMaterial(el.type);

        if (material) {
          const ratio = oldW / oldH;
          const dx = Math.abs(local.x - centerX) * 2;
          const dy = dx / ratio;
          next[0] = { x: centerX - dx/2, y: centerY - dy/2 };
          next[1] = { x: centerX + dx/2, y: centerY + dy/2 };
        } else {
          if ([0, 3, 5].includes(h)) next[0].x = local.x;
          if ([2, 4, 7].includes(h)) next[1].x = local.x;
          if ([0, 1, 2].includes(h)) next[0].y = local.y;
          if ([5, 6, 7].includes(h)) next[1].y = local.y;
        }
        return { ...el, points: next };
      }));
    } else if (interactionMode.current === 'rotating' && selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const { centerX, centerY } = getElementBounds(el);
        const angle = Math.atan2(point.y - centerY, point.x - centerX) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedIds[0] ? { ...e, rotation: angle } : e));
      }
    } else if (interactionMode.current === 'dragging' && selectedIds.length > 0 && lastPoint.current) {
      const dx = point.x - lastPoint.current.x; const dy = point.y - lastPoint.current.y;
      setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) } : el));
      lastPoint.current = point;
    }
    redrawAll();
  };

  const handlePointerUp = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (interactionMode.current === 'drawing' && currentElement.current) {
      setElements(prev => [...prev, currentElement.current!]);
      setSelectedIds([currentElement.current.id]);
      setActiveTool('select');
    }
    currentElement.current = null; interactionMode.current = 'none'; activeHandleIndex.current = null;
  };

  const handleSave = () => {
    toast({ title: isFromForm ? "DIAGRAMA_VINCULADO" : "DIAGRAMA_GUARDADO", description: "Ejercicio sincronizado correctamente." });
    if (isFromForm) setTimeout(() => router.back(), 1500);
  };

  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const hasMultipleSelected = selectedIds.length > 1;
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Tactical_Precision_v9.3</span>
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
                    value={[commonOpacity * 100]} 
                    min={10} 
                    max={100} 
                    step={1}
                    onValueChange={(val) => {
                      const newOpacity = val[0] / 100;
                      setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: newOpacity} : el));
                    }}
                    className="w-full"
                  />
                </div>

                {!hasMultipleSelected && selectedElements[0].type !== 'freehand' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn("h-9 border-white/10 text-[9px] font-black uppercase", selectedElements[0].lineStyle === 'dashed' ? 'bg-amber-500 text-black' : 'text-white/40')}
                    onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, lineStyle: el.lineStyle === 'solid' ? 'dashed' : 'solid'} : el))}
                  >
                    {selectedElements[0].lineStyle === 'dashed' ? 'Línea Discontinua' : 'Línea Sólida'}
                  </Button>
                )}

                {!hasMultipleSelected && selectedElements[0].type === 'text' && (
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Etiqueta</span>
                    <Input 
                      value={selectedElements[0].text || ""} 
                      onChange={(e) => setElements(prev => prev.map(el => el.id === selectedIds[0] ? {...el, text: e.target.value.toUpperCase()} : el))} 
                      className="h-7 w-32 bg-black/40 border-amber-500/20 text-amber-500 font-black text-[10px] p-2 rounded-lg" 
                    />
                  </div>
                )}

                {!hasMultipleSelected && selectedElements[0].type === 'player' && (
                  <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Dorsal</span>
                    <Input 
                      type="number" 
                      value={selectedElements[0].number || 1} 
                      onChange={(e) => setElements(prev => prev.map(el => el.id === selectedIds[0] ? {...el, number: parseInt(e.target.value)} : el))} 
                      className="h-7 w-12 bg-black/40 border-amber-500/20 text-amber-500 font-black text-xs text-center p-0 rounded-lg" 
                    />
                  </div>
                )}

                <div className="flex gap-1">
                  <Button 
                    variant="outline" size="icon" className="h-9 w-9 border-white/10 text-white/40 hover:text-white"
                    onClick={() => {
                      const newElements = selectedElements.map(el => ({ ...el, id: `el-${Date.now()}-${Math.random()}`, points: el.points.map(p => ({ x: p.x + 30, y: p.y + 30 })) }));
                      setElements(prev => [...prev, ...newElements]); 
                      setSelectedIds(newElements.map(e => e.id));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" size="icon" className="h-9 w-9 border-rose-500/20 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10"
                    onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
            <BoardToolbar 
              theme="amber" 
              variant="materials" 
              orientation="horizontal" 
              activeTool={activeTool} 
              onToolSelect={(tool) => { 
                if (tool !== 'select') addElementAtCenter(tool);
                setSelectedIds([]); 
              }} 
              className="border-2 shadow-2xl" 
            />
          </div>
          <div className="pointer-events-auto">
            <BoardToolbar 
              theme="amber" 
              variant="training" 
              orientation="horizontal" 
              activeTool={activeTool} 
              onToolSelect={(tool) => { 
                setActiveTool(tool);
                setSelectedIds([]);
              }} 
              onClear={() => { setElements([]); setSelectedIds([]); }} 
              className="border-2 shadow-2xl" 
            />
          </div>
        </div>
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
