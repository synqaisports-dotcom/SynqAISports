'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Stage, Layer, Line, Arrow, Rect, Group, Circle, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import {
  ArrowRight,
  BoxSelect,
  Copy,
  Minus,
  MousePointer2,
  Package,
  PenTool,
  Save,
  Spline,
  Square,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import { KonvaPitchLayer } from '@/components/methodology/drawing/KonvaPitchLayer';
import { useFieldTransition } from '@/hooks/useFieldTransition';
import { MATERIAL_SCALE_NORM } from '@/lib/field-engine';
import {
  MATERIAL_CATALOG,
  getMaterialImage,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import {
  DEFAULT_STROKE,
  FIELD_FORMAT_SHORT,
  DEFAULT_WAVE_WAVELENGTH_NORM,
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
  duplicateDrawingElement,
  isMaterialTool,
  isShapeTool,
  normToPx,
  parseExerciseDrawing,
  pxToNorm,
  quadBezierEndAngle,
  arrowHeadPoints,
  RECT_STROKE_OPACITY,
  RECT_STROKE_WIDTH_FACTOR,
  serializeExerciseDrawing,
  sortElementsByLayer,
  sportForField,
  translateElementBy,
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

/** Anclajes del transformer — 4 esquinas + 4 puntos medios */
const TRANSFORMER_ANCHORS = [
  'top-left',
  'top-center',
  'top-right',
  'middle-right',
  'bottom-right',
  'bottom-center',
  'bottom-left',
  'middle-left',
] as const;

/** Estilo glass compartido en la pizarra — bordes y textos cyan */
const GLASS = {
  panel:
    'border border-cyan-400/40 bg-cyan-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
  pill:
    'rounded-full border border-cyan-400/40 bg-cyan-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
  btn: 'border border-cyan-400/35 bg-cyan-400/[0.07] text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-200',
  btnActive:
    'border-cyan-400/80 bg-cyan-400/20 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_20px_rgba(34,211,238,0.28)]',
  iconBtn:
    'flex items-center justify-center rounded-full border border-cyan-400/45 bg-cyan-400/[0.1] text-cyan-300 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all hover:border-cyan-400/65 hover:bg-cyan-400/16 hover:text-cyan-100',
  dockBtn:
    'flex items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-400/[0.07] text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-200',
  dockBtnActive:
    'border-cyan-400/75 bg-cyan-400/18 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.24)]',
  danger:
    'border-red-400/45 bg-red-500/12 text-red-300 backdrop-blur-md transition-all hover:border-red-400/60 hover:bg-red-500/22',
  label: 'text-xs text-cyan-300/90',
} as const;

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

  const targetRect = useMemo(
    () => computeFieldRect(size.width, size.height, doc.field, 0, FIELD_INSETS, 'fill-width-top'),
    [size, doc.field]
  );
  const { displayRect, outgoing, blend } = useFieldTransition(doc.field, targetRect);
  const fieldRect = displayRect;

  const selected = doc.elements.find((el) => el.id === selectedId) ?? null;
  const fieldOptions = SPORT_OPTIONS[sport].fields;
  const layeredElements = useMemo(() => sortElementsByLayer(doc.elements), [doc.elements]);
  const shapeElements = useMemo(
    () => layeredElements.filter((el) => el.type !== 'material'),
    [layeredElements]
  );
  const materialElements = useMemo(
    () => layeredElements.filter((el) => el.type === 'material'),
    [layeredElements]
  );

  const attachTransformer = useCallback(
    (node: Konva.Node | null) => {
      const tr = transformerRef.current;
      if (!tr) return;
      if (node && (selected?.type === 'material' || selected?.type === 'shape-rect')) {
        tr.nodes([node]);
        tr.keepRatio(!(selected?.type === 'material' && selected.material === 'ladder'));
      } else {
        tr.nodes([]);
      }
      tr.getLayer()?.batchDraw();
    },
    [selected]
  );

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr || !open) return;
    if (
      !selectedId ||
      !selected ||
      (selected.type !== 'shape-rect' && selected.type !== 'material')
    ) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    requestAnimationFrame(() => {
      const stage = tr.getStage();
      const node = stage?.findOne('#' + selectedId);
      if (!node) return;
      tr.nodes([node]);
      tr.keepRatio(!(selected.type === 'material' && selected.material === 'ladder'));
      tr.getLayer()?.batchDraw();
    });
  }, [selectedId, selected, open, layeredElements]);

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
      setDoc((d) => ({ ...d, elements: sortElementsByLayer([...d.elements, el]) }));
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

  const duplicateSelected = () => {
    if (!selected) return;
    const copy = duplicateDrawingElement(selected);
    setDoc((d) => ({ ...d, elements: sortElementsByLayer([...d.elements, copy]) }));
    setSelectedId(copy.id);
  };

  const handleSportChange = (next: SportKind) => {
    setSport(next);
    const field = defaultFieldForSport(next);
    setDoc((d) => ({ ...d, field }));
  };

  const dashArray = (s: StrokeStyle) => (s.dash ? [10, 6] : undefined);
  const cursorClass = tool === 'select' ? 'cursor-default' : 'cursor-crosshair';

  const finishElementDrag = (element: DrawingElement, node: Konva.Node) => {
    const dx = node.x() / fieldRect.width;
    const dy = node.y() / fieldRect.height;
    node.position({ x: 0, y: 0 });
    if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
      updateElement(element.id, translateElementBy(element, dx, dy));
    }
  };

  const renderElement = (element: DrawingElement, isPreview = false) => {
    const key = isPreview ? `draft-${element.id}` : element.id;
    const canDrag = tool === 'select' && !isPreview;
    const hitStroke =
      element.type === 'material' ? 16 : Math.max(16, element.style.width * 5);

    if (element.type === 'shape-line') {
      const p1 = normToPx(element.x1, element.y1, fieldRect);
      const p2 = normToPx(element.x2, element.y2, fieldRect);
      if (element.arrowEnd || element.arrowStart) {
        return (
          <Arrow
            key={key}
            id={element.id}
            points={[p1.x, p1.y, p2.x, p2.y]}
            stroke={element.style.color}
            strokeWidth={element.style.width}
            dash={dashArray(element.style)}
            fill={element.style.color}
            opacity={element.opacity}
            pointerLength={10}
            pointerWidth={10}
            hitStrokeWidth={hitStroke}
            draggable={canDrag}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (canDrag) setSelectedId(element.id);
            }}
            onDragEnd={(e) => finishElementDrag(element, e.target)}
            onClick={() => !isPreview && setSelectedId(element.id)}
          />
        );
      }
      return (
        <Line
          key={key}
          id={element.id}
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          opacity={element.opacity}
          lineCap="round"
          hitStrokeWidth={hitStroke}
          draggable={canDrag}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
          onDragEnd={(e) => finishElementDrag(element, e.target)}
          onClick={() => !isPreview && setSelectedId(element.id)}
        />
      );
    }

    if (element.type === 'shape-curve') {
      const p1 = normToPx(element.x1, element.y1, fieldRect);
      const p2 = normToPx(element.x2, element.y2, fieldRect);
      const pc = normToPx(element.cx, element.cy, fieldRect);
      const pad = hitStroke;
      const minX = Math.min(p1.x, p2.x, pc.x) - pad;
      const minY = Math.min(p1.y, p2.y, pc.y) - pad;
      const boxW = Math.max(p1.x, p2.x, pc.x) - minX + pad;
      const boxH = Math.max(p1.y, p2.y, pc.y) - minY + pad;
      return (
        <Group
          key={key}
          id={element.id}
          opacity={element.opacity}
          draggable={canDrag}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
          onDragEnd={(e) => finishElementDrag(element, e.target)}
          onClick={() => !isPreview && setSelectedId(element.id)}
        >
          <Rect
            x={minX}
            y={minY}
            width={boxW}
            height={boxH}
            fill="rgba(0,0,0,0.001)"
          />
          <Line
            points={[p1.x, p1.y, pc.x, pc.y, p2.x, p2.y]}
            stroke={element.style.color}
            strokeWidth={element.style.width}
            dash={dashArray(element.style)}
            tension={0.4}
            bezier
            lineCap="round"
            listening={false}
          />
          {element.arrowEnd ? (
            <Line
              points={arrowHeadPoints(
                p2.x,
                p2.y,
                quadBezierEndAngle(p1, pc, p2),
                Math.max(8, element.style.width * 3)
              )}
              closed
              fill={element.style.color}
              stroke={element.style.color}
              strokeWidth={1}
              listening={false}
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
              onMouseDown={(e) => {
                e.cancelBubble = true;
              }}
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
      const wavelength = DEFAULT_WAVE_WAVELENGTH_NORM * fieldRect.width;
      const pts = wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp, wavelength);
      return (
        <Line
          key={key}
          id={element.id}
          points={pts}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          opacity={element.opacity}
          lineCap="round"
          hitStrokeWidth={hitStroke}
          draggable={canDrag}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
          onDragEnd={(e) => finishElementDrag(element, e.target)}
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
          fillOpacity={element.fillOpacity}
          stroke={element.style.color}
          strokeOpacity={RECT_STROKE_OPACITY}
          strokeWidth={element.style.width * RECT_STROKE_WIDTH_FACTOR}
          opacity={element.opacity}
          dash={dashArray(element.style)}
          draggable={canDrag}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
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
      const p = normToPx(element.x, element.y, fieldRect);
      const base = fieldRect.width * MATERIAL_SCALE_NORM;

      if (element.material === 'ladder') {
        const scaleXn = element.scaleX ?? element.scale;
        const scaleYn = element.scaleY ?? element.scale;
        const unitW = 110;
        const unitH = 56;
        const ladderW = scaleXn * base;
        const ladderH = scaleYn * base * (unitH / unitW);
        const hw = ladderW / 2;
        const hh = ladderH / 2;
        const pole = selectedId === element.id && !isPreview ? '#22d3ee' : '#0f172a';
        const rung = selectedId === element.id && !isPreview ? '#22d3ee' : '#fbbf24';
        const rungs = 5;
        return (
          <Group
            key={key}
            id={element.id}
            x={p.x}
            y={p.y}
            rotation={element.rotation}
            opacity={element.opacity}
            draggable={canDrag}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              if (canDrag) setSelectedId(element.id);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              if (canDrag) setSelectedId(element.id);
            }}
            onClick={(e) => {
              e.cancelBubble = true;
              setSelectedId(element.id);
            }}
            onDragEnd={(ev) => {
              const n = pxToNorm(ev.target.x(), ev.target.y(), fieldRect);
              updateElement(element.id, { x: n.x, y: n.y });
            }}
            onTransformEnd={(ev) => {
              const node = ev.target;
              const n = pxToNorm(node.x(), node.y(), fieldRect);
              const ratioX = node.scaleX();
              const ratioY = node.scaleY();
              node.scaleX(1);
              node.scaleY(1);
              const nextScaleX = Math.abs(ratioX - 1) >= 0.001 ? scaleXn * ratioX : scaleXn;
              const nextScaleY = Math.abs(ratioY - 1) >= 0.001 ? scaleYn * ratioY : scaleYn;
              updateElement(element.id, {
                x: n.x,
                y: n.y,
                rotation: node.rotation(),
                scaleX: nextScaleX,
                scaleY: nextScaleY,
                scale: Math.max(nextScaleX, nextScaleY),
              });
            }}
            ref={(node) => {
              if (selectedId === element.id) attachTransformer(node);
            }}
          >
            <Rect
              x={-hw}
              y={-hh}
              width={ladderW}
              height={ladderH}
              fill="rgba(0,0,0,0.001)"
              listening
            />
            <Line points={[-hw, -hh, -hw, hh]} stroke={pole} strokeWidth={2.5} lineCap="round" listening={false} />
            <Line points={[hw, -hh, hw, hh]} stroke={pole} strokeWidth={2.5} lineCap="round" listening={false} />
            {Array.from({ length: rungs }).map((_, i) => {
              const y = -hh + (i / (rungs - 1)) * ladderH;
              return (
                <Line
                  key={i}
                  points={[-hw, y, hw, y]}
                  stroke={rung}
                  strokeWidth={2}
                  lineCap="round"
                  listening={false}
                />
              );
            })}
          </Group>
        );
      }

      const img = materialImages[element.material];
      const scale = element.scale * base;
      return (
        <Group
          key={key}
          id={element.id}
          x={p.x}
          y={p.y}
          rotation={element.rotation}
          opacity={element.opacity}
          draggable={canDrag}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            if (canDrag) setSelectedId(element.id);
          }}
          onClick={(e) => {
            e.cancelBubble = true;
            setSelectedId(element.id);
          }}
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
            onMouseDown={(e) => {
              e.cancelBubble = true;
            }}
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

  /** Ancho del panel de materiales: 9 iconos en una fila (~464px) + margen */
  const materialsPanelW = 'min(92vw, 31rem)';
  const toolsPanelW = 'min(92vw, 480px)';

  const studio = (
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-[#060a12] text-cyan-200">
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
            {outgoing ? (
              <KonvaPitchLayer rect={displayRect} template={outgoing} opacity={1 - blend} />
            ) : null}
            <KonvaPitchLayer rect={displayRect} template={doc.field} opacity={blend} />
            <Rect
              name="field-hit"
              x={fieldRect.x}
              y={fieldRect.y}
              width={fieldRect.width}
              height={fieldRect.height}
              fill="rgba(0,0,0,0.001)"
            />
            {shapeElements.map((el) => renderElement(el))}
            {draft ? renderElement(draft, true) : null}
            {materialElements.map((el) => renderElement(el))}
            {renderAnchors()}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              enabledAnchors={[...TRANSFORMER_ANCHORS]}
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
        className={cn('absolute left-4 top-4 z-40 size-10', GLASS.iconBtn)}
        aria-label="Cerrar"
      >
        <X className="size-4" />
      </button>

      {/* Controles — superior derecha */}
      <div className="absolute right-4 top-4 z-40 flex max-w-[min(92vw,640px)] flex-wrap items-center justify-end gap-2">
        <div className={cn('flex p-0.5', GLASS.pill)}>
          {(Object.keys(SPORT_OPTIONS) as SportKind[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSportChange(key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                sport === key ? GLASS.btnActive : GLASS.btn
              )}
            >
              {SPORT_OPTIONS[key].label}
            </button>
          ))}
        </div>

        <div className={cn('flex flex-wrap justify-end gap-1 rounded-2xl px-2 py-1.5', GLASS.panel)}>
          {fieldOptions.map((field) => (
            <button
              key={field}
              type="button"
              onClick={() => setDoc((d) => ({ ...d, field }))}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                doc.field === field ? GLASS.btnActive : GLASS.btn
              )}
            >
              {FIELD_FORMAT_SHORT[field]}
            </button>
          ))}
        </div>

        <button
          type="button"
          title="Guardar"
          aria-label="Guardar"
          className={cn('size-10', GLASS.iconBtn)}
          onClick={() => {
            onSave(serializeExerciseDrawing(doc));
            onClose();
          }}
        >
          <Save className="size-4" />
        </button>
      </div>

      {/* Propiedades selección */}
      {selected &&
      (selected.type === 'shape-line' ||
        selected.type === 'shape-curve' ||
        selected.type === 'shape-wave' ||
        selected.type === 'shape-rect') ? (
        <div className={cn('pointer-events-none absolute bottom-[5.5rem] left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap justify-center gap-3 rounded-2xl px-4 py-2.5', GLASS.panel)}>
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
            Transparencia
            <input
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={selected.opacity}
              onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) })}
              className="w-24"
            />
          </label>
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
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
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
            <input
              type="checkbox"
              checked={selected.style.dash}
              onChange={(e) => updateElement(selected.id, { style: { ...selected.style, dash: e.target.checked } })}
            />
            Discontinua
          </label>
          {selected.type === 'shape-line' ? (
            <>
              <label className={cn('pointer-events-auto flex items-center gap-1.5', GLASS.label)}>
                <input
                  type="checkbox"
                  checked={selected.arrowStart}
                  onChange={(e) => updateElement(selected.id, { arrowStart: e.target.checked })}
                />
                Punta inicio
              </label>
              <label className={cn('pointer-events-auto flex items-center gap-1.5', GLASS.label)}>
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
                className="size-6 rounded-full border border-cyan-400/35"
                style={{ backgroundColor: c }}
                onClick={() =>
                  updateElement(
                    selected.id,
                    selected.type === 'shape-rect'
                      ? { style: { ...selected.style, color: c }, fill: c }
                      : { style: { ...selected.style, color: c } }
                  )
                }
              />
            ))}
          </div>
          <button
            type="button"
            title="Duplicar"
            aria-label="Duplicar"
            className={cn('pointer-events-auto flex size-8 items-center justify-center rounded-lg', GLASS.btn)}
            onClick={duplicateSelected}
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar"
            className={cn('pointer-events-auto flex size-8 items-center justify-center rounded-lg text-red-300', GLASS.danger)}
            onClick={deleteSelected}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ) : null}

      {selected && selected.type === 'material' ? (
        <div className={cn('pointer-events-none absolute bottom-[5.5rem] left-1/2 z-30 flex max-w-[95vw] -translate-x-1/2 flex-wrap justify-center gap-3 rounded-2xl px-4 py-2.5', GLASS.panel)}>
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
            Transparencia
            <input
              type="range"
              min={0.15}
              max={1}
              step={0.05}
              value={selected.opacity}
              onChange={(e) => updateElement(selected.id, { opacity: Number(e.target.value) })}
              className="w-24"
            />
          </label>
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
            Escala
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={selected.material === 'ladder' ? (selected.scaleX ?? selected.scale) : selected.scale}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (selected.material === 'ladder') {
                  updateElement(selected.id, { scale: v, scaleX: v, scaleY: v });
                } else {
                  updateElement(selected.id, { scale: v });
                }
              }}
              className="w-24"
            />
          </label>
          <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
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
            <label className={cn('pointer-events-auto flex items-center gap-2', GLASS.label)}>
              Etiqueta
              <input
                type="text"
                maxLength={3}
                value={selected.label ?? ''}
                onChange={(e) => updateElement(selected.id, { label: e.target.value })}
                className="w-12 rounded border border-cyan-400/35 bg-cyan-400/10 px-1.5 py-0.5 text-center text-xs text-cyan-200"
              />
            </label>
          ) : null}
          <button
            type="button"
            title="Duplicar"
            aria-label="Duplicar"
            className={cn('pointer-events-auto flex size-8 items-center justify-center rounded-lg', GLASS.btn)}
            onClick={duplicateSelected}
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar"
            className={cn('pointer-events-auto flex size-8 items-center justify-center rounded-lg text-red-300', GLASS.danger)}
            onClick={deleteSelected}
          >
            <Trash2 className="size-3.5" />
          </button>
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
            style={{ '--dock-panel-w': materialsPanelW } as React.CSSProperties}
          >
            <div
              className={cn('mr-2 rounded-2xl p-2.5', GLASS.panel)}
              style={{ width: materialsPanelW }}
            >
              <div className="flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto">
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
                      'flex size-11 items-center justify-center',
                      GLASS.dockBtn,
                      tool === kind && GLASS.dockBtnActive
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
          <div className={cn('relative z-10 flex overflow-hidden', GLASS.pill)}>
            <button
              type="button"
              title="Material"
              aria-label="Material"
              aria-expanded={materialsOpen}
              onClick={() => setMaterialsOpen((v) => !v)}
              className={cn(
                'flex size-11 items-center justify-center border-r border-cyan-400/30 transition-all',
                materialsOpen ? GLASS.btnActive : 'text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200'
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
                'flex size-11 items-center justify-center transition-all',
                toolsOpen ? GLASS.btnActive : 'text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200'
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
            style={{ '--dock-panel-w': toolsPanelW } as React.CSSProperties}
          >
            <div
              className={cn('ml-2 rounded-2xl p-2.5', GLASS.panel)}
              style={{ width: toolsPanelW }}
            >
              <div className="flex flex-nowrap items-center justify-center gap-1.5 overflow-x-auto">
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
                      'flex size-10 items-center justify-center',
                      GLASS.dockBtn,
                      tool === item.id && GLASS.dockBtnActive
                    )}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
              <div className={cn('mt-2 flex flex-wrap items-center justify-center gap-3 border-t border-cyan-400/25 pt-2', GLASS.label)}>
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
                        stroke.color === c ? 'border-cyan-300 ring-1 ring-cyan-400' : 'border-cyan-400/35'
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
