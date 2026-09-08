import type { SignageSponsor, SponsorTier } from '@/lib/signage';
import { SPONSOR_TIER_META } from '@/lib/signage';
import { maxSponsorsInZone } from '@/lib/sponsor-wall';

const DEMO_GOLD_NAMES = [
  'Hogares',
  'Cafetería El Gol',
  'Deportes Martínez',
  'Clínica FisioSport',
  'Automóviles Ruiz',
  'Supermercados Vega',
  'Fontanería López',
  'Gimnasio ProFit',
  'Pizzería Campo',
];

const DEMO_SILVER_NAMES = [
  'Panadería San Jorge',
  'Óptica Visión',
  'Librería Campus',
  'Taller Mecánico Norte',
  'Farmacia Central',
  'Peluquería Style',
  'Inmobiliaria Costa',
  'Seguros Atlántico',
  'Café Estación',
  'Reformas Alba',
  'Veterinaria Can',
  'Electro Hogar',
];

const DEMO_BRONZE_NAMES = [
  'Bar El Corner',
  'Taxi Rápido',
  'Floristería Rosa',
  'Dentista Sonrisa',
  'Academia Inglés',
  'Tatuajes Ink',
  'Carnicería Sol',
  'Pescadería Mar',
  'Lavandería Express',
  'Fotografía Flash',
  'Bicicletas Pedal',
  'Cerrajería 24h',
  'Nutrición Vital',
  'Yoga Zen',
  'Carpintería Madera',
  'Imprenta Color',
  'Hostal Viajero',
  'Jardinería Verde',
];

const DEMO_NAMES: Record<SponsorTier, readonly string[]> = {
  gold: DEMO_GOLD_NAMES,
  silver: DEMO_SILVER_NAMES,
  bronze: DEMO_BRONZE_NAMES,
};

/** Patrocinadores de ejemplo que llenan la capacidad máxima de un slide (9 oro + 12 plata + 18 bronce). */
export function buildFullWallDemoSponsors(): SignageSponsor[] {
  const sponsors: SignageSponsor[] = [];

  (['gold', 'silver', 'bronze'] as const).forEach((tier) => {
    const count = maxSponsorsInZone(tier);
    const names = DEMO_NAMES[tier];
    for (let i = 0; i < count; i += 1) {
      sponsors.push({
        id: `demo-wall-${tier}-${i}`,
        name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
        logo_url: null,
        tier,
        url: null,
        default_duration_sec: SPONSOR_TIER_META[tier].defaultDurationSec,
        active_from: null,
        active_until: null,
        notes: 'Ejemplo de capacidad del muro',
        active: true,
      });
    }
  });

  return sponsors;
}

export const FULL_WALL_DEMO_SPONSOR_COUNT = buildFullWallDemoSponsors().length;
