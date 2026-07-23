'use client';

import { useActionState, useState } from 'react';
import { createSignageAsset, uploadSignageMedia, type SignageActionState } from '@/app/actions/signage';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  SIGNAGE_ASSET_TYPE_LABELS,
  SIGNAGE_ASSET_TYPES,
  SIGNAGE_CONTENT_ORIENTATIONS,
  SIGNAGE_ORIENTATION_LABELS,
  type SignageAsset,
  type SignageAssetType,
  type SignageContentOrientation,
  type SignageExerciseOption,
  type SignageSponsor,
} from '@/lib/signage';
import { Film, ImageIcon, Plus } from 'lucide-react';

const initial: SignageActionState = { ok: false };

type Props = {
  assets: SignageAsset[];
  sponsors: SignageSponsor[];
  exercises: SignageExerciseOption[];
};

export function ContentPanel({ assets, sponsors, exercises }: Props) {
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState<SignageAssetType>('image');
  const [sponsorId, setSponsorId] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [orientation, setOrientation] = useState<SignageContentOrientation>('both');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [state, action, pending] = useActionState(createSignageAsset, initial);

  async function handleUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set('file', file);
    const result = await uploadSignageMedia(fd);
    if (result.ok && result.url) setMediaUrl(result.url);
    setUploading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Vídeos, imágenes, slides de patrocinadores y animaciones de ejercicios.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setAssetType('image');
            setMediaUrl('');
            setSponsorId('');
            setExerciseId('');
            setOrientation('both');
            setOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          Subir contenido
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.id} className="portal-section-surface rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
                {asset.asset_type === 'video' ? (
                  <Film className="size-5 text-primary/80" />
                ) : (
                  <ImageIcon className="size-5 text-primary/80" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{asset.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline">{SIGNAGE_ASSET_TYPE_LABELS[asset.asset_type]}</Badge>
                  <Badge variant="secondary">{asset.duration_sec}s</Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>Nuevo contenido</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <form action={action} className="space-y-4">
              <input type="hidden" name="media_url" value={mediaUrl} />
              <input type="hidden" name="asset_type" value={assetType} />
              <input type="hidden" name="sponsor_id" value={sponsorId} />
              <input type="hidden" name="exercise_id" value={exerciseId} />
              <input type="hidden" name="orientation" value={orientation} />
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Título</label>
                <Input name="title" required className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tipo</label>
                <SynqSelect
                  value={assetType}
                  onChange={(value) => setAssetType(value as SignageAssetType)}
                  options={SIGNAGE_ASSET_TYPES.map((type) => ({
                    value: type,
                    label: SIGNAGE_ASSET_TYPE_LABELS[type],
                  }))}
                />
              </div>
              {(assetType === 'video' || assetType === 'image') && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Archivo</label>
                  <Input
                    type="file"
                    accept={assetType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
                    className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                  />
                </div>
              )}
              {assetType === 'sponsor_slide' && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patrocinador</label>
                  <SynqSelect
                    value={sponsorId}
                    onChange={setSponsorId}
                    options={sponsors.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              )}
              {assetType === 'exercise_animation' && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ejercicio</label>
                  <SynqSelect
                    value={exerciseId}
                    onChange={setExerciseId}
                    options={exercises.map((e) => ({ value: e.id, label: e.title }))}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duración (s)</label>
                <Input name="duration_sec" type="number" min={0} defaultValue={assetType === 'video' ? 0 : 10} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Orientación</label>
                <SynqSelect
                  value={orientation}
                  onChange={(value) => setOrientation(value as SignageContentOrientation)}
                  options={SIGNAGE_CONTENT_ORIENTATIONS.map((o) => ({
                    value: o,
                    label: o === 'both' ? 'Ambas' : SIGNAGE_ORIENTATION_LABELS[o],
                  }))}
                />
              </div>
              <Button type="submit" disabled={pending || uploading} className="w-full">
                {pending || uploading ? 'Guardando…' : 'Añadir a biblioteca'}
              </Button>
              {state.ok ? <p className="text-center text-sm text-emerald-400">Contenido creado</p> : null}
            </form>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
