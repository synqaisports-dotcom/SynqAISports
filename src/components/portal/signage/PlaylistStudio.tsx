'use client';

import { useActionState, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updatePlaylist, updateSchedule, type SignageActionState } from '@/app/actions/signage';
import { ScheduleDaypartsEditor } from '@/components/portal/signage/ScheduleDaypartsEditor';
import { SignagePlaylistPlayer } from '@/components/portal/signage/SignagePlaylistPlayer';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  buildStudioContentOptions,
  formatPlaylistDuration,
  playlistTotalDuration,
  resolveStudioItemLabel,
  studioOptionToPlaylistItem,
  TIMELINE_TYPE_COLORS,
  type StudioContentOption,
} from '@/lib/playlist-studio';
import {
  DAY_LABELS,
  defaultScheduleDayparts,
  formatDaysMask,
  formatScheduleHours,
  isDayActive,
  PLAYLIST_ROTATION_MODES,
  PLAYLIST_ROTATION_MODE_LABELS,
  toggleDayMask,
  type PlaylistItem,
  type SignageAsset,
  type SignageExerciseOption,
  type SignagePlaylist,
  type SignageSchedule,
  type SignageSponsor,
  type ScheduleDaypart,
  SIGNAGE_TRANSITION_LABELS,
  SIGNAGE_TRANSITIONS,
  type SignageTransition,
  type SponsorWallEntrance,
} from '@/lib/signage';
import {
  SPONSOR_WALL_ENTRANCE_LABELS,
  SPONSOR_WALL_ENTRANCES,
} from '@/lib/sponsor-wall';
import { cn } from '@/lib/utils';
import { Film, GripVertical, ImageIcon, LayoutGrid, Megaphone, Music2, Plus, Sparkles, Trash2 } from 'lucide-react';

const initial: SignageActionState = { ok: false };

type Props = {
  playlist: SignagePlaylist;
  playlists: SignagePlaylist[];
  schedule: SignageSchedule | null;
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  exercises: SignageExerciseOption[];
  clubName: string;
  clubLogoUrl: string | null;
  previewOrientation?: 'landscape' | 'portrait';
  exerciseDrawings: { id: string; title: string; drawing_json: unknown }[];
};

function LibraryThumb({ option }: { option: StudioContentOption }) {
  if (option.thumb_url) {
    return <img src={option.thumb_url} alt="" className="size-full object-cover" />;
  }
  const Icon =
    option.type === 'video'
      ? Film
      : option.type === 'sponsor' || option.type === 'sponsor_slide' || option.type === 'sponsor_wall'
        ? option.type === 'sponsor_wall'
          ? LayoutGrid
          : Megaphone
        : option.type === 'exercise_animation'
          ? Sparkles
          : ImageIcon;
  return (
    <div className="flex size-full items-center justify-center bg-primary/5 text-primary/70">
      <Icon className="size-4" />
    </div>
  );
}

function LibraryCard({
  option,
  onAdd,
}: {
  option: StudioContentOption;
  onAdd: (option: StudioContentOption) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `lib-${option.key}`,
    data: { source: 'library', option },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-1 rounded-lg border border-primary/10 bg-background/40 p-1.5 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5',
        isDragging && 'opacity-40'
      )}
    >
      <button
        type="button"
        className="flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/50 active:cursor-grabbing"
        {...listeners}
        {...attributes}
        aria-label="Arrastrar"
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onAdd(option)}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <div className="size-10 shrink-0 overflow-hidden rounded-md border border-primary/15">
          <LibraryThumb option={option} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{option.label}</p>
          <p className="text-[11px] text-muted-foreground">{option.duration}s · clic para añadir</p>
        </div>
        <Plus className="size-4 shrink-0 text-cyan-400/70 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </div>
  );
}

