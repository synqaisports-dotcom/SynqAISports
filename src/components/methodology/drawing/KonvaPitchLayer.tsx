'use client';

import { useEffect, useState } from 'react';
import { Group, Rect, Line, Circle, Arc } from 'react-konva';
import type { FieldRect, FieldTemplate } from '@/lib/exercise-drawing';
import { F7_MARKS, FUTSAL_COURT_NORM, FieldMapper } from '@/lib/field-engine';
import { FOOTBALL_COLORS, FUTSAL_COLORS, getGrassTexture } from '@/lib/drawing-pitch-textures';

type Props = {
  rect: FieldRect;
  template: FieldTemplate;
  opacity?: number;
};

const { line: LINE, lineShadow: LINE_SHADOW } = FOOTBALL_COLORS;
const GRASS_PATTERN_SCALE = 1.35;

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

function f7PenaltyArcPts(
  spotX: number,
  spotY: number,
  radius: number,
  facing: 'left' | 'right',
  segments = 28
): number[] {
  const center = facing === 'left' ? 0 : Math.PI;
  const pts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = center - Math.PI / 2 + t * Math.PI;
    pts.push(spotX + radius * Math.cos(a), spotY + radius * Math.sin(a));
  }
  return pts;
}

/** Césped / pista y líneas reglamentarias — coordenadas % vía FieldMapper. */
export function KonvaPitchLayer({ rect, template, opacity = 1 }: Props) {
  const m = new FieldMapper(rect);
  const lw = m.lineWidth();
  const [grassImg, setGrassImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (template === 'blank' || template === 'futsal') return;
    void getGrassTexture().then(setGrassImg);
  }, [template]);

  const content = (() => {
    if (template === 'blank') {
      return <Rect x={m.x(0)} y={m.y(0)} width={m.w(1)} height={m.h(1)} fill="#1e293b" />;
    }
    if (template === 'futsal') return <FutsalPitch m={m} lw={lw} />;
    return (
      <>
        {grassImg ? (
          <Rect
            x={m.x(0)}
            y={m.y(0)}
            width={m.w(1)}
            height={m.h(1)}
            fillPatternImage={grassImg}
            fillPatternRepeat="repeat"
            fillPatternScale={{ x: GRASS_PATTERN_SCALE, y: GRASS_PATTERN_SCALE }}
          />
        ) : (
          <GrassFallback m={m} />
        )}
        <Rect
          x={m.x(0)}
          y={m.y(0)}
          width={m.w(1)}
          height={m.h(1)}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: m.w(1), y: m.h(1) }}
          fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 0.5, 'rgba(0,0,0,0.02)', 1, 'rgba(0,0,0,0.1)']}
          listening={false}
        />
        {template === 'football-full' && <F11Markings m={m} lw={lw} />}
        {template === 'football-f7' && <F7Markings m={m} lw={lw} />}
        {template === 'football-half' && <HalfMarkings m={m} lw={lw} />}
        {template === 'football-third' && <ThirdMarkings m={m} lw={lw} />}
        <Rect x={m.x(0)} y={m.y(0)} width={m.w(1)} height={m.h(1)} stroke="rgba(0,0,0,0.2)" strokeWidth={1} listening={false} />
      </>
    );
  })();

  return (
    <Group listening={false} opacity={opacity}>
      {content}
    </Group>
  );
}

function GrassFallback({ m }: { m: FieldMapper }) {
  const count = 8;
  const sw = m.w(1 / count);
  return (
    <Group>
      <Rect x={m.x(0)} y={m.y(0)} width={m.w(1)} height={m.h(1)} fill="#42b85a" />
      {Array.from({ length: count }).map((_, i) => (
        <Rect
          key={i}
          x={m.x(i / count)}
          y={m.y(0)}
          width={sw}
          height={m.h(1)}
          fill={i % 2 === 0 ? '#4cc463' : '#2f8a42'}
          opacity={0.88}
        />
      ))}
    </Group>
  );
}

function FutsalPitch({ m, lw }: { m: FieldMapper; lw: number }) {
  const court = m.inset(FUTSAL_COURT_NORM.x, FUTSAL_COURT_NORM.y, FUTSAL_COURT_NORM.w, FUTSAL_COURT_NORM.h);
  return (
    <Group listening={false}>
      <Rect x={m.x(0)} y={m.y(0)} width={m.w(1)} height={m.h(1)} fill={FUTSAL_COLORS.border} />
      <Rect x={court.rect.x} y={court.rect.y} width={court.rect.width} height={court.rect.height} fill={FUTSAL_COLORS.court} />
      <FutsalMarkings m={court} lw={lw} />
    </Group>
  );
}

