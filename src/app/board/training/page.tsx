
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Save, Loader2, LayoutGrid, ChevronLeft, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Point {
  x: number;
  y: number;
}

interface DrawingElement {
  type: DrawingTool;
  points: Point[];
  color: string;
}

export default function TrainingBoardPage() {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [activeTool, setActiveTool] = useState<DrawingTool>("freehand");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado de dibujo
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const currentElement = useRef<DrawingElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point | null>(null);

  const isFromForm = searchParams.get("source") === "form";

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    redrawAll();
  }, [elements]);

  const drawArrowhead = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
    const headLength = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const p = element.points;
    if (p.length < 2) return;

    switch (element.type) {
      case 'freehand':
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        for (let i = 1; i < p.length; i++) {
          ctx.lineTo(p[i].x, p[i].y);
        }
        ctx.stroke();
        break;
      case 'rect':
        ctx.strokeRect(p[0].x, p[0].y, p[p.length - 1].x - p[0].x, p[p.length - 1].y - p[0].y);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(p[p.length - 1].x - p[0].x, 2) + Math.pow(p[p.length - 1].y - p[0].y, 2));
        ctx.beginPath();
        ctx.arc(p[0].x, p[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
        ctx.stroke();
        drawArrowhead(ctx, p[0], p[p.length - 1]);
        break;
      case 'double-arrow':
        ctx.beginPath();
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
        ctx.stroke();
        drawArrowhead(ctx, p[0], p[p.length - 1]);
        drawArrowhead(ctx, p[p.length - 1], p[0]);
        break;
    }
  };

  const redrawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elements.forEach(el => drawElement(ctx, el));
    if (currentElement.current) {
      drawElement(ctx, currentElement.current);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver(() => initCanvas());
    observer.observe(canvas.parentElement);
    initCanvas();
    return () => observer.disconnect();
  }, [initCanvas]);

  const handleAiSync = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      toast({ title: "SINCRONIZACIÓN_IA_COMPLETA", description: "Análisis técnico Gemini finalizado." });
    }, 2000);
  };

  const handleSave = () => {
    if (isFromForm) {
      toast({ title: "DIAGRAMA_VINCULADO", description: "Volviendo al formulario..." });
      setTimeout(() => router.back(), 1500);
    } else {
      toast({ title: "DIAGRAMA_GUARDADO", description: "Ejercicio guardado en biblioteca." });
    }
  };

  const clearCanvas = () => {
    setElements([]);
    currentElement.current = null;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const startDrawing = (e: React.PointerEvent) => {
    if (activeTool === 'select' || !canvasRef.current) return;
    isDrawing.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    startPoint.current = point;
    currentElement.current = { type: activeTool, points: [point], color: currentColor };
  };

  const draw = (e: React.PointerEvent) => {
    if (!isDrawing.current || activeTool === 'select' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (activeTool === 'freehand') {
      currentElement.current?.points.push(currentPoint);
    } else {
      if (currentElement.current) {
        currentElement.current.points = [startPoint.current!, currentPoint];
      }
    }
    redrawAll();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    if (currentElement.current && currentElement.current.points.length >= 2) {
      setElements(prev => [...prev, currentElement.current!]);
    }
    currentElement.current = null;
    startPoint.current = null;
  };

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Exercise_Designer_IA_v2.0</span>
            </div>
            <h1 className="text-lg lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase">Estudio</h1>
          </div>

          {isFromForm && (
            <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2 animate-in fade-in zoom-in-95">
               <LinkIcon className="h-3 w-3 text-amber-500" />
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">VINCULADO_A_FORMULARIO</span>
            </div>
          )}

          <div className="hidden md:block">
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
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button 
            onClick={handleAiSync}
            disabled={isAiProcessing}
            className="h-11 bg-amber-500/10 border border-amber-500/40 text-amber-500 font-black uppercase text-[10px] tracking-widest px-4 lg:px-6 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
          >
            {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Sparkles className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">Sincronizar con IA</span>
          </Button>
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
        <BoardToolbar 
          theme="amber" 
          activeTool={activeTool}
          onToolSelect={setActiveTool}
          activeColor={currentColor}
          onColorSelect={setCurrentColor}
          onClear={clearCanvas}
          className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" 
        />

        <main className="flex-1 flex items-center justify-center relative overflow-hidden touch-none">
          <TacticalField theme="amber" fieldType={fieldType}>
            <canvas 
              ref={canvasRef}
              className={cn(
                "absolute inset-0 z-30",
                activeTool === 'select' ? "pointer-events-none" : "pointer-events-auto cursor-crosshair"
              )}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
            />
          </TacticalField>
        </main>

        <AssetPanel 
          theme="amber" 
          type="training" 
          className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex" 
        />
      </div>
    </div>
  );
}
