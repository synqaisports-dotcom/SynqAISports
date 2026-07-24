'use client';

import { SynqSelect } from '@/components/portal/SynqSelect';
import { Input } from '@/components/ui/input';
import {
  defaultScheduleDayparts,
  formatScheduleHours,
  type ScheduleDaypart,
  type SignagePlaylist,
  type SignageSchedule,
} from '@/lib/signage';
import { cn } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

const DAYPART_COLORS = ['bg-cyan-400/70', 'bg-violet-400/70', 'bg-amber-400/70', 'bg-emerald-400/70'];

type Props = {
  schedule: SignageSchedule | null;
  dayparts: ScheduleDaypart[];
  onChange: (dayparts: ScheduleDaypart[]) => void;
  playlists: SignagePlaylist[];
  activeFromHour: number;
  activeToHour: number;
};

export function ScheduleDaypartsEditor({
  schedule,
  dayparts,
  onChange,
  playlists,
  activeFromHour,
  activeToHour,
}: Props) {
  const envelope = {
    active_from_hour: activeFromHour,
    active_to_hour: activeToHour,
  };
  const visible = dayparts.length ? dayparts : defaultScheduleDayparts(envelope);
  const span = Math.max(1, activeToHour - activeFromHour);

  function updatePart(id: string, patch: Partial<ScheduleDaypart>) {
    onChange(visible.map((part) => (part.id === id ? { ...part, ...patch } : part)));
  }

  function addPart() {
    const last = visible[visible.length - 1];
    const from = last ? last.to_hour : activeFromHour;
    if (from >= activeToHour) return;
    onChange([
      ...visible,
      {
        id: `daypart-${Date.now()}`,
        label: `Franja ${visible.length + 1}`,
        from_hour: from,
        to_hour: Math.min(activeToHour, from + 2),
      },
    ]);
  }

  function removePart(id: string) {
    if (visible.length <= 1) return;
    onChange(visible.filter((part) => part.id !== id));
  }

  function resetDefaults() {
    onChange(defaultScheduleDayparts(envelope));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            {schedule ? formatScheduleHours(schedule) : `${activeFromHour}:00 – ${activeToHour}:00`} · franjas horarias
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetDefaults}
            className="text-xs text-cyan-300/80 hover:text-cyan-200"
          >
            Restaurar mañana/tarde/noche
          </button>
          <button
            type="button"
            onClick={addPart}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Añadir franja
          </button>
        </div>
      </div>

      <div className="relative h-10 overflow-hidden rounded-lg border border-primary/15 bg-background/40">
        {visible.map((part, index) => {
          const left = ((part.from_hour - activeFromHour) / span) * 100;
          const width = ((part.to_hour - part.from_hour) / span) * 100;
          return (
            <div
              key={part.id}
              className={cn(
                'absolute inset-y-0 flex items-center justify-center overflow-hidden border-r border-black/20 px-1 text-[10px] font-medium text-black/80',
                DAYPART_COLORS[index % DAYPART_COLORS.length]
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${part.label} (${part.from_hour}:00–${part.to_hour}:00)`}
            >
              <span className="truncate">{part.label}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {visible.map((part, index) => (
          <div
            key={part.id}
            className="grid gap-3 rounded-lg border border-primary/10 bg-background/30 p-3 sm:grid-cols-[1fr_88px_88px_1fr_auto]"
          >
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Nombre</label>
              <Input
                value={part.label}
                onChange={(e) => updatePart(part.id, { label: e.target.value })}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Desde (h)</label>
              <Input
                type="number"
                min={activeFromHour}
                max={activeToHour - 1}
                value={part.from_hour}
                onChange={(e) => updatePart(part.id, { from_hour: Number(e.target.value) })}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Hasta (h)</label>
              <Input
                type="number"
                min={part.from_hour + 1}
                max={activeToHour}
                value={part.to_hour}
                onChange={(e) => updatePart(part.id, { to_hour: Number(e.target.value) })}
                className="mt-1 h-9"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Playlist (opcional)
              </label>
              <SynqSelect
                value={part.playlist_id ?? ''}
                onChange={(value) => updatePart(part.id, { playlist_id: value || null })}
                options={[
                  { value: '', label: 'Playlist de la pantalla' },
                  ...playlists.map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removePart(part.id)}
                disabled={visible.length <= 1}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                aria-label="Eliminar franja"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