function F11Markings({ m, lw }: { m: FieldMapper; lw: number }) {
  const cx = m.x(0.5);
  const cy = m.y(0.5);
  const penD = m.w(16.5 / 105);
  const penW = m.h(40.32 / 68);
  const goalD = m.w(5.5 / 105);
  const goalW = m.h(18.32 / 68);
  const r = m.h(9.15 / 68);
  const spot = 11 / 105;
  const arcR = m.w(9.15 / 105);
  const cornerR = m.h(1 / 68);
  const netW = m.h(7.32 / 68);
  const netD = m.w(0.016);

  const leftSpotX = m.x(spot);
  const rightSpotX = m.x(1 - spot);

  return (
    <Group>
      <PitchLine points={[m.x(0), m.y(0), m.x(1), m.y(0), m.x(1), m.y(1), m.x(0), m.y(1), m.x(0), m.y(0)]} lw={lw} />
      <PitchLine points={[cx, m.y(0), cx, m.y(1)]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.9} fill={LINE} />

      <Rect x={m.x(0) - netD} y={cy - netW / 2} width={netD} height={netW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(0)} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(0)} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={leftSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line points={footballPenaltyArcPts(leftSpotX, cy, arcR, 'left')} stroke={LINE} strokeWidth={lw} lineCap="round" />

      <Rect x={m.x(1)} y={cy - netW / 2} width={netD} height={netW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(1) - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(1) - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={rightSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line points={footballPenaltyArcPts(rightSpotX, cy, arcR, 'right')} stroke={LINE} strokeWidth={lw} lineCap="round" />

      <CornerArc cx={m.x(0)} cy={m.y(0)} r={cornerR} rot={0} lw={lw} />
      <CornerArc cx={m.x(1)} cy={m.y(0)} r={cornerR} rot={90} lw={lw} />
      <CornerArc cx={m.x(0)} cy={m.y(1)} r={cornerR} rot={270} lw={lw} />
      <CornerArc cx={m.x(1)} cy={m.y(1)} r={cornerR} rot={180} lw={lw} />
    </Group>
  );
}

/** Fútbol sala — coordenadas % sobre la pista interior 38×19 m */
function FutsalMarkings({ m, lw }: { m: FieldMapper; lw: number }) {
  const cx = m.x(0.5);
  const cy = m.y(0.5);
  const R = m.w(6 / 38);
  const gw = m.h(3 / 19);
  const spot6 = 6 / 38;
  const spot10 = 10 / 38;
  const rCenter = m.h(3 / 19);
  const cornerR = m.h(0.25 / 19);
  const subTick = m.h(0.06 / 19);
  const fl = FUTSAL_COLORS.line;
  const ty = cy - gw / 2;
  const by = cy + gw / 2;

  return (
    <Group>
      <PitchLine points={[m.x(0), m.y(0), m.x(1), m.y(0), m.x(1), m.y(1), m.x(0), m.y(1), m.x(0), m.y(0)]} lw={lw} color={fl} />
      <Line points={[cx, m.y(0), cx, m.y(1)]} stroke={fl} strokeWidth={lw} />
      <Circle x={cx} y={cy} radius={rCenter} stroke={fl} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.85} fill={fl} />

      <Line points={futsalQuarterArcPts(m.x(0), ty, R, -Math.PI / 2, 0)} stroke={fl} strokeWidth={lw} lineCap="round" />
      <Line points={futsalQuarterArcPts(m.x(0), by, R, 0, Math.PI / 2)} stroke={fl} strokeWidth={lw} lineCap="round" />
      <Line points={[m.x(6 / 38), ty, m.x(6 / 38), by]} stroke={fl} strokeWidth={lw} />

      <Line points={futsalQuarterArcPts(m.x(1), ty, R, Math.PI, (3 * Math.PI) / 2)} stroke={fl} strokeWidth={lw} lineCap="round" />
      <Line points={futsalQuarterArcPts(m.x(1), by, R, Math.PI / 2, Math.PI)} stroke={fl} strokeWidth={lw} lineCap="round" />
      <Line points={[m.x(1 - 6 / 38), ty, m.x(1 - 6 / 38), by]} stroke={fl} strokeWidth={lw} />

      <Circle x={m.x(spot6)} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={m.x(spot10)} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={m.x(1 - spot6)} y={cy} radius={lw * 0.85} fill={fl} />
      <Circle x={m.x(1 - spot10)} y={cy} radius={lw * 0.85} fill={fl} />

      <CornerArc cx={m.x(0)} cy={m.y(0)} r={cornerR} rot={0} lw={lw} color={fl} />
      <CornerArc cx={m.x(1)} cy={m.y(0)} r={cornerR} rot={90} lw={lw} color={fl} />
      <CornerArc cx={m.x(0)} cy={m.y(1)} r={cornerR} rot={270} lw={lw} color={fl} />
      <CornerArc cx={m.x(1)} cy={m.y(1)} r={cornerR} rot={180} lw={lw} color={fl} />

      {[0.2, 0.35, 0.65, 0.8].map((t) => (
        <Line key={t} points={[m.x(t), m.y(1), m.x(t), m.y(1) - subTick]} stroke={fl} strokeWidth={lw * 0.9} />
      ))}
    </Group>
  );
}

function F7Markings({ m, lw }: { m: FieldMapper; lw: number }) {
  const cx = m.x(0.5);
  const cy = m.y(0.5);
  const penD = m.w(F7_MARKS.penDepth);
  const penW = m.h(F7_MARKS.penWidth);
  const goalD = m.w(F7_MARKS.goalDepth);
  const goalW = m.h(F7_MARKS.goalWidth);
  const r = m.h(F7_MARKS.centerR);
  const arcR = m.w(F7_MARKS.arcR);
  const cornerR = m.h(F7_MARKS.cornerR);
  const leftSpotX = m.x(F7_MARKS.spot);
  const rightSpotX = m.x(1 - F7_MARKS.spot);

  return (
    <Group>
      <PitchLine points={[m.x(0), m.y(0), m.x(1), m.y(0), m.x(1), m.y(1), m.x(0), m.y(1), m.x(0), m.y(0)]} lw={lw} />
      <PitchLine points={[cx, m.y(0), cx, m.y(1)]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} fill="transparent" />
      <Circle x={cx} y={cy} radius={lw * 0.9} fill={LINE} />

      {/* Líneas de fuera de juego — 12 m desde cada meta */}
      <Line points={[m.x(F7_MARKS.offside), m.y(0), m.x(F7_MARKS.offside), m.y(1)]} stroke={LINE} strokeWidth={lw} />
      <Line points={[m.x(1 - F7_MARKS.offside), m.y(0), m.x(1 - F7_MARKS.offside), m.y(1)]} stroke={LINE} strokeWidth={lw} />

      {/* Área izquierda */}
      <Rect x={m.x(0)} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(0)} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={leftSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line points={f7PenaltyArcPts(leftSpotX, cy, arcR, 'left')} stroke={LINE} strokeWidth={lw} lineCap="round" />

      {/* Área derecha */}
      <Rect x={m.x(1) - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(1) - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={rightSpotX} y={cy} radius={lw * 0.85} fill={LINE} />
      <Line points={f7PenaltyArcPts(rightSpotX, cy, arcR, 'right')} stroke={LINE} strokeWidth={lw} lineCap="round" />

      <CornerArc cx={m.x(0)} cy={m.y(0)} r={cornerR} rot={0} lw={lw} />
      <CornerArc cx={m.x(1)} cy={m.y(0)} r={cornerR} rot={90} lw={lw} />
      <CornerArc cx={m.x(0)} cy={m.y(1)} r={cornerR} rot={270} lw={lw} />
      <CornerArc cx={m.x(1)} cy={m.y(1)} r={cornerR} rot={180} lw={lw} />
    </Group>
  );
}

function HalfMarkings({ m, lw }: { m: FieldMapper; lw: number }) {
  const cx = m.x(0.5);
  const cy = m.y(0.5);
  const penD = m.w(16.5 / 52.5);
  const penW = m.h(40.32 / 68);
  const goalD = m.w(5.5 / 52.5);
  const goalW = m.h(18.32 / 68);
  const r = m.h(9.15 / 68);

  return (
    <Group>
      <PitchLine points={[m.x(0), m.y(0), m.x(1), m.y(0), m.x(1), m.y(1), m.x(0), m.y(1), m.x(0), m.y(0)]} lw={lw} />
      <PitchLine points={[m.x(0), cy, m.x(1), cy]} lw={lw} />
      <Circle x={cx} y={cy} radius={r} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(1) - penD} y={cy - penW / 2} width={penD} height={penW} stroke={LINE} strokeWidth={lw} />
      <Rect x={m.x(1) - goalD} y={cy - goalW / 2} width={goalD} height={goalW} stroke={LINE} strokeWidth={lw} />
      <Circle x={m.x(1 - 11 / 52.5)} y={cy} radius={lw * 0.85} fill={LINE} />
    </Group>
  );
}

function ThirdMarkings({ m, lw }: { m: FieldMapper; lw: number }) {
  const cx = m.x(0.5);
  return (
    <Group>
      <PitchLine points={[m.x(0), m.y(0), m.x(1), m.y(0), m.x(1), m.y(1), m.x(0), m.y(1), m.x(0), m.y(0)]} lw={lw} />
      <Line points={[cx, m.y(0), cx, m.y(1)]} stroke={LINE} strokeWidth={lw} dash={[lw * 5, lw * 3]} />
      <Rect x={m.x(0.42)} y={m.y(0.18)} width={m.w(0.52)} height={m.h(0.64)} stroke={LINE} strokeWidth={lw} dash={[lw * 4, lw * 3]} />
    </Group>
  );
}

function PitchLine({ points, lw, color = LINE }: { points: number[]; lw: number; color?: string }) {
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
  return <Arc x={cx} y={cy} innerRadius={r} outerRadius={r} angle={90} rotation={rot} stroke={color} strokeWidth={lw} />;
}
