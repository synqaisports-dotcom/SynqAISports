'use client';

import { useActionState, useState } from 'react';
import {
  createSponsor,
  deleteSponsor,
  toggleSponsorActive,
  updateSponsor,
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
  SPONSOR_TIER_LABELS,
  SPONSOR_TIERS,
  type SignageSponsor,
  type SponsorTier,
} from '@/lib/signage';
import { cn } from '@/lib/utils';
import { Pencil, Plus } from 'lucide-react';

const initial: SignageActionState = { ok: false };

type Props = {
  sponsors: SignageSponsor[];
};

export function SponsorsPanel({ sponsors }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SignageSponsor | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [tier, setTier] = useState<SponsorTier>('silver');
  const [active, setActive] = useState(true);

  const [createState, createAction, creating] = useActionState(createSponsor, initial);
  const [updateState, updateAction, updating] = useActionState(
    editing ? updateSponsor.bind(null, editing.id) : createSponsor,
    initial
  );

  const [uploading, setUploading] = useState(false);

  function openCreate() {
    setEditing(null);
    setLogoUrl('');
    setTier('silver');
    setActive(true);
    setOpen(true);
  }

  function openEdit(sponsor: SignageSponsor) {
    setEditing(sponsor);
    setLogoUrl(sponsor.logo_url ?? '');
    setTier(sponsor.tier);
    setActive(sponsor.active);
    setOpen(true);
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.set('file', file);
    const result = await uploadSignageMedia(fd);
    if (result.ok && result.url) setLogoUrl(result.url);
    setUploading(false);
  }

  const busy = creating || updating || uploading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Patrocinadores que rotan en las pantallas. Pausa para ocultar sin borrar.
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 size-4" />
          Nuevo patrocinador
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className={cn(
              'portal-section-surface rounded-xl p-4',
              !sponsor.active && 'opacity-60'
            )}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => openEdit(sponsor)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
              >
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/20 bg-primary/5">
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt="" className="max-h-full max-w-full object-contain p-1" />
                  ) : (
                    <span className="text-lg font-semibold text-primary/70">{sponsor.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{sponsor.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline">{SPONSOR_TIER_LABELS[sponsor.tier]}</Badge>
                    <Badge variant="secondary">{sponsor.default_duration_sec}s</Badge>
                    {!sponsor.active ? <Badge variant="destructive">Pausado</Badge> : null}
                  </div>
                </div>
              </button>
              <SignageItemActions
                active={sponsor.active}
                onToggle={() => toggleSponsorActive(sponsor.id, !sponsor.active)}
                onDelete={() => deleteSponsor(sponsor.id)}
                pauseLabel="Pausar patrocinador"
                resumeLabel="Reactivar patrocinador"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start text-muted-foreground"
              onClick={() => openEdit(sponsor)}
            >
              <Pencil className="mr-2 size-3.5" />
              Editar
            </Button>
          </div>
        ))}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>{editing ? 'Editar patrocinador' : 'Nuevo patrocinador'}</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <form
              action={editing ? updateAction : createAction}
              className="space-y-4"
              onSubmit={() => {
                if (createState.ok || updateState.ok) setOpen(false);
              }}
            >
              <input type="hidden" name="logo_url" value={logoUrl} />
              <input type="hidden" name="tier" value={tier} />
              <input type="hidden" name="active" value={active ? 'true' : 'false'} />
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nombre</label>
                <Input name="name" defaultValue={editing?.name ?? ''} required className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nivel</label>
                <SynqSelect
                  value={tier}
                  onChange={(value) => setTier(value as SponsorTier)}
                  options={SPONSOR_TIERS.map((t) => ({ value: t, label: SPONSOR_TIER_LABELS[t] }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duración (s)</label>
                <Input
                  name="default_duration_sec"
                  type="number"
                  min={5}
                  max={120}
                  defaultValue={editing?.default_duration_sec ?? 30}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">URL</label>
                <Input name="url" type="url" defaultValue={editing?.url ?? ''} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Logo</label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                  }}
                />
                {logoUrl ? <img src={logoUrl} alt="" className="mt-2 h-16 object-contain" /> : null}
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notas</label>
                <Input name="notes" defaultValue={editing?.notes ?? ''} className="mt-1" />
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
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear patrocinador'}
              </Button>
            </form>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
