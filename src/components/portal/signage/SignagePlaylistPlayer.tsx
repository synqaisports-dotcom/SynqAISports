'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ExerciseAnimationPlayer } from '@/components/methodology/drawing/ExerciseAnimationPlayer';
import { hasDrawableAnimation, parseExerciseDrawing } from '@/lib/exercise-drawing';
import {
  getPlaylistItemWeight,
  isWithinSchedule,
  pickWeightedPlaylistIndex,
  resolvePlaylistItems,
  shufflePlaylistOrder,
  type PlaylistRotationMode,
  type ResolvedPlaylistItem,
  type SignageAsset,
  type SignageDevice,
  type SignagePlaylist,
  type SignageSchedule,
  type SignageSponsor,
  type SignageTransition,
} from '@/lib/signage';
import { cn } from '@/lib/utils';
import { SponsorWallSlide } from '@/components/portal/signage/SponsorWallSlide';

function transitionClass(transition?: SignageTransition): string {
  switch (transition) {
    case 'none':
      return '';
    case 'slide-left':
      return 'signage-transition-slide-left';
    case 'slide-up':
      return 'signage-transition-slide-up';
    case 'zoom':
      return 'signage-transition-zoom';
    default:
      return 'signage-transition-fade';
  }
}

type Props = {
  orientation: SignageDevice['orientation'] | 'landscape' | 'portrait';
  playlist: SignagePlaylist | null;
  schedule: SignageSchedule | null;
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  exercises: { id: string; title: string; drawing_json: unknown }[];
  clubName: string;
  clubLogoUrl: string | null;
  preview?: boolean;
  autoPlay?: boolean;
  fullscreen?: boolean;
  className?: string;
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  backgroundAudioUrl?: string | null;
  audioVolume?: number;
  audioLoop?: boolean;
  audioDuckDuringVideo?: boolean;
};

function SlideContent({
  slide,
  clubName,
  clubLogoUrl,
  onEnded,
}: {
  slide: ResolvedPlaylistItem;
  clubName: string;
  clubLogoUrl: string | null;
  onEnded?: () => void;
}) {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const drawingDoc = slide.exercise_drawing_json
    ? parseExerciseDrawing(slide.exercise_drawing_json)
    : null;
  const canAnimate = drawingDoc ? hasDrawableAnimation(drawingDoc) : false;
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setPlaying(true);
    setProgress(0);
    setImageError(false);
    if (videoRef) {
      videoRef.currentTime = 0;
      void videoRef.play().catch(() => undefined);
    }
  }, [slide.item.id, videoRef]);

  if (slide.sponsors_list?.length) {
    return (
      <SponsorWallSlide
        sponsors={slide.sponsors_list}
        clubName={clubName}
        clubLogoUrl={clubLogoUrl}
        entrance={slide.wall_entrance ?? slide.item.wall_entrance ?? 'stagger-fade'}
      />
    );
  }

  if (slide.item.type === 'sponsor' || slide.asset_type === 'sponsor_slide') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#060a12] via-[#0a1628] to-[#060a12] p-8">
        {slide.logo_url ? (
          <img src={slide.logo_url} alt={slide.title} className="max-h-[40%] max-w-[70%] object-contain" />
        ) : (
          <div className="flex size-32 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-4xl font-bold text-cyan-200">
            {slide.title.slice(0, 1)}
          </div>
        )}
        <p className="text-center text-2xl font-semibold tracking-wide text-white">{slide.title}</p>
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400/60">Patrocinador oficial</p>
      </div>
    );
  }

  if (slide.asset_type === 'video' && slide.media_url) {
    return (
      <video
        ref={setVideoRef}
        src={slide.media_url}
        className="h-full w-full object-contain bg-black"
        muted
        playsInline
        autoPlay
        onEnded={onEnded}
      />
    );
  }

  const isImageSlide =
    slide.asset_type === 'image' || slide.item.type === 'image' || slide.item.type === 'sponsor_slide';

  if (isImageSlide && slide.media_url && !imageError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-2">
        <img
          src={slide.media_url}
          alt={slide.title}
          className="max-h-full max-w-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (isImageSlide && (imageError || !slide.media_url)) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#060a12] p-8 text-center">
        <p className="text-lg font-medium text-white">{slide.title}</p>
        <p className="max-w-md text-sm text-cyan-300/60">
          {imageError
            ? 'No se pudo cargar la imagen. Vuelve a subirla en JPG, PNG o WebP (máx. 10 MB).'
            : 'Sin archivo de imagen. Edita el contenido y sube una imagen válida.'}
        </p>
      </div>
    );
  }

  if (slide.asset_type === 'club_branding' && slide.media_url) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black p-2">
        <img
          src={slide.media_url}
          alt={slide.title}
          className="max-h-full max-w-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  if (slide.asset_type === 'club_branding' && !slide.media_url) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#060a12] to-[#0f1f35]">
        {clubLogoUrl ? (
          <Image src={clubLogoUrl} alt={clubName} width={160} height={160} className="rounded-2xl object-contain" />
        ) : null}
        <p className="text-3xl font-semibold text-white">{clubName}</p>
      </div>
    );
  }

  if (canAnimate && drawingDoc) {
    return (
      <div className="relative h-full w-full bg-[#060a12]">
        <ExerciseAnimationPlayer
          document={drawingDoc}
          playing={playing}
          onPlayingChange={setPlaying}
          progress={progress}
          onProgressChange={setProgress}
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#060a12] text-cyan-200/70">
      {slide.title}
    </div>
  );
}

