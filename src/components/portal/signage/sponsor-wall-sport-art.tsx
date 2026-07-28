import { SYNQ_BRAND } from '@/components/brand/brand-constants';
import { useId } from 'react';

const C = SYNQ_BRAND.cyan;
const CS = SYNQ_BRAND.cyanSoft;
const N = SYNQ_BRAND.navy;
const NL = SYNQ_BRAND.navyLight;

export function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

/** Fútbol — patrón Telstar clásico con pentágonos sólidos y hexágonos delineados. */
export function FootballBallArt({ uid }: { uid: string }) {
  const clipId = `${uid}-fb-clip`;
  const shineId = `${uid}-fb-shine`;
  const glowId = `${uid}-fb-glow`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
        <radialGradient id={shineId} cx="35%" cy="32%" r="45%">
          <stop offset="0%" stopColor={CS} stopOpacity="0.65" />
          <stop offset="55%" stopColor={CS} stopOpacity="0.15" />
          <stop offset="100%" stopColor={CS} stopOpacity="0" />
        </radialGradient>
        <GlowFilter id={glowId} />
      </defs>

      <circle cx="50" cy="50" r="47" fill={N} stroke={C} strokeWidth="3" filter={`url(#${glowId})`} />

      <g clipPath={`url(#${clipId})`}>
        <rect width="100" height="100" fill={N} />

        {/* Pentágono superior */}
        <polygon points="50,6 60.5,18.5 56.5,33 43.5,33 39.5,18.5" fill={C} />

        {/* Hexágono superior izquierdo */}
        <polygon
          points="39.5,18.5 26,27 22,42.5 31.5,52 43.5,33 39.5,18.5"
          fill={NL}
          stroke={C}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Hexágono superior derecho */}
        <polygon
          points="60.5,18.5 74,27 78,42.5 68.5,52 56.5,33 60.5,18.5"
          fill={NL}
          stroke={C}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Pentágono izquierdo */}
        <polygon points="22,42.5 15.5,55 22,68 34,72 31.5,52 22,42.5" fill={C} />

        {/* Pentágono derecho */}
        <polygon points="78,42.5 84.5,55 78,68 66,72 68.5,52 78,42.5" fill={C} />

        {/* Hexágono inferior central */}
        <polygon
          points="31.5,52 34,72 50,80 66,72 68.5,52 56.5,33 43.5,33 31.5,52"
          fill={NL}
          stroke={C}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Pentágono inferior */}
        <polygon points="34,72 42,88 58,88 66,72 50,80 34,72" fill={C} />

        {/* Líneas de unión entre paneles */}
        <path
          d="M26 27 39.5 18.5 50 6 60.5 18.5 74 27"
          stroke={C}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M26 27 22 42.5 15.5 55" stroke={C} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M74 27 78 42.5 84.5 55" stroke={C} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path
          d="M15.5 55 22 68 34 72 50 80 66 72 78 68 84.5 55"
          stroke={C}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M42 88 34 72 31.5 52" stroke={C} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        <path d="M58 88 66 72 68.5 52" stroke={C} strokeWidth="1.8" strokeLinejoin="round" fill="none" />

        {/* Brillo esférico */}
        <ellipse cx="33" cy="36" rx="14" ry="18" fill={`url(#${shineId})`} transform="rotate(-22 33 36)" />
      </g>
    </>
  );
}

/** Baloncesto — costuras curvas clásicas recortadas al círculo. */
export function BasketballBallArt({ uid }: { uid: string }) {
  const clipId = `${uid}-bb-clip`;
  const glowId = `${uid}-bb-glow`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
        <GlowFilter id={glowId} />
      </defs>

      <circle cx="50" cy="50" r="47" fill={N} stroke={C} strokeWidth="3" filter={`url(#${glowId})`} />

      <g clipPath={`url(#${clipId})`} strokeLinecap="round" fill="none">
        {/* Costura vertical central (dos arcos) */}
        <path d="M50 4 C62 22 62 78 50 96" stroke={C} strokeWidth="2.8" />
        <path d="M50 4 C38 22 38 78 50 96" stroke={C} strokeWidth="2.8" />

        {/* Costura horizontal central (dos arcos) */}
        <path d="M4 50 C22 38 78 38 96 50" stroke={C} strokeWidth="2.8" />
        <path d="M4 50 C22 62 78 62 96 50" stroke={C} strokeWidth="2.8" />

        {/* Costuras laterales curvas */}
        <path d="M14 18 C30 34 30 66 14 82" stroke={CS} strokeWidth="2.4" opacity="0.9" />
        <path d="M86 18 C70 34 70 66 86 82" stroke={CS} strokeWidth="2.4" opacity="0.9" />
      </g>
    </>
  );
}

