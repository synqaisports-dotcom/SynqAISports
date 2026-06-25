import type { MarketplaceCandidate } from './cycle-types';
import type { LiveSignalRow } from './radar-types';

export type TrendVerdict = 'comprar' | 'vigilar' | 'tarde' | 'sin_datos';

export type TrendVerdictInfo = {
  verdict: TrendVerdict;
  title: string;
  subtitle: string;
  emoji: string;
};

/** Traduce señales + ventas a una frase clara de qué hacer. */
export function getTrendVerdict(c: MarketplaceCandidate): TrendVerdictInfo {
  const isEcoEs = c.canonical_name.startsWith('[Eco ES]');
  const originMentions = (c.signal_cn ?? 0) + (c.signal_us ?? 0) + (c.signal_latam ?? 0);
  const esMentions = c.signal_es ?? 0;
  const orders = c.origin_orders_total ?? 0;
  const hasProducts =
    (c.top_products?.length ?? 0) > 0 ||
    Object.values(c.top_by_marketplace ?? {}).some((a) => (a?.length ?? 0) > 0);

  if (isEcoEs || esMentions >= 3) {
    return {
      verdict: 'tarde',
      title: 'Ya llegó a España',
      subtitle:
        'El patio ya conoce esto. No compres para importar — solo observa cómo se comporta el mercado.',
      emoji: '🔴',
    };
  }

  if (!hasProducts && originMentions === 0 && orders === 0) {
    return {
      verdict: 'sin_datos',
      title: 'Sin datos suficientes',
      subtitle: 'Espera al próximo scan o revisa que el cron marketplace esté activo.',
      emoji: '⚪',
    };
  }

  if (esMentions === 0 && orders >= 1000) {
    return {
      verdict: 'comprar',
      title: 'Oportunidad abierta',
      subtitle: `Origen vendiendo fuerte (${orders.toLocaleString('es-ES')}+ pedidos) y España aún no habla de ello.`,
      emoji: '🟢',
    };
  }

  if (esMentions === 0 && originMentions >= 2) {
    return {
      verdict: 'comprar',
      title: 'Señal temprana en origen',
      subtitle: 'Hay noticias en China/USA pero casi nada en España. Buen momento para investigar y comprar muestra.',
      emoji: '🟢',
    };
  }

  if (esMentions <= 1 && orders > 0) {
    return {
      verdict: 'vigilar',
      title: 'Vigilar y probar',
      subtitle: `Ventas en origen detectadas. España casi quieto (${esMentions} mención). Compra pequeña y prueba en el cole.`,
      emoji: '🟡',
    };
  }

  if (esMentions >= 1 && esMentions < 3) {
    return {
      verdict: 'vigilar',
      title: 'España empieza a moverse',
      subtitle: 'Ya hay eco en prensa española. El margen se cierra — compra solo si aún no está en tu zona.',
      emoji: '🟡',
    };
  }

  return {
    verdict: 'vigilar',
    title: 'En seguimiento',
    subtitle: 'Revisa los productos más vendidos abajo y compara precio origen vs lo que pagarían en España.',
    emoji: '🟡',
  };
}

export const VERDICT_STYLES: Record<
  TrendVerdict,
  { border: string; bg: string; text: string }
> = {
  comprar: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  vigilar: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  tarde: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    text: 'text-red-300',
  },
  sin_datos: {
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
  },
};

export function getRadarVerdict(s: LiveSignalRow): TrendVerdictInfo {
  const b = s.source_breakdown;
  const esMentions = b?.es ?? 0;
  const originMentions = (b?.cn ?? 0) + (b?.us ?? 0) + (b?.latam ?? 0);
  const orders = s.origin_orders_total ?? 0;

  if (esMentions >= 5) {
    return {
      verdict: 'tarde',
      title: 'Muy visible en España',
      subtitle: 'Muchas noticias en prensa española. El producto ya está en el radar del patio.',
      emoji: '🔴',
    };
  }

  if (orders >= 500 && esMentions <= 1) {
    return {
      verdict: 'comprar',
      title: 'Vende en origen, España quieto',
      subtitle: `${orders.toLocaleString('es-ES')}+ pedidos detectados y casi sin eco en España.`,
      emoji: '🟢',
    };
  }

  if (originMentions >= 3 && esMentions <= 1) {
    return {
      verdict: 'vigilar',
      title: 'Actividad en origen',
      subtitle: 'Noticias en China/USA. Vigila si empieza a aparecer en el cole.',
      emoji: '🟡',
    };
  }

  return {
    verdict: 'vigilar',
    title: 'En seguimiento',
    subtitle: 'Producto conocido del ADN. Revisa ventas y noticias abajo.',
    emoji: '🟡',
  };
}
