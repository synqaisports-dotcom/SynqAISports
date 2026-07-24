export const SPONSOR_TIERS = ['gold', 'silver', 'bronze'] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export const SIGNAGE_ZONE_TYPES = [
  'cafeteria',
  'waiting',
  'gym',
  'reception',
  'field_perimeter',
  'other',
] as const;
export type SignageZoneType = (typeof SIGNAGE_ZONE_TYPES)[number];

export const SIGNAGE_ORIENTATIONS = ['landscape', 'portrait'] as const;
export type SignageOrientation = (typeof SIGNAGE_ORIENTATIONS)[number];

export const SIGNAGE_ASSET_TYPES = [
  'video',
  'image',
  'sponsor_slide',
  'exercise_animation',
  'club_branding',
  'audio',
] as const;
export type SignageAssetType = (typeof SIGNAGE_ASSET_TYPES)[number];

export const SIGNAGE_CONTENT_ORIENTATIONS = ['landscape', 'portrait', 'both'] as const;
export type SignageContentOrientation = (typeof SIGNAGE_CONTENT_ORIENTATIONS)[number];

export const PLAYLIST_ROTATION_MODES = ['sequential', 'shuffle', 'weighted'] as const;
export type PlaylistRotationMode = (typeof PLAYLIST_ROTATION_MODES)[number];

export const PLAYLIST_ITEM_TYPES = [
  'sponsor',
  'video',
  'image',
  'sponsor_slide',
  'exercise_animation',
  'club_branding',
] as const;
export type PlaylistItemType = (typeof PLAYLIST_ITEM_TYPES)[number];

export type SignageSponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  tier: SponsorTier;
  url: string | null;
  default_duration_sec: number;
  active_from: string | null;
  active_until: string | null;
  notes: string | null;
  active: boolean;
};

export type SignageAsset = {
  id: string;
  title: string;
  asset_type: SignageAssetType;
  media_url: string | null;
  thumbnail_url: string | null;
  sponsor_id: string | null;
  exercise_id: string | null;
  duration_sec: number;
  orientation: SignageContentOrientation;
  active: boolean;
};

export type SignageDevice = {
  id: string;
  name: string;
  zone_type: SignageZoneType;
  facility_id: string | null;
  orientation: SignageOrientation;
  device_token: string;
  playlist_id: string | null;
  last_seen_at: string | null;
  active: boolean;
};

export type PlaylistItem = {
  id: string;
  type: PlaylistItemType;
  ref_id: string;
  duration_sec: number;
  weight?: number;
};

export type SignagePlaylist = {
  id: string;
  name: string;
  scope: 'club' | 'device';
  device_id: string | null;
  is_default: boolean;
  rotation_mode: PlaylistRotationMode;
  items: PlaylistItem[];
  active: boolean;
  background_audio_asset_id: string | null;
  audio_volume: number;
  audio_loop: boolean;
  audio_duck_during_video: boolean;
};

export type ScheduleDaypart = {
  id: string;
  label: string;
  from_hour: number;
  to_hour: number;
  playlist_id?: string | null;
};

export type SignageSchedule = {
  id: string;
  device_id: string | null;
  active_from_hour: number;
  active_to_hour: number;
  days_mask: number;
  standby_mode: 'logo' | 'black';
  dayparts: ScheduleDaypart[];
};

export type SignageExerciseOption = {
  id: string;
  title: string;
  has_animation: boolean;
  drawing_json?: unknown;
};

export const SPONSOR_TIER_LABELS: Record<SponsorTier, string> = {
  gold: 'Oro',
  silver: 'Plata',
  bronze: 'Bronce',
};

export const SIGNAGE_ZONE_LABELS: Record<SignageZoneType, string> = {
  cafeteria: 'Cafetería',
  waiting: 'Sala de espera',
  gym: 'Gym',
  reception: 'Recepción',
  field_perimeter: 'Vallas campo',
  other: 'Otra zona',
};

export const SIGNAGE_ORIENTATION_LABELS: Record<SignageOrientation, string> = {
  landscape: 'Horizontal',
  portrait: 'Vertical',
};

export const SIGNAGE_ASSET_TYPE_LABELS: Record<SignageAssetType, string> = {
  video: 'Vídeo',
  image: 'Imagen',
  sponsor_slide: 'Slide patrocinador',
  exercise_animation: 'Animación ejercicio',
  club_branding: 'Branding club',
  audio: 'Audio / música',
};

