import { getDemoClubIdFallback } from '@/lib/demo-constants';
import type {
  SignageAsset,
  SignageDevice,
  SignagePlaylist,
  SignageSchedule,
  SignageSponsor,
} from '@/lib/signage';

const clubId = getDemoClubIdFallback();

export const DEMO_SIGNAGE_SPONSORS: SignageSponsor[] = [
  {
    id: 'demo-sponsor-1',
    name: 'Cafetería El Gol',
    logo_url: null,
    tier: 'gold',
    url: 'https://example.com',
    default_duration_sec: 30,
    active_from: null,
    active_until: null,
    notes: null,
    active: true,
  },
  {
    id: 'demo-sponsor-2',
    name: 'FisioSport Centro',
    logo_url: null,
    tier: 'silver',
    url: null,
    default_duration_sec: 20,
    active_from: null,
    active_until: null,
    notes: null,
    active: true,
  },
];

export const DEMO_SIGNAGE_ASSETS: SignageAsset[] = [
  {
    id: 'demo-asset-1',
    title: 'Bienvenida al club',
    asset_type: 'club_branding',
    media_url: null,
    thumbnail_url: null,
    sponsor_id: null,
    exercise_id: null,
    duration_sec: 15,
    orientation: 'both',
    active: true,
  },
];

export const DEMO_SIGNAGE_DEVICES: SignageDevice[] = [
  {
    id: 'demo-device-1',
    name: 'TV Cafetería',
    zone_type: 'cafeteria',
    facility_id: null,
    orientation: 'landscape',
    device_token: 'demo-token-cafeteria',
    playlist_id: null,
    last_seen_at: new Date().toISOString(),
    active: true,
  },
];

export const DEMO_SIGNAGE_PLAYLISTS: SignagePlaylist[] = [
  {
    id: 'demo-playlist-1',
    name: 'Playlist principal',
    scope: 'club',
    device_id: null,
    is_default: true,
    rotation_mode: 'sequential',
    items: [
      { id: 'pi-1', type: 'sponsor', ref_id: 'demo-sponsor-1', duration_sec: 30 },
      { id: 'pi-2', type: 'club_branding', ref_id: 'demo-asset-1', duration_sec: 15 },
      { id: 'pi-3', type: 'sponsor', ref_id: 'demo-sponsor-2', duration_sec: 20 },
    ],
    active: true,
    background_audio_asset_id: null,
    audio_volume: 40,
    audio_loop: true,
    audio_duck_during_video: true,
  },
];

export const DEMO_SIGNAGE_SCHEDULES: SignageSchedule[] = [
  {
    id: 'demo-schedule-1',
    device_id: null,
    active_from_hour: 10,
    active_to_hour: 22,
    days_mask: 127,
    standby_mode: 'logo',
    dayparts: [],
  },
];

type DemoStore = {
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  devices: SignageDevice[];
  playlists: SignagePlaylist[];
  schedules: SignageSchedule[];
  pairingSessions: Map<
    string,
    { code: string; token: string; clubId: string | null; deviceId: string | null; expiresAt: number }
  >;
};

const store: DemoStore = {
  sponsors: [...DEMO_SIGNAGE_SPONSORS],
  assets: [...DEMO_SIGNAGE_ASSETS],
  devices: [...DEMO_SIGNAGE_DEVICES],
  playlists: [...DEMO_SIGNAGE_PLAYLISTS],
  schedules: [...DEMO_SIGNAGE_SCHEDULES],
  pairingSessions: new Map(),
};

export function getDemoSignageStore() {
  return store;
}

export function resetDemoSignageStore() {
  store.sponsors = [...DEMO_SIGNAGE_SPONSORS];
  store.assets = [...DEMO_SIGNAGE_ASSETS];
  store.devices = [...DEMO_SIGNAGE_DEVICES];
  store.playlists = [...DEMO_SIGNAGE_PLAYLISTS];
  store.schedules = [...DEMO_SIGNAGE_SCHEDULES];
  store.pairingSessions.clear();
}

export { clubId as DEMO_SIGNAGE_CLUB_ID };