/** Voleibol — tres paneles con líneas curvas paralelas (estilo Mikasa). */
export function VolleyballBallArt({ uid }: { uid: string }) {
  const clipId = `${uid}-vb-clip`;
  const glowId = `${uid}-vb-glow`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
        <GlowFilter id={glowId} />
      </defs>

      <circle cx="50" cy="50" r="47" fill={N} stroke={C} strokeWidth="3" filter={`url(#${glowId})`} />

      <g clipPath={`url(#${clipId})`} strokeLinecap="round" fill="none">
        {/* Panel central — 3 líneas horizontales curvas */}
        <path d="M6 44 C22 36 38 32 50 32 C62 32 78 36 94 44" stroke={C} strokeWidth="2.6" />
        <path d="M6 50 C22 50 38 50 50 50 C62 50 78 50 94 50" stroke={C} strokeWidth="2.6" />
        <path d="M6 56 C22 64 38 68 50 68 C62 68 78 64 94 56" stroke={C} strokeWidth="2.6" />

        {/* Panel izquierdo — 3 líneas diagonales curvas */}
        <path d="M10 20 C24 32 36 42 50 50" stroke={C} strokeWidth="2.4" />
        <path d="M6 32 C20 44 34 54 50 62" stroke={CS} strokeWidth="2" opacity="0.85" />
        <path d="M4 46 C18 58 34 68 50 76" stroke={C} strokeWidth="2.4" />

        {/* Panel derecho — 3 líneas diagonales curvas */}
        <path d="M90 20 C76 32 64 42 50 50" stroke={C} strokeWidth="2.4" />
        <path d="M94 32 C80 44 66 54 50 62" stroke={CS} strokeWidth="2" opacity="0.85" />
        <path d="M96 46 C82 58 66 68 50 76" stroke={C} strokeWidth="2.4" />
      </g>
    </>
  );
}

/** Waterpolo — balón con franjas horizontales y ondas de agua. */
export function WaterPoloBallArt({ uid }: { uid: string }) {
  const clipId = `${uid}-wp-clip`;
  const shineId = `${uid}-wp-shine`;
  const glowId = `${uid}-wp-glow`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="48" r="40" />
        </clipPath>
        <radialGradient id={shineId} cx="38%" cy="30%" r="50%">
          <stop offset="0%" stopColor={CS} stopOpacity="0.5" />
          <stop offset="100%" stopColor={CS} stopOpacity="0" />
        </radialGradient>
        <GlowFilter id={glowId} />
      </defs>

      <circle cx="50" cy="48" r="42" fill={N} stroke={C} strokeWidth="3" filter={`url(#${glowId})`} />

      <g clipPath={`url(#${clipId})`} strokeLinecap="round" fill="none">
        <rect x="8" y="8" width="84" height="84" fill={NL} />

        {/* Franjas horizontales del balón */}
        <path d="M12 30 C28 24 42 22 50 22 C58 22 72 24 88 30" stroke={C} strokeWidth="2.6" />
        <path d="M12 38 C28 36 42 35 50 35 C58 35 72 36 88 38" stroke={CS} strokeWidth="2" opacity="0.8" />
        <path d="M12 48 C28 48 42 48 50 48 C58 48 72 48 88 48" stroke={C} strokeWidth="2.8" />
        <path d="M12 58 C28 60 42 61 50 61 C58 61 72 60 88 58" stroke={CS} strokeWidth="2" opacity="0.8" />
        <path d="M12 68 C28 74 42 76 50 76 C58 76 72 74 88 68" stroke={C} strokeWidth="2.6" />

        {/* Curvatura esférica lateral */}
        <path d="M12 48 C12 32 28 14 50 14 C72 14 88 32 88 48" stroke={C} strokeWidth="2" opacity="0.7" />
        <path d="M12 48 C12 64 28 82 50 82 C72 82 88 64 88 48" stroke={C} strokeWidth="2" opacity="0.7" />

        <ellipse cx="36" cy="38" rx="11" ry="14" fill={`url(#${shineId})`} transform="rotate(-15 36 38)" />
      </g>

      {/* Ondas de agua bajo el balón */}
      <path
        d="M6 90 C18 84 30 82 50 82 C70 82 82 84 94 90"
        stroke={C}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M2 95 C16 89 32 87 50 87 C68 87 84 89 98 95"
        stroke={CS}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
    </>
  );
}
