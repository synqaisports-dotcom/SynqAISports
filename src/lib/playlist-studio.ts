import type {
  PlaylistItem,
  PlaylistItemType,
  SignageAsset,
  SignageExerciseOption,
  SignageSponsor,
  SignageTransition,
  SponsorWallEntrance,
} from '@/lib/signage';
import { PLAYLIST_ITEM_TYPE_LABELS, SPONSOR_TIER_LABELS, SPONSOR_TIER_META, sponsorsForWall } from '@/lib/signage';
import { parseSponsorWallEntrance } from '@/lib/sponsor-wall';

const WALL_ENTRANCE_STORAGE_KEY = 'signage-sponsor-wall-entrance';

function preferredWallEntrance(): SponsorWallEntrance {
  if (typeof window === 'undefined') return 'stagger-fade';
  return parseSponsorWallEntrance(localStorage.getItem(WALL_ENTRANCE_STORAGE_KEY));
}

export type StudioContentOption = {
  key: string;
  id: string;
  label: string;
  type: PlaylistItemType;
  duration: number;
  thumb_url: string | null;
  defaultTransition?: SignageTransition;
};

export function buildStudioContentOptions(
  sponsors: SignageSponsor[],
  assets: SignageAsset[],
  exercises: SignageExerciseOption[]
): StudioContentOption[] {
  const options: StudioContentOption[] = [];
  const activeSponsors = sponsors.filter((s) => s.active);

  if (activeSponsors.length >= 2) {
    options.push({
      key: 'sponsor_wall:all',
      id: 'all',
      label: 'Muro de patrocinadores',
      type: 'sponsor_wall',
      duration: 45,
      thumb_url: null,
    });
  }

  for (const tier of ['gold', 'silver', 'bronze'] as const) {
    const tierSponsors = activeSponsors.filter((s) => s.tier === tier);
    if (tierSponsors.length >= 2) {
      options.push({
        key: `sponsor_wall:${tier}`,
        id: tier,
        label: `Muro · ${SPONSOR_TIER_LABELS[tier]}`,
        type: 'sponsor_wall',
        duration: 35,
        thumb_url: null,
      });
    }
  }

  for (const sponsor of sponsors.filter((s) => s.active)) {
    options.push({
      key: `sponsor:${sponsor.id}`,
      id: sponsor.id,
      label: sponsor.name,
      type: 'sponsor',
      duration: sponsor.default_duration_sec,
      thumb_url: sponsor.logo_url,
    });
  }

  for (const asset of assets.filter((a) => a.active && a.asset_type !== 'audio')) {
    const type =
      asset.asset_type === 'exercise_animation'
        ? 'exercise_animation'
        : asset.asset_type === 'club_branding'
          ? 'club_branding'
          : asset.asset_type === 'sponsor_slide'
            ? 'sponsor_slide'
            : asset.asset_type === 'video'
              ? 'video'
              : 'image';
    options.push({
      key: `${type}:${asset.exercise_id ?? asset.id}`,
      id: asset.exercise_id ?? asset.id,
      label: asset.title,
      type,
      duration: asset.duration_sec || 10,
      thumb_url: asset.thumbnail_url ?? asset.media_url,
    });
  }

  for (const exercise of exercises) {
    const key = `exercise_animation:${exercise.id}`;
    if (!options.some((o) => o.key === key)) {
      options.push({
        key,
        id: exercise.id,
        label: exercise.title,
        type: 'exercise_animation',
        duration: 30,
        thumb_url: null,
      });
    }
  }

  return options;
}

export function studioOptionToPlaylistItem(
  option: StudioContentOption,
  defaultTransition: SignageTransition = 'fade',
  sponsors: SignageSponsor[] = []
): PlaylistItem {
  const sponsor = option.type === 'sponsor' ? sponsors.find((s) => s.id === option.id) : null;
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: option.type,
    ref_id: option.id,
    duration_sec: option.duration,
    transition: option.defaultTransition ?? defaultTransition,
    ...(option.type === 'sponsor_wall' ? { wall_entrance: preferredWallEntrance() } : {}),
    ...(sponsor ? { weight: SPONSOR_TIER_META[sponsor.tier].weight } : {}),
  };
}

export function resolveStudioItemLabel(
  item: PlaylistItem,
  options: StudioContentOption[],
  sponsors: SignageSponsor[] = []
): { label: string; thumb_url: string | null; typeLabel: string } {
  if (item.type === 'sponsor_wall') {
    const count = sponsorsForWall(sponsors, item.ref_id).length;
    const label =
      item.ref_id === 'all'
        ? `Muro de patrocinadores (${count})`
        : `Muro · ${SPONSOR_TIER_LABELS[item.ref_id as keyof typeof SPONSOR_TIER_LABELS] ?? item.ref_id} (${count})`;
    return { label, thumb_url: null, typeLabel: PLAYLIST_ITEM_TYPE_LABELS.sponsor_wall };
  }
  const option = options.find((o) => o.id === item.ref_id && o.type === item.type);
  return {
    label: option?.label ?? item.ref_id,
    thumb_url: option?.thumb_url ?? null,
    typeLabel: PLAYLIST_ITEM_TYPE_LABELS[item.type],
  };
}

export function formatPlaylistDuration(totalSec: number): string {
  if (totalSec <= 0) return '0:00';
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function playlistTotalDuration(items: PlaylistItem[]): number {
  return items.reduce((sum, item) => sum + Math.max(0, item.duration_sec || 0), 0);
}

export const TIMELINE_TYPE_COLORS: Record<PlaylistItemType, string> = {
  sponsor: 'bg-amber-400/80',
  sponsor_wall: 'bg-orange-400/85',
  video: 'bg-violet-400/80',
  image: 'bg-cyan-400/80',
  sponsor_slide: 'bg-amber-300/70',
  exercise_animation: 'bg-emerald-400/80',
  club_branding: 'bg-primary/70',
};
