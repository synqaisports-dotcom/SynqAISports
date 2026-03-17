
"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { 
  Zap, 
  Trash2, 
  Save,
  Columns3,
  LayoutGrid,
  Maximize2,
  X,
  Target,
  ClipboardList,
  ArrowRight,
  Copy,
  PencilLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  SheetClose
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

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

function PromoBoardContent() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("id");

  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [showLanes, setShowLanes] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#00f2ff");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [isSaveSheetOpen, setIsSaveSheetOpen] = useState(false);
  const [isDashed, setIsDashed] = useState(false);

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
    if (exerciseId) {
      const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
      const target = vault.exercises?.find((e: any) => e.id.toString() === exerciseId);
      if (target) { 
        setElements(target.elements || []); 
        setFieldType(target.fieldType || "f11"); 
        setSaveFormData(target.metadata || saveFormData); 
      }
    }
  }, [exerciseId]);

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

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const pRaw = element.points; if (pRaw.length < 1) return;
    const widthPx = ctx.canvas.width; const heightPx = ctx.canvas.height;
    const bounds = getElementBounds(element, widthPx, heightPx);
    const { centerX, centerY, width, height, minX, minY, maxX, maxY } = bounds;

    ctx.save(); ctx.globalAlpha = element.opacity; ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
    ctx.strokeStyle = element.color; ctx.fillStyle = hexToRgba(element.color, 0.15); ctx.lineWidth = 3;
    if (element.lineStyle === 'dashed') ctx.setLineDash([10, 5]); else ctx.setLineDash([]);

    switch (element.type) {
      case 'player':
        ctx.beginPath(); ctx.arc(centerX, centerY, width/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText((element.number || 1).toString(), centerX, centerY + 4);
        break;
      case 'ball':
        ctx.beginPath(); ctx.arc(centerX, centerY, 5, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
        break;
      case 'rect':
        ctx.beginPath(); ctx.rect(minX, minY, width, height); ctx.fill(); ctx.stroke();
        break;
      case 'circle':
        ctx.beginPath(); ctx.arc(centerX, centerY, width/2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        break;
      case 'arrow':
      case 'double-arrow':
      case 'zigzag':
        ctx.beginPath();
        const p0 = { x: element.points[0].x * widthPx, y: element.points[0].y * heightPx };
        const p1 = { x: element.points[1].x * widthPx, y: element.points[1].y * heightPx };
        if (element.controlPoint) {
          const cp = { x: element.controlPoint.x * widthPx, y: element.controlPoint.y * heightPx };
          ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(cp.x, cp.y, p1.x, p1.y);
        } else { ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); }
        ctx.stroke();
        break;
      case 'cone':
        ctx.beginPath(); ctx.moveTo(centerX - 10, maxY); ctx.lineTo(centerX + 10, maxY); ctx.lineTo(centerX, minY); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      case 'seta':
        ctx.beginPath(); ctx.ellipse(centerX, centerY, width/2, height/2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        break;
      case 'ladder':
        ctx.strokeRect(minX, minY, width, height);
        for(let i=1; i<5; i++) {
          const x = minX + (width * i / 5);
          ctx.beginPath(); ctx.moveTo(x, minY); ctx.lineTo(x, maxY); ctx.stroke();
        }
        break;
      case 'minigoal':
        ctx.strokeRect(minX, minY, width, height);
        ctx.setLineDash([2, 2]); ctx.strokeRect(minX + 2, minY + 2, width - 4, height - 4);
        break;
    }

    if (isSelected) {
      ctx.restore(); ctx.save(); ctx.translate(centerX, centerY); ctx.rotate(element.rotation); ctx.translate(-centerX, -centerY);
      ctx.strokeStyle = '#00f2ffaa'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]); const pad = 10; ctx.strokeRect(minX - pad, minY - pad, width + pad * 2, height + pad * 2);
      ctx.setLineDash([]); ctx.fillStyle = '#fff'; 
      const handles = [{ x: minX - pad, y: minY - pad }, { x: maxX + pad, y: minY - pad }, { x: minX - pad, y: maxY + pad }, { x: maxX + pad, y: maxY + pad }];
      handles.forEach(h => { ctx.beginPath(); ctx.arc(h.x, h.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(centerX, minY - pad - 20, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } ctx.restore();
  }, [hexToRgba]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(el => drawElement(ctx, el, selectedIds.includes(el.id)));
  }, [elements, selectedIds, drawElement]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const obs = new ResizeObserver(() => {
      if (canvas.parentElement) { 
        canvas.width = canvas.parentElement.clientWidth; 
        canvas.height = canvas.parentElement.clientHeight; 
        redrawAll(); 
      }
    });
    obs.observe(canvas.parentElement!); return () => obs.disconnect();
  }, [redrawAll]);

  useEffect(() => { redrawAll(); }, [elements, selectedIds, fieldType, showLanes, redrawAll]);

  const addElementAtCenter = (tool: DrawingTool) => {
    const canvasRatio = canvasRef.current ? (canvasRef.current.width / canvasRef.current.height) : 1.5;
    const defW = tool === 'ladder' ? 0.15 : (tool === 'text' ? 0.3 : 0.05);
    const defH = isCircular(tool) ? (defW * canvasRatio) : 0.05;
    const newEl: DrawingElement = { 
      id: `el-${Date.now()}`, 
      type: tool, 
      points: [{ x: 0.5 - defW/2, y: 0.5 - defH/2 }, { x: 0.5 + defW/2, y: 0.5 + defH/2 }], 
      controlPoint: ['arrow', 'double-arrow', 'zigzag'].includes(tool) ? { x: 0.5, y: 0.45 } : undefined,
      color: currentColor, 
      rotation: 0, 
      lineStyle: isDashed ? 'dashed' : 'solid', 
      number: tool === 'player' ? elements.filter(e => e.type === 'player').length + 1 : undefined, 
      opacity: 1.0 
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
        const bounds = getElementBounds(el, wPx, hPx);
        if (el.controlPoint) {
          const cpPx = { x: el.controlPoint.x * wPx, y: el.controlPoint.y * hPx };
          if (Math.sqrt(Math.pow(point.x * wPx - cpPx.x, 2) + Math.pow(point.y * hPx - cpPx.y, 2)) < 20) { interactionMode.current = 'curving'; return; }
        }
        const rotHandlePx = rotatePoint({ x: bounds.centerX, y: bounds.minY - 30 }, { x: bounds.centerX, y: bounds.centerY }, el.rotation);
        if (Math.sqrt(Math.pow(point.x * wPx - rotHandlePx.x, 2) + Math.pow(point.y * hPx - rotHandlePx.y, 2)) < 20) { interactionMode.current = 'rotating'; return; }
        
        const pad = 10;
        const handles = [{ x: bounds.minX - pad, y: bounds.minY - pad }, { x: bounds.maxX + pad, y: bounds.minY - pad }, { x: bounds.minX - pad, y: bounds.maxY + pad }, { x: bounds.maxX + pad, y: bounds.maxY + pad }];
        const hIdx = handles.findIndex(h => Math.sqrt(Math.pow(rotatePoint(h, { x: bounds.centerX, y: bounds.centerY }, el.rotation).x - point.x * wPx, 2) + Math.pow(rotatePoint(h, { x: bounds.centerX, y: bounds.centerY }, el.rotation).y - point.y * hPx, 2)) < 15);
        if (hIdx !== -1) { interactionMode.current = 'resizing'; activeHandleIndex.current = hIdx; return; }
      }
    }

    const clicked = [...elements].reverse().find(el => {
      const b = getElementBounds(el, wPx, hPx); const local = rotatePoint({ x: point.x * wPx, y: point.y * hPx }, { x: b.centerX, y: b.centerY }, -el.rotation);
      return local.x >= b.minX - 10 && local.x <= b.maxX + 10 && local.y >= b.minY - 10 && local.y <= b.maxY + 10;
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
    const point = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height }; const wPx = rect.width; const hPx = rect.height;

    if (interactionMode.current === 'resizing' && selectedIds.length === 1 && activeHandleIndex.current !== null) {
      setElements(prev => prev.map(el => {
        if (el.id !== selectedIds[0]) return el;
        const next = [...el.points]; const h = activeHandleIndex.current!;
        if ([0, 2].includes(h)) next[0].x = point.x; else next[1].x = point.x;
        if ([0, 1].includes(h)) next[0].y = point.y; else next[1].y = point.y;
        return { ...el, points: next };
      }));
    } else if (interactionMode.current === 'curving' && selectedIds.length === 1) setElements(prev => prev.map(el => el.id === selectedIds[0] ? { ...el, controlPoint: point } : el));
    else if (interactionMode.current === 'rotating' && selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]); if (el) {
        const b = getElementBounds(el, wPx, hPx); const angle = Math.atan2(point.y * hPx - b.centerY, point.x * wPx - b.centerX) + Math.PI / 2;
        setElements(prev => prev.map(e => e.id === selectedIds[0] ? { ...e, rotation: angle } : e));
      }
    } else if (interactionMode.current === 'dragging' && selectedIds.length > 0 && lastPoint.current) {
      const dx = point.x - lastPoint.current.x; const dy = point.y - lastPoint.current.y;
      setElements(prev => prev.map(el => {
        if (!selectedIds.includes(el.id)) return el;
        const next = { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
        if (el.controlPoint) next.controlPoint = { x: el.controlPoint.x + dx, y: el.controlPoint.y + dy };
        return next;
      })); lastPoint.current = point;
    } redrawAll();
  };

  const handlePointerUp = () => { isDrawing.current = false; interactionMode.current = 'none'; activeHandleIndex.current = null; };

  const handleSaveToBlock = (block: string) => {
    if (!saveFormData.title) { toast({ variant: "destructive", title: "ERROR", description: "Asigne un título antes de guardar." }); return; }
    const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
    const newExercise = { id: Date.now(), block, elements, fieldType, metadata: saveFormData };
    vault.exercises = [newExercise, ...(vault.exercises || [])];
    localStorage.setItem("synq_promo_vault", JSON.stringify(vault));
    toast({ title: "SINCRO_LOCAL", description: `Ejercicio blindado en slot ${block.toUpperCase()}.` });
    setIsSaveSheetOpen(false);
  };

  const commonOpacity = elements.find(e => selectedIds.includes(e.id))?.opacity || 1.0;

  return (
    <div className="h-full w-full flex flex-col bg-black overflow-hidden relative">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-2xl animate-in slide-in-from-top-2">
        <div className="flex flex-col pr-3 border-r border-white/10 shrink-0">
          <div className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary animate-pulse" /><span className="text-[7px] font-black text-primary tracking-widest uppercase italic">Promo_Mode</span></div>
          <h1 className="text-[10px] font-headline font-black text-white italic uppercase leading-none">{exerciseId ? 'Edición' : 'Sandbox'}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}><SelectTrigger className="w-[100px] h-8 bg-white/5 border-primary/20 rounded-lg text-[7px] font-black uppercase text-primary focus:ring-0 px-2"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="f11" className="text-[8px] font-black">F11</SelectItem><SelectItem value="f7" className="text-[8px] font-black">F7</SelectItem><SelectItem value="futsal" className="text-[8px] font-black">FUTSAL</SelectItem></SelectContent></Select>
          <Button variant="ghost" onClick={() => setShowLanes(!showLanes)} className={cn("h-8 px-2 border border-primary/20 text-[7px] font-black uppercase rounded-lg", showLanes ? "bg-primary text-black" : "text-primary/40")}><Columns3 className="h-3 w-3 mr-1" /> Carriles</Button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 border-l border-white/10 pl-3 animate-in zoom-in-95 duration-200">
            <div className="flex gap-1">
              {COLORS.map(c => (
                <button key={c.id} onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))} className={cn("h-4 w-4 rounded-full border border-white/20", elements.find(e => selectedIds.includes(e.id))?.color === c.value && "border-white scale-110")} style={{ backgroundColor: c.value }} />
              ))}
            </div>
            <button onClick={() => { const next = !isDashed; setIsDashed(next); setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, lineStyle: next ? 'dashed' : 'solid'} : el)); }} className={cn("h-8 px-2 border rounded-lg text-[7px] font-black uppercase", isDashed ? "bg-primary text-black" : "border-primary/20 text-primary/40")}>{isDashed ? 'Discontinua' : 'Continua'}</button>
            <Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0]/100} : el))} className="w-12" />
            <button onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-rose-500/60 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <Button onClick={() => setIsSaveSheetOpen(true)} className="h-8 bg-primary text-black font-black uppercase text-[7px] tracking-widest px-4 rounded-lg blue-glow border-none">
          <Save className="h-3 w-3 mr-1.5" /> GUARDAR
        </Button>
      </header>

      <main className="flex-1 relative flex overflow-hidden">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes}>
          <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} />
        </TacticalField>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end gap-4 px-4 z-[100] pointer-events-none">
        <div className="pointer-events-auto">
          <BoardToolbar theme="cyan" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { addElementAtCenter(t); }} />
        </div>
        <div className="pointer-events-auto">
          <BoardToolbar theme="cyan" variant="training" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { if(t === 'select') { setActiveTool('select'); setSelectedIds([]); } else addElementAtCenter(t); }} onClear={() => { setElements([]); setSelectedIds([]); }} />
        </div>
      </div>

      <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Technical_Sheet_Sync_v1.1</span>
              </div>
              <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">VINCULAR <span className="text-primary">DATOS</span></SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Título del Ejercicio</Label>
                <Input value={saveFormData.title} onChange={(e) => setSaveFormData({...saveFormData, title: e.target.value.toUpperCase()})} placeholder="EJ: SALIDA DE BALÓN 4-3-3" className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary text-lg" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Etapa Federativa</Label>
                  <Select value={saveFormData.stage} onValueChange={(v) => setSaveFormData({...saveFormData, stage: v})}>
                    <SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20">{STAGES.map(s => <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Dimensión</Label>
                  <Select value={saveFormData.dimension} onValueChange={(v) => setSaveFormData({...saveFormData, dimension: v})}>
                    <SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem><SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem><SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Objetivo Táctico Primario</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3.5 h-4 w-4 text-primary/40" />
                  <Input value={saveFormData.objective} onChange={(e) => setSaveFormData({...saveFormData, objective: e.target.value.toUpperCase()})} placeholder="EJ: GENERAR SUPERIORIDAD" className="pl-10 h-12 bg-black/40 border-primary/20 rounded-xl font-bold uppercase text-xs text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Consignas para el Equipo</Label>
                <Textarea value={saveFormData.description} onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})} placeholder="Explique la dinámica..." className="min-h-[120px] bg-black/40 border-primary/20 rounded-2xl font-bold text-primary" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">BLOQUE METODOLÓGICO LOCAL</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => handleSaveToBlock('warmup')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">WARMUP</Button>
                <Button onClick={() => handleSaveToBlock('main')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">MAIN</Button>
                <Button onClick={() => handleSaveToBlock('cooldown')} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">COOL</Button>
              </div>
            </div>
          </div>

          <div className="p-8 bg-black/60 border-t border-white/5">
            <SheetClose asChild>
              <Button variant="ghost" className="w-full h-16 border border-primary/20 text-primary/60 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-primary/5">CERRAR_TERMINAL</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function PromoBoardPage() {
  return <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-primary font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando_Sandbox...</div>}><PromoBoardContent /></Suspense>;
}
