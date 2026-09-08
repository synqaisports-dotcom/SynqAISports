import {
  type DrawingAnimation,
  type DrawingElement,
  type StrokeStyle,
  cloneDrawingElements,
  sortElementsByLayer,
} from '@/lib/exercise-drawing';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerpStroke(from: StrokeStyle, to: StrokeStyle, t: number): StrokeStyle {
  return t < 0.5 ? from : to;
}

function interpolateLineLike(
  from: DrawingElement & { type: 'shape-line' | 'shape-curve' | 'shape-wave' },
  to: DrawingElement & { type: 'shape-line' | 'shape-curve' | 'shape-wave' },
  t: number
): DrawingElement {
  const base = {
    id: from.id,
    type: from.type,
    style: lerpStroke(from.style, to.style, t),
    opacity: lerp(from.opacity, to.opacity, t),
  } as const;

  if (from.type === 'shape-line' && to.type === 'shape-line') {
    return {
      ...base,
      type: 'shape-line',
      x1: lerp(from.x1, to.x1, t),
      y1: lerp(from.y1, to.y1, t),
      x2: lerp(from.x2, to.x2, t),
      y2: lerp(from.y2, to.y2, t),
      arrowStart: t < 0.5 ? from.arrowStart : to.arrowStart,
      arrowEnd: t < 0.5 ? from.arrowEnd : to.arrowEnd,
    };
  }

  if (from.type === 'shape-curve' && to.type === 'shape-curve') {
    return {
      ...base,
      type: 'shape-curve',
      x1: lerp(from.x1, to.x1, t),
      y1: lerp(from.y1, to.y1, t),
      x2: lerp(from.x2, to.x2, t),
      y2: lerp(from.y2, to.y2, t),
      cx: lerp(from.cx, to.cx, t),
      cy: lerp(from.cy, to.cy, t),
      arrowEnd: t < 0.5 ? from.arrowEnd : to.arrowEnd,
    };
  }

  if (from.type === 'shape-wave' && to.type === 'shape-wave') {
    return {
      ...base,
      type: 'shape-wave',
      x1: lerp(from.x1, to.x1, t),
      y1: lerp(from.y1, to.y1, t),
      x2: lerp(from.x2, to.x2, t),
      y2: lerp(from.y2, to.y2, t),
      amplitude: lerp(from.amplitude, to.amplitude, t),
    };
  }

  return t < 0.5 ? from : to;
}

function interpolateElement(from: DrawingElement | undefined, to: DrawingElement | undefined, t: number): DrawingElement | null {
  if (!from && !to) return null;
  if (!from && to) {
    return { ...to, opacity: lerp(0, to.opacity, t) };
  }
  if (from && !to) {
    return { ...from, opacity: lerp(from.opacity, 0, t) };
  }
  if (!from || !to) return null;

  if (from.type !== to.type) {
    return t < 0.5
      ? { ...from, opacity: lerp(from.opacity, 0, t * 2) }
      : { ...to, opacity: lerp(0, to.opacity, (t - 0.5) * 2) };
  }

  switch (from.type) {
    case 'shape-line':
    case 'shape-curve':
    case 'shape-wave':
      return interpolateLineLike(from, to as typeof from, t);
    case 'shape-rect': {
      const fromRect = from;
      const toRect = to as typeof from;
      return {
        ...fromRect,
        x: lerp(fromRect.x, toRect.x, t),
        y: lerp(fromRect.y, toRect.y, t),
        width: lerp(fromRect.width, toRect.width, t),
        height: lerp(fromRect.height, toRect.height, t),
        rotation: lerp(fromRect.rotation, toRect.rotation, t),
        fill: t < 0.5 ? fromRect.fill : toRect.fill,
        fillOpacity: lerp(fromRect.fillOpacity, toRect.fillOpacity, t),
        style: lerpStroke(fromRect.style, toRect.style, t),
        opacity: lerp(fromRect.opacity, toRect.opacity, t),
      };
    }
    case 'shape-text': {
      const fromText = from;
      const toText = to as typeof from;
      return {
        ...fromText,
        x: lerp(fromText.x, toText.x, t),
        y: lerp(fromText.y, toText.y, t),
        text: t < 0.5 ? fromText.text : toText.text,
        fontSize: t < 0.5 ? fromText.fontSize : toText.fontSize,
        color: t < 0.5 ? fromText.color : toText.color,
        opacity: lerp(fromText.opacity, toText.opacity, t),
      };
    }
    case 'material': {
      const fromMat = from;
      const toMat = to as typeof from;
      return {
        ...fromMat,
        material: fromMat.material,
        x: lerp(fromMat.x, toMat.x, t),
        y: lerp(fromMat.y, toMat.y, t),
        rotation: lerp(fromMat.rotation, toMat.rotation, t),
        scale: lerp(fromMat.scale, toMat.scale, t),
        scaleX: lerp(fromMat.scaleX ?? fromMat.scale, toMat.scaleX ?? toMat.scale, t),
        scaleY: lerp(fromMat.scaleY ?? fromMat.scale, toMat.scaleY ?? toMat.scale, t),
        label: t < 0.5 ? fromMat.label : toMat.label,
        opacity: lerp(fromMat.opacity, toMat.opacity, t),
      };
    }
    default:
      return t < 0.5 ? from : to;
  }
}

