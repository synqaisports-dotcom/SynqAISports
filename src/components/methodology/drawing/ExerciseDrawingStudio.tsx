'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stage, Layer, Line, Arrow, Rect, Group, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  ArrowRight,
  BoxSelect,
  Check,
  Minus,
  MousePointer2,
  Package,
  PenTool,
  Spline,
  Square,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KonvaPitchLayer } from '@/components/methodology/drawing/KonvaPitchLayer';
import {
  MATERIAL_CATALOG,
  getMaterialImage,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import {
  DEFAULT_STROKE,
  FIELD_FORMAT_SHORT,
  SPORT_OPTIONS,
  type DrawingElement,
  type ExerciseDrawingDocument,
  type FieldTemplate,
  type SportKind,
  type StrokeStyle,
  type StudioTool,
  computeFieldRect,
  defaultDraftForTool,
  defaultFieldForSport,
  isMaterialTool,
  isShapeTool,
  normToPx,
  parseExerciseDrawing,
  pxToNorm,
  serializeExerciseDrawing,
  sportForField,
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

/** Campo a ancho completo, pegado arriba; controles flotan encima */
const FIELD_INSETS = { top: 0, bottom: 0, left: 4, right: 4 };

export function ExerciseDrawingStudio({ open, initialData, onClose, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [mounted, setMounted] = useState(false);
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [doc, setDoc] = useState<ExerciseDrawingDocument>(() => parseExerciseDrawing(initialData));
  const [sport, setSport] = useState<SportKind>(() => sportForField(parseExerciseDrawing(initialData).field));
  const [tool, setTool] = useState<StudioTool>('select');
  const [stroke, setStroke] = useState<StrokeStyle>(DEFAULT_STROKE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DrawingElement | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [materialImages, setMaterialImages] = useState<Partial<Record<MaterialKind, HTMLImageElement>>>({});
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const parsed = parseExerciseDrawing(initialData);
    setDoc(parsed);
    setSport(sportForField(parsed.field));
    setSelectedId(null);
    setDraft(null);
    setTool('select');
    setToolsOpen(false);
    setMaterialsOpen(false);
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
    () => computeFieldRect(size.width, size.height, doc.field, 0, FIELD_INSETS, 'fill-width-top'),
    [size, doc.field]
  );

  const selected = doc.elements.find((el) => el.id === selectedId) ?? null;
  const fieldOptions = SPORT_OPTIONS[sport].fields;

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

  const handleStagePointerDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if ('touches' in e.evt) e.evt.preventDefault();
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
      setDraft(defaultDraftForTool(tool, norm.x, norm.y, norm.x, norm.y, stroke));
    }
  };

  const handleStagePointerMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
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

  const handleStagePointerUp = () => {
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

  const handleSportChange = (next: SportKind) => {
    setSport(next);
    const field = defaultFieldForSport(next);
    setDoc((d) => ({ ...d, field }));
  };

  const dashArray = (s: StrokeStyle) => (s.dash ? [10, 6] : undefined);
  const cursorClass = tool === 'select' ? 'cursor-default' : 'cursor-crosshair';

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
              onDragMove={(ev) => {
                const n = pxToNorm(ev.target.x(), ev.target.y(), fieldRect);
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
          fill={element.fill}
          opacity={element.fillOpacity}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          draggable={tool === 'select'}
          onClick={() => setSelectedId(element.id)}
          onDragEnd={(ev) => {
            const n = pxToNorm(ev.target.x(), ev.target.y(), fieldRect);
            updateElement(element.id, { x: n.x, y: n.y });
          }}
          onTransformEnd={(ev) => {
            const node = ev.target;
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
      const scale = element.scale * (fieldRect.width * 0.075);
      return (
        <Group
          key={key}
          id={element.id}
          x={p.x}
          y={p.y}
          rotation={element.rotation}
          draggable={tool === 'select'}
          onClick={() => setSelectedId(element.id)}
          onDragEnd={(ev) => {
            const n = pxToNorm(ev.target.x(), ev.target.y(), fieldRect);
            updateElement(element.id, { x: n.x, y: n.y });
          }}
          onTransformEnd={(ev) => {
            const node = ev.target;
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
    if (selected.type === 'shape-line' || selected.type === 'shape-wave' || selected.type === 'shape-curve') {
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
            onDragMove={(ev) => {
              const n = pxToNorm(ev.target.x(), ev.target.y(), fieldRect);
              if (a.role === 'start') updateElement(selected.id, { x1: n.x, y1: n.y });
              else updateElement(selected.id, { x2: n.x, y2: n.y });
            }}
          />
        );
      });
    }
    return null;
  };

  if (!open || !mounted) return null;

  const panelW = 'min(44vw, 480px)';

  const studio = (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#060a12] text-foreground">
      <div ref={containerRef} className="absolute inset-0 touch-none">
        <Stage
          width={size.width}
          height={size.height}
          onMouseDown={handleStagePointerDown}
          onMousemove={handleStagePointerMove}
          onMouseup={handleStagePointerUp}
          onTouchStart={handleStagePointerDown}
          onTouchMove={handleStagePointerMove}
          onTouchEnd={handleStagePointerUp}
          className={cn('absolute inset-0', cursorClass)}
        >
          <Layer>
            <Rect x={0} y={0} width={size.width} height={size.height} fill="#060a12" listening={false} />
            <KonvaPitchLayer rect={fieldRect} template={doc.field} />
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

      {/* Cerrar — superior izquierda */}
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-4 z-40 flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-muted-foreground shadow-xl backdrop-blur-xl transition-colors hover:border-white/30 hover:text-foreground"
        aria-label="Cerrar"
      >
        <X className="size-4" />
      </button>

      {/* Controles — superior derecha */}
      <div className="absolute right-4 top-4 z-40 flex max-w-[min(92vw,640px)] flex-wrap items-center justify-end gap-2">
        <div className="flex rounded-full border border-white/15 bg-black/65 p-0.5 shadow-xl backdrop-blur-xl">
          {(Object.keys(SPORT_OPTIONS) as SportKind[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSportChange(key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                sport === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {SPORT_OPTIONS[key].label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-end gap-1 rounded-2xl border border-white/15 bg-black/65 px-2 py-1.5 shadow-xl backdrop-blur-xl">
          {fieldOptions.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => setDoc((d) => ({ ...d, field }))}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                doc.field === field
                  ? 'bg-white/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              {FIELD_FORMAT_SHORT[field]}
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          className="h-9 gap-1.5 rounded-full px-4 shadow-xl"
          onClick={() => {
            onSave(serializeExerciseDrawing(doc));
            onClose();
          }}
        >
          <Check className="size-4" />
          Guardar
        </Button>
      </div>

      {/* Propiedades selección */}
      {selected &&
      (selected.type === 'shape-line' ||
        selected.type === 'shape-curve' ||
        selected.type === 'shape-wave' ||
        selected.type === 'shape-rect') ? (
        <div className="pointer-events-none absolute bottom-[5.5rem] left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap justify-center gap-3 rounded-2xl border border-white/15 bg-black/75 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            Grosor
            <input
              type="range"
              min={1}
              max={8}
              value={selected.style.width}
              onChange={(e) => updateElement(selected.id, { style: { ...selected.style, width: Number(e.target.value) } })}
              className="w-24"
            />
          </label>
          <label className="pointer-events-auto flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={selected.style.dash}
              onChange={(e) => updateElement(selected.id, { style: { ...selected.style, dash: e.target.checked } })}
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
          <div className="pointer-events-auto flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className="size-6 rounded-full border border-white/20"
                style={{ backgroundColor: c }}
                onClick={() => updateElement(selected.id, { style: { ...selected.style, color: c } })}
              />
            ))}
          </div>
          <Button type="button" size="sm" variant="destructive" className="pointer-events-auto h-8" onClick={deleteSelected}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : null}

      {selected && selected.type === 'material' ? (
        <div className="pointer-events-none absolute bottom-[5.5rem] left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap justify-center gap-3 rounded-2xl border border-white/15 bg-black/75 px-4 py-2.5 shadow-2xl backdrop-blur-xl">
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

      {/* Botoneras expandibles — hub fijo, paneles absolutos tipo sidebar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center">
        <div className="pointer-events-auto relative">
          {/* Materiales — desenrolla hacia la izquierda */}
          <div
            className={cn(
              'absolute bottom-0 right-full origin-right overflow-hidden',
              'transition-[width,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              materialsOpen ? 'w-[var(--dock-panel-w)] opacity-100' : 'pointer-events-none w-0 opacity-0'
            )}
            style={{ '--dock-panel-w': panelW } as React.CSSProperties}
          >
            <div
              className="mr-2 rounded-2xl border border-white/15 bg-black/85 p-2.5 shadow-2xl backdrop-blur-xl"
              style={{ width: panelW }}
            >
              <div className="grid grid-cols-5 gap-1.5">
                {MATERIAL_CATALOG.map(({ kind, label }) => (
                  <button
                    key={kind}
                    type="button"
                    title={label}
                    onClick={() => {
                      setTool(kind);
                      setMaterialsOpen(false);
                    }}
                    className={cn(
                      'flex size-11 items-center justify-center rounded-xl border transition-colors',
                      tool === kind
                        ? 'border-primary bg-primary/15'
                        : 'border-white/10 bg-white/5 hover:border-primary/30'
                    )}
                  >
                    {materialImages[kind] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={materialImages[kind]!.src} alt={label} className="size-8 object-contain" />
                    ) : (
                      <BoxSelect className="size-6 opacity-40" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hub central — solo iconos */}
          <div className="relative z-10 flex overflow-hidden rounded-full border border-white/20 bg-black/85 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              title="Material"
              aria-label="Material"
              aria-expanded={materialsOpen}
              onClick={() => setMaterialsOpen((v) => !v)}
              className={cn(
                'flex size-11 items-center justify-center border-r border-white/15 transition-colors',
                materialsOpen ? 'bg-primary/25 text-primary' : 'text-foreground hover:bg-white/5'
              )}
            >
              <Package className="size-5" />
            </button>
            <button
              type="button"
              title="Herramientas de dibujo"
              aria-label="Herramientas de dibujo"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
              className={cn(
                'flex size-11 items-center justify-center transition-colors',
                toolsOpen ? 'bg-primary/25 text-primary' : 'text-foreground hover:bg-white/5'
              )}
            >
              <PenTool className="size-5" />
            </button>
          </div>

          {/* Herramientas — desenrolla hacia la derecha */}
          <div
            className={cn(
              'absolute bottom-0 left-full origin-left overflow-hidden',
              'transition-[width,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              toolsOpen ? 'w-[var(--dock-panel-w)] opacity-100' : 'pointer-events-none w-0 opacity-0'
            )}
            style={{ '--dock-panel-w': panelW } as React.CSSProperties}
          >
            <div
              className="ml-2 rounded-2xl border border-white/15 bg-black/85 p-2.5 shadow-2xl backdrop-blur-xl"
              style={{ width: panelW }}
            >
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
                      'flex size-10 items-center justify-center rounded-xl border transition-colors',
                      tool === item.id
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/5 hover:border-primary/30'
                    )}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-2 text-xs text-muted-foreground">
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
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(studio, document.body);
}
