'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Line, Arrow, Rect, Group, Circle, Image as KonvaImage, Text } from 'react-konva';
import { KonvaPitchLayer } from '@/components/methodology/drawing/KonvaPitchLayer';
import { MATERIAL_SCALE_NORM } from '@/lib/field-engine';
import {
  MATERIAL_CATALOG,
  getMaterialImage,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import {
  elapsedMsFromGlobalProgress,
  getAnimationCycleDuration,
  getAnimationPlaybackState,
} from '@/lib/exercise-animation';
import {
  DEFAULT_WAVE_WAVELENGTH_NORM,
  RECT_STROKE_OPACITY,
  RECT_STROKE_WIDTH_FACTOR,
  type DrawingElement,
  type ExerciseDrawingDocument,
  type FieldRect,
  type StrokeStyle,
  arrowHeadPoints,
  computeFieldRect,
  normToPx,
  quadBezierEndAngle,
  quadBezierLinePoints,
  sortElementsByLayer,
  textFontSizePx,
  wavePathPoints,
} from '@/lib/exercise-drawing';
import {
  applyDrawingElementToKonvaNode,
  collectAnimationElementUnion,
} from '@/lib/konva-element-sync';
import { cn } from '@/lib/utils';

type Props = {
  document: ExerciseDrawingDocument;
  className?: string;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
};

function dashArray(style: StrokeStyle) {
  return style.dash ? [10, 6] : undefined;
}

function InitialElement({
  element,
  fieldRect,
  materialImages,
  registerNode,
}: {
  element: DrawingElement;
  fieldRect: FieldRect;
  materialImages: Partial<Record<MaterialKind, HTMLImageElement>>;
  registerNode: (id: string, node: Konva.Node | null) => void;
}) {
  if (element.type === 'shape-line') {
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    if (element.arrowEnd || element.arrowStart) {
      return (
        <Arrow
          ref={(node) => registerNode(element.id, node)}
          points={[p1.x, p1.y, p2.x, p2.y]}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          fill={element.style.color}
          opacity={element.opacity}
          pointerLength={10}
          pointerWidth={10}
          listening={false}
        />
      );
    }
    return (
      <Line
        ref={(node) => registerNode(element.id, node)}
        points={[p1.x, p1.y, p2.x, p2.y]}
        stroke={element.style.color}
        strokeWidth={element.style.width}
        dash={dashArray(element.style)}
        opacity={element.opacity}
        lineCap="round"
        listening={false}
      />
    );
  }

  if (element.type === 'shape-curve') {
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    const pc = normToPx(element.cx, element.cy, fieldRect);
    const lp2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const lpc = { x: pc.x - p1.x, y: pc.y - p1.y };
    return (
      <Group ref={(node) => registerNode(element.id, node)} x={p1.x} y={p1.y} opacity={element.opacity} listening={false}>
        <Line
          name="curve-body"
          points={quadBezierLinePoints({ x: 0, y: 0 }, lpc, lp2)}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          lineCap="round"
          listening={false}
        />
        {element.arrowEnd ? (
          <Line
            name="curve-arrow"
            points={arrowHeadPoints(
              lp2.x,
              lp2.y,
              quadBezierEndAngle({ x: 0, y: 0 }, lpc, lp2),
              Math.max(8, element.style.width * 3)
            )}
            closed
            fill={element.style.color}
            stroke={element.style.color}
            strokeWidth={1}
            listening={false}
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
    return (
      <Line
        ref={(node) => registerNode(element.id, node)}
        points={wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp, wavelength)}
        stroke={element.style.color}
        strokeWidth={element.style.width}
        dash={dashArray(element.style)}
        opacity={element.opacity}
        lineCap="round"
        listening={false}
      />
    );
  }

  if (element.type === 'shape-rect') {
    const p = normToPx(element.x, element.y, fieldRect);
    return (
      <Rect
        ref={(node) => registerNode(element.id, node)}
        x={p.x}
        y={p.y}
        width={element.width * fieldRect.width}
        height={element.height * fieldRect.height}
        rotation={element.rotation}
        fill={element.fill}
        fillOpacity={element.fillOpacity}
        stroke={element.style.color}
        strokeOpacity={RECT_STROKE_OPACITY}
        strokeWidth={element.style.width * RECT_STROKE_WIDTH_FACTOR}
        opacity={element.opacity}
        dash={dashArray(element.style)}
        listening={false}
      />
    );
  }

  if (element.type === 'shape-text') {
    const p = normToPx(element.x, element.y, fieldRect);
    return (
      <Group ref={(node) => registerNode(element.id, node)} x={p.x} y={p.y} opacity={element.opacity} listening={false}>
        <Text
          text={element.text}
          fontSize={textFontSizePx(element.fontSize, fieldRect.width)}
          fill={element.color}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontStyle="bold"
          listening={false}
        />
      </Group>
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
      const rungs = 5;
      return (
        <Group
          ref={(node) => registerNode(element.id, node)}
          x={p.x}
          y={p.y}
          rotation={element.rotation}
          opacity={element.opacity}
          listening={false}
        >
          <Line points={[-hw, -hh, -hw, hh]} stroke="#0f172a" strokeWidth={2.5} lineCap="round" listening={false} />
          <Line points={[hw, -hh, hw, hh]} stroke="#0f172a" strokeWidth={2.5} lineCap="round" listening={false} />
          {Array.from({ length: rungs }).map((_, i) => {
            const y = -hh + (i / (rungs - 1)) * ladderH;
            return (
              <Line
                key={i}
                points={[-hw, y, hw, y]}
                stroke="#fbbf24"
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
        ref={(node) => registerNode(element.id, node)}
        x={p.x}
        y={p.y}
        rotation={element.rotation}
        opacity={element.opacity}
        listening={false}
      >
        {img ? (
          <KonvaImage image={img} width={scale} height={scale} offsetX={scale / 2} offsetY={scale / 2} />
        ) : (
          <Circle radius={scale / 2} fill="#334155" listening={false} />
        )}
      </Group>
    );
  }

  return null;
}

export function DrawingKonvaAnimator({
  document,
  className,
  playing,
  progress,
  onProgressChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const nodeRefs = useRef(new Map<string, Konva.Node>());
  const konvaAnimRef = useRef<Konva.Animation | null>(null);
  const elapsedRef = useRef(0);
  const progressEmitRef = useRef(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [materialImages, setMaterialImages] = useState<Partial<Record<MaterialKind, HTMLImageElement>>>({});

  const animation = document.animation!;

  useEffect(() => {
    void Promise.all(
      MATERIAL_CATALOG.map(async ({ kind }) => [kind, await getMaterialImage(kind)] as const)
    ).then((entries) => setMaterialImages(Object.fromEntries(entries)));
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const fieldRect = useMemo(
    () => computeFieldRect(size.width, size.height, document.field, 0, {}, 'fill-width-top'),
    [size.width, size.height, document.field]
  );

  const unionElements = useMemo(() => {
    const union = collectAnimationElementUnion(animation.scenes);
    return sortElementsByLayer(union);
  }, [animation.scenes]);

  const shapeElements = useMemo(
    () => unionElements.filter((el) => el.type !== 'material'),
    [unionElements]
  );
  const materialElements = useMemo(
    () => unionElements.filter((el) => el.type === 'material'),
    [unionElements]
  );

  const registerNode = useCallback((id: string, node: Konva.Node | null) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  }, []);

  const applyFrame = useCallback(
    (elapsedMs: number) => {
      const speed = animation.playbackSpeed ?? 1;
      const playback = getAnimationPlaybackState(animation, elapsedMs / speed, animation.loop);
      const visibleIds = new Set(playback.elements.map((el) => el.id));

      for (const element of playback.elements) {
        applyDrawingElementToKonvaNode(
          nodeRefs.current.get(element.id),
          element,
          fieldRect,
          materialImages
        );
      }

      for (const [id, node] of nodeRefs.current.entries()) {
        if (!visibleIds.has(id)) node.visible(false);
      }

      layerRef.current?.batchDraw();

      const cycleMs = getAnimationCycleDuration(animation);
      if (cycleMs > 0) {
        const nextProgress = ((elapsedMs / speed) % cycleMs) / cycleMs;
        const now = performance.now();
        if (now - progressEmitRef.current > 120) {
          progressEmitRef.current = now;
          onProgressChange(nextProgress);
        }
      }
    },
    [animation, fieldRect, materialImages, onProgressChange]
  );

  useEffect(() => {
    elapsedRef.current = elapsedMsFromGlobalProgress(progress, animation) * (animation.playbackSpeed ?? 1);
  }, [progress, animation]);

  useEffect(() => {
    if (!playing) {
      konvaAnimRef.current?.stop();
      konvaAnimRef.current = null;
      applyFrame(elapsedRef.current);
      return;
    }

    const layer = layerRef.current;
    if (!layer) return;

    const konvaAnim = new Konva.Animation((frame) => {
      if (!frame) return;
      elapsedRef.current += frame.timeDiff;
      applyFrame(elapsedRef.current);
    }, layer);

    konvaAnimRef.current = konvaAnim;
    konvaAnim.start();

    return () => {
      konvaAnim.stop();
      konvaAnimRef.current = null;
    };
  }, [playing, applyFrame]);

  useEffect(() => {
    if (!playing) {
      applyFrame(elapsedRef.current);
    }
  }, [progress, playing, applyFrame]);

  if (size.width < 2 || size.height < 2) {
    return <div ref={containerRef} className={cn('h-full w-full', className)} />;
  }

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      <Stage width={size.width} height={size.height} listening={false}>
        <Layer ref={layerRef} listening={false}>
          <Rect x={0} y={0} width={size.width} height={size.height} fill="#45b85a" listening={false} />
          <KonvaPitchLayer rect={fieldRect} template={document.field} />
          {shapeElements.map((element) => (
            <InitialElement
              key={element.id}
              element={element}
              fieldRect={fieldRect}
              materialImages={materialImages}
              registerNode={registerNode}
            />
          ))}
          {materialElements.map((element) => (
            <InitialElement
              key={element.id}
              element={element}
              fieldRect={fieldRect}
              materialImages={materialImages}
              registerNode={registerNode}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}

// Re-export controls from player file - will update ExerciseAnimationPlayer to use this