export function interpolateElements(
  fromElements: DrawingElement[],
  toElements: DrawingElement[],
  t: number
): DrawingElement[] {
  const fromMap = new Map(fromElements.map((el) => [el.id, el]));
  const toMap = new Map(toElements.map((el) => [el.id, el]));
  const ids = new Set([...fromMap.keys(), ...toMap.keys()]);
  const result: DrawingElement[] = [];

  for (const id of ids) {
    const interpolated = interpolateElement(fromMap.get(id), toMap.get(id), t);
    if (interpolated && interpolated.opacity > 0.01) {
      result.push(interpolated);
    }
  }

  return sortElementsByLayer(result);
}

export type AnimationPlaybackState = {
  elements: DrawingElement[];
  sceneIndex: number;
  phase: 'hold' | 'transition';
  localProgress: number;
};

export function getAnimationCycleDuration(animation: DrawingAnimation): number {
  const count = animation.scenes.length;
  if (count <= 1) return animation.holdMs;
  return count * animation.holdMs + (count - 1) * animation.transitionMs;
}

export function getAnimationPlaybackState(
  animation: DrawingAnimation,
  elapsedMs: number,
  loop = true
): AnimationPlaybackState {
  const { scenes, transitionMs, holdMs } = animation;
  if (scenes.length === 0) {
    return { elements: [], sceneIndex: 0, phase: 'hold', localProgress: 0 };
  }
  if (scenes.length === 1) {
    return {
      elements: cloneDrawingElements(scenes[0].elements),
      sceneIndex: 0,
      phase: 'hold',
      localProgress: 0,
    };
  }

  const cycleMs = getAnimationCycleDuration(animation);
  let time = Math.max(0, elapsedMs);
  if (loop && cycleMs > 0) {
    time = elapsedMs % cycleMs;
  } else if (time >= cycleMs) {
    const last = scenes[scenes.length - 1];
    return {
      elements: cloneDrawingElements(last.elements),
      sceneIndex: scenes.length - 1,
      phase: 'hold',
      localProgress: 1,
    };
  }

  let cursor = 0;
  for (let index = 0; index < scenes.length; index++) {
    if (time < cursor + holdMs) {
      return {
        elements: cloneDrawingElements(scenes[index].elements),
        sceneIndex: index,
        phase: 'hold',
        localProgress: holdMs > 0 ? (time - cursor) / holdMs : 0,
      };
    }
    cursor += holdMs;

    if (index < scenes.length - 1) {
      if (time < cursor + transitionMs) {
        const localT = transitionMs > 0 ? (time - cursor) / transitionMs : 1;
        const eased = easeInOutCubic(localT);
        return {
          elements: interpolateElements(scenes[index].elements, scenes[index + 1].elements, eased),
          sceneIndex: index,
          phase: 'transition',
          localProgress: localT,
        };
      }
      cursor += transitionMs;
    }
  }

  const last = scenes[scenes.length - 1];
  return {
    elements: cloneDrawingElements(last.elements),
    sceneIndex: scenes.length - 1,
    phase: 'hold',
    localProgress: 1,
  };
}

export function getGlobalAnimationProgress(elapsedMs: number, animation: DrawingAnimation, loop = true): number {
  const cycleMs = getAnimationCycleDuration(animation);
  if (cycleMs <= 0) return 0;
  if (loop) return (elapsedMs % cycleMs) / cycleMs;
  return Math.min(1, elapsedMs / cycleMs);
}

export function elapsedMsFromGlobalProgress(progress: number, animation: DrawingAnimation): number {
  const cycleMs = getAnimationCycleDuration(animation);
  return Math.max(0, Math.min(1, progress)) * cycleMs;
}
