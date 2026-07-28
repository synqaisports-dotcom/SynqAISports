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
import { SponsorWallPreviewFrame } from '@/components/portal/signage/SponsorWallPreviewFrame';
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
  buildFullWallDemoSponsors,
  FULL_WALL_DEMO_SPONSOR_COUNT,
} from '@/lib/sponsor-wall-demo';
import {
  SPONSOR_TIER_GRID_SPAN,
  SPONSOR_WALL_ENTRANCE_LABELS,
  SPONSOR_WALL_ENTRANCES,
  summarizeSponsorWallCapacity,
  type SponsorWallEntrance,
} from '@/lib/sponsor-wall';
import { signageUploadErrorMessage } from '@/lib/signage-media';
import { cn } from '@/lib/utils';
import { Info, Plus } from 'lucide-react';

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
  const [useDemoWall, setUseDemoWall] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const demoWallSponsors = useMemo(() => buildFullWallDemoSponsors(), []);

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
  const canPreviewWall = wallPreviewSponsors.length >= 2;
  const previewSponsors = useDemoWall ? demoWallSponsors : wallPreviewSponsors;

  function replayPreview() {
    setPreviewKey((k) => k + 1);
  }

  function openDemoFullscreen() {
    setUseDemoWall(true);
    setPreviewKey((k) => k + 1);
    setFullscreenOpen(true);
  }

  return (
    <div className="portal-section-surface relative rounded-xl p-4">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="absolute right-4 top-4 z-10 shrink-0"
        onClick={() => setInfoOpen(true)}
        aria-label="Información de niveles y muro"
        title="Información"
      >
        <Info className="size-4" />
      </Button>

      <div className="grid gap-4 pt-1 lg:grid-cols-2 lg:items-stretch lg:gap-6">
        {/* Columna izquierda: listado */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {activeSponsors.length} activos · pausa para ocultar sin borrar
            </p>
            <Button type="button" size="sm" onClick={openCreate}>
              <Plus className="mr-1 size-4" />
              Nuevo
            </Button>
          </div>

          <div className="flex max-h-[min(70vh,560px)] flex-col gap-2 overflow-y-auto pr-1">
            {sponsors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
                Aún no hay patrocinadores. Crea el primero para empezar.
              </div>
            ) : (
              sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-primary/10 bg-background/30 p-2.5',
                    !sponsor.active && 'opacity-60'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openEdit(sponsor)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary/20 bg-primary/5">
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt="" className="max-h-full max-w-full object-contain p-0.5" />
                      ) : (
                        <span className="text-base font-semibold text-primary/70">{sponsor.name.slice(0, 1)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{sponsor.name}</p>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 px-1.5 text-[10px]',
                            sponsor.tier === 'gold' && 'border-amber-400/40 text-amber-200',
                            sponsor.tier === 'silver' && 'border-slate-300/30 text-slate-200',
                            sponsor.tier === 'bronze' && 'border-orange-400/30 text-orange-200'
                          )}
                        >
                          {SPONSOR_TIER_LABELS[sponsor.tier]}
                        </Badge>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                          {sponsor.default_duration_sec}s
                        </Badge>
                        {!sponsor.active ? (
                          <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                            Pausado
                          </Badge>
                        ) : null}
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
              ))
            )}
          </div>
        </div>

        {/* Columna derecha: visualizador */}
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-end gap-2 pr-10">
            <div className="min-w-[160px] flex-1">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Transición
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
            <Button type="button" size="sm" variant="outline" onClick={openDemoFullscreen}>
              Slide completo ({FULL_WALL_DEMO_SPONSOR_COUNT})
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/portal/signage/programacion">Programación</Link>
            </Button>
          </div>

          {useDemoWall ? (
            <p className="text-xs text-cyan-300/80">
              Mostrando ejemplo con capacidad máxima: {FULL_WALL_DEMO_SPONSOR_COUNT} patrocinadores en un slide.
              <button
                type="button"
                className="ml-1 underline underline-offset-2 hover:text-cyan-200"
                onClick={() => setUseDemoWall(false)}
              >
                Ver los tuyos
              </button>
            </p>
          ) : null}

          {canPreviewWall || useDemoWall ? (
            <SponsorWallPreviewFrame
              embedded
              sponsors={previewSponsors}
              clubName={clubName}
              clubLogoUrl={clubLogoUrl}
              entrance={wallEntrance}
              replayKey={previewKey}
              fullscreenOpen={fullscreenOpen}
              onFullscreenOpenChange={setFullscreenOpen}
              onPreview={replayPreview}
            />
          ) : (
            <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-primary/20 bg-background/20 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Vista previa del muro</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Añade al menos 2 patrocinadores activos o prueba el slide completo de ejemplo.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button type="button" size="sm" onClick={openCreate}>
                  <Plus className="mr-1 size-4" />
                  Nuevo patrocinador
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={openDemoFullscreen}>
                  Slide completo ({FULL_WALL_DEMO_SPONSOR_COUNT})
                </Button>
              </div>
            </div>
          )}
        </div>
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
                  <span className="text-foreground">Capacidad por zona:</span> hasta {wallCapacity.maxByTier.gold}{' '}
                  oro, {wallCapacity.maxByTier.silver} plata y {wallCapacity.maxByTier.bronze} bronce en un slide
                </li>
                <li>
                  <span className="text-foreground">Tus activos:</span> {wallCapacity.currentFit.gold} oro,{' '}
                  {wallCapacity.currentFit.silver} plata, {wallCapacity.currentFit.bronze} bronce → caben{' '}
                  <span className="font-medium text-cyan-200">{wallCapacity.currentFit.total}</span> en el muro
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
