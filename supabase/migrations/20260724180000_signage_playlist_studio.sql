-- Playlist Studio: audio de fondo, dayparts y tipo audio en biblioteca.

alter table public.synq_signage_assets
  drop constraint if exists synq_signage_assets_asset_type_check;

alter table public.synq_signage_assets
  add constraint synq_signage_assets_asset_type_check
  check (
    asset_type in (
      'video',
      'image',
      'sponsor_slide',
      'exercise_animation',
      'club_branding',
      'audio'
    )
  );

alter table public.synq_signage_playlists
  add column if not exists background_audio_asset_id uuid
    references public.synq_signage_assets (id) on delete set null,
  add column if not exists audio_volume integer not null default 40
    check (audio_volume between 0 and 100),
  add column if not exists audio_loop boolean not null default true,
  add column if not exists audio_duck_during_video boolean not null default true;

alter table public.synq_signage_schedules
  add column if not exists dayparts_json jsonb not null default '[]'::jsonb;

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav'
  ]
where id = 'signage-media';
