'use client';

import { useActionState, useState } from 'react';
import { claimPairingCode, deleteDevice, toggleDeviceActive, updateDevice, type SignageActionState } from '@/app/actions/signage';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { SignageItemActions } from '@/components/portal/signage/SignageItemActions';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  deviceIsOnline,
  SIGNAGE_ORIENTATION_LABELS,
  SIGNAGE_ORIENTATIONS,
  SIGNAGE_ZONE_LABELS,
  SIGNAGE_ZONE_TYPES,
  type SignageDevice,
  type SignageOrientation,
  type SignagePlaylist,
  type SignageZoneType,
} from '@/lib/signage';
import { cn } from '@/lib/utils';
import { Copy, Link2, Monitor, Pencil } from 'lucide-react';
import Link from 'next/link';

const initial: SignageActionState = { ok: false };

type Props = {
  devices: SignageDevice[];
  playlists: SignagePlaylist[];
};

export function DevicesPanel({ devices, playlists }: Props) {
  const [pairOpen, setPairOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<SignageDevice | null>(null);
  const [pairZone, setPairZone] = useState<SignageZoneType>('cafeteria');
  const [pairOrientation, setPairOrientation] = useState<SignageOrientation>('landscape');
  const [editZone, setEditZone] = useState<SignageZoneType>('waiting');
  const [editOrientation, setEditOrientation] = useState<SignageOrientation>('landscape');
  const [editPlaylistId, setEditPlaylistId] = useState('');
  const [pairState, pairAction, pairing] = useActionState(claimPairingCode, initial);
  const [updateState, updateAction, updating] = useActionState(
    editDevice ? updateDevice.bind(null, editDevice.id) : claimPairingCode,
    initial
  );

  function copyPlayUrl(token: string) {
    const url = `${window.location.origin}/play/${token}`;
    void navigator.clipboard.writeText(url);
  }

  function openEdit(device: SignageDevice) {
    setEditDevice(device);
    setEditZone(device.zone_type);
    setEditOrientation(device.orientation);
    setEditPlaylistId(device.playlist_id ?? '');
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Cada TV es una pantalla independiente. Para añadir otra, repite el emparejamiento en la nueva TV.
          Abre{' '}
          <Link href="/play/pair" className="text-cyan-300 hover:underline" target="_blank">
            /play/pair
          </Link>{' '}
          en el navegador de la pantalla.
        </p>
        <Button type="button" size="sm" onClick={() => setPairOpen(true)}>
          <Link2 className="mr-1 size-4" />
          Emparejar pantalla
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {devices.map((device) => {
          const online = deviceIsOnline(device.last_seen_at);
          const playlist = playlists.find((p) => p.id === device.playlist_id);
          return (
            <div key={device.id} className={cn('portal-section-surface rounded-xl p-4', !device.active && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
                    <Monitor className="size-5 text-primary/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{device.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">{SIGNAGE_ZONE_LABELS[device.zone_type]}</Badge>
                      <Badge variant="outline">{SIGNAGE_ORIENTATION_LABELS[device.orientation]}</Badge>
                      <Badge variant={online ? 'default' : 'secondary'}>{online ? 'En línea' : 'Offline'}</Badge>
                      {!device.active ? <Badge variant="destructive">Pausada</Badge> : null}
                    </div>
                    {playlist ? (
                      <p className="mt-2 text-xs text-muted-foreground">Playlist: {playlist.name}</p>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">Playlist por defecto del club</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <SignageItemActions
                    active={device.active}
                    onToggle={() => toggleDeviceActive(device.id, !device.active)}
                    onDelete={() => deleteDevice(device.id)}
                    pauseLabel="Pausar pantalla"
                    resumeLabel="Reactivar pantalla"
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => copyPlayUrl(device.device_token)}>
                    <Copy className="size-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" onClick={() => openEdit(device)}>
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline" disabled={!device.active}>
                  <Link href={`/play/${device.device_token}`} target="_blank">
                    Abrir reproductor
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={pairOpen} onOpenChange={setPairOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>Emparejar pantalla</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <p className="mb-4 text-sm text-muted-foreground">
              En la TV, abre <strong>/play/pair</strong> y anota el código de 6 dígitos que aparece en pantalla.
            </p>
            <form action={pairAction} className="space-y-4">
              <input type="hidden" name="zone_type" value={pairZone} />
              <input type="hidden" name="orientation" value={pairOrientation} />
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Código</label>
                <Input name="pairing_code" inputMode="numeric" maxLength={6} required className="mt-1 text-center text-2xl tracking-[0.4em]" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nombre pantalla</label>
                <Input name="name" placeholder="TV Cafetería" required className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zona</label>
                <SynqSelect
                  value={pairZone}
                  onChange={(value) => setPairZone(value as SignageZoneType)}
                  options={SIGNAGE_ZONE_TYPES.map((z) => ({ value: z, label: SIGNAGE_ZONE_LABELS[z] }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Orientación</label>
                <SynqSelect
                  value={pairOrientation}
                  onChange={(value) => setPairOrientation(value as SignageOrientation)}
                  options={SIGNAGE_ORIENTATIONS.map((o) => ({ value: o, label: SIGNAGE_ORIENTATION_LABELS[o] }))}
                />
              </div>
              <Button type="submit" disabled={pairing} className="w-full">
                {pairing ? 'Emparejando…' : 'Confirmar emparejamiento'}
              </Button>
              {pairState.ok ? (
                <p className="text-center text-sm text-emerald-400">Pantalla emparejada correctamente</p>
              ) : null}
            </form>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>

      <Sheet open={Boolean(editDevice)} onOpenChange={(v) => !v && setEditDevice(null)}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>Editar pantalla</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            {editDevice ? (
              <form action={updateAction} className="space-y-4">
                <input type="hidden" name="zone_type" value={editZone} />
                <input type="hidden" name="orientation" value={editOrientation} />
                <input type="hidden" name="playlist_id" value={editPlaylistId} />
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nombre</label>
                  <Input name="name" defaultValue={editDevice.name} required className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Zona</label>
                  <SynqSelect
                    value={editZone}
                    onChange={(value) => setEditZone(value as SignageZoneType)}
                    options={SIGNAGE_ZONE_TYPES.map((z) => ({ value: z, label: SIGNAGE_ZONE_LABELS[z] }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Orientación</label>
                  <SynqSelect
                    value={editOrientation}
                    onChange={(value) => setEditOrientation(value as SignageOrientation)}
                    options={SIGNAGE_ORIENTATIONS.map((o) => ({ value: o, label: SIGNAGE_ORIENTATION_LABELS[o] }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Playlist</label>
                  <SynqSelect
                    value={editPlaylistId}
                    onChange={setEditPlaylistId}
                    options={[
                      { value: '', label: 'Por defecto del club' },
                      ...playlists.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
                </div>
                <input type="hidden" name="active" value="true" />
                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? 'Guardando…' : 'Guardar'}
                </Button>
                {updateState.ok ? <p className="text-center text-sm text-emerald-400">Guardado</p> : null}
              </form>
            ) : null}
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </div>
  );
}
