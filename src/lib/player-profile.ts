import { playerDisplayName } from '@/lib/cantera-teams';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import type { PlayerGuardian } from '@/lib/player-guardians';
import type { PlayerMedicalInfo } from '@/lib/player-medical';
import type { PlayerClubHistoryEvent } from '@/lib/player-club-history';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import type { PlayerTeamMembership } from '@/lib/player-memberships';
import { positionShortForSport } from '@/lib/player-positions';

export type PlayerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  jersey_number: number | null;
  position: string | null;
  photo_url: string | null;
  birth_year: number | null;
  team_id: string | null;
  team_name: string;
  team_category: string;
  team_category_slug?: CanteraCategorySlug | null;
  primary_sport?: ClubPracticedSport;
  memberships?: PlayerTeamMembership[];
  active: boolean;
  is_minor: boolean;
  guardians: PlayerGuardian[];
  created_at: string | null;
  history: PlayerClubHistoryEvent[];
} & PlayerMedicalInfo;

export function playerFullName(player: Pick<PlayerProfile, 'first_name' | 'last_name' | 'display_name'>) {
  return playerDisplayName(player.first_name, player.last_name, player.display_name);
}

export function playerSortKey(player: PlayerProfile): string {
  const last = (player.last_name ?? player.display_name.split(' ').slice(1).join(' ')).trim();
  const first = (player.first_name ?? player.display_name.split(' ')[0] ?? '').trim();
  return `${last} ${first}`.trim().toLowerCase();
}

export type PlayerListSortMode = 'category' | 'name-asc' | 'name-desc';

export function playerCategoryOrder(
  player: Pick<PlayerProfile, 'team_category' | 'team_category_slug'>
): number {
  const slug =
    player.team_category_slug ??
    resolveTeamCategorySlug(player.team_category, player.team_category_slug);
  const meta = slug ? getCanteraCategory(slug) : null;
  return meta?.order ?? 999;
}

export function comparePlayersForList(
  a: PlayerProfile,
  b: PlayerProfile,
  mode: PlayerListSortMode
): number {
  if (mode === 'category') {
    const byCategory = playerCategoryOrder(a) - playerCategoryOrder(b);
    if (byCategory !== 0) return byCategory;
    const byTeam = a.team_name.localeCompare(b.team_name, 'es');
    if (byTeam !== 0) return byTeam;
    return playerSortKey(a).localeCompare(playerSortKey(b), 'es');
  }

  const cmp = playerSortKey(a).localeCompare(playerSortKey(b), 'es');
  return mode === 'name-asc' ? cmp : -cmp;
}

export function playerDetailFields(player: PlayerProfile) {
  return [
    { label: 'Equipo', value: player.team_name },
    { label: 'Categoría', value: player.team_category },
    {
      label: 'Dorsal',
      value: player.jersey_number != null ? `#${player.jersey_number}` : '—',
    },
    { label: 'Año nacimiento', value: player.birth_year ? String(player.birth_year) : '—' },
  ];
}

export function playerListSubtitle(player: PlayerProfile) {
  const sport = player.primary_sport ?? 'football';
  const parts = [positionShortForSport(sport, player.position)];
  if (player.jersey_number != null) parts.push(`#${player.jersey_number}`);
  return parts.filter((part) => part && part !== '—').join(' · ');
}
