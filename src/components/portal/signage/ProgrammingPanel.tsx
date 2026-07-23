'use client';

import { useActionState, useMemo, useState } from 'react';
import { updatePlaylist, updateSchedule, type SignageActionState } from '@/app/actions/signage';
import { SignagePlaylistPlayer } from '@/components/portal/signage/SignagePlaylistPlayer';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DAY_LABELS,
  formatDaysMask,
  formatScheduleHours,
  isDayActive,
  PLAYLIST_ITEM_TYPE_LABELS,
  PLAYLIST_ROTATION_MODES,
  toggleDayMask,
  type PlaylistItem,
  type SignageAsset,
  type SignageExerciseOption,
  type SignagePlaylist,
  type SignageSchedule,
  type SignageSponsor,
} from '@/lib/signage';
import { GripVertical, Trash2 } from 'lucide-react';

const initial: SignageActionState = { ok: false };

type ContentOption = { id: string; label: string; type: PlaylistItem['type']; duration: number };

type Props = {
  playlist: SignagePlaylist;
  schedule: SignageSchedule | null;
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  exercises: SignageExerciseOption[];
  clubName: string;
  clubLogoUrl: string | null;
  previewOrientation?: 'landscape' | 'portrait';
  exerciseDrawings: { id: string; title: string; drawing_json: unknown }[];
};

export function ProgrammingPanel({
  playlist,
  schedule,
  sponsors,
  assets,
  exercises,
  clubName,
  clubLogoUrl,
  previewOrientation = 'landscape',
  exerciseDrawings,
}: Props) {
  const [items, setItems] = useState<PlaylistItem[]>(playlist.items);
  const [addValue, setAddValue] = useState('');
  const [daysMask, setDaysMask] = useState(schedule?.days_mask ?? 127);
  const [playlistState, playlistAction, savingPlaylist] = useActionState(
    updatePlaylist.bind(null, playlist.id),
    initial
  );
  const [scheduleState, scheduleAction, savingSchedule] = useActionState(
    updateSchedule.bind(null, schedule?.id ?? null),
    initial
  );

  const contentOptions = useMemo<ContentOption[]>(() => {
    const options: ContentOption[] = [];
    for (const sponsor of sponsors.filter((s) => s.active)) {
      options.push({
        id: sponsor.id,
        label: sponsor.name,
        type: 'sponsor',
        duration: sponsor.default_duration_sec,
      });
    }
    for (const asset of assets.filter((a) => a.active)) {
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
        id: asset.exercise_id ?? asset.id,
        label: asset.title,
        type,
        duration: asset.duration_sec || 10,
      });
    }
    for (const exercise of exercises) {
      if (!options.some((o) => o.id === exercise.id && o.type === 'exercise_animation')) {
        options.push({
          id: exercise.id,
          label: exercise.title,
          type: 'exercise_animation',
          duration: 0,
        });
      }
    }
    return options;
  }, [sponsors, assets, exercises]);

  function addItem(option: ContentOption) {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        type: option.type,
        ref_id: option.id,
        duration_sec: option.duration,
      },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const previewPlaylist = { ...playlist, items };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="portal-section-surface rounded-xl p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-medium">Playlist — {playlist.name}</h2>
              <p className="text-sm text-muted-foreground">Orden de reproducción en las pantallas</p>
            </div>
            <Badge variant="outline">{items.length} ítems</Badge>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => {
              const option = contentOptions.find((o) => o.id === item.ref_id && o.type === item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-primary/10 bg-background/40 px-3 py-2"
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{option?.label ?? item.ref_id}</p>
                    <p className="text-xs text-muted-foreground">{PLAYLIST_ITEM_TYPE_LABELS[item.type]}</p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={item.duration_sec}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setItems((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, duration_sec: value } : row))
                      );
                    }}
                    className="w-16 text-center"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <SynqSelect
              value={addValue}
              onChange={(value) => {
                setAddValue('');
                const [type, id] = value.split(':');
                const option = contentOptions.find((o) => o.type === type && o.id === id);
                if (option) addItem(option);
              }}
              placeholder="Añadir contenido…"
              options={contentOptions.map((o) => ({
                value: `${o.type}:${o.id}`,
                label: `${o.label} (${PLAYLIST_ITEM_TYPE_LABELS[o.type]})`,
              }))}
            />
          </div>

          <form action={playlistAction} className="mt-4 space-y-3 border-t border-primary/10 pt-4">
            <input type="hidden" name="name" value={playlist.name} />
            <input type="hidden" name="items_json" value={JSON.stringify(items)} />
            <input type="hidden" name="rotation_mode" value={playlist.rotation_mode} />
            <input type="hidden" name="is_default" value={playlist.is_default ? 'true' : 'false'} />
            <Button type="submit" disabled={savingPlaylist} className="w-full sm:w-auto">
              {savingPlaylist ? 'Guardando playlist…' : 'Guardar playlist'}
            </Button>
            {playlistState.ok ? <span className="text-sm text-emerald-400">Playlist guardada</span> : null}
          </form>
        </div>

        <div className="portal-section-surface rounded-xl p-4">
          <h2 className="font-medium">Horario activo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {schedule ? formatScheduleHours(schedule) : '10:00 – 22:00'} · {formatDaysMask(daysMask)}
          </p>
          <form action={scheduleAction} className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Desde (h)</label>
                <Input name="active_from_hour" type="number" min={0} max={23} defaultValue={schedule?.active_from_hour ?? 10} />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hasta (h)</label>
                <Input name="active_to_hour" type="number" min={1} max={24} defaultValue={schedule?.active_to_hour ?? 22} />
              </div>
            </div>
            <input type="hidden" name="days_mask" value={daysMask} />
            <input type="hidden" name="standby_mode" value={schedule?.standby_mode ?? 'logo'} />
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
            <Button type="submit" disabled={savingSchedule} variant="outline">
              {savingSchedule ? 'Guardando…' : 'Guardar horario'}
            </Button>
            {scheduleState.ok ? <span className="ml-2 text-sm text-emerald-400">Horario guardado</span> : null}
          </form>
        </div>
      </div>

      <div className="portal-section-surface rounded-xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Previsualización</h2>
          <div className="flex gap-1">
            {(['landscape', 'portrait'] as const).map((o) => (
              <Badge key={o} variant={previewOrientation === o ? 'default' : 'outline'}>
                {o === 'landscape' ? 'H' : 'V'}
              </Badge>
            ))}
          </div>
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
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Modo {PLAYLIST_ROTATION_MODES.includes(playlist.rotation_mode) ? playlist.rotation_mode : 'sequential'}.
          Fuera del horario activo las pantallas muestran standby.
        </p>
      </div>
    </div>
  );
}
