'use client';

import { useEffect, useState } from 'react';
import { Group, Rect, Line, Circle, Arc } from 'react-konva';
import type { FieldRect, FieldTemplate } from '@/lib/exercise-drawing';
import { FOOTBALL_COLORS, FUTSAL_COLORS, getGrassTexture } from '@/lib/drawing-pitch-textures';

type Props = {
  rect: FieldRect;
  template: FieldTemplate;
};

const { line: LINE, lineShadow: LINE_SHADOW } = FOOTBALL_COLORS;

const GRASS_PATTERN_SCALE = 1.35;

/** Cuarto de círculo reglamentario futsal (6 m desde cada poste). */
function futsalQuarterArcPts(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  segments = 18
): number[] {
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = startAngle + t * (endAngle - startAngle);
    pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  return pts;
}

/** Arco de penalty FIFA (9,15 m desde el punto, parte exterior del área 16,5 m). */
function footballPenaltyArcPts(
  spotX: number,
  spotY: number,
  radius: number,
  facing: 'left' | 'right',
  segments = 36
): number[] {
  const halfAngle = Math.acos(5.5 / 9.15);
  const center = facing === 'left' ? 0 : Math.PI;
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = center - halfAngle + t * 2 * halfAngle;
    pts.push(spotX + radius * Math.cos(a), spotY + radius * Math.sin(a));
  }
  return pts;
}

/** Césped / pista y líneas reglamentarias en Konva. */
export function KonvaPitchLayer({ rect, template }: Props) {
  const { x, y, width: w, height: h } = rect;
  const lw = Math.max(1.2, Math.min(3.2, w * 0.0018));
  const [grassImg, setGrassImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (template === 'blank' || template === 'futsal') return;
    void getGrassTexture().then(setGrassImg);
  }, [template]);

  if (template === 'blank') {
    return (
      <Group listening={false}>
        <Rect x={x} y={y} width={w} height={h} fill="#1e293b" />
      </Group>
    );
  }

  if (template === 'futsal') {
    return <FutsalPitch x={x} y={y} w={w} h={h} lw={lw} />;
  }

  const isFootball = template.startsWith('football');

  return (
    <Group listening={false}>
      {grassImg ? (
        <Rect
          x={x}
          y={y}
          width={w}
          height={h}
          fillPatternImage={grassImg}
          fillPatternRepeat="repeat"
          fillPatternScale={{ x: GRASS_PATTERN_SCALE, y: GRASS_PATTERN_SCALE }}
        />
      ) : (
        <GrassFallback x={x} y={y} w={w} h={h} />
      )}
      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: w, y: h }}
        fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 0.5, 'rgba(0,0,0,0.02)', 1, 'rgba(0,0,0,0.1)']}
        listening={false}
      />

      {template === 'football-full' && <F11Markings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-f7' && <F7Markings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-half' && <HalfMarkings x={x} y={y} w={w} h={h} lw={lw} />}
      {template === 'football-third' && <ThirdMarkings x={x} y={y} w={w} h={h} lw={lw} />}

      {isFootball ? (
        <Rect x={x} y={y} width={w} height={h} stroke="rgba(0,0,0,0.2)" strokeWidth={1} listening={false} />
      ) : null}
    </Group>
  );
}

function GrassFallback({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const count = 8;
  const sw = w / count;
  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill="#42b85a" />
      {Array.from({ length: count }).map((_, i) => (
        <Rect
          key={i}
          x={x + i * sw}
          y={y}
          width={sw}
          height={h}
          fill={i % 2 === 0 ? '#4cc463' : '#2f8a42'}
          opacity={0.88}
        />
      ))}
    </Group>
  );
}

