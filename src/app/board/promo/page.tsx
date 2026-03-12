
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Zap, 
  Lock, 
  ArrowRight, 
  Sparkles, 
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
  MousePointerClick
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { TacticalField, FieldType } from "@/components/board/TacticalField";
import { BoardToolbar, DrawingTool } from "@/components/board/BoardToolbar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Point {
  x: number; // 0.0 to 1.0 (Normalized)
  y: number; // 0.0 to 1.0 (Normalized)
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

const isMaterial = (type: DrawingTool) => 
  ['player', 'ball', 'cone', 'seta', 'ladder', 'hurdle', 'minigoal', 'pica', 'barrier'].includes(type);

const isCircular = (type: DrawingTool) => 
  ['player', 'ball', 'circle', 'seta'].includes(type);

export default function PromoBoardPage() {
  const [exercisesCount, setExercisesCount] = useState(2);
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const MAX_EXERCISES = 4;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'curving' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  const isLocked = exercisesCount >= MAX_EXERCISES;

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
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

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const pRaw = element.points; if (pRaw.length < 1) return;
    const widthPx = ctx.canvas.width; const heightPx = ctx.canvas.height;
    const p = pRaw.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const bounds = getElementBounds(element, widthPx, heightPx);
    const { centerX, centerY, width, height, minX, minY, maxX, maxY } = bounds;

    ctx.save(); ctx.globalAlpha = element.opacity; ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
    ctx.strokeStyle = element.color; ctx.fillStyle = hexToRgba(element.color, 0.15); ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (element.lineStyle === 'dashed') ctx.setLineDash([10, 5]); else ctx.setLineDash([]);

    switch (element.type) {
      case 'text':
        ctx.save(); ctx.setLineDash([]); ctx.fillStyle = element.color; ctx.font = `bold ${Math.floor(height || 24)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(element.text || "TEXTO TÁCTICO", centerX, centerY); ctx.restore(); break;
      case 'freehand':
        ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y); ctx.stroke(); break;
      case 'rect': ctx.beginPath(); ctx.rect(minX, minY, width, height); ctx.fill(); ctx.stroke(); break;
      case 'circle':
        ctx.beginPath();
        const radius = Math.min(width, height) / 2;
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill(); ctx.stroke(); break;
      case 'arrow':
      case 'double-arrow':
      case 'zigzag':
        ctx.beginPath();
        if (element.controlPoint) {
          const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          ctx.moveTo(p[0].x, p[0].y); ctx.quadraticCurveTo(cp.x, cp.y, p[1].x, p[1].y);
        } else ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        const head = 15;
        let angle = element.controlPoint ? Math.atan2(p[1].y - (element.controlPoint.y * heightPx), p[1].x - (element.controlPoint.x * widthPx)) : Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x);
        ctx.setLineDash([]); const drawH = (tx: number, ty: number, ang: number) => {
          ctx.beginPath(); ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang - Math.PI / 6), ty - head * Math.sin(ang - Math.PI / 6));
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx - head * Math.cos(ang + Math.PI / 6), ty - head * Math.sin(ang + Math.PI / 6)); ctx.stroke();
        };
        drawH(p[1].x, p[1].y, angle);
        if (element.type === 'double-arrow') {
          const startAngle = element.controlPoint ? Math.atan2(p[0].y - (element.controlPoint.y * heightPx), p[0].x - (element.controlPoint.x * widthPx)) : angle + Math.PI;
          drawH(p[0].x, p[0].y, startAngle);
        }
        break;
      case 'cross-arrow':
        ctx.save(); ctx.translate(centerX, centerY); const cS = Math.min(width, height) / 2; const th = cS * 0.35; const aH = cS * 0.4;
        const dCB = (isV: boolean) => {
          ctx.beginPath(); if (isV) { ctx.moveTo(-th/2, -cS + aH); ctx.lineTo(th/2, -cS + aH); ctx.lineTo(th/2, cS - aH); ctx.lineTo(-th/2, cS - aH); }
          else { ctx.moveTo(-cS + aH, -th/2); ctx.lineTo(cS - aH, -th/2); ctx.lineTo(cS - aH, th/2); ctx.lineTo(-cS + aH, th/2); }
          ctx.closePath(); const barG = ctx.createLinearGradient(isV ? -th/2 : -cS, isV ? -cS : -th/2, isV ? th/2 : cS, isV ? cS : th/2);
          barG.addColorStop(0, element.color); barG.addColorStop(0.5, '#ffffffaa'); barG.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = barG; ctx.fill(); ctx.stroke();
        };
        const dAH = (tx: number, ty: number, rot: number) => {
          ctx.save(); ctx.translate(tx, ty); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-aH, aH); ctx.lineTo(aH, aH); ctx.closePath();
          const headG = ctx.createLinearGradient(-aH, 0, aH, aH); headG.addColorStop(0, element.color); headG.addColorStop(0.5, '#ffffffaa'); headG.addColorStop(1, hexToRgba(element.color, 0.8));
          ctx.fillStyle = headG; ctx.fill(); ctx.stroke(); ctx.restore();
        };
        dCB(false); dCB(true); dAH(0, -cS, 0); dAH(cS, 0, Math.PI/2); dAH(0, cS, Math.PI); dAH(-cS, 0, -Math.PI/2); ctx.restore(); break;
      case 'player':
        ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = hexToRgba(element.color, 0.4);
        const pRadius = Math.min(width, height) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pRadius, 0, Math.PI * 2);
        const pGrad = ctx.createRadialGradient(centerX - pRadius/3, centerY - pRadius/3, 0, centerX, centerY, pRadius);
        pGrad.addColorStop(0, '#ffffff44'); pGrad.addColorStop(0.5, hexToRgba(element.color, 0.3)); pGrad.addColorStop(1, hexToRgba(element.color, 0.1));
        ctx.fillStyle = pGrad; ctx.fill(); ctx.strokeStyle = element.color; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.floor(pRadius * 0.64)}px Space Grotesk`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((element.number || 1).toString(), centerX, centerY + (pRadius * 0.04)); ctx.restore(); break;
      case 'ball':
        ctx.save(); ctx.translate(centerX, centerY); 
        const bRadius = Math.min(width, height) / 2;
        ctx.scale(bRadius/40, bRadius/40);
        ctx.beginPath(); ctx.arc(0, 5, 40, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
        const bG = ctx.createRadialGradient(-15, -15, 0, 0, 0, 40);
        bG.addColorStop(0, '#ffffff'); bG.addColorStop(1, '#E2E8F0');
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fillStyle = bG; ctx.fill();
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        [[50,10,35,25], [50,10,65,25], [50,90,35,75], [50,90,65,75], [10,50,25,35], [10,50,25,65], [90,50,75,35], [90,50,75,65]].forEach(pat => { ctx.moveTo(pat[0]-50, pat[1]-50); ctx.lineTo(pat[2]-50, pat[3]-50); });
        ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.restore(); break;
      case 'cone':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/50, height/50);
        ctx.beginPath(); ctx.ellipse(0, 15, 25, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 12, 20, 8, 0, 0, Math.PI * 2); ctx.fillStyle = '#ea580c'; ctx.fill();
        const cGrad = ctx.createLinearGradient(-20, 0, 20, 0);
        cGrad.addColorStop(0, '#ea580c'); cGrad.addColorStop(0.5, '#fb923c'); cGrad.addColorStop(1, '#9a3412');
        ctx.beginPath(); ctx.moveTo(-15, 12); ctx.lineTo(15, 12); ctx.lineTo(2, -30); ctx.lineTo(-2, -30); ctx.closePath();
        ctx.fillStyle = cGrad; ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.fillRect(-8, -5, 16, 6); ctx.fillRect(-4, -20, 8, 4);
        ctx.restore(); break;
      case 'barrier':
        ctx.save(); ctx.translate(centerX, centerY);
        const bw = width / 3;
        for (let i = -1; i <= 1; i++) {
          ctx.save(); ctx.translate(i * bw * 0.8, 0); ctx.beginPath(); ctx.ellipse(0, 0, bw/2, height/2, 0, 0, Math.PI * 2);
          const bGrad = ctx.createLinearGradient(-bw/2, 0, bw/2, 0);
          bGrad.addColorStop(0, hexToRgba(element.color, 0.8)); bGrad.addColorStop(0.5, element.color); bGrad.addColorStop(1, hexToRgba(element.color, 0.6));
          ctx.fillStyle = bGrad; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
        } ctx.restore(); break;
      case 'ladder':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/200, height/50); ctx.strokeStyle = '#334155'; ctx.lineWidth = 5; ctx.strokeRect(-100, -25, 200, 50);
        ctx.lineWidth = 3; ctx.strokeStyle = element.color; for(let x=-100; x<=100; x+=40) { ctx.beginPath(); ctx.moveTo(x, -25); ctx.lineTo(x, 25); ctx.stroke(); } ctx.restore(); break;
      case 'hurdle':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/60, height/30); ctx.strokeStyle = element.color; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(-30, 15); ctx.lineTo(-30, -15); ctx.lineTo(30, -15); ctx.lineTo(30, 15); ctx.stroke(); ctx.restore(); break;
      case 'minigoal':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/100, height/60); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(-50, -30, 100, 60);
        ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        for(let i=-50; i<50; i+=10) { ctx.beginPath(); ctx.moveTo(i, -30); ctx.lineTo(i, 30); ctx.stroke(); }
        for(let j=-30; j<30; j+=10) { ctx.beginPath(); ctx.moveTo(-50, j); ctx.lineTo(50, j); ctx.stroke(); }
        ctx.setLineDash([]); ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 5; ctx.strokeRect(-50, -30, 100, 60); ctx.restore(); break;
      case 'pica':
        ctx.save(); ctx.translate(centerX, centerY); ctx.scale(width/36, height/80); ctx.beginPath(); ctx.arc(0, 30, 18, 0, Math.PI * 2); ctx.fillStyle = '#334155'; ctx.fill(); ctx.fillStyle = element.color; ctx.fillRect(-4, -40, 8, 70); ctx.restore(); break;
      case 'seta':
        ctx.save(); ctx.translate(centerX, centerY); 
        const sSize = Math.min(width, height);
        ctx.scale(sSize/44, sSize/20);
        ctx.beginPath(); ctx.ellipse(0, 5, 22, 10, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, Math.PI * 2);
        const sG = ctx.createRadialGradient(0, -5, 0, 0, 0, 22);
        sG.addColorStop(0, '#ffffff'); sG.addColorStop(0.3, element.color); sG.addColorStop(1, hexToRgba(element.color, 0.8));
        ctx.fillStyle = sG; ctx.fill(); ctx.restore();
        break;
    }

    if (isSelected) {
      ctx.restore(); ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
      ctx.strokeStyle = '#00f2ffaa'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); const pad = 10; ctx.strokeRect(minX - pad, minY - pad, width + pad * 2, height + pad * 2);
      ctx.setLineDash([]); ctx.fillStyle = '#fff'; const handles = [{ x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad }, { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY }, { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }];
      handles.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      const rotY = minY - pad - 40; ctx.beginPath(); ctx.moveTo(centerX, minY - pad); ctx.lineTo(centerX, rotY); ctx.stroke();
      ctx.fillStyle = '#00f2ff'; ctx.beginPath(); ctx.arc(centerX, rotY, 8, 0, Math.PI * 2); ctx.fill();
      if (element.controlPoint && ['arrow', 'double-arrow', 'zigzag'].includes(element.type)) {
        const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
        ctx.restore(); ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = '#00f2ffaa'; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(cp.x, cp.y); ctx.stroke();
        ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.arc(cp.x, cp.y, 8, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }, [hexToRgba]);

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
    const canvas = canvasRef.current; if (!canvas) return;
    const obs = new ResizeObserver(() => {
      if (canvas.parentElement) { canvas.width = canvas.parentElement.clientWidth; canvas.height = canvas.parentElement.clientHeight; redrawAll(); }
    });
    obs.observe(canvas.parentElement!); return () => obs.disconnect();
  }, [redrawAll]);

  useEffect(() => { redrawAll(); }, [elements, selectedIds, fieldType, redrawAll]);

  const addElementAtCenter = (tool: DrawingTool) => {
    if (isLocked) return; 
    const pNum = tool === 'player' ? elements.filter(e => e.type === 'player').length + 1 : undefined;
    const canvasRatio = canvasRef.current ? (canvasRef.current.width / canvasRef.current.height) : 1.5;
    const defW = tool === 'ladder' ? 0.15 : (['minigoal', 'cross-arrow', 'barrier'].includes(tool) ? 0.1 : tool === 'text' ? 0.3 : 0.05);
    const defH = isCircular(tool) ? (defW * canvasRatio) : (tool === 'ladder' ? 0.05 : (['minigoal', 'cross-arrow', 'barrier'].includes(tool) ? 0.08 : 0.05));
    const newEl: DrawingElement = { id: `el-${Date.now()}`, type: tool, points: [{ x: 0.5 - defW/2, y: 0.5 - defH/2 }, { x: 0.5 + defW/2, y: 0.5 + defH/2 }], controlPoint: ['arrow', 'double-arrow', 'zigzag'].includes(tool) ? { x: 0.5, y: 0.45 } : undefined, color: currentColor, rotation: 0, lineStyle: 'solid', number: pNum, opacity: 1.0, text: tool === 'text' ? "CONSIGNA PROMO" : undefined };
    setElements(prev => [...prev, newEl]); setSelectedIds([newEl.id]); setActiveTool('select');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current || isLocked) return; const rect = canvasRef.current.getBoundingClientRect();
    const p = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    startPoint.current = p; lastPoint.current = p; isDrawing.current = true; const wPx = rect.width; const hPx = rect.height;

    if (selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el) {
        const bounds = getElementBounds(el, wPx, hPx); if (el.controlPoint) {
          const cpPx = { x: el.controlPoint.x * wPx, y: el.controlPoint.y * hPx };
          if (Math.sqrt(Math.pow(p.x * wPx - cpPx.x, 2) + Math.pow(p.y * hPx - cpPx.y, 2)) < 20) { interactionMode.current = 'curving'; return; }
        }
        const rotHandlePx = rotatePoint({ x: bounds.centerX, y: bounds.minY - 50 }, { x: bounds.centerX, y: bounds.centerY }, el.rotation);
        if (Math.sqrt(Math.pow(p.x * wPx - rotHandlePx.x, 2) + Math.pow(p.y * hPx - rotHandlePx.y, 2)) < 20) { interactionMode.current = 'rotating'; return; }
        const local = rotatePoint({ x: p.x * wPx, y: p.y * hPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
        const pad = 10; const handles = [{ x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.centerX, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad }, { x: bounds.minX - pad, y: bounds.centerY }, { x: bounds.maxX + pad, y: bounds.centerY }, { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.centerX, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }];
        const hIdx = handles.findIndex(h => Math.sqrt(Math.pow(local.x - h.x, 2) + Math.pow(local.y - h.y, 2)) < 15);
        if (hIdx !== -1) { interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return; }
      }
    }

    const clicked = [...elements].reverse().find(el => {
      const b = getElementBounds(el, wPx, hPx); const l = rotatePoint({ x: p.x * wPx, y: p.y * hPx }, { x: b.centerX, y: b.centerY }, -el.rotation);
      const hitPadding = el.type === 'text' ? 25 : 10;
      return l.x >= b.minX - hitPadding && l.x <= b.maxX + hitPadding && l.y >= b.minY - hitPadding && l.y <= b.maxY + hitPadding;
    });

    if (clicked) {
      if (e.shiftKey) setSelectedIds(prev => prev.includes(clicked.id) ? prev.filter(id => id !== clicked.id) : [...prev, clicked.id]);
      else setSelectedIds([clicked.id]);
      setActiveTool('select'); interactionMode.current = 'dragging';
    } else setSelectedIds([]);
    redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const p = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }; const wPx = rect.width; const hPx = rect.height;
    if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedIds[0]) return el; 
        const bounds = getElementBounds(el, wPx, hPx); 
        const local = rotatePoint({ x: p.x * wPx, y: p.y * hPx }, { x: bounds.centerX, y: bounds.centerY }, -el.rotation);
        const next = [...el.points]; const h = activeHandleIndex.current!;
        if (isCircular(el.type)) {
          const dxPx = Math.abs(local.x - bounds.centerX) * 2;
          const dyPx = dxPx;
          next[0] = { x: (bounds.centerX - dxPx/2) / wPx, y: (bounds.centerY - dyPx/2) / hPx }; 
          next[1] = { x: (bounds.centerX + dxPx/2) / wPx, y: (bounds.centerY + dyPx/2) / hPx };
        } else if (isMaterial(el.type)) {
          const ratio = bounds.width / bounds.height; const dx = Math.abs(local.x - bounds.centerX) * 2; const dy = dx / ratio;
          next[0] = { x: (bounds.centerX - dx/2) / wPx, y: (bounds.centerY - dy/2) / hPx }; next[1] = { x: (bounds.centerX + dx/2) / wPx, y: (bounds.centerY + dy/2) / hPx };
        } else {
          const p0Px = { x: next[0].x * wPx, y: next[0].y * hPx }; const p1Px = { x: next[1].x * wPx, y: next[1].y * hPx };
          if ([0, 3, 5].includes(h)) p0Px.x = local.x; if ([2, 4, 7].includes(h)) p1Px.x = local.x; if ([0, 1, 2].includes(h)) p0Px.y = local.y; if ([5, 6, 7].includes(h)) p1Px.y = local.y;
          next[0] = { x: p0Px.x / wPx, y: p0Px.y / hPx }; next[1] = { x: p1Px.x / wPx, y: p1Px.y / hPx };
        } return { ...el, points: next };
      }));
    } else if (interactionMode.current === 'curving') setElements(prev => prev.map(el => el.id === selectedIds[0] ? {...el, controlPoint: p} : el));
    else if (interactionMode.current === 'rotating') {
      const el = elements.find(e => e.id === selectedIds[0]); if(el) {
        const b = getElementBounds(el, wPx, hPx); const ang = Math.atan2(p.y * hPx - b.centerY, p.x * wPx - b.centerX) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedIds[0] ? {...e, rotation: ang} : e));
      }
    } else if (interactionMode.current === 'dragging' && lastPoint.current) {
      const dx = p.x - lastPoint.current.x; const dy = p.y - lastPoint.current.y;
      setElements(prev => prev.map(el => {
        if (!selectedIds.includes(el.id)) return el; const next = { ...el, points: el.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
        if (el.controlPoint) next.controlPoint = { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy }; return next;
      })); lastPoint.current = p;
    } redrawAll();
  };

  const handlePointerUp = () => { isDrawing.current = false; interactionMode.current = 'none'; activeHandleIndex.current = null; };
  const selectedElements = elements.filter(e => selectedIds.includes(e.id));
  const commonOpacity = selectedElements.length > 0 ? selectedElements[0].opacity : 1.0;

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-primary/20 bg-black/40 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-4 lg:gap-6 overflow-hidden">
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary animate-pulse" /><span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Tactical_Board_v9.8.6</span></div>
            <h1 className="text-sm lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">Free</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}><SelectTrigger className="w-[150px] h-10 bg-white/5 border-primary/20 rounded-xl text-[10px] font-black uppercase text-primary"><LayoutGrid className="h-3 w-3 mr-2" /> <SelectValue placeholder="Superficie" /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="f11" className="text-[10px] font-black uppercase">Fútbol 11</SelectItem><SelectItem value="f7" className="text-[10px] font-black uppercase">Fútbol 7</SelectItem><SelectItem value="futsal" className="text-[10px] font-black uppercase">Fútbol Sala</SelectItem></SelectContent></Select>
            <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-3"><span className="text-[9px] font-black text-primary uppercase">CAPACIDAD:</span><div className="h-1.5 w-16 lg:w-24 bg-black/40 rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", isLocked ? "bg-rose-500" : "bg-primary")} style={{ width: `${(exercisesCount / MAX_EXERCISES) * 100}%` }} /></div><span className="text-[10px] font-black text-white">{exercisesCount}/{MAX_EXERCISES}</span></div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-white/10 animate-in fade-in duration-300 overflow-hidden">
              {selectedElements.length === 1 && selectedElements[0].type === 'text' ? (
                <div className="flex items-center gap-2 px-3 bg-black/40 border border-primary/30 rounded-2xl">
                  <Type className="h-4 w-4 text-primary" />
                  <Input 
                    value={selectedElements[0].text || ""} 
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, text: val } : el));
                    }}
                    placeholder="ESCRIBIR CONSIGN..."
                    className="h-10 w-48 lg:w-64 bg-transparent border-none text-primary font-black uppercase text-[11px] focus-visible:ring-0 placeholder:text-primary/20"
                  />
                </div>
              ) : (
                <div className="flex gap-1 p-1 bg-black/40 border border-white/5 rounded-xl mr-2">
                  {COLORS.map(c => (
                    <button key={c.id} onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))} className={cn("h-6 w-6 rounded-full border-2 transition-all", selectedElements.every(el => el.color === c.value) ? "border-white scale-110" : "border-transparent opacity-40 hover:opacity-100")} style={{ backgroundColor: c.value }} />
                  ))}
                </div>
              )}
              
              <div className="flex flex-col gap-2 w-24 lg:w-32 px-2 hidden lg:flex">
                <div className="flex justify-between items-center"><span className="text-[8px] font-black text-white/40 uppercase">Opacidad</span><span className="text-[8px] font-black text-primary">{Math.round(commonOpacity * 100)}%</span></div>
                <Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0] / 100} : el))} />
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 border-white/10 text-white/40 hover:text-white" 
                  onClick={() => { 
                    const next = selectedElements.map(el => {
                      const newId = `el-${Date.now()}-${Math.random()}`;
                      const newPoints = el.points.map(p => ({ x: p.x + 0.02, y: p.y + 0.02 }));
                      let newNumber = el.number;
                      if (el.type === 'player' && el.number !== undefined) {
                        newNumber = el.number + 1;
                      }
                      return { ...el, id: newId, points: newPoints, number: newNumber };
                    }); 
                    setElements(prev => [...prev, ...next]); 
                    setSelectedIds(next.map(e => e.id)); 
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 border-rose-500/20 text-rose-500/40 hover:text-rose-500" onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 lg:gap-4 shrink-0"><Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-4 lg:px-8 rounded-xl cyan-glow border-none" asChild><Link href="/login">Acceso Pro <ArrowRight className="h-4 w-4 ml-2" /></Link></Button></div>
      </header>
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex items-center justify-center relative overflow-hidden touch-none">
          <TacticalField theme="cyan" fieldType={fieldType} showWatermark><canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} /></TacticalField>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-end gap-12 px-12 z-50 pointer-events-none">
            <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { addElementAtCenter(t); setSelectedIds([]); }} className="border-2 shadow-2xl" /></div>
            <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="training" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { if(t === 'select') { setActiveTool('select'); setSelectedIds([]); } else addElementAtCenter(t); }} onClear={() => { setElements([]); setSelectedIds([]); }} className="border-2 shadow-2xl" /></div>
          </div>
          {isLocked && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 lg:p-12 text-center space-y-6 animate-in fade-in duration-700">
              <div className="relative"><div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" /><Lock className="h-16 w-16 lg:h-20 lg:w-20 text-primary relative z-10" /></div>
              <h3 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter">Protocolo de Capacidad Lleno</h3>
              <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] max-w-md mx-auto leading-relaxed">Has alcanzado el límite de {MAX_EXERCISES} sesiones. Sincronizada tu club con el Plan Élite para desbloquear almacenamiento ilimitado y funciones IA.</p>
              <Button className="h-14 lg:h-16 bg-primary text-black font-black uppercase text-[10px] lg:text-[11px] tracking-[0.3em] px-8 lg:px-12 rounded-2xl cyan-glow border-none" asChild><Link href="/login">Actualizar a Plan Pro <Sparkles className="h-4 w-4 ml-3" /></Link></Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
