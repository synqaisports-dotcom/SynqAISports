'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import { createPlaylist, deletePlaylist } from '@/app/actions/signage';
import { PlaylistStudio } from '@/components/portal/signage/PlaylistStudio';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
  SignageAsset,
  SignageExerciseOption,
  SignagePlaylist,
  SignageSchedule,
  SignageSponsor,
} from '@/lib/signage';
import { Plus, Trash2 } from 'lucide-react';

type Props = {
  playlists: SignagePlaylist[];
  selectedPlaylistId: string;
  schedule: SignageSchedule | null;
  sponsors: SignageSponsor[];
  assets: SignageAsset[];
  exercises: SignageExerciseOption[];
  clubName: string;
  clubLogoUrl: string | null;
  exerciseDrawings: { id: string; title: string; drawing_json: unknown }[];
};

export function ProgrammingHub({
  playlists,
  selectedPlaylistId,
  schedule,
  sponsors,
  assets,
  exercises,
  clubName,
  clubLogoUrl,
  exerciseDrawings,
}: Props) {
  const router = useRouter();
  const selected = playlists.find((p) => p.id === selectedPlaylistId) ?? playlists[0];
  const [newName, setNewName] = useState('');
  const [createState, createAction, creating] = useActionState(createPlaylist, { ok: false });

  if (!selected) return null;

  return (
    <div className="space-y-4">
      <div className="portal-section-surface flex flex-wrap items-end gap-3 rounded-xl p-4">
        <div className="min-w-[220px] flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Playlist activa
          </label>
          <SynqSelect
            value={selected.id}
            onChange={(id) => router.push(`/portal/signage/programacion?playlist=${id}`)}
            options={playlists.map((p) => ({
              value: p.id,
              label: p.is_default ? `${p.name} (por defecto)` : p.name,
            }))}
          />
        </div>
        <form action={createAction} className="flex flex-1 flex-wrap items-end gap-2">
          <div className="min-w-[180px] flex-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nueva playlist
            </label>
            <Input
              name="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Gym, Cafetería…"
              className="mt-1"
            />
          </div>
          <Button type="submit" size="sm" disabled={creating || !newName.trim()}>
            <Plus className="mr-1 size-4" />
            Crear
          </Button>
        </form>
        {!selected.is_default ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (!window.confirm(`¿Eliminar la playlist "${selected.name}"?`)) return;
              void deletePlaylist(selected.id).then(() => {
                router.push('/portal/signage/programacion');
                router.refresh();
              });
            }}
          >
            <Trash2 className="mr-1 size-4" />
            Eliminar
          </Button>
        ) : null}
      </div>

      {createState.ok ? (
        <p className="text-sm text-emerald-400">Playlist creada. Selecciónala arriba para editarla.</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {playlists.map((p) => (
          <Badge key={p.id} variant={p.id === selected.id ? 'default' : 'outline'}>
            {p.name} · {p.items.length} ítems
          </Badge>
        ))}
      </div>

      <PlaylistStudio
        key={selected.id}
        playlist={selected}
        playlists={playlists}
        schedule={schedule}
        sponsors={sponsors}
        assets={assets}
        exercises={exercises}
        clubName={clubName}
        clubLogoUrl={clubLogoUrl}
        exerciseDrawings={exerciseDrawings}
      />
    </div>
  );
}