function FutsalPitch({ x, y, w, h, lw }: { x: number; y: number; w: number; h: number; lw: number }) {
  const band = Math.max(10, Math.min(w, h) * 0.032);
  const px = x + band;
  const py = y + band;
  const pw = w - band * 2;
  const ph = h - band * 2;

  return (
    <Group listening={false}>
      <Rect x={x} y={y} width={w} height={h} fill={FUTSAL_COLORS.border} />
      <Rect x={px} y={py} width={pw} height={ph} fill={FUTSAL_COLORS.court} />
      <FutsalMarkings x={px} y={py} w={pw} h={ph} lw={lw} />
    </Group>
  );
}

type M = { x: number; y: number; w: number; h: number; lw: number };

function F11Markings({ x, y, w, h, lw }: M) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = w * (16.5 / 105);
  const penW = h * (40.32 / 68);
  const goalD = w * (5.5 / 105);
  const goalW = h * (18.32 / 68);
  const r = h * (9.15 / 68);
  const spot = w * (11 / 105);
  const arcR = w * (9.15 / 105);
  const cornerR = h * (1 / 68);
  const netW = h * (7.32 / 68);
  const netD = w * (0.016);

  const leftSpotX = x + spot;
  const rightSpotX = x + w - spot;

  return (
    <Group>
      <PitchLine points={[x, y, x + w, y, x + w, y + h, x, y + h, x, y]} lw={lw} />
      <PitchLine points={[cx, y, cx, y + h]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.9} fill={LINE} />

      <Rect x={x - netD} y={cy - netW / 2} width={netD} height={netW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={leftSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line
        points={footballPenaltyArcPts(leftSpotX, cy, arcR, 'left')}
        stroke={LINE}
        strokeWidth={lw}
        lineCap="round"
      />

      <Rect x={x + w} y={cy - netW / 2} width={netD} height={netW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={rightSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line
        points={footballPenaltyArcPts(rightSpotX, cy, arcR, 'right')}
        stroke={LINE}
        strokeWidth={lw}
        lineCap="round"
      />

      <CornerArc cx={x} cy={y} r={cornerR} rot={0} lw={lw} />
      <CornerArc cx={x + w} cy={y} r={cornerR} rot={90} lw={lw} />
      <CornerArc cx={x} cy={y + h} r={cornerR} rot={270} lw={lw} />
      <CornerArc cx={x + w} cy={y + h} r={cornerR} rot={180} lw={lw} />
    </Group>
  );
}

/** Fútbol sala 40 × 20 m */
function FutsalMarkings({ x, y, w, h, lw }: M) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const R = w * (6 / 40);
  const gw = h * (3 / 20);
  const spot6 = w * (6 / 40);
  const spot10 = w * (10 / 40);
  const rCenter = h * (3 / 20);
  const cornerR = h * (0.25 / 20);
  const subTick = h * (0.06 / 20);
  const fl = FUTSAL_COLORS.line;
  const ty = cy - gw / 2;
  const by = cy + gw / 2;

  return (
    <Group>
      <PitchLine points={[x, y, x + w, y, x + w, y + h, x, y + h, x, y]} lw={lw} color={fl} />
      <Line points={[cx, y, cx, y + h]} stroke={fl} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={rCenter} stroke={fl} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.85} fill={fl} />

      {/* Área izquierda — D reglamentaria (cuartos de círculo + línea a 6 m) */}
      <Line
        points={futsalQuarterArcPts(x, ty, R, -Math.PI / 2, 0)}
        stroke={fl}
        strokeWidth={lw}
        lineCap="round"
      />
      <Line
        points={futsalQuarterArcPts(x, by, R, 0, Math.PI / 2)}
        stroke={fl}
        strokeWidth={lw}
        lineCap="round"
      />
      <Line points={[x + R, ty, x + R, by]} stroke={fl} strokeWidth={lw} />

      {/* Área derecha */}
      <Line
        points={futsalQuarterArcPts(x + w, ty, R, Math.PI, (3 * Math.PI) / 2)}
        stroke={fl}
        strokeWidth={lw}
        lineCap="round"
      />
      <Line
        points={futsalQuarterArcPts(x + w, by, R, Math.PI / 2, Math.PI)}
        stroke={fl}
        strokeWidth={lw}
        lineCap="round"
      />
      <Line points={[x + w - R, ty, x + w - R, by]} stroke={fl} strokeWidth={lw} />

      <Circle x={x + spot6} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={x + spot10} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={x + w - spot6} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={x + w - spot10} y={cy} radius={lw * 0.85} fill={fl} />

      <CornerArc cx={x} cy={y} r={cornerR} rot={0} lw={lw} color={fl} />
      <CornerArc cx={x + w} cy={y} r={cornerR} rot={90} lw={lw} color={fl} />
      <CornerArc cx={x} cy={y + h} r={cornerR} rot={270} lw={lw} color={fl} />
      <CornerArc cx={x + w} cy={y + h} r={cornerR} rot={180} lw={lw} color={fl} />

      {[0.2, 0.35, 0.65, 0.8].map((t) => (
        <Line
          key={t}
          points={[x + w * t, y + h, x + w * t, y + h - subTick]}
          stroke={fl}
          strokeWidth={lw * 0.9}
        />
      ))}
    </Group>
  );
}

/** F7 — 60 × 40 m */
function F7Markings({ x, y, w, h, lw }: M) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = w * (12 / 60);
  const penW = h * (24 / 40);
  const goalD = w * (4 / 60);
  const goalW = h * (10 / 40);
  const r = h * (6 / 40);

  return (
    <Group>
      <PitchLine points={[x, y, x + w, y, x + w, y + h, x, y + h, x, y]} lw={lw} />
      <PitchLine points={[cx, y, cx, y + h]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.9} fill={LINE} />
      <Rect x={x} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
    </Group>
  );
}

