export type CanteraCategorySlug =
  | 'debutantes'
  | 'prebenjamin'
  | 'benjamin'
  | 'alevin'
  | 'infantil'
  | 'cadete'
  | 'juvenil';

export type CanteraCategory = {
  slug: CanteraCategorySlug;
  name: string;
  ages: string;
  international: string;
  description: string;
  borderClass: string;
  ringClass: string;
  badgeClass: string;
  order: number;
};

/** Catálogo oficial de categorías de cantera (España + equivalencia internacional). */
export const CANTERA_CATEGORIES: CanteraCategory[] = [
  {
    slug: 'debutantes',
    name: 'Debutantes',
    ages: '4–5 años',
    international: 'Inicio en el club · primeros pasos con el balón',
    description:
      'Primera etapa de la cantera. Contacto lúdico con el fútbol, coordinación y trabajo en grupo antes del juego reglado.',
    borderClass: 'border-fuchsia-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(292_84%_61%_/_0.25)]',
    badgeClass: 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300',
    order: 0,
  },
  {
    slug: 'prebenjamin',
    name: 'Prebenjamín',
    ages: '5–7 años',
    international: 'SUB 7 · SUB 8',
    description:
      'Inicio del fútbol. Los niños y niñas descubren qué es el fútbol y cómo se juega, con pocos conocimientos técnicos formales.',
    borderClass: 'border-white/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(0_0%_100%_/_0.25)]',
    badgeClass: 'border-white/40 bg-white/10 text-white',
    order: 1,
  },
  {
    slug: 'benjamin',
    name: 'Benjamín',
    ages: '8–9 años',
    international: 'SUB 9 · SUB 10',
    description:
      'Más conocimientos técnicos: pases, control, disparos y primeras ideas de posiciones y funciones en el campo.',
    borderClass: 'border-emerald-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(160_84%_39%_/_0.25)]',
    badgeClass: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    order: 2,
  },
  {
    slug: 'alevin',
    name: 'Alevín',
    ages: '10–11 años',
    international: 'SUB 11 · SUB 12',
    description:
      'Avance en teoría del juego: desmarques, cuándo atacar, marcar al rival y conceptos de cobertura.',
    borderClass: 'border-sky-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(199_89%_48%_/_0.25)]',
    badgeClass: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
    order: 3,
  },
  {
    slug: 'infantil',
    name: 'Infantil',
    ages: '12–13 años',
    international: 'SUB 13 · SUB 14',
    description:
      'Se empieza a jugar a fútbol 11. Estrategias, paredes, desmarques, marcajes e intercepciones en partido real.',
    borderClass: 'border-violet-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(263_70%_58%_/_0.25)]',
    badgeClass: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    order: 4,
  },
  {
    slug: 'cadete',
    name: 'Cadete',
    ages: '14–15 años',
    international: 'SUB 15 · SUB 16',
    description:
      'Refuerzo ofensivo y defensivo de todo lo aprendido. Mayor exigencia táctica y física en competición.',
    borderClass: 'border-amber-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(38_92%_50%_/_0.25)]',
    badgeClass: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    order: 5,
  },
  {
    slug: 'juvenil',
    name: 'Juvenil',
    ages: '16–18 años',
    international: 'SUB 17 · SUB 18 · SUB 19',
    description:
      'Última etapa del fútbol base. Esquemas tácticos avanzados, desarrollo de la personalidad y alta competitividad.',
    borderClass: 'border-rose-400/55',
    ringClass: 'shadow-[0_0_0_1px_hsl(350_89%_60%_/_0.25)]',
    badgeClass: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
    order: 6,
  },
];

export function getCanteraCategory(slug: string): CanteraCategory | undefined {
  return CANTERA_CATEGORIES.find((category) => category.slug === slug);
}

export function resolveTeamCategorySlug(
  category: string,
  categorySlug?: string | null
): CanteraCategorySlug | null {
  if (categorySlug && getCanteraCategory(categorySlug)) {
    return categorySlug as CanteraCategorySlug;
  }

  const normalized = category
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]/g, '');

  const direct = CANTERA_CATEGORIES.find((cat) => {
    const slugNorm = cat.slug.replace(/[^a-z0-9]/g, '');
    const nameNorm = cat.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]/g, '');
    return normalized === slugNorm || normalized === nameNorm || normalized.includes(slugNorm);
  });

  if (direct) return direct.slug;

  if (normalized.includes('sub7') || normalized.includes('sub8')) return 'prebenjamin';
  if (normalized.includes('sub9') || normalized.includes('sub10')) return 'benjamin';
  if (normalized.includes('sub11') || normalized.includes('sub12')) return 'alevin';
  if (normalized.includes('sub13') || normalized.includes('sub14')) return 'infantil';
  if (normalized.includes('sub15') || normalized.includes('sub16')) return 'cadete';
  if (
    normalized.includes('sub17') ||
    normalized.includes('sub18') ||
    normalized.includes('sub19')
  ) {
    return 'juvenil';
  }

  return null;
}

export type CanteraTeamRow = {
  id: string;
  name: string;
  category: string;
  category_slug: CanteraCategorySlug | null;
  team_letter: string | null;
  sport: string;
  active: boolean;
  player_count?: number;
};

export function groupTeamsByCategory(teams: CanteraTeamRow[]) {
  const groups = new Map<CanteraCategorySlug, CanteraTeamRow[]>();
  for (const category of CANTERA_CATEGORIES) {
    groups.set(category.slug, []);
  }

  for (const team of teams) {
    const slug =
      team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
    if (slug && groups.has(slug)) {
      groups.get(slug)!.push(team);
      continue;
    }
    // Equipos legacy sin slug: intentar emparejar por nombre de categoría
    const byName = CANTERA_CATEGORIES.find(
      (cat) => cat.name.toLowerCase() === team.category.toLowerCase()
    );
    if (byName) groups.get(byName.slug)!.push(team);
  }

  for (const [, list] of groups) {
    list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  return CANTERA_CATEGORIES.map((category) => ({
    category,
    teams: groups.get(category.slug) ?? [],
  }));
}
