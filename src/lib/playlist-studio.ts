import type { PlaylistItem, PlaylistItemType, SignageAsset, SignageExerciseOption, SignageSponsor } from '@/lib/signage';
import { PLAYLIST_ITEM_TYPE_LABELS } from '@/lib/signage';

export type StudioContentOption = {
  key: string;
  id: string;
  label: string;
  type: PlaylistItemType;
  duration: number;
  thumb_url: string | null;
};

export function buildStudioContentOptions(
  sponsors: SignageSponsor[],
  assets: SignageAsset[],
  exercises: SignageExerciseOption[]
): StudioContentOption[] {
  const options: StudioContentOption[] = [];

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

export function studioOptionToPlaylistItem(option: StudioContentOption): PlaylistItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: option.type,
    ref_id: option.id,
    duration_sec: option.duration,
  };
}

export function resolveStudioItemLabel(
  item: PlaylistItem,
  options: StudioContentOption[]
): { label: string; thumb_url: string | null; typeLabel: string } {
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
  video: 'bg-violet-400/80',
  image: 'bg-cyan-400/80',
  sponsor_slide: 'bg-amber-300/70',
  exercise_animation: 'bg-emerald-400/80',
  club_branding: 'bg-primary/70',
};