function HalfMarkings({ x, y, w, h, lw }: M) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const penD = w * (16.5 / 52.5);
  const penW = h * (40.32 / 68);
  const goalD = w * (5.5 / 52.5);
  const goalW = h * (18.32 / 68);
  const r = h * (9.15 / 68);

  return (
    <Group>
      <PitchLine points={[x, y, x + w, y, x + w, y + h, x, y + h, x, y]} lw={lw} />
      <PitchLine points={[x, cy, x + w, cy]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={x + w - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={x + w - w * (11 / 52.5)} y={cy} radius={lw * 0.85} fill={LINE} />
    </Group>
  );
}

function ThirdMarkings({ x, y, w, h, lw }: M) {
  const cx = x + w / 2;
  return (
    <Group>
      <PitchLine points={[x, y, x + w, y, x + w, y + h, x, y + h, x, y]} lw={lw} />
      <Line points={[cx, y, cx, y + h]} stroke={LINE} strokeWidth={lw} dash={[lw * 5, lw * 3]} />
      <Rect
        x={x + w * 0.42}
        y={y + h * 0.18}
        width={w * 0.52}
        height={h * 0.64}
        stroke={LINE}
        strokeWidth={lw}
        dash={[lw * 4, lw * 3]}
      />
    </Group>
  );
}

function PitchLine({
  points,
  lw,
  color = LINE,
}: {
  points: number[];
  lw: number;
  color?: string;
}) {
  return (
    <Group>
      <Line points={points} stroke={LINE_SHADOW} strokeWidth={lw + 0.5} lineJoin="round" opacity={0.45} />
      <Line points={points} stroke={color} strokeWidth={lw} lineJoin="round" />
    </Group>
  );
}

function CornerArc({
  cx,
  cy,
  r,
  rot,
  lw,
  color = LINE,
}: {
  cx: number;
  cy: number;
  r: number;
  rot: number;
  lw: number;
  color?: string;
}) {
  return (
    <Arc
      x={cx}
      y={cy}
      innerRadius={r}
      outerRadius={r}
      angle={90}
      rotation={rot}
      stroke={color}
      strokeWidth={lw}
    />
  );
}
