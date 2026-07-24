'use server';

import { requireClubId } from '@/lib/auth-staff';
import { DEMO_SIGNAGE_CLUB_ID, getDemoSignageStore } from '@/lib/demo-signage-store';
import { isDemoActive } from '@/lib/demo';
import { hasDrawableAnimation, parseExerciseDrawing } from '@/lib/exercise-drawing';
import {
  fileExtensionForMime,
  fileToDataUrl,
  validateSignageUpload,
} from '@/lib/signage-media';
import {
  ASSET_SELECT,
  DEVICE_SELECT,
  generateDeviceToken,
  generatePairingCode,
  parsePlaylistItems,
  parseScheduleDayparts,
  PLAYLIST_SELECT,
  SCHEDULE_SELECT,
  serializePlaylistItems,
  serializeScheduleDayparts,
  SPONSOR_SELECT,
  type PlaylistItem,
  type SignageAsset,
  type SignageDevice,
  type SignageExerciseOption,
  type SignagePlaylist,
  type SignageSchedule,
  type SignageSponsor,
} from '@/lib/signage';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type SignageActionState = { ok: boolean; message?: string; id?: string };

const SIGNAGE_PATHS = [
  '/portal/signage',
  '/portal/signage/patrocinadores',
  '/portal/signage/contenido',
  '/portal/signage/pantallas',
  '/portal/signage/programacion',
];

function revalidateSignage() {
  for (const path of SIGNAGE_PATHS) revalidatePath(path);
}

function mapSponsor(row: Record<string, unknown>): SignageSponsor {
  return {
    id: String(row.id),
    name: String(row.name),
    logo_url: row.logo_url ? String(row.logo_url) : null,
    tier: row.tier as SignageSponsor['tier'],
    url: row.url ? String(row.url) : null,
    default_duration_sec: Number(row.default_duration_sec ?? 30),
    active_from: row.active_from ? String(row.active_from) : null,
    active_until: row.active_until ? String(row.active_until) : null,
    notes: row.notes ? String(row.notes) : null,
    active: row.active !== false,
  };
}

function mapAsset(row: Record<string, unknown>): SignageAsset {
  return {
    id: String(row.id),
    title: String(row.title),
    asset_type: row.asset_type as SignageAsset['asset_type'],
    media_url: row.media_url ? String(row.media_url) : null,
    thumbnail_url: row.thumbnail_url ? String(row.thumbnail_url) : null,
    sponsor_id: row.sponsor_id ? String(row.sponsor_id) : null,
    exercise_id: row.exercise_id ? String(row.exercise_id) : null,
    duration_sec: Number(row.duration_sec ?? 10),
    orientation: row.orientation as SignageAsset['orientation'],
    active: row.active !== false,
  };
}

function mapDevice(row: Record<string, unknown>): SignageDevice {
  return {
    id: String(row.id),
    name: String(row.name),
    zone_type: row.zone_type as SignageDevice['zone_type'],
    facility_id: row.facility_id ? String(row.facility_id) : null,
    orientation: row.orientation as SignageDevice['orientation'],
    device_token: String(row.device_token),
    playlist_id: row.playlist_id ? String(row.playlist_id) : null,
    last_seen_at: row.last_seen_at ? String(row.last_seen_at) : null,
    active: row.active !== false,
  };
}

function mapPlaylist(row: Record<string, unknown>): SignagePlaylist {
  return {
    id: String(row.id),
    name: String(row.name),
    scope: row.scope as SignagePlaylist['scope'],
    device_id: row.device_id ? String(row.device_id) : null,
    is_default: Boolean(row.is_default),
    rotation_mode: row.rotation_mode as SignagePlaylist['rotation_mode'],
    items: parsePlaylistItems(row.items_json),
    active: row.active !== false,
    background_audio_asset_id: row.background_audio_asset_id ? String(row.background_audio_asset_id) : null,
    audio_volume: Number(row.audio_volume ?? 40),
    audio_loop: row.audio_loop !== false,
    audio_duck_during_video: row.audio_duck_during_video !== false,
  };
}

