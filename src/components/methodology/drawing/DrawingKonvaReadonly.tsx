'use client';

import { useEffect, useMemo, useState } from 'react';
import { Stage, Layer, Line, Arrow, Rect, Group, Circle, Image as KonvaImage, Text } from 'react-konva';
import { KonvaPitchLayer } from '@/components/methodology/drawing/KonvaPitchLayer';
import { MATERIAL_SCALE_NORM } from '@/lib/field-engine';
import {
  MATERIAL_CATALOG,
  getMaterialImage,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import {
  DEFAULT_WAVE_WAVELENGTH_NORM,
  RECT_STROKE_OPACITY,
  RECT_STROKE_WIDTH_FACTOR,
  type DrawingElement,
  type ExerciseDrawingDocument,
  type FieldFitMode,
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

type Props = {
  document: ExerciseDrawingDocument;
  width: number;
  height: number;
  fit?: FieldFitMode;
};

function dashArray(style: StrokeStyle) {
  return style.dash ? [10, 6] : undefined;
}

function ReadonlyElement({
  element,
  fieldRect,
  materialImages,
}: {
  element: DrawingElement;
  fieldRect: FieldRect;
  materialImages: Partial<Record<MaterialKind, HTMLImageElement>>;
}) {
  if (element.type === 'shape-line') {
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    if (element.arrowEnd || element.arrowStart) {
      return (
        <Arrow
          key={element.id}
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
        key={element.id}
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
      <Group key={element.id} x={p1.x} y={p1.y} opacity={element.opacity} listening={false}>
        <Line
          points={quadBezierLinePoints({ x: 0, y: 0 }, lpc, lp2)}
          stroke={element.style.color}
          strokeWidth={element.style.width}
          dash={dashArray(element.style)}
          lineCap="round"
          listening={false}
        />
        {element.arrowEnd ? (
          <Line
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
    const pts = wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp, wavelength);
    return (
      <Line
        key={element.id}
        points={pts}
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
    const w = element.width * fieldRect.width;
    const h = element.height * fieldRect.height;
    return (
      <Rect
        key={element.id}
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
        listening={false}
      />
    );
  }

  if (element.type === 'shape-text') {
    const p = normToPx(element.x, element.y, fieldRect);
    const fontSize = textFontSizePx(element.fontSize, fieldRect.width);
    return (
      <Group key={element.id} x={p.x} y={p.y} opacity={element.opacity} listening={false}>
        <Text
          text={element.text}
          fontSize={fontSize}
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
          key={element.id}
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
        key={element.id}
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

export function DrawingKonvaReadonly({ document, width, height, fit = 'fill-width' }: Props) {
  const [materialImages, setMaterialImages] = useState<Partial<Record<MaterialKind, HTMLImageElement>>>({});

  useEffect(() => {
    void Promise.all(
      MATERIAL_CATALOG.map(async ({ kind }) => [kind, await getMaterialImage(kind)] as const)
    ).then((entries) => setMaterialImages(Object.fromEntries(entries)));
  }, []);

  const fieldRect = useMemo(
    () => computeFieldRect(width, height, document.field, 0, {}, fit),
    [width, height, document.field, fit]
  );

  const layeredElements = useMemo(() => sortElementsByLayer(document.elements), [document.elements]);
  const shapeElements = useMemo(
    () => layeredElements.filter((el) => el.type !== 'material'),
    [layeredElements]
  );
  const materialElements = useMemo(
    () => layeredElements.filter((el) => el.type === 'material'),
    [layeredElements]
  );

  if (width < 2 || height < 2) return null;

  return (
    <Stage width={width} height={height} listening={false}>
      <Layer listening={false}>
        <Rect x={0} y={0} width={width} height={height} fill="#45b85a" listening={false} />
        <KonvaPitchLayer rect={fieldRect} template={document.field} />
        {shapeElements.map((element) => (
          <ReadonlyElement
            key={element.id}
            element={element}
            fieldRect={fieldRect}
            materialImages={materialImages}
          />
        ))}
        {materialElements.map((element) => (
          <ReadonlyElement
            key={element.id}
            element={element}
            fieldRect={fieldRect}
            materialImages={materialImages}
          />
        ))}
      </Layer>
    </Stage>
  );
}
