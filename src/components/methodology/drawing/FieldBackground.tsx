import type { FieldTemplate } from '@/lib/exercise-drawing';
import { FIELD_TEMPLATES } from '@/lib/exercise-drawing';

type Props = {
  template: FieldTemplate;
  className?: string;
};

/** Fondo de campo con proporciones reglamentarias (viewBox normalizado 0–100). */
export function FieldBackground({ template, className }: Props) {
  const { aspectRatio } = FIELD_TEMPLATES[template];

  return (
    <div
      className={className}
      style={{ aspectRatio }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full rounded-lg border border-white/15 shadow-inner"
      >
        <defs>
          <linearGradient id="pitch-grass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a5c38" />
            <stop offset="50%" stopColor="#1e6b42" />
            <stop offset="100%" stopColor="#165a34" />
          </linearGradient>
          <pattern id="pitch-stripes" width="10" height="100" patternUnits="userSpaceOnUse">
            <rect width="5" height="100" fill="#1a5c38" opacity="0.35" />
          </pattern>
        </defs>

        {template === 'blank' ? (
          <rect width="100" height="100" fill="#1e293b" />
        ) : (
          <>
            <rect width="100" height="100" fill="url(#pitch-grass)" />
            <rect width="100" height="100" fill="url(#pitch-stripes)" />
            {template === 'football-full' && <FullPitchMarkings />}
            {template === 'football-half' && <HalfPitchMarkings />}
            {template === 'football-third' && <ThirdPitchMarkings />}
            {template === 'futsal' && <FutsalMarkings />}
          </>
        )}
      </svg>
    </div>
  );
}

function lineProps(stroke = '#e2e8f0', width = 0.35) {
  return { stroke, strokeWidth: width, fill: 'none', opacity: 0.85 };
}

function FullPitchMarkings() {
  const p = lineProps();
  return (
    <g>
      <rect x="3" y="3" width="94" height="94" {...p} />
      <line x1="50" y1="3" x2="50" y2="97" {...p} />
      <circle cx="50" cy="50" r="9" {...p} />
      <circle cx="50" cy="50" r="0.8" fill="#e2e8f0" />
      <rect x="3" y="22" width="16" height="56" {...p} />
      <rect x="81" y="22" width="16" height="56" {...p} />
      <rect x="3" y="34" width="6" height="32" {...p} />
      <rect x="91" y="34" width="6" height="32" {...p} />
      <circle cx="11" cy="50" r="0.6" fill="#e2e8f0" />
      <circle cx="89" cy="50" r="0.6" fill="#e2e8f0" />
      <path d="M 3 38 A 6 6 0 0 0 3 62" {...p} />
      <path d="M 97 38 A 6 6 0 0 1 97 62" {...p} />
      <circle cx="3" cy="50" r="1.2" fill="none" stroke="#e2e8f0" strokeWidth="0.25" />
      <circle cx="97" cy="50" r="1.2" fill="none" stroke="#e2e8f0" strokeWidth="0.25" />
    </g>
  );
}

function HalfPitchMarkings() {
  const p = lineProps();
  return (
    <g>
      <rect x="3" y="3" width="94" height="94" {...p} />
      <line x1="3" y1="50" x2="97" y2="50" {...p} />
      <circle cx="50" cy="50" r="9" {...p} />
      <rect x="55" y="22" width="42" height="56" {...p} />
      <rect x="85" y="34" width="12" height="32" {...p} />
      <circle cx="89" cy="50" r="0.6" fill="#e2e8f0" />
    </g>
  );
}

function ThirdPitchMarkings() {
  const p = lineProps();
  return (
    <g>
      <rect x="3" y="3" width="94" height="94" {...p} />
      <line x1="50" y1="3" x2="50" y2="97" {...p} strokeDasharray="2 1.5" />
      <rect x="55" y="25" width="38" height="50" {...p} strokeDasharray="1.5 1" />
    </g>
  );
}

function FutsalMarkings() {
  const p = lineProps('#f8fafc', 0.4);
  return (
    <g>
      <rect x="4" y="8" width="92" height="84" {...p} />
      <line x1="50" y1="8" x2="50" y2="92" {...p} />
      <circle cx="50" cy="50" r="8" {...p} />
      <rect x="4" y="30" width="12" height="40" {...p} />
      <rect x="84" y="30" width="12" height="40" {...p} />
    </g>
  );
}
