'use client';

import type Konva from 'konva';
import { Circle, Group, Image as KonvaImage, Text } from 'react-konva';
import { MATERIAL_SCALE_NORM } from '@/lib/field-engine';
import {
  isPlayerMaterial,
  playerLabelFontSize,
  type MaterialKind,
} from '@/lib/drawing-material-assets';
import type { MaterialElement } from '@/lib/exercise-drawing';
import type { FieldRect } from '@/lib/exercise-drawing';
import { normToPx } from '@/lib/exercise-drawing';

type SpriteProps = {
  element: MaterialElement;
  fieldRect: FieldRect;
  materialImages: Partial<Record<MaterialKind, HTMLImageElement>>;
  listening?: boolean;
  draggable?: boolean;
  onSelect?: () => void;
  onDragEnd?: (x: number, y: number) => void;
  onTransformEnd?: (node: {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  }) => void;
  innerRef?: (node: Konva.Group | null) => void;
};

export function MaterialKonvaSprite({
  element,
  fieldRect,
  materialImages,
  listening = false,
  draggable = false,
  onSelect,
  onDragEnd,
  onTransformEnd,
  innerRef,
}: SpriteProps) {
  const p = normToPx(element.x, element.y, fieldRect);
  const base = fieldRect.width * MATERIAL_SCALE_NORM;
  const img = materialImages[element.material];
  const scaleXn = element.scaleX ?? element.scale;
  const scaleYn = element.scaleY ?? element.scale;
  const width = scaleXn * base;
  const height = scaleYn * base;
  const uniform = element.material !== 'ladder';
  const renderScale = uniform ? element.scale * base : undefined;

  return (
    <Group
      id={element.id}
      x={p.x}
      y={p.y}
      rotation={element.rotation}
      opacity={element.opacity}
      listening={listening}
      draggable={draggable}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onSelect?.();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect?.();
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect?.();
      }}
      onDragEnd={(ev) => onDragEnd?.(ev.target.x(), ev.target.y())}
      onTransformEnd={(ev) => {
        const node = ev.target;
        onTransformEnd?.({
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
      ref={innerRef}
    >
      {img ? (
        uniform ? (
          <KonvaImage
            image={img}
            width={renderScale}
            height={renderScale}
            offsetX={(renderScale ?? 0) / 2}
            offsetY={(renderScale ?? 0) / 2}
            listening={false}
          />
        ) : (
          <KonvaImage
            image={img}
            width={width}
            height={height}
            offsetX={width / 2}
            offsetY={height / 2}
            listening={false}
          />
        )
      ) : (
        <Circle radius={(renderScale ?? width) / 2} fill="#334155" listening={false} />
      )}
      {isPlayerMaterial(element.material) && element.label ? (
        <Text
          name="player-label"
          text={element.label}
          fontSize={playerLabelFontSize(renderScale ?? width)}
          fill="#ffffff"
          fontStyle="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          align="center"
          verticalAlign="middle"
          width={renderScale ?? width}
          offsetX={(renderScale ?? width) / 2}
          offsetY={(playerLabelFontSize(renderScale ?? width) * 0.55)}
          listening={false}
          shadowColor="rgba(0,0,0,0.45)"
          shadowBlur={5}
          shadowOffsetY={1}
        />
      ) : null}
    </Group>
  );
}
