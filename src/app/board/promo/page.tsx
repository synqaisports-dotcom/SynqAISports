
"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
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
  MousePointerClick,
  Info,
  Save,
  Megaphone,
  CloudSun,
  Thermometer,
  Share2,
  Download,
  Database,
  Target,
  ClipboardList
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
  SheetDescription,
  SheetFooter, 
  SheetClose
} from "@/components/ui/sheet";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { synqSync } from "@/lib/sync-service";
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

  const [saveFormData, setSaveFormData] = useState({
    title: "", stage: "Alevín", dimension: "Táctica", objective: "", description: ""
  });

  const [promoStats, setPromoStats] = useState({ warmup: 0, main: 0, cooldown: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'resizing' | 'rotating' | 'dragging' | 'curving' | 'none'>('none');
  const activeHandleIndex = useRef<number | null>(null);

  useEffect(() => {
    const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
    const exercises = vault.exercises || [];
    setPromoStats({
      warmup: exercises.filter((e: any) => e.block === 'warmup').length,
      main: exercises.filter((e: any) => e.block === 'main').length,
      cooldown: exercises.filter((e: any) => e.block === 'cooldown').length,
    });
    if (exerciseId) {
      const target = exercises.find((e: any) => e.id.toString() === exerciseId);
      if (target) { setElements(target.elements || []); setFieldType(target.fieldType || "f11"); setSaveFormData(target.metadata || saveFormData); }
    }
  }, [exerciseId]);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getElementBounds = (element: DrawingElement, widthPx: number, heightPx: number) => {
    const p = element.points.map(pt => ({ x: pt.x * widthPx, y: pt.y * heightPx }));
    const minX = Math.min(...p.map(pt => pt.x)); const minY = Math.min(...p.map(pt => pt.y));
    const maxX = Math.max(...p.map(pt => pt.x)); const maxY = Math.max(...p.map(pt => pt.y));
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
  };

  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
    const pRaw = element.points; if (pRaw.length < 1) return;
    const wPx = ctx.canvas.width; const hPx = ctx.canvas.height;
    const b = getElementBounds(element, wPx, hPx);
    ctx.save(); ctx.globalAlpha = element.opacity; ctx.translate(b.centerX, b.centerY); ctx.rotate(element.rotation); ctx.translate(-b.centerX, -b.centerY);
    ctx.strokeStyle = element.color; ctx.fillStyle = hexToRgba(element.color, 0.15); ctx.lineWidth = 3;
    if (element.lineStyle === 'dashed') ctx.setLineDash([10, 5]); else ctx.setLineDash([]);
    
    if (element.type === 'player') {
      ctx.beginPath(); ctx.arc(b.centerX, b.centerY, Math.min(b.width, b.height)/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Space Grotesk'; ctx.textAlign = 'center'; ctx.fillText((element.number || 1).toString(), b.centerX, b.centerY + 4);
    } else if (element.type === 'ball') {
      ctx.beginPath(); ctx.arc(b.centerX, b.centerY, 5, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    } else if (element.type === 'rect') {
      ctx.strokeRect(b.minX, b.minY, b.width, b.height); ctx.fill();
    } else if (element.type === 'circle') {
      ctx.beginPath(); ctx.arc(b.centerX, b.centerY, b.width/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(element.points[0].x * wPx, element.points[0].y * hPx); ctx.lineTo(element.points[1].x * wPx, element.points[1].y * hPx); ctx.stroke();
    }

    if (isSelected) {
      ctx.strokeStyle = '#00f2ffaa'; ctx.setLineDash([5, 5]); ctx.strokeRect(b.minX - 5, b.minY - 5, b.width + 10, b.height + 10);
    } ctx.restore();
  }, [hexToRgba]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d'); if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(el => drawElement(ctx, el, selectedIds.includes(el.id)));
  }, [elements, selectedIds, drawElement]);

  useEffect(() => { redrawAll(); }, [elements, selectedIds, fieldType, showLanes, redrawAll]);

  const addElement = (tool: DrawingTool) => {
    const newEl: DrawingElement = { id: `el-${Date.now()}`, type: tool, points: [{ x: 0.45, y: 0.45 }, { x: 0.55, y: 0.55 }], color: currentColor, rotation: 0, lineStyle: 'solid', number: tool === 'player' ? elements.filter(e => e.type === 'player').length + 1 : undefined, opacity: 1.0 };
    setElements(prev => [...prev, newEl]); setSelectedIds([newEl.id]); setActiveTool('select');
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect();
    const p = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    const clicked = [...elements].reverse().find(el => {
      const b = getElementBounds(el, rect.width, rect.height);
      return p.x * rect.width >= b.minX && p.x * rect.width <= b.maxX && p.y * rect.height >= b.minY && p.y * rect.height <= b.maxY;
    });
    if (clicked) { setSelectedIds([clicked.id]); interactionMode.current = 'dragging'; lastPoint.current = p; }
    else setSelectedIds([]); redrawAll();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (interactionMode.current === 'dragging' && lastPoint.current) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const p = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
      const dx = p.x - lastPoint.current.x; const dy = p.y - lastPoint.current.y;
      setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, points: el.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) } : el));
      lastPoint.current = p; redrawAll();
    }
  };

  const commonOpacity = elements.find(e => selectedIds.includes(e.id))?.opacity || 1.0;

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden relative">
      {/* FLOATING_HEADER_PROMO */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-2xl border border-primary/30 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 duration-700">
        <div className="flex flex-col pr-4 border-r border-white/10 shrink-0">
          <div className="flex items-center gap-2"><Zap className="h-3 w-3 text-primary animate-pulse" /><span className="text-[8px] font-black text-primary tracking-[0.4em] uppercase">Promo_Sandbox</span></div>
          <h1 className="text-xs font-headline font-black text-white italic uppercase tracking-tighter leading-none">{exerciseId ? 'Modo Edición' : 'Lienzo Libre'}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={fieldType} onValueChange={(v: FieldType) => setFieldType(v)}><SelectTrigger className="w-[110px] h-9 bg-white/5 border-primary/20 rounded-xl text-[8px] font-black uppercase text-primary focus:ring-0"><LayoutGrid className="h-3 w-3 mr-2" /><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="f11" className="text-[9px] font-black">F11</SelectItem><SelectItem value="f7" className="text-[9px] font-black">F7</SelectItem><SelectItem value="futsal" className="text-[9px] font-black">FUTSAL</SelectItem></SelectContent></Select>
          <Button variant="ghost" onClick={() => setShowLanes(!showLanes)} className={cn("h-9 px-3 border border-primary/20 text-[8px] font-black uppercase rounded-xl", showLanes ? "bg-primary text-black" : "text-primary/40")}><Columns3 className="h-3.5 w-3.5 mr-2" /> Carriles</Button>
        </div>

        <div className="h-6 w-[1px] bg-white/10 mx-1" />

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
            <div className="flex gap-1">
              {COLORS.map(c => (
                <button key={c.id} onClick={() => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, color: c.value} : el))} className={cn("h-5 w-5 rounded-full border border-white/20", elements.find(e => selectedIds.includes(e.id))?.color === c.value && "border-white scale-110")} style={{ backgroundColor: c.value }} />
              ))}
            </div>
            <Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0]/100} : el))} className="w-16" />
            <button onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-rose-500/60 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
          </div>
        )}

        <Button onClick={() => setIsSaveSheetOpen(true)} className="h-10 bg-primary text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl blue-glow border-none">
          <Save className="h-3.5 w-3.5 mr-2" /> GUARDAR LOCAL
        </Button>
      </header>

      {/* FULL_SCREEN_CANVAS_AREA */}
      <main className="flex-1 relative flex overflow-hidden">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes}>
          <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => interactionMode.current = 'none'} />
        </TacticalField>
      </main>

      {/* FLOATING_TOOLBARS_BOTTOM */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center items-end gap-12 px-12 z-[100] pointer-events-none">
        <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { addElement(t); }} className="border shadow-2xl" /></div>
        <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="training" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { if(t === 'select') { setActiveTool('select'); setSelectedIds([]); } else addElement(t); }} onClear={() => { setElements([]); setSelectedIds([]); }} className="border shadow-2xl" /></div>
      </div>

      {/* SAVE_SHEET */}
      <Sheet open={isSaveSheetOpen} onOpenChange={setIsSaveSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)]">
          <SheetHeader className="p-6 border-b border-white/5">
            <SheetTitle className="text-2xl font-black italic uppercase tracking-tighter">VINCULAR_DATOS</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest">Título del Ejercicio</Label>
              <Input value={saveFormData.title} onChange={(e) => setSaveFormData({...saveFormData, title: e.target.value.toUpperCase()})} placeholder="EJ: RONDO 4X1" className="h-12 bg-white/5 border-primary/20 text-primary uppercase font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Etapa</Label><Select value={saveFormData.stage} onValueChange={(v) => setSaveFormData({...saveFormData, stage: v})}><SelectTrigger className="h-10 bg-black border-primary/20 text-[9px] uppercase"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20">{STAGES.map(s => <SelectItem key={s} value={s} className="text-[9px] uppercase">{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Dimensión</Label><Select value={saveFormData.dimension} onValueChange={(v) => setSaveFormData({...saveFormData, dimension: v})}><SelectTrigger className="h-10 bg-black border-primary/20 text-[9px] uppercase"><SelectValue /></SelectTrigger><SelectContent className="bg-[#0a0f18] border-primary/20"><SelectItem value="Táctica" className="text-[9px]">TÁCTICA</SelectItem><SelectItem value="Técnica" className="text-[9px]">TÉCNICA</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Consignas</Label><Textarea value={saveFormData.description} onChange={(e) => setSaveFormData({...saveFormData, description: e.target.value})} className="h-24 bg-black border-primary/20 text-primary text-[10px]" /></div>
            <div className="grid grid-cols-3 gap-2 pt-4">
              <Button onClick={() => toast({ title: 'SINCRO_LOCAL', description: 'Ejercicio blindado en slot Calentamiento.' })} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">WARMUP</Button>
              <Button onClick={() => toast({ title: 'SINCRO_LOCAL', description: 'Ejercicio blindado en slot Principal.' })} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">MAIN</Button>
              <Button onClick={() => toast({ title: 'SINCRO_LOCAL', description: 'Ejercicio blindado en slot Vuelta Calma.' })} className="h-14 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase hover:bg-primary hover:text-black">COOL</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function PromoBoardPage() {
  return <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-primary font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando_Sandbox...</div>}><PromoBoardContent /></Suspense>;
}
