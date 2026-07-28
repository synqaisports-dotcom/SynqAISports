'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { SponsorWallSlide } from '@/components/portal/signage/SponsorWallSlide';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  sortSponsorsByTier,
  SPONSOR_TIER_LABELS,
  SPONSOR_TIER_META,
  SPONSOR_TIERS,
  sponsorsForWall,
  type SignageSponsor,
  type SponsorTier,
} from '@/lib/signage';
import {
  SPONSOR_TIER_GRID_SPAN,
  SPONSOR_WALL_ENTRANCE_LABELS,
  SPONSOR_WALL_ENTRANCES,
  summarizeSponsorWallCapacity,
  type SponsorWallEntrance,
} from '@/lib/sponsor-wall';
import { signageUploadErrorMessage } from '@/lib/signage-media';
import { cn } from '@/lib/utils';
import { Info, Play, Plus } from 'lucide-react';

const WALL_ENTRANCE_STORAGE_KEY = 'signage-sponsor-wall-entrance';

const initial: SignageActionState = { ok: false };

type Props = {
  sponsors: SignageSponsor[];
  clubName: string;
  clubLogoUrl: string | null;
};

export function SponsorsPanel({ sponsors, clubName, clubLogoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [editing, setEditing] = useState<SignageSponsor | null>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tier, setTier] = useState<SponsorTier>('silver');
  const [durationSec, setDurationSec] = useState(SPONSOR_TIER_META.silver.defaultDurationSec);
  const [active, setActive] = useState(true);
  const [wallEntrance, setWallEntrance] = useState<SponsorWallEntrance>(() => {
    if (typeof window === 'undefined') return 'stagger-fade';
    const saved = localStorage.getItem(WALL_ENTRANCE_STORAGE_KEY);
    return SPONSOR_WALL_ENTRANCES.includes(saved as SponsorWallEntrance)
      ? (saved as SponsorWallEntrance)
      : 'stagger-fade';
  });
  const [previewKey, setPreviewKey] = useState(0);
  const [previewing, setPreviewing] = useState(false);

  const [createState, createAction, creating] = useActionState(createSponsor, initial);
  const [updateState, updateAction, updating] = useActionState(
    editing ? updateSponsor.bind(null, editing.id) : createSponsor,
    initial
  );

  const [uploading, setUploading] = useState(false);
  const activeSponsors = useMemo(() => sortSponsorsByTier(sponsors.filter((s) => s.active)), [sponsors]);
  const wallPreviewSponsors = sponsorsForWall(sponsors, 'all');
  const wallCapacity = useMemo(() => summarizeSponsorWallCapacity(sponsors), [sponsors]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  function openCreate() {
    setEditing(null);
    setLogoUrl('');
    setLogoPreviewUrl(null);
    setUploadError(null);
    setTier('silver');
    setDurationSec(SPONSOR_TIER_META.silver.defaultDurationSec);
    setActive(true);
    setOpen(true);
  }

  function openEdit(sponsor: SignageSponsor) {
    setEditing(sponsor);
    setLogoUrl(sponsor.logo_url ?? '');
    setLogoPreviewUrl(sponsor.logo_url ?? null);
    setUploadError(null);
    setTier(sponsor.tier);
    setDurationSec(sponsor.default_duration_sec);
    setActive(sponsor.active);
    setOpen(true);
  }

  function handleTierChange(nextTier: SponsorTier) {
    setTier(nextTier);
    if (!editing) setDurationSec(SPONSOR_TIER_META[nextTier].defaultDurationSec);
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    const localPreview = URL.createObjectURL(file);
    setLogoPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return localPreview;
    });
    const fd = new FormData();
    fd.set('file', file);
    const result = await uploadSignageMedia(fd);
    if (result.ok && result.url) {
      setLogoUrl(result.url);
      setLogoPreviewUrl(result.url);
    } else {
      setUploadError(signageUploadErrorMessage(result.message));
    }
    setUploading(false);
  }

  const busy = creating || updating || uploading;

  return (
    <div className="space-y-4">
      {wallPreviewSponsors.length >= 2 ? (
        <div className="portal-section-surface overflow-hidden rounded-xl p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Muro de patrocinadores</h3>
              <p className="text-sm text-muted-foreground">
                Zonas oro arriba, plata al centro y bronce abajo. Marca de agua SynqAI en el centro. Añádelo en
                Programación.
              </p>
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0"
              onClick={() => setInfoOpen(true)}
              aria-label="Información de niveles y muro"
              title="Información"
            >
              <Info className="size-4" />
            </Button>
          </div>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Transición de aparición
              </label>
              <SynqSelect
                value={wallEntrance}
                onChange={(value) => {
                  const next = value as SponsorWallEntrance;
                  setWallEntrance(next);
                  localStorage.setItem(WALL_ENTRANCE_STORAGE_KEY, next);
                }}
                options={SPONSOR_WALL_ENTRANCES.map((e) => ({
                  value: e,
                  label: SPONSOR_WALL_ENTRANCE_LABELS[e],
                }))}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setPreviewKey((k) => k + 1);
                setPreviewing(true);
              }}
            >
              <Play className="mr-1 size-4" />
              Previsualizar
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/portal/signage/programacion">Ir a Programación</Link>
            </Button>
          </div>
          <div className="aspect-video overflow-hidden rounded-lg border border-primary/15">
            <SponsorWallSlide
              key={previewKey}
              sponsors={wallPreviewSponsors}
              clubName={clubName}
              clubLogoUrl={clubLogoUrl}
              entrance={wallEntrance}
              compact
            />
          </div>
          {previewing ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Esta transición se aplicará al añadir el muro en Programación (se guarda como preferencia).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {activeSponsors.length} patrocinadores activos. Pausa para ocultar sin borrar.
        </p>
        <div className="flex items-center gap-2">
          {wallPreviewSponsors.length < 2 ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setInfoOpen(true)}
              aria-label="Información de niveles y muro"
              title="Información"
            >
              <Info className="size-4" />
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-4" />
            Nuevo patrocinador
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.id}
            className={cn('portal-section-surface rounded-xl p-4', !sponsor.active && 'opacity-60')}
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
                    <Badge
                      variant="outline"
                      className={cn(
                        sponsor.tier === 'gold' && 'border-amber-400/40 text-amber-200',
                        sponsor.tier === 'silver' && 'border-slate-300/30 text-slate-200',
                        sponsor.tier === 'bronze' && 'border-orange-400/30 text-orange-200'
                      )}
                    >
                      {SPONSOR_TIER_LABELS[sponsor.tier]}
                    </Badge>
                    <Badge variant="secondary">{sponsor.default_duration_sec}s</Badge>
                    {!sponsor.active ? <Badge variant="destructive">Pausado</Badge> : null}
                  </div>
                </div>
              </button>
              <SignageItemActions
                active={sponsor.active}
                onEdit={() => openEdit(sponsor)}
                onToggle={() => toggleSponsorActive(sponsor.id, !sponsor.active)}
                onDelete={() => deleteSponsor(sponsor.id)}
                pauseLabel="Pausar patrocinador"
                resumeLabel="Reactivar patrocinador"
                editLabel="Editar patrocinador"
              />
            </div>
          </div>
        ))}
      </div>

      <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
        <PortalSheetContent maxWidth="lg">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>Niveles y muro de patrocinadores</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody className="space-y-4">
            <div>
              <h3 className="font-medium">Niveles oro, plata y bronce</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Clasifican el peso comercial del patrocinio. No es decoración: define duración sugerida, tamaño en el
                muro conjunto y prioridad cuando uses rotación ponderada.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {SPONSOR_TIERS.map((tierKey) => (
                <div key={tierKey} className="rounded-lg border border-primary/10 bg-background/30 p-3 text-sm">
                  <p className="font-medium text-foreground">{SPONSOR_TIER_LABELS[tierKey]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{SPONSOR_TIER_META[tierKey].description}</p>
                  <p className="mt-2 text-[11px] text-cyan-300/70">
                    Muro {SPONSOR_TIER_GRID_SPAN[tierKey].cols}×{SPONSOR_TIER_GRID_SPAN[tierKey].rows} ·{' '}
                    {SPONSOR_TIER_META[tierKey].defaultDurationSec}s · peso {SPONSOR_TIER_META[tierKey].weight}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/5 p-3 text-sm">
              <p className="font-medium text-cyan-100">Distribución del muro por zonas</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>
                  <span className="text-foreground">Zonas:</span> oro arriba · plata en el centro · bronce abajo
                </li>
                <li>
                  <span className="text-foreground">Referencia 1080p:</span> hasta {wallCapacity.maxByTier.gold} oro,{' '}
                  {wallCapacity.maxByTier.silver} plata y {wallCapacity.maxByTier.bronze} bronce visibles cómodamente
                </li>
                <li>
                  <span className="text-foreground">Tus activos:</span> {wallCapacity.currentFit.gold} oro,{' '}
                  {wallCapacity.currentFit.silver} plata, {wallCapacity.currentFit.bronze} bronce (
                  {wallCapacity.currentFit.total} en total). En 4K caben más filas por zona.
                </li>
                <li>
                  <span className="text-foreground">Aparición:</span> un logo cada segundo, en orden oro → plata →
                  bronce
                </li>
              </ul>
            </div>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>

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
                  onChange={(value) => handleTierChange(value as SponsorTier)}
                  options={SPONSOR_TIERS.map((t) => ({ value: t, label: SPONSOR_TIER_LABELS[t] }))}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{SPONSOR_TIER_META[tier].description}</p>
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duración (s)</label>
                <Input
                  name="default_duration_sec"
                  type="number"
                  min={5}
                  max={120}
                  value={durationSec}
                  onChange={(e) => setDurationSec(Number(e.target.value))}
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
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.svg"
                  className="mt-1"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleLogoUpload(file);
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, GIF o SVG (recomendado para logos).</p>
                {uploading ? <p className="mt-2 text-xs text-cyan-300/80">Subiendo logo…</p> : null}
                {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt="" className="mt-2 h-20 max-w-full object-contain" />
                ) : null}
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
