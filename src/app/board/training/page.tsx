
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Sparkles, 
  Save, 
  Loader2, 
  LayoutGrid, 
  ChevronLeft, 
  Link as LinkIcon, 
  RotateCw, 
  Trash2, 
  MousePointer2, 
  Copy, 
  Type,
  Square,
  Circle as CircleIcon,
  ArrowUpRight,
  ArrowLeftRight,
  Pencil,
  Spline,
  Minus
} from "lucide-react";
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
  id: string;
  type: DrawingTool;
  points: Point[];
  color: string;
  rotation: number;
  lineStyle: 'solid' | 'dashed';
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

export default function TrainingBoardPage() {
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [fieldType, setFieldType] = useState<FieldType>("f11");
  const [activeTool, setActiveTool] = useState<DrawingTool>("select");
  const [currentColor, setCurrentColor] = useState("#facc15");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    if (p.length < 2) {
      ctx.restore();
      return;
    }

    const centerX = (p[0].x + p[1].x) / 2;
    const centerY = (p[0].y + p[1].y) / 2;
    const canRotate = element.type !== 'freehand' && element.type !== 'circle';
    
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
        const w = p[1].x - p[0].x;
        const h = p[1].y - p[0].y;
        ctx.rect(p[0].x, p[0].y, w, h);
        ctx.fill();
        ctx.stroke();
        break;
      case 'circle':
        const radius = getDistance(p[0], p[1]);
        ctx.arc(p[0].x, p[0].y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'arrow':
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([]);
        drawArrowhead(ctx, p[0], p[1]);
        ctx.stroke();
        break;
      case 'double-arrow':
        ctx.moveTo(p[0].x, p[0].y);
        ctx.lineTo(p[1].x, p[1].y);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([]);
        drawArrowhead(ctx, p[0], p[1]);
        drawArrowhead(ctx, p[1], p[0]);
        ctx.stroke();
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
      
      if (element.type === 'rect') {
        ctx.strokeRect(p[0].x, p[0].y, p[1].x - p[0].x, p[1].y - p[0].y);
      }

      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      
      let handles: Point[] = [];
      if (element.type === 'rect') {
        handles = [
          { x: p[0].x, y: p[0].y },
          { x: p[1].x, y: p[0].y },
          { x: p[1].x, y: p[1].y },
          { x: p[0].x, y: p[1].y }
        ];
      } else {
        handles = p;
      }

      handles.forEach(cp => {
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      if (canRotate) {
        const rotX = (p[0].x + p[1].x) / 2;
        const rotY = Math.min(p[0].y, p[1].y) - 30;
        ctx.beginPath();
        ctx.moveTo(rotX, Math.min(p[0].y, p[1].y));
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
        const centerX = (el.points[0].x + el.points[1].x) / 2;
        const centerY = (el.points[0].y + el.points[1].y) / 2;
        const localPoint = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);

        if (el.type !== 'circle') {
          const rotX = (el.points[0].x + el.points[1].x) / 2;
          const rotY = Math.min(el.points[0].y, el.points[1].y) - 30;
          if (getDistance(point, rotatePoint({x: rotX, y: rotY}, {x: centerX, y: centerY}, el.rotation)) < 15) {
            interactionMode.current = 'rotating';
            return;
          }
        }

        let handles: Point[] = [];
        if (el.type === 'rect') {
          handles = [
            { x: el.points[0].x, y: el.points[0].y },
            { x: el.points[1].x, y: el.points[0].y },
            { x: el.points[1].x, y: el.points[1].y },
            { x: el.points[0].x, y: el.points[1].y }
          ];
        } else {
          handles = el.points;
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
      const centerX = (p[0].x + (p[1]?.x || p[0].x)) / 2;
      const centerY = (p[0].y + (p[1]?.y || p[0].y)) / 2;
      const localPoint = rotatePoint(point, {x: centerX, y: centerY}, -el.rotation);

      if (el.type === 'rect') {
        return localPoint.x >= Math.min(p[0].x, p[1].x) && localPoint.x <= Math.max(p[0].x, p[1].x) &&
               localPoint.y >= Math.min(p[0].y, p[1].y) && localPoint.y <= Math.max(p[0].y, p[1].y);
      }
      if (el.type === 'circle') {
        const radius = getDistance(p[0], p[1]);
        return getDistance(localPoint, p[0]) <= radius;
      }
      if (el.type === 'freehand') {
        return p.some(fp => getDistance(point, fp) < 15);
      }
      return getDistance(localPoint, p[0]) < 25 || getDistance(localPoint, p[p.length-1]) < 25;
    });

    if (clickedEl) {
      setSelectedId(clickedEl.id);
      setActiveTool('select');
      interactionMode.current = 'dragging';
    } else {
      if (activeTool !== 'select') {
        setSelectedId(null);
        interactionMode.current = 'drawing';
        currentElement.current = { 
          id: `el-${Date.now()}`, 
          type: activeTool, 
          points: [point, point], 
          color: currentColor,
          rotation: 0,
          lineStyle: 'solid'
        };
      } else {
        setSelectedId(null);
        interactionMode.current = 'none';
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    if (interactionMode.current === 'drawing' && currentElement.current) {
      if (activeTool === 'freehand') {
        currentElement.current.points.push(point);
      } else {
        currentElement.current.points[1] = point;
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
          newPoints[activeHandleIndex.current!] = localPoint;
        }
        return { ...el, points: newPoints };
      }));
    } else if (interactionMode.current === 'rotating' && selectedId) {
      const el = elements.find(e => e.id === selectedId);
      if (el) {
        const centerX = (el.points[0].x + el.points[1].x) / 2;
        const centerY = (el.points[0].y + el.points[1].y) / 2;
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
    if (selectedId === id) setSelectedId(null);
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
  
  const getMenuPos = () => {
    if (!selectedElement) return null;
    const p = selectedElement.points;
    const centerX = (p[0].x + (p[1]?.x || p[0].x)) / 2;
    const centerY = (p[0].y + (p[1]?.y || p[0].y)) / 2;
    return {
      x: centerX,
      y: Math.min(p[0].y, (p[1]?.y || p[0].y)) - 80
    };
  };

  const actionMenuPos = getMenuPos();

  return (
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Exercise_Designer_IA_v2.0</span>
            </div>
            <h1 className="text-lg lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase">Estudio Profesional</h1>
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
          onClear={() => { setElements([]); setSelectedId(null); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" 
        />

        <main className="flex-1 flex items-center justify-center relative overflow-hidden touch-none">
          <TacticalField theme="amber" fieldType={fieldType}>
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

            {selectedElement && actionMenuPos && (
              <div 
                className="absolute z-[100] flex items-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                style={{ 
                  left: `${actionMenuPos.x}px`, 
                  top: `${actionMenuPos.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
                  {COLORS.map(c => (
                    <button 
                      key={c.id} 
                      onClick={() => changeElementColor(selectedId!, c.value)}
                      className={cn(
                        "h-5 w-5 rounded-full border border-white/10 transition-all",
                        selectedElement.color === c.value ? "scale-125 border-white ring-2 ring-white/20" : "opacity-40 hover:opacity-100"
                      )}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>

                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"
                  onClick={() => toggleLineStyle(selectedId!)}
                  title="Tipo de Línea"
                >
                  {selectedElement.lineStyle === 'solid' ? <Minus className="h-4 w-4" /> : <Spline className="h-4 w-4" />}
                </Button>

                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 text-white/40 hover:text-white"
                  onClick={() => duplicateElement(selectedId!)}
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button 
                  variant="ghost" size="icon" className="h-8 w-8 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10"
                  onClick={() => deleteElement(selectedId!)}
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
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