export function SignagePlaylistPlayer({
  orientation,
  playlist,
  schedule,
  sponsors,
  assets,
  exercises,
  clubName,
  clubLogoUrl,
  preview = false,
  autoPlay = true,
  fullscreen = false,
  className,
  currentIndex,
  onIndexChange,
  backgroundAudioUrl,
  audioVolume,
  audioLoop,
  audioDuckDuringVideo,
}: Props) {
  const resolved = useMemo(
    () => resolvePlaylistItems(playlist, sponsors, assets, exercises),
    [playlist, sponsors, assets, exercises]
  );

  const [internalIndex, setInternalIndex] = useState(0);
  const index = currentIndex ?? internalIndex;
  const setIndex = useCallback(
    (value: number | ((prev: number) => number)) => {
      const next = typeof value === 'function' ? value(index) : value;
      if (onIndexChange) onIndexChange(next);
      else setInternalIndex(next);
    },
    [index, onIndexChange]
  );

  const active = resolved[index] ?? null;
  const inSchedule = !schedule || preview || isWithinSchedule(schedule);

  const resolvedAudioUrl =
    backgroundAudioUrl ??
    (playlist?.background_audio_asset_id
      ? assets.find((asset) => asset.id === playlist.background_audio_asset_id)?.media_url ?? null
      : null);
  const volume = audioVolume ?? playlist?.audio_volume ?? 40;
  const loop = audioLoop ?? playlist?.audio_loop ?? true;
  const duck = audioDuckDuringVideo ?? playlist?.audio_duck_during_video ?? true;
  const isVideoSlide = active?.asset_type === 'video';
  const effectiveVolume = duck && isVideoSlide ? Math.round(volume * 0.2) : volume;
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [shuffleOrder, setShuffleOrder] = useState<number[]>([]);
  const [shuffleStep, setShuffleStep] = useState(0);

  const rotationMode: PlaylistRotationMode = playlist?.rotation_mode ?? 'sequential';

  useEffect(() => {
    if (rotationMode !== 'shuffle' || !resolved.length) return;
    const order = shufflePlaylistOrder(resolved.length);
    setShuffleOrder(order);
    setShuffleStep(0);
    if (!onIndexChange) setIndex(order[0] ?? 0);
  }, [rotationMode, playlist?.id, resolved.length, onIndexChange, setIndex]);

  const advance = useCallback(() => {
    if (!resolved.length) return;
    if (rotationMode === 'weighted') {
      setIndex((current) => {
        const weights = resolved.map((slide) => getPlaylistItemWeight(slide.item, sponsors));
        return pickWeightedPlaylistIndex(resolved.length, weights, current);
      });
      return;
    }
    if (rotationMode === 'shuffle' && shuffleOrder.length === resolved.length) {
      const nextStep = (shuffleStep + 1) % resolved.length;
      if (nextStep === 0) {
        const order = shufflePlaylistOrder(resolved.length);
        setShuffleOrder(order);
        setShuffleStep(0);
        setIndex(order[0] ?? 0);
      } else {
        setShuffleStep(nextStep);
        setIndex(shuffleOrder[nextStep] ?? 0);
      }
      return;
    }
    setIndex((value) => (value + 1) % resolved.length);
  }, [resolved, rotationMode, shuffleOrder, shuffleStep, sponsors, setIndex]);

  useEffect(() => {
    if (index >= resolved.length) setIndex(0);
  }, [index, resolved.length, setIndex]);

  useEffect(() => {
    if (!audioRef) return;
    audioRef.volume = Math.min(1, Math.max(0, effectiveVolume / 100));
    if (autoPlay) void audioRef.play().catch(() => undefined);
  }, [audioRef, effectiveVolume, autoPlay, resolvedAudioUrl]);

  useEffect(() => {
    if (!autoPlay || !active || !inSchedule) return;
    const durationMs = (active.item.duration_sec || 10) * 1000;
    if (active.asset_type === 'video') return;
    if (active.asset_type === 'exercise_animation') {
      const timer = window.setTimeout(advance, Math.max(durationMs, 30_000));
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(advance, durationMs);
    return () => window.clearTimeout(timer);
  }, [active, advance, autoPlay, inSchedule]);

  const frameClass = fullscreen
    ? 'h-full w-full'
    : orientation === 'portrait'
      ? 'aspect-[9/16] max-h-full w-auto max-w-full'
      : 'aspect-video w-full max-w-full';

  if (!inSchedule) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl border border-cyan-400/25 bg-[#060a12] shadow-[0_8px_40px_rgba(0,0,0,0.5)]',
          frameClass,
          className
        )}
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8">
          {schedule?.standby_mode === 'logo' && clubLogoUrl ? (
            <Image src={clubLogoUrl} alt={clubName} width={120} height={120} className="opacity-80" />
          ) : null}
          <p className="text-sm text-cyan-300/50">Fuera de horario activo</p>
        </div>
      </div>
    );
  }

  if (!resolved.length) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-cyan-400/25 bg-[#060a12]/80 p-8 text-sm text-cyan-300/60',
          frameClass,
          className
        )}
      >
        Añade contenido a la playlist para previsualizar
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {resolvedAudioUrl ? (
        <audio
          key={resolvedAudioUrl}
          ref={setAudioRef}
          src={resolvedAudioUrl}
          autoPlay
          loop={loop}
          preload="auto"
          className="hidden"
        />
      ) : null}
      <div
        className={cn(
          'relative mx-auto overflow-hidden bg-black',
          fullscreen
            ? 'h-full w-full rounded-none border-0'
            : 'rounded-xl border border-cyan-400/30 shadow-[0_8px_40px_rgba(34,211,238,0.12)]',
          frameClass
        )}
      >
        <div className="relative h-full w-full">
        {active ? (
          <div
            key={active.item.id}
            className={cn('absolute inset-0', transitionClass(active.item.transition))}
          >
            <SlideContent
              slide={active}
              clubName={clubName}
              clubLogoUrl={clubLogoUrl}
              onEnded={advance}
            />
          </div>
        ) : null}
        </div>
        {preview ? (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
            <p className="truncate text-sm font-medium text-white">{active?.title}</p>
            <p className="text-xs text-cyan-300/70">
              {index + 1} / {resolved.length}
            </p>
          </div>
        ) : null}
      </div>
      {preview && resolved.length > 1 ? (
        <div className="mt-3 flex justify-center gap-2">
          {resolved.map((slide, i) => (
            <button
              key={slide.item.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-8 bg-cyan-400' : 'w-3 bg-cyan-400/25'
              )}
              aria-label={`Ir a ${slide.title}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
