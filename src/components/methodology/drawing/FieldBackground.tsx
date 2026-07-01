import type { FieldTemplate } from '@/lib/exercise-drawing';
import { FIELD_TEMPLATES } from '@/lib/exercise-drawing';
import { F7_MARKS, HALF_MARKS } from '@/lib/field-engine';

type Props = {
  template: FieldTemplate;
  className?: string;
};

const GRASS_A = '#45b85a';
const GRASS_B = '#2f8440';
const LINE = '#ffffff';

/** Preview SVG del campo (ficha, listados, impresión). */
export function FieldBackground({ template, className }: Props) {
  const { aspectRatio } = FIELD_TEMPLATES[template];
  const isFutsal = template === 'futsal';
  const isF7 = template === 'football-f7';
  const isHalf = template === 'football-half';

  return (
    <div className={className} style={{ aspectRatio }}>
      {template === 'blank' ? (
        <svg viewBox="0 0 105 68" className="h-full w-full rounded-md bg-slate-800" />
      ) : isFutsal ? (
        <svg viewBox="0 0 40 20" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
          <rect width="40" height="20" fill="#1e5a8f" />
          <rect x="1" y="0.5" width="38" height="19" fill="#6ec8f5" />
          <FutsalSvg />
        </svg>
      ) : isF7 ? (
        <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
          <rect width="60" height="40" fill={GRASS_A} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={(60 / 8) * i}
              y={0}
              width={60 / 8}
              height={40}
              fill={i % 2 === 0 ? '#4cc463' : '#2f8a42'}
              opacity={0.9}
            />
          ))}
          <F7Svg />
        </svg>
      ) : isHalf ? (
        <svg viewBox="0 0 68 52.5" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
          <rect width="68" height="52.5" fill={GRASS_A} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={(68 / 8) * i}
              y={0}
              width={68 / 8}
              height={52.5}
              fill={i % 2 === 0 ? '#4cc463' : '#2f8a42'}
              opacity={0.9}
            />
          ))}
          <HalfSvg />
        </svg>
      ) : (
        <svg viewBox="0 0 105 68" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
          <defs>
            <linearGradient id="pitch-vignette" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
            </linearGradient>
          </defs>
          <rect width="105" height="68" fill={GRASS_A} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect
              key={i}
              x={(105 / 8) * i}
              y={0}
              width={105 / 8}
              height={68}
              fill={i % 2 === 0 ? '#4cc463' : '#2f8a42'}
              opacity={0.9}
            />
          ))}
          <rect width="105" height="68" fill="url(#pitch-vignette)" />
          {template === 'football-full' && <F11Svg />}
          {template === 'football-third' && <ThirdSvg />}
        </svg>
      )}
    </div>
  );
}

function F11Svg() {
  const p = { stroke: LINE, strokeWidth: 0.32, fill: 'none' as const };
  return (
    <g>
      <rect x="0" y="0" width="105" height="68" {...p} />
      <line x1="52.5" y1="0" x2="52.5" y2="68" {...p} />
      <circle cx="52.5" cy="34" r="9.15" {...p} />
      <circle cx="52.5" cy="34" r="0.45" fill={LINE} />
      <rect x="0" y="13.84" width="16.5" height="40.32" {...p} />
      <rect x="88.5" y="13.84" width="16.5" height="40.32" {...p} />
      <rect x="0" y="24.84" width="5.5" height="18.32" {...p} />
      <rect x="99.5" y="24.84" width="5.5" height="18.32" {...p} />
      <circle cx="11" cy="34" r="0.4" fill={LINE} />
      <circle cx="94" cy="34" r="0.4" fill={LINE} />
    </g>
  );
}

function F7Svg() {
  const p = { stroke: LINE, strokeWidth: 0.22, fill: 'none' as const };
  const cy = 20;
  const penD = 60 * F7_MARKS.penDepth;
  const penW = 40 * F7_MARKS.penWidth;
  const goalD = 60 * F7_MARKS.goalDepth;
  const goalW = 40 * F7_MARKS.goalWidth;
  const r = 40 * F7_MARKS.centerR;
  const arcR = 60 * F7_MARKS.arcR;
  const off = 60 * F7_MARKS.offside;
  const spot = 60 * F7_MARKS.spot;

  const leftArc = f7ArcPath(spot, cy, arcR, 'left');
  const rightArc = f7ArcPath(60 - spot, cy, arcR, 'right');

  return (
    <g>
      <rect x="0" y="0" width="60" height="40" {...p} />
      <line x1="30" y1="0" x2="30" y2="40" {...p} />
      <circle cx="30" cy={cy} r={r} {...p} />
      <circle cx="30" cy={cy} r="0.35" fill={LINE} />

      <line x1={off} y1="0" x2={off} y2="40" {...p} />
      <line x1={60 - off} y1="0" x2={60 - off} y2="40" {...p} />

      <rect x="0" y={cy - penW / 2} width={penD} height={penW} {...p} />
      <rect x="0" y={cy - goalW / 2} width={goalD} height={goalW} {...p} />
      <circle cx={spot} cy={cy} r="0.35" fill={LINE} />
      <path d={leftArc} {...p} />

      <rect x={60 - penD} y={cy - penW / 2} width={penD} height={penW} {...p} />
      <rect x={60 - goalD} y={cy - goalW / 2} width={goalD} height={goalW} {...p} />
      <circle cx={60 - spot} cy={cy} r="0.35" fill={LINE} />
      <path d={rightArc} {...p} />
    </g>
  );
}

