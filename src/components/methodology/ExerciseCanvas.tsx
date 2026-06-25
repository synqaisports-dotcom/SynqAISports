'use client';

import { useCallback, useRef, useState } from 'react';
import type { DrawingData, DrawingStroke } from '@/lib/methodology';
import { parseDrawingJson } from '@/lib/methodology';

type Props = {
  name?: string;
  initialData?: DrawingData | unknown;
  height?: number;
};

export function ExerciseCanvas({ name = 'drawingJson', initialData, height = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<DrawingStroke[]>(
    () => parseDrawingJson(initialData).strokes
  );
  const [current, setCurrent] = useState<DrawingStroke | null>(null);
  const drawing = useRef(false);

  const redraw = useCallback((strokeList: DrawingStroke[], preview?: DrawingStroke | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const all = preview ? [...strokeList, preview] : strokeList;
    all.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
      }
      ctx.stroke();
    });
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = getPos(e);
    drawing.current = true;
    setCurrent({ points: [[x, y]], color: '#22c55e', width: 4 });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !current) return;
    const { x, y } = getPos(e);
    const next = { ...current, points: [...current.points, [x, y] as [number, number]] };
    setCurrent(next);
    redraw(strokes, next);
  }

  function onPointerUp() {
    if (!drawing.current || !current) return;
    drawing.current = false;
    const next = [...strokes, current];
    setStrokes(next);
    setCurrent(null);
    redraw(next);
  }

  function clear() {
    setStrokes([]);
    setCurrent(null);
    redraw([]);
  }

  const json = JSON.stringify({ strokes } satisfies DrawingData);

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={clear}
          className="rounded border border-white/15 px-3 py-1 text-xs text-synq-muted hover:text-white"
        >
          Borrar dibujo
        </button>
      </div>
      <canvas
        ref={(el) => {
          canvasRef.current = el;
          if (el) {
            el.width = el.clientWidth * 2;
            el.height = height * 2;
            redraw(strokes);
          }
        }}
        className="w-full touch-none rounded-lg border border-white/10"
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <input type="hidden" name={name} value={json} readOnly />
    </div>
  );
}

export function ExerciseCanvasPreview({
  data,
  height = 120,
}: {
  data: DrawingData | unknown;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokes = parseDrawingJson(data).strokes;

  return (
    <canvas
      ref={(el) => {
        canvasRef.current = el;
        if (!el) return;
        el.width = 400;
        el.height = height * 2;
        const ctx = el.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, el.width, el.height);
        strokes.forEach((stroke) => {
          if (stroke.points.length < 2) return;
          ctx.strokeStyle = stroke.color;
          ctx.lineWidth = stroke.width;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(stroke.points[0][0], stroke.points[0][1]);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i][0], stroke.points[i][1]);
          }
          ctx.stroke();
        });
      }}
      className="w-full rounded border border-white/5"
      style={{ height }}
    />
  );
}