function SequenceRow({
  item,
  index,
  options,
  sponsors,
  selected,
  onSelect,
  onDurationChange,
  onTransitionChange,
  onWallEntranceChange,
  onRemove,
}: {
  item: PlaylistItem;
  index: number;
  options: StudioContentOption[];
  sponsors: SignageSponsor[];
  selected: boolean;
  onSelect: () => void;
  onDurationChange: (value: number) => void;
  onTransitionChange: (value: SignageTransition) => void;
  onWallEntranceChange: (value: SponsorWallEntrance) => void;
  onRemove: () => void;
}) {
  const meta = resolveStudioItemLabel(item, options, sponsors);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { source: 'sequence', item },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 sm:flex-nowrap sm:gap-3',
        selected ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-primary/10 bg-background/40',
        isDragging && 'z-10 opacity-80 shadow-lg'
      )}
      onClick={onSelect}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground/50 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        aria-label="Reordenar"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="size-9 shrink-0 overflow-hidden rounded-md border border-primary/15">
        {meta.thumb_url ? (
          <img src={meta.thumb_url} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/5 text-[10px] text-muted-foreground">
            {index + 1}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{meta.label}</p>
        <p className="text-xs text-muted-foreground">{meta.typeLabel}</p>
      </div>
      <Input
        type="number"
        min={3}
        max={300}
        value={item.duration_sec}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="w-16 text-center"
      />
      <div className="w-[118px]" onClick={(e) => e.stopPropagation()}>
        <SynqSelect
          value={item.transition ?? 'fade'}
          onChange={(value) => onTransitionChange(value as SignageTransition)}
          options={SIGNAGE_TRANSITIONS.map((t) => ({ value: t, label: SIGNAGE_TRANSITION_LABELS[t] }))}
        />
      </div>
      {item.type === 'sponsor_wall' ? (
        <div className="w-[140px]" onClick={(e) => e.stopPropagation()}>
          <SynqSelect
            value={item.wall_entrance ?? 'stagger-fade'}
            onChange={(value) => onWallEntranceChange(value as SponsorWallEntrance)}
            options={SPONSOR_WALL_ENTRANCES.map((e) => ({
              value: e,
              label: SPONSOR_WALL_ENTRANCE_LABELS[e],
            }))}
          />
        </div>
      ) : null}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function TimelineStrip({
  items,
  options,
  sponsors,
  selectedId,
  currentIndex,
  onSelect,
  onDurationChange,
}: {
  items: PlaylistItem[];
  options: StudioContentOption[];
  sponsors: SignageSponsor[];
  selectedId: string | null;
  currentIndex: number;
  onSelect: (id: string, index: number) => void;
  onDurationChange: (id: string, duration: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const total = playlistTotalDuration(items);

  function startResize(itemId: string, startDuration: number, startX: number) {
    const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 1;
    const onMove = (ev: PointerEvent) => {
      const deltaPx = ev.clientX - startX;
      const deltaSec = Math.round((deltaPx / trackWidth) * Math.max(total, 1));
      onDurationChange(itemId, Math.min(300, Math.max(3, startDuration + deltaSec)));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }
  if (!items.length) {
    return (
      <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-primary/15 text-xs text-muted-foreground">
        Arrastra contenido aquí para ver la línea de tiempo
      </div>
    );
  }

  const playheadLeft = (() => {
    if (!items[currentIndex]) return 0;
    const before = items.slice(0, currentIndex).reduce((sum, row) => sum + Math.max(row.duration_sec, 1), 0);
    const current = Math.max(items[currentIndex].duration_sec, 1);
    return ((before + current / 2) / Math.max(total, 1)) * 100;
  })();

  return (
    <div className="space-y-2">
      <div ref={trackRef} className="relative h-12 overflow-hidden rounded-lg border border-primary/15 bg-background/40">
        <div className="absolute inset-0 flex">
          {items.map((item, index) => {
            const width = (Math.max(item.duration_sec, 1) / Math.max(total, 1)) * 100;
            const meta = resolveStudioItemLabel(item, options, sponsors);
            return (
              <div
                key={item.id}
                className={cn(
                  'group relative h-full min-w-[12px] border-r border-black/20',
                  TIMELINE_TYPE_COLORS[item.type],
                  selectedId === item.id ? 'ring-2 ring-inset ring-white/70' : 'opacity-90'
                )}
                style={{ width: `${width}%` }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id, index)}
                  className="flex h-full w-full items-center px-1 text-[10px] font-medium text-black/80"
                  title={`${meta.label} · ${item.duration_sec}s`}
                >
                  <span className="block truncate">{meta.label}</span>
                </button>
                <button
                  type="button"
                  aria-label="Ajustar duración"
                  className="absolute inset-y-0 right-0 w-2 cursor-ew-resize bg-white/0 transition-colors hover:bg-white/35"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startResize(item.id, item.duration_sec, e.clientX);
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ left: `${playheadLeft}%` }}
          aria-hidden
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Duración total: <strong className="text-foreground">{formatPlaylistDuration(total)}</strong>
        <span className="ml-2 text-muted-foreground/80">· arrastra el borde derecho de un bloque para ajustar</span>
      </p>
    </div>
  );
}

export function PlaylistStudio({
  playlist,
  playlists,
  schedule,
  sponsors,
  assets,
  exercises,
  clubName,
  clubLogoUrl,
  previewOrientation = 'landscape',
  exerciseDrawings,
}: Props) {
  const contentOptions = useMemo(
    () => buildStudioContentOptions(sponsors, assets, exercises),
    [sponsors, assets, exercises]
  );
  const audioAssets = useMemo(
    () => assets.filter((asset) => asset.active && asset.asset_type === 'audio'),
    [assets]
  );

  const [items, setItems] = useState<PlaylistItem[]>(playlist.items);
  const [selectedId, setSelectedId] = useState<string | null>(playlist.items[0]?.id ?? null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [activeDrag, setActiveDrag] = useState<StudioContentOption | null>(null);
  const [defaultTransition, setDefaultTransition] = useState<SignageTransition>('fade');
  const [rotationMode, setRotationMode] = useState(playlist.rotation_mode);
  const [backgroundAudioAssetId, setBackgroundAudioAssetId] = useState(playlist.background_audio_asset_id ?? '');
  const [audioVolume, setAudioVolume] = useState(playlist.audio_volume);
  const [audioLoop, setAudioLoop] = useState(playlist.audio_loop);
  const [audioDuck, setAudioDuck] = useState(playlist.audio_duck_during_video);
  const [daysMask, setDaysMask] = useState(schedule?.days_mask ?? 127);
  const [activeFromHour, setActiveFromHour] = useState(schedule?.active_from_hour ?? 10);
  const [activeToHour, setActiveToHour] = useState(schedule?.active_to_hour ?? 22);
  const [dayparts, setDayparts] = useState<ScheduleDaypart[]>(
    schedule?.dayparts.length
      ? schedule.dayparts
      : defaultScheduleDayparts({
          active_from_hour: schedule?.active_from_hour ?? 10,
          active_to_hour: schedule?.active_to_hour ?? 22,
        })
  );

  const [playlistState, playlistAction, savingPlaylist] = useActionState(
    updatePlaylist.bind(null, playlist.id),
    initial
  );
  const [scheduleState, scheduleAction, savingSchedule] = useActionState(
    updateSchedule.bind(null, schedule?.id ?? null),
    initial
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: 'sequence-drop' });

  const previewPlaylist = useMemo(
    () => ({
      ...playlist,
      items,
      rotation_mode: rotationMode,
      background_audio_asset_id: backgroundAudioAssetId || null,
      audio_volume: audioVolume,
      audio_loop: audioLoop,
      audio_duck_during_video: audioDuck,
    }),
    [playlist, items, rotationMode, backgroundAudioAssetId, audioVolume, audioLoop, audioDuck]
  );

  const backgroundAudioUrl =
    audioAssets.find((asset) => asset.id === backgroundAudioAssetId)?.media_url ?? null;

  function addOption(option: StudioContentOption) {
    const next = studioOptionToPlaylistItem(option, defaultTransition, sponsors);
    setItems((prev) => {
      setPreviewIndex(prev.length);
      return [...prev, next];
    });
    setSelectedId(next.id);
  }

  function handleDragStart(event: DragStartEvent) {
    const option = event.active.data.current?.option as StudioContentOption | undefined;
    if (option) setActiveDrag(option);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const fromLibrary = String(active.id).startsWith('lib-');
    if (fromLibrary) {
      const option = active.data.current?.option as StudioContentOption | undefined;
      if (!option) return;
      if (over.id === 'sequence-drop' || String(over.id).startsWith('item-') || items.some((i) => i.id === over.id)) {
        addOption(option);
      }
      return;
    }

    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id);
        const newIndex = prev.findIndex((item) => item.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function selectItem(id: string, index: number) {
    setSelectedId(id);
    setPreviewIndex(index);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px]">
        <div className="portal-section-surface rounded-xl p-4">
          <h2 className="font-medium">Biblioteca</h2>
          <p className="mt-1 text-xs text-muted-foreground">Arrastra al centro o pulsa para añadir</p>
          <div className="mt-3 max-h-[min(70vh,640px)] space-y-2 overflow-y-auto pr-1">
            {contentOptions.map((option) => (
              <div key={option.key} className="group">
                <LibraryCard option={option} onAdd={addOption} />
              </div>
            ))}
            {contentOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay contenido activo. Sube material en Contenido.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="portal-section-surface rounded-xl p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">Playlist — {playlist.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} ítems · {formatPlaylistDuration(playlistTotalDuration(items))}
                </p>
              </div>
              <Badge variant="outline">{PLAYLIST_ROTATION_MODE_LABELS[rotationMode]}</Badge>
            </div>

            <TimelineStrip
              items={items}
              options={contentOptions}
              sponsors={sponsors}
              selectedId={selectedId}
              currentIndex={previewIndex}
              onSelect={selectItem}
              onDurationChange={(id, duration) =>
                setItems((prev) => prev.map((row) => (row.id === id ? { ...row, duration_sec: duration } : row)))
              }
            />

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="min-w-[180px] flex-1">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Transición por defecto (nuevos ítems)
                </label>
                <SynqSelect
                  value={defaultTransition}
                  onChange={(value) => setDefaultTransition(value as SignageTransition)}
                  options={SIGNAGE_TRANSITIONS.map((t) => ({ value: t, label: SIGNAGE_TRANSITION_LABELS[t] }))}
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setItems((prev) => prev.map((row) => ({ ...row, transition: defaultTransition })))
                }
              >
                Aplicar a todos
              </Button>
            </div>

            <div
              ref={setDropRef}
              className={cn(
                'mt-4 space-y-2 rounded-lg border border-dashed p-2 transition-colors',
                isOver ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-primary/10'
              )}
            >
              <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {items.map((item, index) => (
                  <SequenceRow
                    key={item.id}
                    item={item}
                    index={index}
                    options={contentOptions}
                    sponsors={sponsors}
                    selected={selectedId === item.id}
                    onSelect={() => selectItem(item.id, index)}
                    onDurationChange={(value) =>
                      setItems((prev) => prev.map((row, i) => (i === index ? { ...row, duration_sec: value } : row)))
                    }
                    onTransitionChange={(value) =>
                      setItems((prev) => prev.map((row, i) => (i === index ? { ...row, transition: value } : row)))
                    }
                    onWallEntranceChange={(value) =>
                      setItems((prev) => prev.map((row, i) => (i === index ? { ...row, wall_entrance: value } : row)))
                    }
                    onRemove={() =>
                      setItems((prev) => {
                        const next = prev.filter((row) => row.id !== item.id);
                        if (selectedId === item.id) {
                          setSelectedId(next[0]?.id ?? null);
                          setPreviewIndex(0);
                        }
                        return next;
                      })
                    }
                  />
                ))}
              </SortableContext>
              {!items.length ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Arrastra contenido desde la biblioteca
                </p>
              ) : null}
            </div>

            <form action={playlistAction} className="mt-4 space-y-4 border-t border-primary/10 pt-4">
              <input type="hidden" name="items_json" value={JSON.stringify(items)} />
              <input type="hidden" name="rotation_mode" value={rotationMode} />
              <input type="hidden" name="is_default" value={playlist.is_default ? 'true' : 'false'} />
              <input type="hidden" name="background_audio_asset_id" value={backgroundAudioAssetId} />
              <input type="hidden" name="audio_volume" value={String(audioVolume)} />
              <input type="hidden" name="audio_loop" value={audioLoop ? 'true' : 'false'} />
              <input type="hidden" name="audio_duck_during_video" value={audioDuck ? 'true' : 'false'} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Modo de rotación
                  </label>
                  <SynqSelect
                    value={rotationMode}
                    onChange={(value) => setRotationMode(value as typeof rotationMode)}
                    options={PLAYLIST_ROTATION_MODES.map((mode) => ({
                      value: mode,
                      label: PLAYLIST_ROTATION_MODE_LABELS[mode],
                    }))}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ponderada usa el peso oro (3), plata (2) y bronce (1) en patrocinadores.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nombre de la playlist
                  </label>
                  <Input name="name" defaultValue={playlist.name} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Música de fondo
                  </label>
                  <SynqSelect
                    value={backgroundAudioAssetId}
                    onChange={setBackgroundAudioAssetId}
                    options={[
                      { value: '', label: 'Sin música' },
                      ...audioAssets.map((asset) => ({ value: asset.id, label: asset.title })),
                    ]}
                  />
                </div>
              </div>

              {backgroundAudioAssetId ? (
                <div className="grid gap-3 rounded-lg border border-primary/10 bg-background/30 p-3 sm:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Music2 className="size-4 text-cyan-300" />
                    Volumen {audioVolume}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="sm:col-span-2"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={audioLoop} onChange={(e) => setAudioLoop(e.target.checked)} />
                    Repetir en bucle
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" checked={audioDuck} onChange={(e) => setAudioDuck(e.target.checked)} />
                    Bajar volumen durante vídeos
                  </label>
                </div>
              ) : null}

              <Button type="submit" disabled={savingPlaylist} className="w-full sm:w-auto">
                {savingPlaylist ? 'Guardando playlist…' : 'Guardar playlist'}
              </Button>
              {playlistState.ok ? <span className="text-sm text-emerald-400">Playlist guardada</span> : null}
              {!audioAssets.length ? (
                <p className="text-xs text-muted-foreground">
                  Sube pistas MP3 en <strong>Contenido</strong> (tipo Audio) para usar música de fondo.
                </p>
              ) : null}
            </form>
          </div>

          <div className="portal-section-surface rounded-xl p-4">
            <h2 className="font-medium">Horario y franjas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {schedule ? formatScheduleHours(schedule) : `${activeFromHour}:00 – ${activeToHour}:00`} ·{' '}
              {formatDaysMask(daysMask)}
            </p>
            <form action={scheduleAction} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desde (h)</label>
                  <Input
                    name="active_from_hour"
                    type="number"
                    min={0}
                    max={23}
                    value={activeFromHour}
                    onChange={(e) => setActiveFromHour(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hasta (h)</label>
                  <Input
                    name="active_to_hour"
                    type="number"
                    min={1}
                    max={24}
                    value={activeToHour}
                    onChange={(e) => setActiveToHour(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              <input type="hidden" name="days_mask" value={daysMask} />
              <input type="hidden" name="standby_mode" value={schedule?.standby_mode ?? 'logo'} />
              <input type="hidden" name="dayparts_json" value={JSON.stringify(dayparts)} />
              <div className="flex flex-wrap gap-2">
                {DAY_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDaysMask((mask) => toggleDayMask(mask, index))}
                    className={
                      isDayActive(daysMask, index)
                        ? 'rounded-full border border-cyan-400/50 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100'
                        : 'rounded-full border border-primary/15 px-3 py-1 text-sm text-muted-foreground'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ScheduleDaypartsEditor
                schedule={schedule}
                dayparts={dayparts}
                onChange={setDayparts}
                playlists={playlists}
                activeFromHour={activeFromHour}
                activeToHour={activeToHour}
              />
              <Button type="submit" disabled={savingSchedule} variant="outline">
                {savingSchedule ? 'Guardando…' : 'Guardar horario'}
              </Button>
              {scheduleState.ok ? <span className="ml-2 text-sm text-emerald-400">Horario guardado</span> : null}
            </form>
          </div>
        </div>

        <div className="portal-section-surface rounded-xl p-4 xl:sticky xl:top-4 xl:self-start">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">Previsualización</h2>
            <Badge variant="outline">{previewOrientation === 'landscape' ? 'Horizontal' : 'Vertical'}</Badge>
          </div>
          <SignagePlaylistPlayer
            orientation={previewOrientation}
            playlist={previewPlaylist}
            schedule={schedule}
            sponsors={sponsors}
            assets={assets}
            exercises={exerciseDrawings}
            clubName={clubName}
            clubLogoUrl={clubLogoUrl}
            preview
            currentIndex={previewIndex}
            onIndexChange={(index) => {
              setPreviewIndex(index);
              setSelectedId(items[index]?.id ?? null);
            }}
            backgroundAudioUrl={backgroundAudioUrl}
            audioVolume={audioVolume}
            audioLoop={audioLoop}
            audioDuckDuringVideo={audioDuck}
          />
        </div>
      </div>

      <DragOverlay>
        {activeDrag ? (
          <div className="flex w-56 items-center gap-2 rounded-lg border border-cyan-400/40 bg-background/95 p-2 shadow-xl">
            <div className="size-10 overflow-hidden rounded-md border border-primary/15">
              <LibraryThumb option={activeDrag} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{activeDrag.label}</p>
              <p className="text-xs text-muted-foreground">{activeDrag.duration}s</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