function f7ArcPath(spotX: number, spotY: number, r: number, side: 'left' | 'right') {
  const sweep = side === 'left' ? 1 : 0;
  return `M ${spotX} ${spotY - r} A ${r} ${r} 0 0 ${sweep} ${spotX} ${spotY + r}`;
}

function HalfSvg() {
  const p = { stroke: LINE, strokeWidth: 0.28, fill: 'none' as const };
  const cx = 34;
  const penD = 52.5 * HALF_MARKS.penDepth;
  const penW = 68 * HALF_MARKS.penWidth;
  const goalD = 52.5 * HALF_MARKS.goalDepth;
  const goalW = 68 * HALF_MARKS.goalWidth;
  const rx = 68 * HALF_MARKS.centerR;
  const ry = 52.5 * HALF_MARKS.centerRy;
  const spot = 52.5 * HALF_MARKS.spot;
  const arcRx = 68 * HALF_MARKS.arcR;
  const arcRy = 52.5 * HALF_MARKS.arcRy;
  const halfAngle = Math.acos(5.5 / 9.15);

  const centerArc = `M ${cx - rx} 52.5 A ${rx} ${ry} 0 0 1 ${cx + rx} 52.5`;
  const penArc = (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const a = Math.PI / 2 - halfAngle + t * 2 * halfAngle;
      const x = cx + arcRx * Math.cos(a);
      const y = spot + arcRy * Math.sin(a);
      pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return pts.join(' ');
  })();

  return (
    <g>
      <rect x="0" y="0" width="68" height="52.5" {...p} />
      <line x1="0" y1="52.5" x2="68" y2="52.5" {...p} />
      <path d={centerArc} {...p} />
      <rect x={cx - penW / 2} y="0" width={penW} height={penD} {...p} />
      <rect x={cx - goalW / 2} y="0" width={goalW} height={goalD} {...p} />
      <circle cx={cx} cy={spot} r="0.4" fill={LINE} />
      <path d={penArc} {...p} />
    </g>
  );
}

function ThirdSvg() {
  const p = { stroke: LINE, strokeWidth: 0.32, fill: 'none' as const };
  return (
    <g transform="translate(35 0)">
      <rect x="0" y="0" width="35" height="68" {...p} />
      <line x1="17.5" y1="0" x2="17.5" y2="68" {...p} strokeDasharray="2 1.5" />
    </g>
  );
}

function FutsalSvg() {
  const p = { stroke: LINE, strokeWidth: 0.12, fill: 'none' as const };
  const gw = 1.5;
  const R = 6;
  return (
    <g>
      <rect x="1" y="0.5" width="38" height="19" {...p} />
      <line x1="20" y1="0.5" x2="20" y2="19.5" {...p} />
      <circle cx="20" cy="10" r="3" {...p} />
      <circle cx="20" cy="10" r="0.15" fill={LINE} />
      {/* Área izq — D */}
      <path
        d={`M 1 ${10 - gw} A ${R} ${R} 0 0 1 ${1 + R} ${10 - gw} L ${1 + R} ${10 + gw} A ${R} ${R} 0 0 1 1 ${10 + gw}`}
        {...p}
      />
      <circle cx="7" cy="10" r="0.12" fill={LINE} />
      <circle cx="11" cy="10" r="0.12" fill={LINE} />
      {/* Área der */}
      <path
        d={`M 39 ${10 - gw} A ${R} ${R} 0 0 0 ${39 - R} ${10 - gw} L ${39 - R} ${10 + gw} A ${R} ${R} 0 0 0 39 ${10 + gw}`}
        {...p}
      />
      <circle cx="33" cy="10" r="0.12" fill={LINE} />
      <circle cx="29" cy="10" r="0.12" fill={LINE} />
    </g>
  );
}
