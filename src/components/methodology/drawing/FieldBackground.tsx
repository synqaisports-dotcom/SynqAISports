import type { FieldTemplate } from '@/lib/exercise-drawing';
import { FIELD_TEMPLATES } from '@/lib/exercise-drawing';

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

  return (
    <div className={className} style={{ aspectRatio }}>
      {template === 'blank' ? (
        <svg viewBox="0 0 105 68" className="h-full w-full rounded-md bg-slate-800" />
      ) : isFutsal ? (
        <svg viewBox="0 0 40 20" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
          <rect width="40" height="20" fill="#1a4d7a" />
          <rect x="1.2" y="0.6" width="37.6" height="18.8" fill="#5eb8e8" />
          <FutsalSvg />
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
          {Array.from({ length: 18 }).map((_, i) => (
            <rect
              key={i}
              x={(105 / 18) * i}
              y={0}
              width={105 / 18}
              height={68}
              fill={i % 2 === 0 ? GRASS_A : GRASS_B}
              opacity={0.92}
            />
          ))}
          <rect width="105" height="68" fill="url(#pitch-vignette)" />
          {template === 'football-full' && <F11Svg />}
          {template === 'football-f7' && <F7Svg />}
          {template === 'football-half' && <HalfSvg />}
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
      <rect x="-0.8" y="30.34" width="0.8" height="7.32" {...p} />
      <rect x="105" y="30.34" width="0.8" height="7.32" {...p} />
    </g>
  );
}

function F7Svg() {
  const p = { stroke: LINE, strokeWidth: 0.35, fill: 'none' as const };
  return (
    <g transform="translate(22 14)">
      <rect x="0" y="0" width="60" height="40" {...p} />
      <line x1="30" y1="0" x2="30" y2="40" {...p} />
      <circle cx="30" cy="20" r="7" {...p} />
    </g>
  );
}

function HalfSvg() {
  const p = { stroke: LINE, strokeWidth: 0.32, fill: 'none' as const };
  return (
    <g transform="translate(26 0)">
      <rect x="0" y="0" width="52.5" height="68" {...p} />
      <line x1="0" y1="34" x2="52.5" y2="34" {...p} />
      <circle cx="26.25" cy="34" r="9.15" {...p} />
      <rect x="36" y="13.84" width="16.5" height="40.32" {...p} />
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
  return (
    <g>
      <rect x="1.2" y="0.6" width="37.6" height="18.8" {...p} />
      <line x1="20" y1="0.6" x2="20" y2="19.4" {...p} />
      <circle cx="20" cy="10" r="3" {...p} />
      <circle cx="20" cy="10" r="0.15" fill={LINE} />
      <line x1="7.2" y1="4.5" x2="7.2" y2="15.5" {...p} />
      <line x1="32.8" y1="4.5" x2="32.8" y2="15.5" {...p} />
      <circle cx="7.2" cy="10" r="0.12" fill={LINE} />
      <circle cx="12" cy="10" r="0.12" fill={LINE} />
      <circle cx="28" cy="10" r="0.12" fill={LINE} />
      <circle cx="32.8" cy="10" r="0.12" fill={LINE} />
    </g>
  );
}
