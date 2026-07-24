'use client';

import { useActionState, useState } from 'react';
import {
  createSignageAsset,
  deleteSignageAsset,
  toggleSignageAssetActive,
  updateSignageAsset,
  uploadSignageMedia,
  type SignageActionState,
} from '@/app/actions/signage';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { SignageItemActions } from '@/components/portal/signage/SignageItemActions';
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
import {
  SIGNAGE_IMAGE_EXTENSIONS,
  SIGNAGE_VIDEO_EXTENSIONS,
  signageUploadErrorMessage,
} from '@/lib/signage-media';
import { cn } from '@/lib/utils';
import { Film, ImageIcon, Plus } from 'lucide-react';

const initial: SignageActionState = { ok: false };

type Props = {
  assets: SignageAsset[];
  sponsors: SignageSponsor[];
  exercises: SignageExerciseOption[];
};

export function ContentPanel({ assets, sponsors, exercises }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SignageAsset | null>(null);
  const [assetType, setAssetType] = useState<SignageAssetType>('image');
  const [sponsorId, setSponsorId] = useState('');
  const [exerciseId, setExerciseId] = useState('');
  const [orientation, setOrientation] = useState<SignageContentOrientation>('both');
  const [mediaUrl, setMediaUrl] = useState('');
  const [active, setActive] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [createState, createAction, creating] = useActionState(createSignageAsset, initial);
  const [updateState, updateAction, updating] = useActionState(
    editing ? updateSignageAsset.bind(null, editing.id) : createSignageAsset,
    initial
  );

  function resetForm() {
    setEditing(null);
    setAssetType('image');
    setMediaUrl('');
    setSponsorId('');
    setExerciseId('');
    setOrientation('both');
    setActive(true);
  }

  const busy = creating || updating || uploading;
  const isEdit = Boolean(editing);

  function handleOpenCreate() {
    resetForm();
    setUploadError(null);
    setOpen(true);
  }

  function openEdit(asset: SignageAsset) {
    setEditing(asset);
    setAssetType(asset.asset_type);
    setMediaUrl(asset.media_url ?? '');
    setSponsorId(asset.sponsor_id ?? '');
    setExerciseId(asset.exercise_id ?? '');
    setOrientation(asset.orientation);
    setActive(asset.active);
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.set('file', file);
    const result = await uploadSignageMedia(fd);
    if (result.ok && result.url) {
      setMediaUrl(result.url);
    } else {
      setUploadError(signageUploadErrorMessage(result.message));
      setMediaUrl('');
    }
    setUploading(false);
  }

  const needsMedia = !isEdit && (assetType === 'image' || assetType === 'video');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Vídeos, imágenes, slides y animaciones. Edita, pausa o elimina desde cada tarjeta.
        </p>
        <Button type="button" size="sm" onClick={handleOpenCreate}>
          <Plus className="mr-1 size-4" />
          Subir contenido
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className={cn('portal-section-surface rounded-xl p-4', !asset.active && 'opacity-60')}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => openEdit(asset)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/5">
                  {asset.media_url && (asset.asset_type === 'image' || asset.asset_type === 'video') ? (
                    asset.asset_type === 'video' ? (
                      <Film className="size-5 text-primary/80" />
                    ) : (
                      <img src={asset.media_url} alt="" className="size-full object-cover" />
                    )
                  ) : asset.asset_type === 'video' ? (
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
                    {!asset.active ? <Badge variant="destructive">Pausado</Badge> : null}
                  </div>
                </div>
              </button>
              <SignageItemActions
                active={asset.active}
                onEdit={() => openEdit(asset)}
                onToggle={() => toggleSignageAssetActive(asset.id, !asset.active)}
                onDelete={() => deleteSignageAsset(asset.id)}
                pauseLabel="Pausar contenido"
                resumeLabel="Reactivar contenido"
                editLabel="Editar contenido"
              />
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Aún no hay contenido en la biblioteca.</p>
      ) : null}

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>{isEdit ? 'Editar contenido' : 'Nuevo contenido'}</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <form
              action={isEdit ? updateAction : createAction}
              className="space-y-4"
              onSubmit={() => {
                if (createState.ok || updateState.ok) setOpen(false);
              }}
            >
              <input type="hidden" name="media_url" value={mediaUrl} />
              {!isEdit ? (
                <>
                  <input type="hidden" name="asset_type" value={assetType} />
                  <input type="hidden" name="sponsor_id" value={sponsorId} />
                  <input type="hidden" name="exercise_id" value={exerciseId} />
                </>
              ) : null}
              <input type="hidden" name="orientation" value={orientation} />
              <input type="hidden" name="active" value={active ? 'true' : 'false'} />
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Título</label>
                <Input name="title" defaultValue={editing?.title ?? ''} required className="mt-1" />
              </div>
              {!isEdit ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tipo: <strong>{editing ? SIGNAGE_ASSET_TYPE_LABELS[editing.asset_type] : ''}</strong>
                </p>
              )}
              {(assetType === 'video' || assetType === 'image' || (isEdit && editing?.media_url)) && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {isEdit ? 'Reemplazar archivo' : 'Archivo'}
                  </label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Imágenes: {SIGNAGE_IMAGE_EXTENSIONS} (máx. 10 MB). Vídeos: {SIGNAGE_VIDEO_EXTENSIONS} (máx. 200 MB).
                  </p>
                  <Input
                    type="file"
                    accept={
                      (isEdit ? editing?.asset_type : assetType) === 'video'
                        ? 'video/mp4,video/webm'
                        : 'image/jpeg,image/png,image/webp,image/gif'
                    }
                    className="mt-1"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                  />
                  {uploadError ? <p className="mt-2 text-sm text-destructive">{uploadError}</p> : null}
                  {mediaUrl ? (
                    editing?.asset_type === 'video' || assetType === 'video' ? (
                      <p className="mt-2 truncate text-xs text-muted-foreground">{mediaUrl}</p>
                    ) : (
                      <img src={mediaUrl} alt="" className="mt-2 max-h-24 object-contain" />
                    )
                  ) : null}
                </div>
              )}
              {!isEdit && assetType === 'sponsor_slide' && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patrocinador</label>
                  <SynqSelect
                    value={sponsorId}
                    onChange={setSponsorId}
                    options={sponsors.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
              )}
              {!isEdit && assetType === 'exercise_animation' && (
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
                <Input
                  name="duration_sec"
                  type="number"
                  min={0}
                  defaultValue={editing?.duration_sec ?? (assetType === 'video' ? 0 : 10)}
                  className="mt-1"
                />
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
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-primary/30"
                />
                Activo en pantallas
              </label>
              <Button type="submit" disabled={busy || (needsMedia && !mediaUrl)} className="w-full">
                {busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Añadir a biblioteca'}
              </Button>
              {needsMedia && !mediaUrl ? (
                <p className="text-center text-xs text-amber-400/90">
                  Espera a que termine la subida del archivo antes de guardar.
                </p>
              ) : null}
              {createState.ok || updateState.ok ? (
                <p className="text-center text-sm text-emerald-400">
                  Guardado. Añádelo en <strong>Programación</strong> para que salga en pantalla.
                </p>
              ) : null}
            </form>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
