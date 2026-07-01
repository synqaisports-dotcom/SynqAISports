'use client';

import { useEffect, useRef, useState } from 'react';
import type { FieldRect, FieldTemplate } from '@/lib/exercise-drawing';
import { easeOutCubic, fieldRectsEqual, lerpFieldRect } from '@/lib/field-engine';

const DURATION_MS = 380;

type TransitionState = {
  displayRect: FieldRect;
  incoming: FieldTemplate;
  outgoing: FieldTemplate | null;
  blend: number;
};

export function useFieldTransition(field: FieldTemplate, targetRect: FieldRect): TransitionState {
  const [state, setState] = useState<TransitionState>({
    displayRect: targetRect,
    incoming: field,
    outgoing: null,
    blend: 1,
  });

  const prevFieldRef = useRef(field);
  const displayRectRef = useRef(targetRect);
  const animRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const fromRect = displayRectRef.current;
    const fieldChanged = mountedRef.current && field !== prevFieldRef.current;
    const needsRectAnim = mountedRef.current && !fieldRectsEqual(fromRect, targetRect);

    if (!mountedRef.current) {
      mountedRef.current = true;
      prevFieldRef.current = field;
      displayRectRef.current = targetRect;
      setState({ displayRect: targetRect, incoming: field, outgoing: null, blend: 1 });
      return;
    }

    if (!fieldChanged && !needsRectAnim) return;

    const outgoing = fieldChanged ? prevFieldRef.current : null;
    if (fieldChanged) prevFieldRef.current = field;

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const e = easeOutCubic(t);
      const nextRect = needsRectAnim || fieldChanged ? lerpFieldRect(fromRect, targetRect, e) : targetRect;
      displayRectRef.current = nextRect;

      setState({
        displayRect: nextRect,
        incoming: field,
        outgoing: fieldChanged && t < 1 ? outgoing : null,
        blend: fieldChanged ? e : 1,
      });

      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animRef.current);
  }, [field, targetRect.x, targetRect.y, targetRect.width, targetRect.height]);

  return state;
}
