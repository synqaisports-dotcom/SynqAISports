
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
    ctx.save();
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

    const p = element.points;
    if (p.length < 1) {
      ctx.restore();
      return;
    }

    const centerX = p[1] ? (p[0].x + p[1].x) / 2 : p[0].x;
    const centerY = p[1] ? (p[0].y + p[1].y) / 2 : p[0].y;
    const canRotate = !['freehand', 'circle', 'ball', 'cone', 'seta', 'ladder', 'hurdle', 'minigoal', 'pica', 'player'].includes(element.type);
    
    if (canRotate) {
      ctx.translate(centerX, centerY);
      ctx.rotate(element.rotation);
      ctx.translate(-centerX, -centerY);
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
        const radius = getDistance(p[0], p[1]);
        ctx.arc(p[0].x, p[0].y, radius, 0, 2 * Math.PI);
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
        // High Fidelity Athlete Chip
        ctx.shadowBlur = 15;
        ctx.shadowColor = hexToRgba(element.color, 0.5);
        ctx.beginPath();
        ctx.arc(p[0].x, p[0].y, 20, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p[0].x, p[0].y, 0, p[0].x, p[0].y, 20);
        grad.addColorStop(0, hexToRgba(element.color, 0.4));
        grad.addColorStop(1, hexToRgba(element.color, 0.1));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((element.number || 1).toString(), p[0].x, p[0].y);
        break;
      case 'ball':
        // Professional Ball with Pentagons
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        for(let i=0; i<5; i++){
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(i*Math.PI*2/5)*10, Math.sin(i*Math.PI*2/5)*10);
          ctx.stroke();
        }
        ctx.restore();
        break;
      case 'cone':
        // 3D Volumetric Cone
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        // Base
        ctx.beginPath();
        ctx.ellipse(0, 8, 14, 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(element.color, 0.8);
        ctx.fill();
        ctx.stroke();
        // Body
        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(0, -15);
        ctx.lineTo(10, 8);
        ctx.closePath();
        const coneGrad = ctx.createLinearGradient(-10, 0, 10, 0);
        coneGrad.addColorStop(0, element.color);
        coneGrad.addColorStop(0.5, '#fff');
        coneGrad.addColorStop(1, element.color);
        ctx.fillStyle = coneGrad;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      case 'seta':
        // Professional Disc Marker
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
        const setaGrad = ctx.createRadialGradient(0, -2, 0, 0, 0, 16);
        setaGrad.addColorStop(0, '#fff');
        setaGrad.addColorStop(0.3, element.color);
        setaGrad.addColorStop(1, hexToRgba(element.color, 0.8));
        ctx.fillStyle = setaGrad;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -2, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();
        ctx.restore();
        break;
      case 'ladder':
        // Realistic Agility Ladder (2 points)
        if (!p[1]) break;
        const dist = getDistance(p[0], p[1]);
        const ang = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        const stepWidth = 40;
        const stepGap = 25;
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.rotate(ang);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        // Side rails
        ctx.strokeRect(0, -stepWidth/2, dist, stepWidth);
        // Rungs
        ctx.lineWidth = 2;
        ctx.strokeStyle = element.color;
        for(let d=0; d<dist; d+=stepGap) {
          ctx.beginPath();
          ctx.moveTo(d, -stepWidth/2);
          ctx.lineTo(d, stepWidth/2);
          ctx.stroke();
        }
        ctx.restore();
        break;
      case 'hurdle':
        // 3D Training Hurdle (2 points for width)
        if (!p[1]) break;
        const hWidth = getDistance(p[0], p[1]);
        const hAng = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.rotate(hAng);
        ctx.strokeStyle = element.color;
        ctx.lineWidth = 5;
        // Arch
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(0, -10);
        ctx.lineTo(hWidth, -10);
        ctx.lineTo(hWidth, 10);
        ctx.stroke();
        // Feet
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';
        ctx.strokeRect(-5, 8, 10, 4);
        ctx.strokeRect(hWidth-5, 8, 10, 4);
        ctx.restore();
        break;
      case 'minigoal':
        // High Fidelity Mini Goal
        if (!p[1]) break;
        const gWidth = getDistance(p[0], p[1]);
        const gAng = Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        ctx.rotate(gAng);
        // Net
        ctx.beginPath();
        ctx.rect(0, -gWidth/4, gWidth, gWidth/2);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        for(let i=0; i<gWidth; i+=8) {
          ctx.moveTo(i, -gWidth/4); ctx.lineTo(i, gWidth/2);
        }
        ctx.stroke();
        // Frame
        ctx.setLineDash([]);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, -gWidth/4, gWidth, gWidth/2);
        ctx.restore();
        break;
      case 'pica':
        // Training Pole
        ctx.save();
        ctx.translate(p[0].x, p[0].y);
        // Base
        ctx.beginPath();
        ctx.arc(0, 15, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();
        // Pole
        const poleGrad = ctx.createLinearGradient(-3, 0, 3, 0);
        poleGrad.addColorStop(0, element.color);
        poleGrad.addColorStop(0.5, '#fff');
        poleGrad.addColorStop(1, element.color);
        ctx.fillStyle = poleGrad;
        ctx.fillRect(-3, -30, 6, 45);
        ctx.restore();
        break;
    }

    if (isSelected && element.type !== 'freehand') {
      ctx.restore();
      ctx.save();
      
      if (canRotate) {
        ctx.translate(centerX, centerY);
        ctx.rotate(element.rotation);
        ctx.translate(-centerX, -centerY);
      }

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      const isSinglePoint = ['ball', 'cone', 'seta', 'pica', 'player'].includes(element.type);

      if (element.type === 'rect' && p[1]) {
        ctx.strokeRect(p[0].x, p[0].y, p[1].x - p[0].x, p[1].y - p[0].y);
      } else if (isSinglePoint) {
        ctx.strokeRect(p[0].x - 25, p[0].y - 25, 50, 50);
      }

      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      
      let handles: Point[] = [];
      if (element.type === 'rect' && p[1]) {
        handles = [
          { x: p[0].x, y: p[0].y },
          { x: p[1].x, y: p[0].y },
          { x: p[1].x, y: p[1].y },
          { x: p[0].x, y: p[1].y }
        ];
      } else if (!isSinglePoint && p[1]) {
        handles = [p[0], p[p.length-1]];
      }

      handles.forEach(cp => {
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      if (canRotate && (p[1] || isSinglePoint)) {
        const rotX = p[1] ? (p[0].x + p[1].x) / 2 : p[0].x;
        const rotY = p[1] ? Math.min(p[0].y, p[1].y) - 35 : p[0].y - 35;
        ctx.beginPath();
        ctx.moveTo(rotX, p[1] ? Math.min(p[0].y, p[1].y) : p[0].y);
        ctx.lineTo(rotX, rotY);
        ctx.stroke();
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(rotX, rotY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }, []);

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
        const p = el.points;
        const centerX = p[1] ? (p[0].x + p[1].x) / 2 : p[0].x;
        const centerY = p[1] ? (p[0].y + p[1].y) / 2 : p[0].y;
        const localPoint = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);

        const isSinglePoint = ['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type);

        if (el.type !== 'circle' && (p[1] || isSinglePoint)) {
          const rotX = p[1] ? (el.points[0].x + el.points[1].x) / 2 : el.points[0].x;
          const rotY = p[1] ? Math.min(el.points[0].y, el.points[1].y) - 35 : el.points[0].y - 35;
          if (getDistance(point, rotatePoint({x: rotX, y: rotY}, {x: centerX, y: centerY}, el.rotation)) < 15) {
            interactionMode.current = 'rotating';
            return;
          }
        }

        let handles: Point[] = [];
        if (el.type === 'rect' && p[1]) {
          handles = [
            { x: el.points[0].x, y: el.points[0].y },
            { x: el.points[1].x, y: el.points[0].y },
            { x: el.points[1].x, y: el.points[1].y },
            { x: el.points[0].x, y: el.points[1].y }
          ];
        } else if (!isSinglePoint && p[1]) {
          handles = [el.points[0], el.points[el.points.length - 1]];
        }

        const handleIdx = handles.findIndex(hp => getDistance(localPoint, hp) < 15);
        if (handleIdx !== -1) {
          interactionMode.current = 'resizing';
          activeHandleIndex.current = handleIdx;
          return;
        }
      }
    }

    const clickedEl = [...elements].reverse().find(el => {
      const p = el.points;
      const centerX = p[1] ? (p[0].x + p[1].x) / 2 : p[0].x;
      const centerY = p[1] ? (p[0].y + p[1].y) / 2 : p[0].y;
      const localPoint = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);

      if (el.type === 'rect' && p[1]) {
        return localPoint.x >= Math.min(p[0].x, p[1].x) && localPoint.x <= Math.max(p[0].x, p[1].x) &&
               localPoint.y >= Math.min(p[0].y, p[1].y) && localPoint.y <= Math.max(p[0].y, p[1].y);
      }
      if (el.type === 'circle' && p[1]) {
        const radius = getDistance(p[0], p[1]);
        return getDistance(localPoint, p[0]) <= radius;
      }
      if (el.type === 'freehand') {
        return p.some(fp => getDistance(point, fp) < 15);
      }
      if (['ball', 'cone', 'seta', 'pica', 'player'].includes(el.type)) {
        return getDistance(point, p[0]) < 30;
      }
      if (p[1]) {
        return getDistance(localPoint, p[0]) < 30 || getDistance(localPoint, p[p.length-1]) < 30;
      }
      return getDistance(localPoint, p[0]) < 30;
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id);
      setActiveTool('select');
      interactionMode.current = 'dragging';
      if (clickedEl.type === 'freehand') {
        setIsPropertiesOpen(false);
      }
    } else {
      if (activeTool !== 'select') {
        const isSinglePoint = ['ball', 'cone', 'seta', 'pica', 'player'].includes(activeTool);
        setSelectedId(null);
        setIsPropertiesOpen(false);
        interactionMode.current = 'drawing';
        
        let playerNum;
        if(activeTool === 'player') {
          const playersCount = elements.filter(e => e.type === 'player').length;
          playerNum = playersCount + 1;
        }

        currentElement.current = { 
          id: `el-${Date.now()}`, 
          type: activeTool, 
          points: isSinglePoint ? [point] : [point, point], 
          color: currentColor,
          rotation: 0,
          lineStyle: 'solid',
          number: playerNum
        };
      } else {
        setSelectedId(null);
        setIsPropertiesOpen(false);
        interactionMode.current = 'none';
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (interactionMode.current === 'drawing' && currentElement.current) {
      const isSinglePoint = ['ball', 'cone', 'seta', 'pica', 'player'].includes(currentElement.current.type);
      if (!isSinglePoint) {
        if (activeTool === 'freehand') {
          currentElement.current.points.push(point);
        } else {
          currentElement.current.points[1] = point;
        }
      }
    } else if (interactionMode.current === 'resizing' && selectedId && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedId) return el;
        const centerX = (el.points[0].x + el.points[1].x) / 2;
        const centerY = (el.points[0].y + el.points[1].y) / 2;
        const localPoint = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);
        
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
        const centerX = el.points[1] ? (el.points[0].x + el.points[1].x) / 2 : el.points[0].x;
        const centerY = el.points[1] ? (el.points[0].y + el.points[1].y) / 2 : el.points[0].y;
        const angle = Math.atan2(point.y - centerY, point.x - centerX) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedId ? { ...e, rotation: angle } : e));
      }
    } else if (interactionMode.current === 'dragging' && selectedId && lastPoint.current) {
      const dx = point.x - lastPoint.current.x;
      const dy = point.y - lastPoint.current.y;
      setElements(prev => prev.map(el => {
        if (el.id !== selectedId) return el;
        return {
          ...el,
          points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
        };
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
    currentElement.current = null;
    interactionMode.current = 'none';
    activeHandleIndex.current = null;
    lastPoint.current = null;
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setIsPropertiesOpen(false);
    }
  };

  const duplicateElement = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newEl: DrawingElement = {
      ...el,
      id: `el-${Date.now()}`,
      points: el.points.map(p => ({ x: p.x + 20, y: p.y + 20 }))
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const toggleLineStyle = (id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, lineStyle: el.lineStyle === 'solid' ? 'dashed' : 'solid' } : el
    ));
  };

  const changeElementColor = (id: string, color: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, color } : el
    ));
  };

  const handleSave = () => {
    if (isFromForm) {
      toast({ title: "DIAGRAMA_VINCULADO", description: "Volviendo al formulario..." });
      setTimeout(() => router.back(), 1500);
    } else {
      toast({ title: "DIAGRAMA_GUARDADO", description: "Ejercicio guardado en biblioteca." });
    }
  };

  const selectedElement = elements.find(e => e.id === selectedId);
  const isSheetOpen = isPropertiesOpen || isLibraryOpen;

  const getActionTriggerPosition = () => {
    if (!selectedElement) return null;
    const p = selectedElement.points;
    let maxX, minY;
    
    if (selectedElement.type === 'freehand') {
      maxX = Math.max(...p.map(pt => pt.x));
      minY = Math.min(...p.map(pt => pt.y));
    } else if (['ball', 'cone', 'seta', 'pica', 'player'].includes(selectedElement.type)) {
      maxX = p[0].x;
      minY = p[0].y;
    } else if (p[1]) {
      maxX = Math.max(p[0].x, p[1].x);
      minY = Math.min(p[0].y, p[1].y);
    } else {
      maxX = p[0].x;
      minY = p[0].y;
    }
    
    return { x: maxX + 25, y: minY - 25 };
  };

  const triggerPos = getActionTriggerPosition();

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Exercise_Designer_IA_v8.3</span>
            </div>
            <h1 className="text-lg lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase">Estudio Profesional</h1>
          </div>

          {isFromForm && (
            <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2 animate-in fade-in zoom-in-95">
               <LinkIcon className="h-3 w-3 text-amber-500" />
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">VINCULADO_A_FORMULARIO</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}>
              <SelectTrigger className="w-[160px] h-11 bg-white/5 border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/5 transition-all">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Superficie" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                <SelectItem value="f11" className="text-[10px] font-black uppercase">Fútbol 11</SelectItem>
                <SelectItem value="f7" className="text-[10px] font-black uppercase">Fútbol 7</SelectItem>
                <SelectItem value="futsal" className="text-[10px] font-black uppercase">Fútbol Sala</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => setShowLanes(!showLanes)}
              className={cn(
                "h-11 px-4 border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                showLanes ? "bg-amber-500 text-black amber-glow" : "bg-white/5 text-amber-500/40 hover:text-amber-500"
              )}
            >
              <Columns3 className="h-4 w-4 mr-2" />
              Carriles
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button 
            onClick={handleSave}
            className="h-11 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-6 lg:px-8 rounded-xl amber-glow border-none"
          >
            <Save className="h-4 w-4 sm:mr-2" /> 
            <span className="hidden sm:inline">{isFromForm ? "Vincular a Tarea" : "Guardar Táctica"}</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex items-center justify-center relative overflow-hidden touch-none">
          <TacticalField theme="amber" fieldType={fieldType} showLanes={showLanes}>
            <canvas 
              ref={canvasRef}
              className={cn(
                "absolute inset-0 z-30",
                activeTool === 'select' ? "pointer-events-auto" : "pointer-events-auto cursor-crosshair"
              )}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            />

            {selectedId && triggerPos && !isPropertiesOpen && selectedElement?.type !== 'freehand' && (
              <div 
                className="absolute z-[100] transition-all duration-300 animate-in fade-in zoom-in-95 pointer-events-auto"
                style={{ left: triggerPos.x, top: triggerPos.y, transform: 'translateX(-50%)' }}
              >
                <button
                  onClick={() => setIsPropertiesOpen(true)}
                  className="h-10 w-10 bg-amber-500 text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-110 active:scale-95 transition-all amber-glow"
                  title="Abrir Propiedades"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            )}
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
                setActiveTool(tool);
                setSelectedId(null);
                setIsPropertiesOpen(false);
              }}
              className="amber-glow border-2" 
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
                if (tool !== 'select') {
                  setSelectedId(null);
                  setIsPropertiesOpen(false);
                }
              }}
              onClear={() => { setElements([]); setSelectedId(null); setIsPropertiesOpen(false); }}
              className="amber-glow border-2" 
            />
          </div>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={(open) => { 
          if(!open) { 
            setIsPropertiesOpen(false); 
            setIsLibraryOpen(false); 
          } 
        }}>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
            {isPropertiesOpen && selectedElement ? (
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-white/5 bg-amber-500/5">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Settings2 className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Node_Properties_v2.0</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                      PROPIEDADES
                    </SheetTitle>
                    <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                      Ajuste el estilo y comportamiento del objeto táctico.
                    </SheetDescription>
                  </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Palette className="h-4 w-4 text-amber-500/40" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Paleta de Identidad</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {COLORS.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => changeElementColor(selectedId!, c.value)}
                          className={cn(
                            "h-14 rounded-2xl border-2 transition-all flex items-center justify-center group",
                            selectedElement.color === c.value ? "border-white scale-105 shadow-lg" : "border-white/5 opacity-40 hover:opacity-100"
                          )}
                          style={{ backgroundColor: c.value }}
                        >
                          {selectedElement.color === c.value && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                        </button>
                      ))}
                    </div>
                  </section>

                  {selectedElement.type === 'player' && (
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <UserCircle className="h-4 w-4 text-amber-500/40" />
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Identidad Jugador</h3>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1">Dorsal / ID</Label>
                        <Input 
                          type="number"
                          value={selectedElement.number || 1}
                          onChange={(e) => setElements(prev => prev.map(el => el.id === selectedId ? {...el, number: parseInt(e.target.value)} : el))}
                          className="h-12 bg-white/5 border-amber-500/20 rounded-xl text-amber-500 font-bold"
                        />
                      </div>
                    </section>
                  )}

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Spline className="h-4 w-4 text-amber-500/40" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Configuración de Trazo</h3>
                    </div>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "w-full h-16 bg-white/5 border-white/10 rounded-2xl flex justify-between px-8 transition-all",
                        selectedElement.lineStyle === 'dashed' ? "bg-amber-500/10 border-amber-500/40 text-white" : "text-white/40"
                      )}
                      onClick={() => toggleLineStyle(selectedId!)}
                    >
                      <span className="text-[11px] font-black uppercase tracking-widest">Línea Discontinua</span>
                      {selectedElement.lineStyle === 'dashed' ? <Spline className="h-5 w-5 text-amber-500" /> : <Minus className="h-5 w-5" />}
                    </Button>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <Layers className="h-4 w-4 text-amber-500/40" />
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Acciones de Objeto</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <Button 
                        variant="outline"
                        className="h-16 bg-white/5 border-white/10 rounded-2xl text-white/60 font-black uppercase text-[11px] tracking-widest hover:bg-white/10 hover:text-white transition-all flex justify-between px-8"
                        onClick={() => duplicateElement(selectedId!)}
                      >
                        <span>Duplicar Elemento</span>
                        <Copy className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-16 bg-rose-500/5 border-rose-500/20 rounded-2xl text-rose-500/60 font-black uppercase text-[11px] tracking-widest hover:bg-rose-500/10 hover:text-rose-500 transition-all flex justify-between px-8"
                        onClick={() => deleteElement(selectedId!)}
                      >
                        <span>Eliminar del Campo</span>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </section>
                </div>

                <div className="p-10 bg-black/40 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">SINCRO_ID: {selectedElement.id.split('-')[1]}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-white/5 bg-black/40">
                  <SheetHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Library className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Asset_Library_v2.0</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                      BIBLIOTECA
                    </SheetTitle>
                    <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                      Material técnico sincronizado con el nodo local.
                    </SheetDescription>
                  </SheetHeader>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AssetPanel 
                    theme="amber" 
                    type="training" 
                    className="w-full h-full bg-transparent border-none rounded-none shadow-none" 
                  />
                </div>
              </div>
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
