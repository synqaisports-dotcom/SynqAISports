import {
  getCanteraCategory,
  resolveTeamCategorySlug,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';

export type PlayerTeamOption = {
  id: string;
  name: string;
  category: string;
  category_slug?: CanteraCategorySlug | null;
};

function categoryOrder(team: PlayerTeamOption): number {
  const slug = team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  const meta = slug ? getCanteraCategory(slug) : null;
  return meta?.order ?? 999;
}

export function sortPlayerTeamsByCategory(teams: PlayerTeamOption[]): PlayerTeamOption[] {
  return [...teams].sort((a, b) => {
    const byCategory = categoryOrder(a) - categoryOrder(b);
    if (byCategory !== 0) return byCategory;
    return a.name.localeCompare(b.name, 'es');
  });
}