export const PLAYLIST_ITEM_TYPE_LABELS: Record<PlaylistItemType, string> = {
  sponsor: 'Patrocinador',
  video: 'Vídeo',
  image: 'Imagen',
  sponsor_slide: 'Slide patrocinador',
  exercise_animation: 'Animación',
  club_branding: 'Branding club',
};

export const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const;

export function generatePairingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function generateDeviceToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function parsePlaylistItems(raw: unknown): PlaylistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const type = String(o.type ?? '');
      if (!PLAYLIST_ITEM_TYPES.includes(type as PlaylistItemType)) return null;
      const refId = String(o.ref_id ?? '');
      if (!refId) return null;
      return {
        id: String(o.id ?? `item-${index}`),
        type: type as PlaylistItemType,
        ref_id: refId,
        duration_sec: Number(o.duration_sec ?? 10),
        weight: o.weight != null ? Number(o.weight) : undefined,
      };
    })
    .filter((item) => item !== null) as PlaylistItem[];
}

export function serializePlaylistItems(items: PlaylistItem[]): PlaylistItem[] {
  return items.map((item, index) => ({
    id: item.id || `item-${index}`,
    type: item.type,
    ref_id: item.ref_id,
    duration_sec: item.duration_sec,
    ...(item.weight != null ? { weight: item.weight } : {}),
  }));
}

export function isDayActive(daysMask: number, dayIndex: number): boolean {
  return Boolean(daysMask & (1 << dayIndex));
}

export function toggleDayMask(daysMask: number, dayIndex: number): number {
  return daysMask ^ (1 << dayIndex);
}

export function formatDaysMask(daysMask: number): string {
  if (daysMask === 127) return 'Todos los días';
  const active = DAY_LABELS.filter((_, i) => isDayActive(daysMask, i));
  return active.join(' · ') || 'Sin días';
}

export function parseScheduleDayparts(raw: unknown): ScheduleDaypart[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const o = item as Record<string, unknown>;
      const from = Number(o.from_hour);
      const to = Number(o.to_hour);
      if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return null;
      return {
        id: String(o.id ?? `daypart-${index}`),
        label: String(o.label ?? `Franja ${index + 1}`),
        from_hour: from,
        to_hour: to,
        playlist_id: o.playlist_id ? String(o.playlist_id) : null,
      };
    })
    .filter((item) => item !== null) as ScheduleDaypart[];
}

export function serializeScheduleDayparts(dayparts: ScheduleDaypart[]): ScheduleDaypart[] {
  return dayparts.map((part, index) => ({
    id: part.id || `daypart-${index}`,
    label: part.label,
    from_hour: part.from_hour,
    to_hour: part.to_hour,
    ...(part.playlist_id ? { playlist_id: part.playlist_id } : {}),
  }));
}

export function defaultScheduleDayparts(schedule: Pick<SignageSchedule, 'active_from_hour' | 'active_to_hour'>): ScheduleDaypart[] {
  const from = schedule.active_from_hour;
  const to = schedule.active_to_hour;
  const span = to - from;
  if (span < 3) {
    return [{ id: 'all-day', label: 'Activo', from_hour: from, to_hour: to }];
  }
  const third = Math.floor(span / 3);
  const mid = from + third;
  const late = from + third * 2;
  return [
    { id: 'morning', label: 'Mañana', from_hour: from, to_hour: mid },
    { id: 'afternoon', label: 'Tarde', from_hour: mid, to_hour: late },
    { id: 'evening', label: 'Noche', from_hour: late, to_hour: to },
  ];
}

export function getScheduleDayparts(schedule: SignageSchedule): ScheduleDaypart[] {
  if (schedule.dayparts.length) return schedule.dayparts;
  return defaultScheduleDayparts(schedule);
}

export function isWithinSchedule(schedule: SignageSchedule, date = new Date()): boolean {
  const day = (date.getDay() + 6) % 7;
  if (!isDayActive(schedule.days_mask, day)) return false;
  const hour = date.getHours();
  const dayparts = getScheduleDayparts(schedule);
  if (dayparts.length) {
    return dayparts.some((part) => hour >= part.from_hour && hour < part.to_hour);
  }
  return hour >= schedule.active_from_hour && hour < schedule.active_to_hour;
}

