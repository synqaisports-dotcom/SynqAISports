'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTournamentPwaLinks, type DemoTorneoPwaLinks } from '@/app/actions/tournaments';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ClipboardList, Copy, ExternalLink, QrCode, Radio, Smartphone, Trophy, Users } from 'lucide-react';

type Props = {
  tournamentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TournamentAccessSheet({ tournamentId, open, onOpenChange }: Props) {
  const [links, setLinks] = useState<DemoTorneoPwaLinks | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    getTournamentPwaLinks(tournamentId).then(setLinks);
  }, [open, tournamentId]);

  async function copyFull(path: string, key: string) {
    const url = path.startsWith('http') ? path : `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const items = links
    ? [
        { key: 'public', href: links.publicWeb, icon: Trophy, title: 'Web pública', desc: 'Resultados y info para familias' },
        { key: 'mesa', href: links.mesa, icon: Smartphone, title: 'Mesa móvil', desc: links.mesaLabel },
        { key: 'delegado', href: links.delegado, icon: Users, title: 'Portal delegado', desc: links.delegadoLabel },
        { key: 'taquilla', href: links.taquilla, icon: QrCode, title: 'Taquilla QR', desc: 'Validación de entradas en puerta' },
      ]
    : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="md">
        <PortalSheetHeader>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Radio className="size-5 text-cyan-300" />
              Accesos del torneo
            </SheetTitle>
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enlaces para compartir con delegados, mesa y público. En móvil se pueden instalar como PWA desde el navegador.
          </p>

          <div className="space-y-2">
            {items.map(({ key, href, icon: Icon, title, desc }) => (
              <div key={key} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                  <Icon className="size-5 text-cyan-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-cyan-300/80">{href}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-cyan-300"
                    title="Copiar enlace"
                    onClick={() => copyFull(href, key)}
                  >
                    <Copy className="size-4" />
                  </button>
                  <Link
                    href={href}
                    target="_blank"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-cyan-300"
                    title="Abrir"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
                {copied === key ? <span className="sr-only">Copiado</span> : null}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-muted/5 p-4 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <ClipboardList className="size-4 text-cyan-300" />
              Instalar como app (PWA)
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-muted-foreground">
              <li>iPhone: Compartir → Añadir a pantalla de inicio</li>
              <li>Android: Menú ⋮ → Instalar aplicación</li>
              <li>Comparte el enlace del rol correspondiente (delegado, mesa…)</li>
            </ul>
          </div>
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
