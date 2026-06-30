'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Arrow, Rect, Group, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  ArrowRight,
  BoxSelect,
  Check,
  Minus,
  MousePointer2,
  Spline,
  Square,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FieldBackground } from '@/components/methodology/drawing/FieldBackground';
import {
  MATERIAL_CATALOG,
  getMaterialImage,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import {
  DEFAULT_STROKE,
  FIELD_TEMPLATES,
  type DrawingElement,
  type ExerciseDrawingDocument,
  type FieldTemplate,
  type StrokeStyle,
  type StudioTool,
  computeFieldRect,
  defaultDraftForTool,
  isMaterialTool,
  isShapeTool,
  normToPx,
  parseExerciseDrawing,
  pxToNorm,
  serializeExerciseDrawing,
  wavePathPoints,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  initialData?: unknown;
  onClose: () => void;
  onSave: (json: string) => void;
};

const SHAPE_TOOLS: { id: StudioTool; label: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Seleccionar', icon: <MousePointer2 className="size-5" /> },
  { id: 'shape-line', label: 'Línea', icon: <Minus className="size-5" /> },
  { id: 'shape-arrow', label: 'Flecha', icon: <ArrowRight className="size-5" /> },
  { id: 'shape-curve', label: 'Curva', icon: <Spline className="size-5" /> },
  { id: 'shape-wave', label: 'Ondas', icon: <Waves className="size-5" /> },
  { id: 'shape-rect', label: 'Zona', icon: <Square className="size-5" /> },
];

const COLORS = ['#fbbf24', '#38bdf8', '#f87171', '#4ade80', '#ffffff', '#a78bfa'];

export function ExerciseDrawingStudio({ open, initialData, onClose, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [doc, setDoc] = useState<ExerciseDrawingDocument>(() => parseExerciseDrawing(initialData));
  const [tool, setTool] = useState<StudioTool>('select');
  const [stroke, setStroke] = useState<StrokeStyle>(DEFAULT_STROKE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DrawingElement | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [materialImages, setMaterialImages] = useState<Partial<Record<MaterialKind, HTMLImageElement>>>({});
  const [activeDock, setActiveDock] = useState<'tools' | 'materials' | null>('tools');

  useEffect(() => {
    if (!open) return;
    setDoc(parseExerciseDrawing(initialData));
    setSelectedId(null);
    setDraft(null);
    setTool('select');
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    void Promise.all(MATERIAL_CATALOG.map(async ({ kind }) => [kind, await getMaterialImage(kind)] as const)).then(
      (entries) => setMaterialImages(Object.fromEntries(entries))
    );
  }, [open]);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.max(320, width), height: Math.max(240, height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [open]);

  const fieldRect = useMemo(
    () => computeFieldRect(size.width, size.height, doc.field, 32),
    [size, doc.field]
  );

  const selected = doc.elements.find((el) => el.id === selectedId) ?? null;

  const attachTransformer = useCallback(
    (node: Konva.Node | null) => {
      const tr = transformerRef.current;
      if (!tr) return;
      if (node && (selected?.type === 'material' || selected?.type === 'shape-rect')) {
        tr.nodes([node]);
      } else {
        tr.nodes([]);
      }
      tr.getLayer()?.batchDraw();
    },
    [selected?.type]
  );

  const getPointerNorm = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return pxToNorm(pos.x, pos.y, fieldRect);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const clickedOnEmpty = e.target === stage || e.target.name() === 'field-hit';
    const norm = getPointerNorm(stage);
    if (!norm) return;

    if (tool === 'select') {
      if (clickedOnEmpty) setSelectedId(null);
      return;
    }

    if (isMaterialTool(tool)) {
      const el = defaultDraftForTool(tool, norm.x, norm.y, norm.x, norm.y, stroke);
      if (!el) return;
      setDoc((d) => ({ ...d, elements: [...d.elements, el] }));
      setSelectedId(el.id);
      setTool('select');
      return;
    }

    if (isShapeTool(tool)) {
      setDragStart(norm);
      const el = defaultDraftForTool(tool, norm.x, norm.y, norm.x, norm.y, stroke);
      setDraft(el);
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!dragStart || !draft) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const norm = getPointerNorm(stage);
    if (!norm) return;

    if (draft.type === 'shape-line') {
      setDraft({ ...draft, x2: norm.x, y2: norm.y });
    } else if (draft.type === 'shape-curve') {
      setDraft({
        ...draft,
        x2: norm.x,
        y2: norm.y,
        cx: (draft.x1 + norm.x) / 2,
        cy: Math.min(draft.y1, norm.y) - 0.06,
      });
    } else if (draft.type === 'shape-wave') {
      setDraft({ ...draft, x2: norm.x, y2: norm.y });
    } else if (draft.type === 'shape-rect') {
      setDraft({
        ...draft,
        x: Math.min(dragStart.x, norm.x),
        y: Math.min(dragStart.y, norm.y),
        width: Math.max(0.02, Math.abs(norm.x - dragStart.x)),
        height: Math.max(0.02, Math.abs(norm.y - dragStart.y)),
      });
    }
  };

  const handleStageMouseUp = () => {
    if (draft) {
      setDoc((d) => ({ ...d, elements: [...d.elements, draft] }));
      setSelectedId(draft.id);
      setDraft(null);
      setDragStart(null);
      setTool('select');
    }
  };

  const updateElement = (id: string, patch: Partial<DrawingElement>) => {
    setDoc((d) => ({
      ...d,
      elements: d.elements.map((el) => (el.id === id ? ({ ...el, ...patch } as DrawingElement) : el)),
    }));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setDoc((d) => ({ ...d, elements: d.elements.filter((el) => el.id !== selectedId) }));
    setSelectedId(null);
  };

  if (!open) return null;

  const dashArray = (s: StrokeStyle) => (s.dash ? [10, 6] : undefined);

  const renderElement = (element: DrawingElement, isPreview = false) => {
    const key = isPreview ? `draft-${element.id}` : element.id;

    if (element.type === 'shape-line') {
      const p1 = normToPx(element.x1, element.y1, fieldRect);
      const p2 = normToPx(element.x2, element.y2, fieldRect);
      if (element.arrowEnd || element.arrowStart) {
        return (
          <Arrow
            key={key}
            points={[p1.x, p1.y, p2.x, p2.y]}
            stroke={element.style.color}
            strokeWidth={element.style.width}
            dash={dashArray(element.style)}
            fill={element.style.color}
            pointerLength={10}
            pointerWidth={10}
            onClick={() => !isPreview && setSelectedId(element.id)}
          />
        );
      }
      return (
        <Line
          key={key}
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          lineCap="round"
          onClick={() => !isPreview && setSelectedId(element.id)}
        />
      );
    }

    if (element.type === 'shape-curve') {
      const p1 = normToPx(element.x1, element.y1, fieldRect);
      const p2 = normToPx(element.x2, element.y2, fieldRect);
      const pc = normToPx(element.cx, element.cy, fieldRect);
      const path = `M ${p1.x} ${p1.y} Q ${pc.x} ${pc.y} ${p2.x} ${p2.y}`;
      return (
        <Group key={key} onClick={() => !isPreview && setSelectedId(element.id)}>
          <Line
            points={[p1.x, p1.y, pc.x, pc.y, p2.x, p2.y]}
            stroke={element.style.color}
            strokeWidth={element.style.width}
            dash={dashArray(element.style)}
            tension={0.4}
            bezier
            lineCap="round"
          />
          {element.arrowEnd ? (
            <Arrow
              points={[pc.x, pc.y, p2.x, p2.y]}
              stroke={element.style.color}
              strokeWidth={element.style.width}
              fill={element.style.color}
              pointerLength={8}
              pointerWidth={8}
            />
          ) : null}
          {selectedId === element.id && !isPreview ? (
            <Circle
              x={pc.x}
              y={pc.y}
              radius={8}
              fill="#22d3ee"
              stroke="#0f172a"
              strokeWidth={2}
              draggable
              onDragMove={(e) => {
                const n = pxToNorm(e.target.x(), e.target.y(), fieldRect);
                updateElement(element.id, { cx: n.x, cy: n.y });
              }}
            />
          ) : null}
        </Group>
      );
    }

    if (element.type === 'shape-wave') {
      const p1 = normToPx(element.x1, element.y1, fieldRect);
      const p2 = normToPx(element.x2, element.y2, fieldRect);
      const amp = element.amplitude * fieldRect.width;
      const pts = wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp);
      return (
        <Line
          key={key}
          points={pts}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          lineCap="round"
          onClick={() => !isPreview && setSelectedId(element.id)}
        />
      );
    }

    if (element.type === 'shape-rect') {
      const p = normToPx(element.x, element.y, fieldRect);
      const w = element.width * fieldRect.width;
      const h = element.height * fieldRect.height;
      return (
        <Rect
          key={key}
          id={element.id}
          x={p.x}
          y={p.y}
          width={w}
          height={h}
          rotation={element.rotation}
          offsetX={0}
          offsetY={0}
          fill={element.fill}
          opacity={element.fillOpacity}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          draggable={tool === 'select'}
          onClick={() => setSelectedId(element.id)}
          onDragEnd={(e) => {
            const n = pxToNorm(e.target.x(), e.target.y(), fieldRect);
            updateElement(element.id, { x: n.x, y: n.y });
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const n = pxToNorm(node.x(), node.y(), fieldRect);
            updateElement(element.id, {
              x: n.x,
              y: n.y,
              width: Math.max(0.02, (node.width() * node.scaleX()) / fieldRect.width),
              height: Math.max(0.02, (node.height() * node.scaleY()) / fieldRect.height),
              rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
          ref={(node) => {
            if (selectedId === element.id) attachTransformer(node);
          }}
        />
      );
    }

    if (element.type === 'material') {
      const img = materialImages[element.material];
      const p = normToPx(element.x, element.y, fieldRect);
      const scale = element.scale * (fieldRect.width * 0.09);
      return (
        <Group
          key={key}
          id={element.id}
          x={p.x}
          y={p.y}
          rotation={element.rotation}
          draggable={tool === 'select'}
          onClick={() => setSelectedId(element.id)}
          onDragEnd={(e) => {
            const n = pxToNorm(e.target.x(), e.target.y(), fieldRect);
            updateElement(element.id, { x: n.x, y: n.y });
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const n = pxToNorm(node.x(), node.y(), fieldRect);
            updateElement(element.id, {
              x: n.x,
              y: n.y,
              rotation: node.rotation(),
              scale: element.scale * Math.max(node.scaleX(), node.scaleY()),
            });
            node.scaleX(1);
            node.scaleY(1);
          }}
          ref={(node) => {
            if (selectedId === element.id) attachTransformer(node);
          }}
        >
          {img ? (
            <KonvaImage image={img} width={scale} height={scale} offsetX={scale / 2} offsetY={scale / 2} />
          ) : (
            <Circle radius={scale / 2} fill="#334155" />
          )}
        </Group>
      );
    }

    return null;
  };

  const renderAnchors = () => {
    if (!selected || tool !== 'select') return null;
    if (selected.type === 'shape-line') {
      const anchors = [
        { role: 'start', x: selected.x1, y: selected.y1 },
        { role: 'end', x: selected.x2, y: selected.y2 },
      ];
      return anchors.map((a) => {
        const p = normToPx(a.x, a.y, fieldRect);
        return (
          <Circle
            key={a.role}
            x={p.x}
            y={p.y}
            radius={9}
            fill="#22d3ee"
            stroke="#0f172a"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const n = pxToNorm(e.target.x(), e.target.y(), fieldRect);
              if (a.role === 'start') updateElement(selected.id, { x1: n.x, y1: n.y });
              else updateElement(selected.id, { x2: n.x, y2: n.y });
            }}
          />
        );
      });
    }
    if (selected.type === 'shape-wave' || selected.type === 'shape-curve') {
      const anchors = [
        { role: 'start', x: selected.x1, y: selected.y1 },
        { role: 'end', x: selected.x2, y: selected.y2 },
      ];
      return anchors.map((a) => {
        const p = normToPx(a.x, a.y, fieldRect);
        return (
          <Circle
            key={a.role}
            x={p.x}
            y={p.y}
            radius={9}
            fill="#22d3ee"
            stroke="#0f172a"
            strokeWidth={2}
            draggable
            onDragMove={(e) => {
              const n = pxToNorm(e.target.x(), e.target.y(), fieldRect);
              if (a.role === 'start') updateElement(selected.id, { x1: n.x, y1: n.y });
              else updateElement(selected.id, { x2: n.x, y2: n.y });
            }}
          />
        );
      });
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#070b14] text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold tracking-wide text-primary">Pizarra SynqAI</p>
          <select
            value={doc.field}
            onChange={(e) => setDoc((d) => ({ ...d, field: e.target.value as FieldTemplate }))}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs"
          >
            {(Object.keys(FIELD_TEMPLATES) as FieldTemplate[]).map((key) => (
              <option key={key} value={key}>
                {FIELD_TEMPLATES[key].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              onSave(serializeExerciseDrawing(doc));
              onClose();
            }}
          >
            <Check className="size-4" />
            Guardar
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </header>

      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute"
          style={{
            left: fieldRect.x,
            top: fieldRect.y,
            width: fieldRect.width,
            height: fieldRect.height,
          }}
        >
          <FieldBackground template={doc.field} className="h-full w-full shadow-2xl" />
        </div>

        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={handleStageMouseDown}
          onMousemove={handleStageMouseMove}
          onMouseup={handleStageMouseUp}
          onTouchStart={handleStageMouseDown}
          onTouchMove={handleStageMouseMove}
          onTouchEnd={handleStageMouseUp}
          className="absolute inset-0 cursor-crosshair"
        >
          <Layer>
            <Rect
              name="field-hit"
              x={fieldRect.x}
              y={fieldRect.y}
              width={fieldRect.width}
              height={fieldRect.height}
              fill="rgba(0,0,0,0.001)"
            />
            {doc.elements.map((el) => renderElement(el))}
            {draft ? renderElement(draft, true) : null}
            {renderAnchors()}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              borderStroke="#22d3ee"
              anchorStroke="#22d3ee"
              anchorFill="#67e8f9"
            />
          </Layer>
        </Stage>
      </div>

      {/* Propiedades flotantes — formas */}
      {selected &&
      (selected.type === 'shape-line' ||
        selected.type === 'shape-curve' ||
        selected.type === 'shape-wave' ||
        selected.type === 'shape-rect') ? (
        <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 flex max-w-[95vw] flex-wrap justify-center gap-3 rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            Grosor
            <input
              type="range"
              min={1}
              max={8}
              value={selected.style.width}
              onChange={(e) => {
                const width = Number(e.target.value);
                updateElement(selected.id, { style: { ...selected.style, width } });
              }}
              className="w-24"
            />
          </label>
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={selected.style.dash}
              onChange={(e) => {
                updateElement(selected.id, { style: { ...selected.style, dash: e.target.checked } });
              }}
            />
            Discontinua
          </label>
          {selected.type === 'shape-line' ? (
            <>
              <label className="pointer-events-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selected.arrowStart}
                  onChange={(e) => updateElement(selected.id, { arrowStart: e.target.checked })}
                />
                Punta inicio
              </label>
              <label className="pointer-events-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selected.arrowEnd}
                  onChange={(e) => updateElement(selected.id, { arrowEnd: e.target.checked })}
                />
                Punta fin
              </label>
            </>
          ) : null}
          {selected.type === 'shape-curve' ? (
            <label className="pointer-events-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={selected.arrowEnd}
                onChange={(e) => updateElement(selected.id, { arrowEnd: e.target.checked })}
              />
              Punta fin
            </label>
          ) : null}
          <div className="pointer-events-auto flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="size-6 rounded-full border border-white/20"
                style={{ backgroundColor: c }}
                onClick={() => {
                  updateElement(selected.id, { style: { ...selected.style, color: c } });
                }}
              />
            ))}
          </div>
          <Button type="button" size="sm" variant="destructive" className="pointer-events-auto h-8" onClick={deleteSelected}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : null}

      {/* Propiedades flotantes — material */}
      {selected && selected.type === 'material' ? (
        <div className="pointer-events-none absolute bottom-28 left-1/2 z-20 flex max-w-[95vw] flex-wrap justify-center gap-3 rounded-2xl border border-white/15 bg-black/70 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            Escala
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={selected.scale}
              onChange={(e) => updateElement(selected.id, { scale: Number(e.target.value) })}
              className="w-24"
            />
          </label>
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            Rotación
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(e) => updateElement(selected.id, { rotation: Number(e.target.value) })}
              className="w-24"
            />
          </label>
          {selected.material.startsWith('player') ? (
            <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
              Etiqueta
              <input
                type="text"
                maxLength={3}
                value={selected.label ?? ''}
                onChange={(e) => updateElement(selected.id, { label: e.target.value })}
                className="w-12 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-center text-xs"
              />
            </label>
          ) : null}
          <Button type="button" size="sm" variant="destructive" className="pointer-events-auto h-8" onClick={deleteSelected}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : null}

      {/* Botoneras flotantes */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center gap-3 px-4">
        <div className="pointer-events-auto flex max-w-[95vw] flex-col gap-2">
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveDock(activeDock === 'materials' ? null : 'materials')}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-medium shadow-xl backdrop-blur-xl transition-all',
                activeDock === 'materials'
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-white/15 bg-black/75 text-foreground hover:border-primary/40'
              )}
            >
              Material
            </button>
            <button
              type="button"
              onClick={() => setActiveDock(activeDock === 'tools' ? null : 'tools')}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-medium shadow-xl backdrop-blur-xl transition-all',
                activeDock === 'tools'
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-white/15 bg-black/75 text-foreground hover:border-primary/40'
              )}
            >
              Herramientas
            </button>
          </div>

          {activeDock === 'tools' ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-black/80 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap justify-center gap-1.5">
                {SHAPE_TOOLS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => {
                      setTool(item.id);
                      setSelectedId(null);
                    }}
                    className={cn(
                      'flex size-11 items-center justify-center rounded-xl border transition-colors',
                      tool === item.id
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/5 hover:border-primary/30'
                    )}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-2 text-xs text-muted-foreground">
                <label className="flex items-center gap-2">
                  Grosor
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={stroke.width}
                    onChange={(e) => setStroke((s) => ({ ...s, width: Number(e.target.value) }))}
                    className="w-20"
                  />
                </label>
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={stroke.dash}
                    onChange={(e) => setStroke((s) => ({ ...s, dash: e.target.checked }))}
                  />
                  Discontinua
                </label>
                <div className="flex gap-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={cn(
                        'size-5 rounded-full border',
                        stroke.color === c ? 'border-white ring-1 ring-primary' : 'border-white/20'
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => setStroke((s) => ({ ...s, color: c }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeDock === 'materials' ? (
            <div className="flex max-w-3xl flex-wrap justify-center gap-2 rounded-2xl border border-white/15 bg-black/80 p-3 shadow-2xl backdrop-blur-xl">
              {MATERIAL_CATALOG.map(({ kind, label }) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => {
                    setTool(kind);
                    setActiveDock(null);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border px-3 py-2 text-[10px] transition-colors',
                    tool === kind
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-white/10 bg-white/5 hover:border-primary/30'
                  )}
                >
                  {materialImages[kind] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={materialImages[kind]!.src} alt={label} className="size-10 object-contain" />
                  ) : (
                    <BoxSelect className="size-8 opacity-40" />
                  )}
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
