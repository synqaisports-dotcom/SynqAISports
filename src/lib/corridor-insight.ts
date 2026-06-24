import type { SourceBreakdown } from '@/lib/ingest/scraper-types';

export function buildCorridorInsight(
  b: SourceBreakdown,
  originRegion: string,
  dnaSlug?: string | null
): string {
  if (b.weighted === 0) {
    return 'Sin menciones en 14 días. El patio puede estar quieto o la tendencia aún no tiene nombre en prensa.';
  }

  const early = b.cn + b.us + b.pod + b.latam;
  const es = b.es;

  if (b.es >= 8 && b.us >= 10) {
    return 'Fuerte en USA y España → ola en curso o evento programado (p. ej. álbum deportivo en año de torneo). Comparar con ADN estacional, no solo viral patio.';
  }

  if (early >= 3 && es <= 1) {
    const where =
      b.cn >= b.us && b.cn > 0
        ? 'China'
        : b.us >= b.cn && b.us > 0
          ? 'USA'
          : 'origen';
    return `Activo en ${where} (${Math.round(b.weighted)}w ponderado), España aún baja → ventana temprana. Patrón patio: suele verse en colegio semanas después.`;
  }

  if (b.cn >= 2 && es === 0 && originRegion === 'asia') {
    return 'Señal Asia sin eco en ES → reloj largo (tipo Labubu/Pokémon). Margen para importación o preventa.';
  }

  if (b.latam >= 2 && es <= 1) {
    return 'LATAM con menciones y España baja → a veces LATAM hispanohablante adelanta al patio español (no siempre).';
  }

  if (dnaSlug === 'fifa-stickers-2022' || dnaSlug?.includes('fifa')) {
    return 'Índice inflado por ciclo deportivo. Útil para Megacracks/Adrenalyn en sus meses (liga ~agosto, adrenalyn ~diciembre).';
  }

  return `Ruido moderado (${b.weighted}w). Cruzar con ADN histórico del patio antes de comprar stock.`;
}
