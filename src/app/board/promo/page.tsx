
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
  ArrowRight
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
  const lastPoint = useRef<Point | null>(null);
  const interactionMode = useRef<'drawing' | 'dragging' | 'none'>('none');

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
    const newEl: DrawingElement = { 
      id: `el-${Date.now()}`, 
      type: tool, 
      points: [{ x: 0.45, y: 0.45 }, { x: 0.55, y: 0.55 }], 
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

  const toggleLineStyle = () => {
    const nextDashed = !isDashed;
    setIsDashed(nextDashed);
    if (selectedIds.length > 0) {
      setElements(prev => prev.map(el => selectedIds.includes(el.id) ? { ...el, lineStyle: nextDashed ? 'dashed' : 'solid' } : el));
    }
  };

  const handleSaveToBlock = (block: string) => {
    if (!saveFormData.title) {
      toast({ variant: "destructive", title: "ERROR", description: "Asigne un título antes de guardar." });
      return;
    }
    const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": []}');
    const newExercise = {
      id: Date.now(),
      block,
      elements,
      fieldType,
      metadata: saveFormData
    };
    vault.exercises = [newExercise, ...(vault.exercises || [])];
    localStorage.setItem("synq_promo_vault", JSON.stringify(vault));
    toast({ title: "SINCRO_LOCAL", description: `Ejercicio blindado en slot ${block.toUpperCase()}.` });
    setIsSaveSheetOpen(false);
  };

  const commonOpacity = elements.find(e => selectedIds.includes(e.id))?.opacity || 1.0;

  return (
    <div className="h-full w-full flex flex-col bg-black overflow-hidden relative">
      {/* FLOATING_HEADER_PROMO (Ultra-Compact v12.1) */}
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
            <button onClick={toggleLineStyle} className={cn("h-8 px-2 border rounded-lg text-[7px] font-black uppercase", isDashed ? "bg-primary text-black" : "border-primary/20 text-primary/40")}>{isDashed ? 'Discontinua' : 'Continua'}</button>
            <Slider value={[commonOpacity * 100]} min={10} max={100} onValueChange={(v) => setElements(prev => prev.map(el => selectedIds.includes(el.id) ? {...el, opacity: v[0]/100} : el))} className="w-12" />
            <button onClick={() => { setElements(prev => prev.filter(el => !selectedIds.includes(el.id))); setSelectedIds([]); }} className="text-rose-500/60 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )}

        <Button onClick={() => setIsSaveSheetOpen(true)} className="h-8 bg-primary text-black font-black uppercase text-[7px] tracking-widest px-4 rounded-lg blue-glow border-none">
          <Save className="h-3 w-3 mr-1.5" /> GUARDAR
        </Button>
      </header>

      {/* FULL_SCREEN_CANVAS_AREA */}
      <main className="flex-1 relative flex overflow-hidden">
        <TacticalField theme="cyan" fieldType={fieldType} showWatermark showLanes={showLanes}>
          <canvas ref={canvasRef} className="absolute inset-0 z-30 pointer-events-auto" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => interactionMode.current = 'none'} />
        </TacticalField>
      </main>

      {/* FLOATING_TOOLBARS_BOTTOM (Optimized for width v12.1) */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end gap-4 px-4 z-[100] pointer-events-none">
        <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="materials" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { addElement(t); }} /></div>
        <div className="pointer-events-auto"><BoardToolbar theme="cyan" variant="training" orientation="horizontal" activeTool={activeTool} onToolSelect={(t) => { if(t === 'select') { setActiveTool('select'); setSelectedIds([]); } else addElement(t); }} onClear={() => { setElements([]); setSelectedIds([]); }} /></div>
      </div>

      {/* SAVE_SHEET (Formulario de Paridad Pro) */}
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
