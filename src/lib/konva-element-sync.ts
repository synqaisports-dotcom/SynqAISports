import type Konva from 'konva';
import { MATERIAL_SCALE_NORM } from '@/lib/field-engine';
import type { MaterialKind } from '@/lib/drawing-material-assets';
import { isPlayerMaterial, playerImageKey } from '@/lib/drawing-material-assets';
import {
  DEFAULT_WAVE_WAVELENGTH_NORM,
  RECT_STROKE_OPACITY,
  RECT_STROKE_WIDTH_FACTOR,
  type DrawingElement,
  type FieldRect,
  type StrokeStyle,
  arrowHeadPoints,
  normToPx,
  quadBezierEndAngle,
  quadBezierLinePoints,
  textFontSizePx,
  wavePathPoints,
} from '@/lib/exercise-drawing';

function dashArray(style: StrokeStyle): number[] | undefined {
  return style.dash ? [10, 6] : undefined;
}

/** Aplica el estado interpolado de un elemento a su nodo Konva (sin re-render React). */
export function applyDrawingElementToKonvaNode(
  node: Konva.Node | undefined,
  element: DrawingElement,
  fieldRect: FieldRect,
  materialImages: Partial<Record<MaterialKind, HTMLImageElement>>,
  playerImages: Record<string, HTMLImageElement> = {}
) {
  if (!node) return;

  if (element.type === 'shape-line') {
    const line = node as Konva.Arrow | Konva.Line;
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    line.points([p1.x, p1.y, p2.x, p2.y]);
    line.stroke(element.style.color);
    line.strokeWidth(element.style.width);
    line.dash(dashArray(element.style));
    line.opacity(element.opacity);
    if ('fill' in line) line.fill(element.style.color);
    line.visible(element.opacity > 0.01);
    return;
  }

  if (element.type === 'shape-curve') {
    const group = node as Konva.Group;
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    const pc = normToPx(element.cx, element.cy, fieldRect);
    const lp2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const lpc = { x: pc.x - p1.x, y: pc.y - p1.y };
    group.position({ x: p1.x, y: p1.y });
    group.opacity(element.opacity);
    group.visible(element.opacity > 0.01);
    const curveLine = group.findOne('.curve-body') as Konva.Line | null;
    const arrowHead = group.findOne('.curve-arrow') as Konva.Line | null;
    if (curveLine) {
      curveLine.points(quadBezierLinePoints({ x: 0, y: 0 }, lpc, lp2));
      curveLine.stroke(element.style.color);
      curveLine.strokeWidth(element.style.width);
      curveLine.dash(dashArray(element.style));
    }
    if (arrowHead) {
      if (element.arrowEnd) {
        arrowHead.visible(true);
        arrowHead.points(
          arrowHeadPoints(
            lp2.x,
            lp2.y,
            quadBezierEndAngle({ x: 0, y: 0 }, lpc, lp2),
            Math.max(8, element.style.width * 3)
          )
        );
        arrowHead.fill(element.style.color);
        arrowHead.stroke(element.style.color);
      } else {
        arrowHead.visible(false);
      }
    }
    return;
  }

  if (element.type === 'shape-wave') {
    const line = node as Konva.Line;
    const p1 = normToPx(element.x1, element.y1, fieldRect);
    const p2 = normToPx(element.x2, element.y2, fieldRect);
    const amp = element.amplitude * fieldRect.width;
    const wavelength = DEFAULT_WAVE_WAVELENGTH_NORM * fieldRect.width;
    line.points(wavePathPoints(p1.x, p1.y, p2.x, p2.y, amp, wavelength));
    line.stroke(element.style.color);
    line.strokeWidth(element.style.width);
    line.dash(dashArray(element.style));
    line.opacity(element.opacity);
    line.visible(element.opacity > 0.01);
    return;
  }

  if (element.type === 'shape-rect') {
    const rect = node as Konva.Rect;
    const p = normToPx(element.x, element.y, fieldRect);
    rect.position({ x: p.x, y: p.y });
    rect.width(element.width * fieldRect.width);
    rect.height(element.height * fieldRect.height);
    rect.rotation(element.rotation);
    rect.fill(element.fill);
    rect.setAttr('fillOpacity', element.fillOpacity);
    rect.stroke(element.style.color);
    rect.setAttr('strokeOpacity', RECT_STROKE_OPACITY);
    rect.strokeWidth(element.style.width * RECT_STROKE_WIDTH_FACTOR);
    rect.opacity(element.opacity);
    rect.dash(dashArray(element.style));
    rect.visible(element.opacity > 0.01);
    return;
  }

  if (element.type === 'shape-text') {
    const group = node as Konva.Group;
    const p = normToPx(element.x, element.y, fieldRect);
    group.position({ x: p.x, y: p.y });
    group.opacity(element.opacity);
    group.visible(element.opacity > 0.01);
    const text = group.findOne('Text') as Konva.Text | null;
    if (text) {
      text.text(element.text);
      text.fontSize(textFontSizePx(element.fontSize, fieldRect.width));
      text.fill(element.color);
    }
    return;
  }

  if (element.type === 'material') {
    const group = node as Konva.Group;
    const p = normToPx(element.x, element.y, fieldRect);
    const base = fieldRect.width * MATERIAL_SCALE_NORM;
    group.position({ x: p.x, y: p.y });
    group.rotation(element.rotation);
    group.opacity(element.opacity);
    group.visible(element.opacity > 0.01);

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
      const lines = group.find('Line');
      if (lines.length >= 2) {
        (lines[0] as Konva.Line).points([-hw, -hh, -hw, hh]);
        (lines[1] as Konva.Line).points([hw, -hh, hw, hh]);
        for (let i = 0; i < rungs && i + 2 < lines.length; i++) {
          const y = -hh + (i / (rungs - 1)) * ladderH;
          (lines[i + 2] as Konva.Line).points([-hw, y, hw, y]);
        }
      }
      return;
    }

    const imgNode = group.findOne('Image') as Konva.Image | null;
    const scale = element.scale * base;
    if (imgNode) {
      const img = isPlayerMaterial(element.material)
        ? playerImages[playerImageKey(element.material, element.label)]
        : materialImages[element.material];
      if (img) imgNode.image(img);
      imgNode.width(scale);
      imgNode.height(scale);
      imgNode.offsetX(scale / 2);
      imgNode.offsetY(scale / 2);
    }
  }
}

export function collectAnimationElementUnion(
  scenes: { elements: DrawingElement[] }[]
): DrawingElement[] {
  const byId = new Map<string, DrawingElement>();
  for (const scene of scenes) {
    for (const element of scene.elements) {
      if (!byId.has(element.id)) byId.set(element.id, element);
    }
  }
  return [...byId.values()];
}
