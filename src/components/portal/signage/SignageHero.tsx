'use client';

import type { ReactNode } from 'react';
import { Tv } from 'lucide-react';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';
import { Badge } from '@/components/ui/badge';
import { deviceIsOnline, type SignageDevice, type SignagePlaylist, type SignageSponsor } from '@/lib/signage';

type Props = {
  sponsors: SignageSponsor[];
  devices: SignageDevice[];
  playlists: SignagePlaylist[];
  actions?: ReactNode;
  className?: string;
};

export function SignageHero({ sponsors, devices, playlists, actions, className }: Props) {
  const online = devices.filter((d) => deviceIsOnline(d.last_seen_at)).length;
  const activeSponsors = sponsors.filter((s) => s.active).length;
  const defaultPlaylist = playlists.find((p) => p.is_default);

  return (
    <PortalSectionShell actions={actions} className={className}>
      <PortalSectionBadge icon={<Tv className="size-3.5" />}>Digital signage</PortalSectionBadge>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Pantallas del club</h1>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
        Gestiona patrocinadores, contenido multimedia, emparejamiento de TVs y programación horaria.
        El reproductor web funciona en navegador de Smart TV, Fire Stick o Chromecast.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{devices.length} pantallas</Badge>
        <Badge variant="outline">{online} en línea</Badge>
        <Badge variant="outline">{activeSponsors} patrocinadores</Badge>
        {defaultPlaylist ? (
          <Badge variant="outline">{defaultPlaylist.items.length} ítems en playlist</Badge>
        ) : null}
      </div>
    </PortalSectionShell>
  );
}
