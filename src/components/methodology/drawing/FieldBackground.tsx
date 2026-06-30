import type { FieldTemplate } from '@/lib/exercise-drawing';
import { FIELD_TEMPLATES } from '@/lib/exercise-drawing';

type Props = {
  template: FieldTemplate;
  className?: string;
};

const GRASS_A = '#1a6b3c';
const GRASS_B = '#1f7a45';
const LINE = '#f1f5f9';

/** Preview SVG del campo (ficha, listados, impresión). */
export function FieldBackground({ template, className }: Props) {
  const { aspectRatio } = FIELD_TEMPLATES[template];

  return (
    <div className={className} style={{ aspectRatio }}>
      <svg viewBox="0 0 105 68" preserveAspectRatio="xMidYMid meet" className="h-full w-full rounded-md shadow-lg">
        <defs>
          <linearGradient id="pitch-vignette" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {template === 'blank' ? (
          <rect width="105" height="68" fill="#1e293b" />
        ) : (
          <>
            <rect width="105" height="68" fill={GRASS_A} />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x={(105 / 12) * i}
                y={0}
                width={105 / 12}
                height={68}
                fill={i % 2 === 0 ? GRASS_A : GRASS_B}
                opacity={0.9}
              />
            ))}
            <rect width="105" height="68" fill="url(#pitch-vignette)" />
            {template === 'football-full' && <F11Svg />}
            {template === 'football-f7' && <F7Svg />}
            {template === 'football-half' && <HalfSvg />}
            {template === 'football-third' && <ThirdSvg />}
            {template === 'futsal' && <FutsalSvg />}
          </>
        )}
      </svg>
    </div>
  );
}

function line(strokeWidth = 0.35) {
  return { stroke: LINE, strokeWidth, fill: 'none' as const };
}

function F11Svg() {
  const p = line();
  return (
    <g transform="translate(3 3) scale(0.943)">
      <rect x="0" y="0" width="105" height="68" {...p} />
      <line x1="52.5" y1="0" x2="52.5" y2="68" {...p} />
      <circle cx="52.5" cy="34" r="9.15" {...p} />
      <circle cx="52.5" cy="34" r="0.5" fill={LINE} />
      <rect x="0" y="13.84" width="16.5" height="40.32" {...p} />
      <rect x="88.5" y="13.84" width="16.5" height="40.32" {...p} />
      <rect x="0" y="24.84" width="5.5" height="18.32" {...p} />
      <rect x="99.5" y="24.84" width="5.5" height="18.32" {...p} />
      <circle cx="11" cy="34" r="0.45" fill={LINE} />
      <circle cx="94" cy="34" r="0.45" fill={LINE} />
    </g>
  );
}

function F7Svg() {
  const p = line(0.4);
  return (
    <g transform="translate(4 4) scale(0.88)">
      <rect x="0" y="0" width="60" height="40" {...p} />
      <line x1="30" y1="0" x2="30" y2="40" {...p} />
      <circle cx="30" cy="20" r="7" {...p} />
      <rect x="0" y="9" width="8" height="22" {...p} />
      <rect x="52" y="9" width="8" height="22" {...p} />
    </g>
  );
}

function HalfSvg() {
  const p = line();
  return (
    <g transform="translate(3 3) scale(0.943)">
      <rect x="0" y="0" width="52.5" height="68" {...p} />
      <line x1="0" y1="34" x2="52.5" y2="34" {...p} />
      <circle cx="26.25" cy="34" r="9.15" {...p} />
      <rect x="36" y="13.84" width="16.5" height="40.32" {...p} />
      <rect x="46.5" y="24.84" width="5.5" height="18.32" {...p} />
    </g>
  );
}

function ThirdSvg() {
  const p = line();
  return (
    <g transform="translate(3 3) scale(0.943)">
      <rect x="0" y="0" width="35" height="68" {...p} />
      <line x1="17.5" y1="0" x2="17.5" y2="68" {...p} strokeDasharray="2 1.5" />
      <rect x="17.5" y="14" width="17.5" height="40" {...p} strokeDasharray="1.5 1" />
    </g>
  );
}

function FutsalSvg() {
  const p = line(0.4);
  return (
    <g transform="translate(2 6) scale(0.95)">
      <rect x="0" y="0" width="40" height="20" {...p} />
      <line x1="20" y1="0" x2="20" y2="20" {...p} />
      <circle cx="20" cy="10" r="4.5" {...p} />
      <rect x="0" y="5" width="3" height="10" {...p} />
      <rect x="37" y="5" width="3" height="10" {...p} />
    </g>
  );
}