function mapSchedule(row: Record<string, unknown>): SignageSchedule {
  return {
    id: String(row.id),
    device_id: row.device_id ? String(row.device_id) : null,
    active_from_hour: Number(row.active_from_hour ?? 10),
    active_to_hour: Number(row.active_to_hour ?? 22),
    days_mask: Number(row.days_mask ?? 127),
    standby_mode: row.standby_mode as SignageSchedule['standby_mode'],
    dayparts: parseScheduleDayparts(row.dayparts_json),
  };
}

export type SignageBundle = {
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  devices: SignageDevice[];
  playlists: SignagePlaylist[];
  schedules: SignageSchedule[];
  exercises: SignageExerciseOption[];
};

export async function loadSignageBundle(clubId: string): Promise<SignageBundle> {
  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    return {
      sponsors: store.sponsors,
      assets: store.assets,
      devices: store.devices,
      playlists: store.playlists,
      schedules: store.schedules,
      exercises: [],
    };
  }

  const supabase = await createClient();
  const [sponsorsRes, assetsRes, devicesRes, playlistsRes, schedulesRes, exercisesRes] =
    await Promise.all([
      supabase.from('synq_sponsors').select(SPONSOR_SELECT).eq('club_id', clubId).order('name'),
      supabase.from('synq_signage_assets').select(ASSET_SELECT).eq('club_id', clubId).order('title'),
      supabase.from('synq_signage_devices').select(DEVICE_SELECT).eq('club_id', clubId).order('name'),
      supabase
        .from('synq_signage_playlists')
        .select(PLAYLIST_SELECT)
        .eq('club_id', clubId)
        .order('name'),
      supabase.from('synq_signage_schedules').select(SCHEDULE_SELECT).eq('club_id', clubId),
      supabase
        .from('synq_exercises')
        .select('id, title, drawing_json')
        .eq('club_id', clubId)
        .order('title'),
    ]);

  const exercises = (exercisesRes.data ?? [])
    .map((row) => {
      const doc = parseExerciseDrawing(row.drawing_json);
      const has_animation = hasDrawableAnimation(doc);
      if (!has_animation) return null;
      return {
        id: String(row.id),
        title: String(row.title),
        has_animation,
        drawing_json: row.drawing_json,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  return {
    sponsors: (sponsorsRes.data ?? []).map((r) => mapSponsor(r as Record<string, unknown>)),
    assets: (assetsRes.data ?? []).map((r) => mapAsset(r as Record<string, unknown>)),
    devices: (devicesRes.data ?? []).map((r) => mapDevice(r as Record<string, unknown>)),
    playlists: (playlistsRes.data ?? []).map((r) => mapPlaylist(r as Record<string, unknown>)),
    schedules: (schedulesRes.data ?? []).map((r) => mapSchedule(r as Record<string, unknown>)),
    exercises,
  };
}

export async function createSponsor(
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'validation' };

  const payload = {
    name,
    logo_url: String(formData.get('logo_url') ?? '').trim() || null,
    tier: String(formData.get('tier') ?? 'silver'),
    url: String(formData.get('url') ?? '').trim() || null,
    default_duration_sec: Number(formData.get('default_duration_sec') ?? 30),
    notes: String(formData.get('notes') ?? '').trim() || null,
    active: formData.get('active') !== 'false',
  };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const id = `demo-sponsor-${Date.now()}`;
    store.sponsors.push({
      id,
      name: payload.name,
      logo_url: payload.logo_url,
      tier: payload.tier as SignageSponsor['tier'],
      url: payload.url,
      default_duration_sec: payload.default_duration_sec,
      notes: payload.notes,
      active: payload.active,
      active_from: null,
      active_until: null,
    });
    revalidateSignage();
    return { ok: true, id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_sponsors')
    .insert({ club_id: clubId, ...payload })
    .select('id')
    .single();
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: String(data.id) };
}

export async function updateSponsor(
  sponsorId: string,
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'validation' };

  const payload = {
    name,
    logo_url: String(formData.get('logo_url') ?? '').trim() || null,
    tier: String(formData.get('tier') ?? 'silver'),
    url: String(formData.get('url') ?? '').trim() || null,
    default_duration_sec: Number(formData.get('default_duration_sec') ?? 30),
    notes: String(formData.get('notes') ?? '').trim() || null,
    active: formData.get('active') !== 'false',
  };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.sponsors.findIndex((s) => s.id === sponsorId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.sponsors[idx] = {
      ...store.sponsors[idx],
      name: payload.name,
      logo_url: payload.logo_url,
      tier: payload.tier as SignageSponsor['tier'],
      url: payload.url,
      default_duration_sec: payload.default_duration_sec,
      notes: payload.notes,
      active: payload.active,
    };
    revalidateSignage();
    return { ok: true, id: sponsorId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_sponsors')
    .update(payload)
    .eq('id', sponsorId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: sponsorId };
}

export async function uploadSignageMedia(
  formData: FormData
): Promise<{ ok: boolean; url?: string; message?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'no_file' };

  const validation = validateSignageUpload(file);
  if (!validation.ok) return { ok: false, message: validation.message };

  const ext = fileExtensionForMime(file.type, file.name);
  const path = `${clubId}/signage/${Date.now()}.${ext}`;
  const supabase = await createClient();

  const { error } = await supabase.storage.from('signage-media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  });

  if (!error) {
    const { data } = supabase.storage.from('signage-media').getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  }

  // Fallback demo: data URL embebida (válida en cualquier pantalla)
  if ((await isDemoActive()) && file.type.startsWith('image/')) {
    try {
      const url = await fileToDataUrl(file);
      return { ok: true, url };
    } catch {
      return { ok: false, message: 'upload_error' };
    }
  }

  console.error('uploadSignageMedia', error);
  return { ok: false, message: 'upload_error' };
}

export async function createSignageAsset(
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = String(formData.get('title') ?? '').trim();
  const asset_type = String(formData.get('asset_type') ?? 'image');
  if (!title) return { ok: false, message: 'validation' };

  const payload = {
    title,
    asset_type,
    media_url: String(formData.get('media_url') ?? '').trim() || null,
    thumbnail_url: String(formData.get('thumbnail_url') ?? '').trim() || null,
    sponsor_id: String(formData.get('sponsor_id') ?? '').trim() || null,
    exercise_id: String(formData.get('exercise_id') ?? '').trim() || null,
    duration_sec: Number(formData.get('duration_sec') ?? 10),
    orientation: String(formData.get('orientation') ?? 'both'),
    active: true,
  };

  if ((asset_type === 'image' || asset_type === 'video' || asset_type === 'audio') && !payload.media_url) {
    return { ok: false, message: 'no_file' };
  }

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const id = `demo-asset-${Date.now()}`;
    store.assets.push({
      id,
      ...payload,
      sponsor_id: payload.sponsor_id,
      exercise_id: payload.exercise_id,
      asset_type: payload.asset_type as SignageAsset['asset_type'],
      orientation: payload.orientation as SignageAsset['orientation'],
    });
    revalidateSignage();
    return { ok: true, id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_signage_assets')
    .insert({ club_id: clubId, ...payload })
    .select('id')
    .single();
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: String(data.id) };
}

export async function updateSignageAsset(
  assetId: string,
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, message: 'validation' };

  const payload = {
    title,
    media_url: String(formData.get('media_url') ?? '').trim() || null,
    thumbnail_url: String(formData.get('thumbnail_url') ?? '').trim() || null,
    duration_sec: Number(formData.get('duration_sec') ?? 10),
    orientation: String(formData.get('orientation') ?? 'both'),
    active: formData.get('active') !== 'false',
  };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.assets.findIndex((a) => a.id === assetId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.assets[idx] = {
      ...store.assets[idx],
      ...payload,
      orientation: payload.orientation as SignageAsset['orientation'],
    };
    revalidateSignage();
    return { ok: true, id: assetId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_assets')
    .update(payload)
    .eq('id', assetId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: assetId };
}

export async function toggleSponsorActive(sponsorId: string, active: boolean): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.sponsors.findIndex((s) => s.id === sponsorId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.sponsors[idx] = { ...store.sponsors[idx], active };
    revalidateSignage();
    return { ok: true, id: sponsorId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_sponsors')
    .update({ active })
    .eq('id', sponsorId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: sponsorId };
}

export async function deleteSponsor(sponsorId: string): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    store.sponsors = store.sponsors.filter((s) => s.id !== sponsorId);
    revalidateSignage();
    return { ok: true, id: sponsorId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_sponsors')
    .delete()
    .eq('id', sponsorId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: sponsorId };
}

export async function toggleSignageAssetActive(assetId: string, active: boolean): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.assets.findIndex((a) => a.id === assetId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.assets[idx] = { ...store.assets[idx], active };
    revalidateSignage();
    return { ok: true, id: assetId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_assets')
    .update({ active })
    .eq('id', assetId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: assetId };
}

export async function deleteSignageAsset(assetId: string): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    store.assets = store.assets.filter((a) => a.id !== assetId);
    revalidateSignage();
    return { ok: true, id: assetId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_assets')
    .delete()
    .eq('id', assetId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: assetId };
}

export async function toggleDeviceActive(deviceId: string, active: boolean): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.devices.findIndex((d) => d.id === deviceId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.devices[idx] = { ...store.devices[idx], active };
    revalidateSignage();
    return { ok: true, id: deviceId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_devices')
    .update({ active })
    .eq('id', deviceId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: deviceId };
}

export async function deleteDevice(deviceId: string): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    store.devices = store.devices.filter((d) => d.id !== deviceId);
    revalidateSignage();
    return { ok: true, id: deviceId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_devices')
    .delete()
    .eq('id', deviceId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: deviceId };
}

export async function createPlaylist(
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const id = `demo-playlist-${Date.now()}`;
    store.playlists.push({
      id,
      name,
      scope: 'club',
      device_id: null,
      is_default: false,
      rotation_mode: 'sequential',
      items: [],
      active: true,
      background_audio_asset_id: null,
      audio_volume: 40,
      audio_loop: true,
      audio_duck_during_video: true,
    });
    revalidateSignage();
    return { ok: true, id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_signage_playlists')
    .insert({
      club_id: clubId,
      name,
      scope: 'club',
      is_default: false,
      items_json: [],
    })
    .select('id')
    .single();
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: String(data.id) };
}

export async function deletePlaylist(playlistId: string): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const playlist = store.playlists.find((p) => p.id === playlistId);
    if (!playlist) return { ok: false, message: 'not_found' };
    if (playlist.is_default) return { ok: false, message: 'cannot_delete_default' };
    store.playlists = store.playlists.filter((p) => p.id !== playlistId);
    store.devices.forEach((d, i) => {
      if (d.playlist_id === playlistId) {
        store.devices[i] = { ...d, playlist_id: null };
      }
    });
    revalidateSignage();
    return { ok: true, id: playlistId };
  }

  const supabase = await createClient();
  const { data: playlist } = await supabase
    .from('synq_signage_playlists')
    .select('is_default')
    .eq('id', playlistId)
    .eq('club_id', clubId)
    .maybeSingle();
  if (!playlist) return { ok: false, message: 'not_found' };
  if (playlist.is_default) return { ok: false, message: 'cannot_delete_default' };

  await supabase
    .from('synq_signage_devices')
    .update({ playlist_id: null })
    .eq('playlist_id', playlistId)
    .eq('club_id', clubId);

  const { error } = await supabase
    .from('synq_signage_playlists')
    .delete()
    .eq('id', playlistId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: playlistId };
}

export async function updatePlaylist(
  playlistId: string,
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, message: 'validation' };

  let items: PlaylistItem[] = [];
  try {
    items = parsePlaylistItems(JSON.parse(String(formData.get('items_json') ?? '[]')));
  } catch {
    return { ok: false, message: 'validation' };
  }

  const payload = {
    name,
    rotation_mode: String(formData.get('rotation_mode') ?? 'sequential'),
    items_json: serializePlaylistItems(items),
    is_default: formData.get('is_default') === 'true',
    active: formData.get('active') !== 'false',
    background_audio_asset_id: String(formData.get('background_audio_asset_id') ?? '').trim() || null,
    audio_volume: Math.min(100, Math.max(0, Number(formData.get('audio_volume') ?? 40))),
    audio_loop: formData.get('audio_loop') !== 'false',
    audio_duck_during_video: formData.get('audio_duck_during_video') !== 'false',
  };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.playlists.findIndex((p) => p.id === playlistId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.playlists[idx] = {
      ...store.playlists[idx],
      name: payload.name,
      rotation_mode: payload.rotation_mode as SignagePlaylist['rotation_mode'],
      items,
      is_default: payload.is_default,
      active: payload.active,
      background_audio_asset_id: payload.background_audio_asset_id,
      audio_volume: payload.audio_volume,
      audio_loop: payload.audio_loop,
      audio_duck_during_video: payload.audio_duck_during_video,
    };
    if (payload.is_default) {
      store.playlists.forEach((p, i) => {
        if (i !== idx && p.scope === 'club') store.playlists[i] = { ...p, is_default: false };
      });
    }
    revalidateSignage();
    return { ok: true, id: playlistId };
  }

  const supabase = await createClient();
  if (payload.is_default) {
    await supabase
      .from('synq_signage_playlists')
      .update({ is_default: false })
      .eq('club_id', clubId)
      .eq('scope', 'club');
  }
  const { error } = await supabase
    .from('synq_signage_playlists')
    .update(payload)
    .eq('id', playlistId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: playlistId };
}

export async function createDefaultPlaylist(clubId: string): Promise<string | null> {
  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    if (store.playlists.length) return store.playlists[0].id;
    const id = 'demo-playlist-new';
    store.playlists.push({
      id,
      name: 'Playlist principal',
      scope: 'club',
      device_id: null,
      is_default: true,
      rotation_mode: 'sequential',
      items: [],
      active: true,
      background_audio_asset_id: null,
      audio_volume: 40,
      audio_loop: true,
      audio_duck_during_video: true,
    });
    return id;
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('synq_signage_playlists')
    .select('id')
    .eq('club_id', clubId)
    .eq('is_default', true)
    .maybeSingle();
  if (existing) return String(existing.id);

  const { data, error } = await supabase
    .from('synq_signage_playlists')
    .insert({
      club_id: clubId,
      name: 'Playlist principal',
      scope: 'club',
      is_default: true,
      items_json: [],
    })
    .select('id')
    .single();
  if (error) return null;
  return String(data.id);
}

export async function updateSchedule(
  scheduleId: string | null,
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const payload = {
    active_from_hour: Number(formData.get('active_from_hour') ?? 10),
    active_to_hour: Number(formData.get('active_to_hour') ?? 22),
    days_mask: Number(formData.get('days_mask') ?? 127),
    standby_mode: String(formData.get('standby_mode') ?? 'logo'),
    device_id: String(formData.get('device_id') ?? '').trim() || null,
    dayparts_json: [] as ReturnType<typeof serializeScheduleDayparts>,
  };

  try {
    payload.dayparts_json = serializeScheduleDayparts(
      parseScheduleDayparts(JSON.parse(String(formData.get('dayparts_json') ?? '[]')))
    );
  } catch {
    return { ok: false, message: 'validation' };
  }

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    if (!scheduleId) {
      const id = `demo-schedule-${Date.now()}`;
      store.schedules.push({
        id,
        device_id: payload.device_id,
        active_from_hour: payload.active_from_hour,
        active_to_hour: payload.active_to_hour,
        days_mask: payload.days_mask,
        standby_mode: payload.standby_mode as SignageSchedule['standby_mode'],
        dayparts: payload.dayparts_json,
      });
      revalidateSignage();
      return { ok: true, id };
    }
    const idx = store.schedules.findIndex((s) => s.id === scheduleId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.schedules[idx] = {
      ...store.schedules[idx],
      ...payload,
      standby_mode: payload.standby_mode as SignageSchedule['standby_mode'],
      dayparts: payload.dayparts_json,
    };
    revalidateSignage();
    return { ok: true, id: scheduleId };
  }

  const supabase = await createClient();
  if (scheduleId) {
    const { error } = await supabase
      .from('synq_signage_schedules')
      .update(payload)
      .eq('id', scheduleId)
      .eq('club_id', clubId);
    if (error) return { ok: false, message: 'error' };
  } else {
    const { data, error } = await supabase
      .from('synq_signage_schedules')
      .insert({ club_id: clubId, ...payload })
      .select('id')
      .single();
    if (error) return { ok: false, message: 'error' };
    revalidateSignage();
    return { ok: true, id: String(data.id) };
  }
  revalidateSignage();
  return { ok: true, id: scheduleId };
}

export async function updateDevice(
  deviceId: string,
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    zone_type: String(formData.get('zone_type') ?? 'waiting'),
    orientation: String(formData.get('orientation') ?? 'landscape'),
    facility_id: String(formData.get('facility_id') ?? '').trim() || null,
    playlist_id: String(formData.get('playlist_id') ?? '').trim() || null,
    active: formData.get('active') !== 'false',
  };
  if (!payload.name) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const idx = store.devices.findIndex((d) => d.id === deviceId);
    if (idx < 0) return { ok: false, message: 'not_found' };
    store.devices[idx] = {
      ...store.devices[idx],
      ...payload,
      zone_type: payload.zone_type as SignageDevice['zone_type'],
      orientation: payload.orientation as SignageDevice['orientation'],
    };
    revalidateSignage();
    return { ok: true, id: deviceId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_signage_devices')
    .update(payload)
    .eq('id', deviceId)
    .eq('club_id', clubId);
  if (error) return { ok: false, message: 'error' };
  revalidateSignage();
  return { ok: true, id: deviceId };
}

export async function claimPairingCode(
  _prev: SignageActionState,
  formData: FormData
): Promise<SignageActionState & { deviceToken?: string }> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const code = String(formData.get('pairing_code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const zone_type = String(formData.get('zone_type') ?? 'waiting');
  const orientation = String(formData.get('orientation') ?? 'landscape');
  if (!code || !name) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const session = [...store.pairingSessions.values()].find((s) => s.code === code);
    if (!session || session.expiresAt < Date.now()) return { ok: false, message: 'expired' };
    const deviceId = `demo-device-${Date.now()}`;
    store.devices.push({
      id: deviceId,
      name,
      zone_type: zone_type as SignageDevice['zone_type'],
      facility_id: null,
      orientation: orientation as SignageDevice['orientation'],
      device_token: session.token,
      playlist_id: null,
      last_seen_at: null,
      active: true,
    });
    session.clubId = clubId;
    session.deviceId = deviceId;
    revalidateSignage();
    return { ok: true, id: deviceId, deviceToken: session.token };
  }

  const supabase = await createClient();
  const { data: session } = await supabase
    .from('synq_signage_pairing_sessions')
    .select('id, device_token, expires_at, claimed_at')
    .eq('pairing_code', code)
    .maybeSingle();

  if (!session || session.claimed_at) return { ok: false, message: 'invalid' };
  if (new Date(session.expires_at) < new Date()) return { ok: false, message: 'expired' };

  const { data: device, error: deviceError } = await supabase
    .from('synq_signage_devices')
    .insert({
      club_id: clubId,
      name,
      zone_type,
      orientation,
      device_token: session.device_token,
      active: true,
    })
    .select('id')
    .single();
  if (deviceError) return { ok: false, message: 'error' };

  await supabase
    .from('synq_signage_pairing_sessions')
    .update({ club_id: clubId, device_id: device.id, claimed_at: new Date().toISOString() })
    .eq('id', session.id);

  revalidateSignage();
  return { ok: true, id: String(device.id), deviceToken: session.device_token };
}

export async function createPairingSession(): Promise<{
  ok: boolean;
  code?: string;
  token?: string;
  expiresAt?: string;
  message?: string;
}> {
  const code = generatePairingCode();
  const token = generateDeviceToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    store.pairingSessions.set(code, {
      code,
      token,
      clubId: null,
      deviceId: null,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
    return { ok: true, code, token, expiresAt };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('synq_signage_pairing_sessions').insert({
    pairing_code: code,
    device_token: token,
    expires_at: expiresAt,
  });
  if (error) return { ok: false, message: 'error' };
  return { ok: true, code, token, expiresAt };
}

export async function getPairingStatus(code: string): Promise<{
  status: 'pending' | 'paired' | 'expired' | 'invalid';
  deviceToken?: string;
}> {
  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const session = [...store.pairingSessions.values()].find((s) => s.code === code);
    if (!session) return { status: 'invalid' };
    if (session.expiresAt < Date.now()) return { status: 'expired' };
    if (session.deviceId) return { status: 'paired', deviceToken: session.token };
    return { status: 'pending' };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from('synq_signage_pairing_sessions')
    .select('device_token, expires_at, claimed_at')
    .eq('pairing_code', code)
    .maybeSingle();

  if (!data) return { status: 'invalid' };
  if (new Date(data.expires_at) < new Date()) return { status: 'expired' };
  if (data.claimed_at) return { status: 'paired', deviceToken: data.device_token };
  return { status: 'pending' };
}

export async function loadPlayerPayload(deviceToken: string) {
  if (await isDemoActive()) {
    const store = getDemoSignageStore();
    const device = store.devices.find((d) => d.device_token === deviceToken && d.active);
    if (!device) return null;
    const playlist =
      store.playlists.find((p) => p.id === device.playlist_id) ??
      store.playlists.find((p) => p.is_default);
    const schedule = store.schedules.find((s) => !s.device_id) ?? null;
    const { resolvePlaylistForSchedule } = await import('@/lib/signage');
    const effectivePlaylist = resolvePlaylistForSchedule(device, store.playlists, schedule) ?? playlist;
    return {
      device,
      playlist: effectivePlaylist,
      playlists: store.playlists,
      schedule,
      club: { name: 'Club Demo SynqAI', logo_url: '/demo/club-demo-logo.svg' },
      sponsors: store.sponsors,
      assets: store.assets,
      exercises: [] as { id: string; title: string; drawing_json: unknown }[],
    };
  }

  const supabase = await createClient();
  const { data: device } = await supabase
    .from('synq_signage_devices')
    .select(`${DEVICE_SELECT}, club_id`)
    .eq('device_token', deviceToken)
    .eq('active', true)
    .maybeSingle();
  if (!device) return null;

  const clubId = String(device.club_id);
  const [clubRes, playlistsRes, schedulesRes, sponsorsRes, assetsRes] = await Promise.all([
    supabase.from('synq_clubs').select('name, logo_url').eq('id', clubId).single(),
    supabase.from('synq_signage_playlists').select(PLAYLIST_SELECT).eq('club_id', clubId).eq('active', true),
    supabase.from('synq_signage_schedules').select(SCHEDULE_SELECT).eq('club_id', clubId),
    supabase.from('synq_sponsors').select(SPONSOR_SELECT).eq('club_id', clubId).eq('active', true),
    supabase.from('synq_signage_assets').select(ASSET_SELECT).eq('club_id', clubId).eq('active', true),
  ]);

  const playlists = (playlistsRes.data ?? []).map((r) => mapPlaylist(r as Record<string, unknown>));
  const schedules = (schedulesRes.data ?? []).map((r) => mapSchedule(r as Record<string, unknown>));
  const mappedDevice = mapDevice(device as Record<string, unknown>);
  const schedule =
    schedules.find((s) => s.device_id === mappedDevice.id) ?? schedules.find((s) => !s.device_id) ?? null;
  const { resolvePlaylistForSchedule } = await import('@/lib/signage');
  const playlist = resolvePlaylistForSchedule(mappedDevice, playlists, schedule);

  const exerciseIds = (playlist?.items ?? [])
    .filter((i) => i.type === 'exercise_animation')
    .map((i) => i.ref_id);
  let exercises: { id: string; title: string; drawing_json: unknown }[] = [];
  if (exerciseIds.length) {
    const { data } = await supabase
      .from('synq_exercises')
      .select('id, title, drawing_json')
      .in('id', exerciseIds);
    exercises = (data ?? []).map((r) => ({
      id: String(r.id),
      title: String(r.title),
      drawing_json: r.drawing_json,
    }));
  }

  await supabase
    .from('synq_signage_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', mappedDevice.id);

  return {
    device: mappedDevice,
    playlist: playlist ?? null,
    playlists,
    schedule,
    club: clubRes.data ?? { name: 'Club', logo_url: null },
    sponsors: (sponsorsRes.data ?? []).map((r) => mapSponsor(r as Record<string, unknown>)),
    assets: (assetsRes.data ?? []).map((r) => mapAsset(r as Record<string, unknown>)),
    exercises,
  };
}

export async function ensureSignageDefaults(clubId: string) {
  if (clubId === DEMO_SIGNAGE_CLUB_ID && (await isDemoActive())) return;
  await createDefaultPlaylist(clubId);
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from('synq_signage_schedules')
    .select('id')
    .eq('club_id', clubId)
    .is('device_id', null)
    .maybeSingle();
  if (!schedule) {
    await supabase.from('synq_signage_schedules').insert({
      club_id: clubId,
      active_from_hour: 10,
      active_to_hour: 22,
      days_mask: 127,
      standby_mode: 'logo',
    });
  }
}
