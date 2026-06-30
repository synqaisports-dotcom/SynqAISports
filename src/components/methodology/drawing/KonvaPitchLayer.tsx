'use client';

import { useMemo } from 'react';
import { Group, Rect, Line, Circle, Arc } from 'react-konva';
import type { FieldRect, FieldTemplate } from '@/lib/exercise-drawing';

type Props = {
  rect: FieldRect;
  template: FieldTemplate;
};

const LINE = '#f1f5f9';
const GRASS_A = '#1a6b3c';
const GRASS_B = '#1f7a45';

/** Césped y líneas reglamentarias renderizados en Konva (alta calidad, táctil). */
export function KonvaPitchLayer({ rect, template }: Props) {
  const { x, y, width: w, height: h } = rect;
  const lw = Math.max(1.5, w * 0.0028);

  const stripes = useMemo(() => {
    const count = 12;
    const sw = w / count;
    return Array.from({ length: count }, (_, i) => ({
      x: x + i * sw,
      fill: i % 2 === 0 ? GRASS_A : GRASS_B,
      width: sw,
    }));
  }, [x, w]);

  if (template === 'blank') {
    return (
      <Group listening={false}>
        <Rect x={x} y={y} width={w} height={h} fill="#1e293b" cornerRadius={2} />
      </Group>
    );
  }

  return (
    <Group listening={false}>
      <Rect x={x} y={y} width={w} height={h} fill={GRASS_A} cornerRadius={3} />
      {stripes.map((s, i) => (
        <Rect key={i} x={s.x} y={y} width={s.width} height={h} fill={s.fill} opacity={0.92} />
      ))}
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={2}
        cornerRadius={3}
        fill="transparent"
      />

      {template === 'football-full' && <F11Markings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-f7' && <F7Markings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-half' && <HalfMarkings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-third' && <ThirdMarkings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'futsal' && <FutsalMarkings x={x} y={y} w={w} h={h} lw={lw} />}
    </Group>
  );
}

type M = { x: number; y: number; w: number; h: number; lw: number };

function F11Markings({ x, y, w, h, lw }: M) {
  const m = 0.028;
  const px = x + w * m;
  const py = y + h * m;
  const pw = w * (1 - 2 * m);
  const ph = h * (1 - 2 * m);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = ph * (16.5 / 68);
  const penW = pw * (40.32 / 105);
  const goalD = ph * (5.5 / 68);
  const goalW = pw * (18.32 / 105);
  const r = ph * (9.15 / 68);
  const spot = pw * (11 / 105);
  const arcR = ph * (9.15 / 68);

  return (
    <Group>
      <Rect x={px} y={py} width={pw} height={ph} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Line points={[cx, py, cx, py + ph]} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={lw * 1.2} fill={LINE} />
      {/* Área izquierda */}
      <Rect x={px} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={px + spot} y={cy} radius={lw * 1.1} fill={LINE} />
      <Arc
        x={px + penD}
        y={cy}
        innerRadius={arcR}
        outerRadius={arcR}
        angle={90}
        rotation={-90}
        stroke={LINE}
        strokeWidth={lw}
      />
      {/* Área derecha */}
      <Rect x={px + pw - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={px + pw - spot} y={cy} radius={lw * 1.1} fill={LINE} />
      <Arc x={px + pw - penD} y={cy} innerRadius={arcR} outerRadius={arcR} angle={90} rotation={0} stroke={LINE} strokeWidth={lw} />
      {/* Esquinas */}
      <CornerArc cx={px} cy={py} r={ph * 0.02} start={0} lw={lw} />
      <CornerArc cx={px + pw} cy={py} r={ph * 0.02} start={90} lw={lw} />
      <CornerArc cx={px} cy={py + ph} r={ph * 0.02} start={270} lw={lw} />
      <CornerArc cx={px + pw} cy={py + ph} r={ph * 0.02} start={180} lw={lw} />
    </Group>
  );
}

function F7Markings({ x, y, w, h, lw }: M) {
  const m = 0.03;
  const px = x + w * m;
  const py = y + h * m;
  const pw = w * (1 - 2 * m);
  const ph = h * (1 - 2 * m);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = ph * 0.22;
  const penW = pw * 0.55;
  const goalD = ph * 0.08;
  const goalW = pw * 0.28;
  const r = ph * 0.18;

  return (
    <Group>
      <Rect x={px} y={py} width={pw} height={ph} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Line points={[cx, py, cx, py + ph]} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={lw * 1.2} fill={LINE} />
      <Rect x={px} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
    </Group>
  );
}

function HalfMarkings({ x, y, w, h, lw }: M) {
  const m = 0.03;
  const px = x + w * m;
  const py = y + h * m;
  const pw = w * (1 - 2 * m);
  const ph = h * (1 - 2 * m);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = ph * (16.5 / 68);
  const penW = pw * (40.32 / 52.5);
  const goalD = ph * (5.5 / 68);
  const goalW = pw * (18.32 / 52.5);
  const r = ph * (9.15 / 68);

  return (
    <Group>
      <Rect x={px} y={py} width={pw} height={ph} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Line points={[px, cy, px + pw, cy]} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={px + pw - pw * (11 / 52.5)} y={cy} radius={lw * 1.1} fill={LINE} />
    </Group>
  );
}

function ThirdMarkings({ x, y, w, h, lw }: M) {
  const m = 0.035;
  const px = x + w * m;
  const py = y + h * m;
  const pw = w * (1 - 2 * m);
  const ph = h * (1 - 2 * m);
  const cx = x + w / 2;

  return (
    <Group>
      <Rect x={px} y={py} width={pw} height={ph} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Line points={[cx, py, cx, py + ph]} stroke={LINE} strokeWidth={lw} dash={[lw * 4, lw * 3]} />
      <Rect
        x={px + pw * 0.45}
        y={py + ph * 0.2}
        width={pw * 0.5}
        height={ph * 0.6}
        stroke={LINE}
        strokeWidth={lw}
        dash={[lw * 3, lw * 2]}
      />
    </Group>
  );
}

function FutsalMarkings({ x, y, w, h, lw }: M) {
  const m = 0.04;
  const px = x + w * m;
  const py = y + h * m;
  const pw = w * (1 - 2 * m);
  const ph = h * (1 - 2 * m);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = pw * 0.15;
  const penW = ph * 0.5;
  const r = ph * 0.22;

  return (
    <Group>
      <Rect x={px} y={py} width={pw} height={ph} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Line points={[cx, py, cx, py + ph]} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={lw * 1.2} fill={LINE} />
      <Rect x={px} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={px + pw - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
    </Group>
  );
}

function CornerArc({
  cx,
  cy,
  r,
  start,
  lw,
}: {
  cx: number;
  cy: number;
  r: number;
  start: number;
  lw: number;
}) {
  return <Arc x={cx} y={cy} innerRadius={r} outerRadius={r} angle={90} rotation={start} stroke={LINE} strokeWidth={lw} />;
}