export function resolvePlaylistForSchedule(
  device: SignageDevice | null,
  playlists: SignagePlaylist[],
  schedule: SignageSchedule | null,
  date = new Date()
): SignagePlaylist | null {
  const base = resolveEffectivePlaylist(device, playlists);
  if (!schedule || !isWithinSchedule(schedule, date)) return base;
  const hour = date.getHours();
  const daypart = getScheduleDayparts(schedule).find((part) => hour >= part.from_hour && hour < part.to_hour);
  if (daypart?.playlist_id) {
    return playlists.find((p) => p.id === daypart.playlist_id && p.active) ?? base;
  }
  return base;
}

export function formatScheduleHours(schedule: SignageSchedule): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(schedule.active_from_hour)}:00 – ${pad(schedule.active_to_hour)}:00`;
}

export function deviceIsOnline(lastSeenAt: string | null, thresholdMinutes = 3): boolean {
  if (!lastSeenAt) return false;
  const diff = Date.now() - new Date(lastSeenAt).getTime();
  return diff < thresholdMinutes * 60 * 1000;
}

export function resolveEffectivePlaylist(
  device: SignageDevice | null,
  playlists: SignagePlaylist[]
): SignagePlaylist | null {
  if (device?.playlist_id) {
    const override = playlists.find((p) => p.id === device.playlist_id && p.active);
    if (override) return override;
  }
  return playlists.find((p) => p.is_default && p.scope === 'club' && p.active) ?? null;
}

export function resolveEffectiveSchedule(
  deviceId: string | null,
  schedules: SignageSchedule[]
): SignageSchedule | null {
  if (deviceId) {
    const deviceSchedule = schedules.find((s) => s.device_id === deviceId);
    if (deviceSchedule) return deviceSchedule;
  }
  return schedules.find((s) => !s.device_id) ?? null;
}

export type ResolvedPlaylistItem = {
  item: PlaylistItem;
  title: string;
  media_url: string | null;
  logo_url: string | null;
  exercise_drawing_json?: unknown;
  asset_type?: SignageAssetType;
};

export function resolvePlaylistItems(
  playlist: SignagePlaylist | null,
  sponsors: SignageSponsor[],
  assets: SignageAsset[],
  exercises: { id: string; title: string; drawing_json: unknown }[]
): ResolvedPlaylistItem[] {
  if (!playlist) return [];
  return playlist.items
    .map((item) => {
      if (item.type === 'sponsor') {
        const sponsor = sponsors.find((s) => s.id === item.ref_id && s.active);
        if (!sponsor) return null;
        return {
          item: { ...item, duration_sec: item.duration_sec || sponsor.default_duration_sec },
          title: sponsor.name,
          media_url: null,
          logo_url: sponsor.logo_url,
        };
      }
      if (item.type === 'sponsor_slide' || item.type === 'video' || item.type === 'image' || item.type === 'club_branding') {
        const asset = assets.find((a) => a.id === item.ref_id && a.active);
        if (!asset) return null;
        return {
          item: { ...item, duration_sec: item.duration_sec || asset.duration_sec || 10 },
          title: asset.title,
          media_url: asset.media_url,
          logo_url: asset.thumbnail_url,
          asset_type: asset.asset_type,
        };
      }
      if (item.type === 'exercise_animation') {
        const exercise = exercises.find((e) => e.id === item.ref_id);
        if (!exercise) return null;
        return {
          item: { ...item, duration_sec: item.duration_sec || 0 },
          title: exercise.title,
          media_url: null,
          logo_url: null,
          exercise_drawing_json: exercise.drawing_json,
          asset_type: 'exercise_animation' as const,
        };
      }
      return null;
    })
    .filter((entry) => entry !== null) as ResolvedPlaylistItem[];
}

export const SPONSOR_SELECT =
  'id, name, logo_url, tier, url, default_duration_sec, active_from, active_until, notes, active';
export const ASSET_SELECT =
  'id, title, asset_type, media_url, thumbnail_url, sponsor_id, exercise_id, duration_sec, orientation, active';
export const DEVICE_SELECT =
  'id, name, zone_type, facility_id, orientation, device_token, playlist_id, last_seen_at, active';
export const PLAYLIST_SELECT =
  'id, name, scope, device_id, is_default, rotation_mode, items_json, active, background_audio_asset_id, audio_volume, audio_loop, audio_duck_during_video';
export const SCHEDULE_SELECT =
  'id, device_id, active_from_hour, active_to_hour, days_mask, standby_mode, dayparts_json';
