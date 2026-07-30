'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ensureTournamentSignageScreenToken } from '@/app/actions/tournaments';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Loader2, MonitorPlay, Tv } from 'lucide-react';

type Props = {
  tournamentId: string;
  screenPath: string | null;
  hasClubSignage: boolean;
  sponsorCount: number;
};

export function TournamentSignageControls({
  tournamentId,
  screenPath: initialPath,
  hasClubSignage,
  sponsorCount,
}: Props) {
  const [screenPath, setScreenPath] = useState(initialPath);
  const [loading, setLoading] = useState(!initialPath);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialPath) return;
    let cancelled = false;
    void ensureTournamentSignageScreenToken(tournamentId).then((res) => {
      if (cancelled) return;
      if (res.ok && res.path) setScreenPath(res.path);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [initialPath, tournamentId]);

  const fullUrl = screenPath && typeof window !== 'undefined' ? `${window.location.origin}${screenPath}` : null;

  async function copyUrl() {
    if (!fullUrl) return;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="portal-section-surface space-y-4 rounded-xl p-4 text-sm">
      <div className="flex items-start gap-3">
        <Tv className="mt-0.5 size-5 shrink-0 text-cyan-300" />
        <div>
          <p className="font-medium">Pantalla del torneo (sin playlist manual)</p>
          <p className="mt-1 text-muted-foreground">
            {hasClubSignage
              ? 'Tu club puede montar playlists avanzadas en Signage. Además, este torneo tiene su propia URL de TV con el muro de patrocinadores generado automáticamente.'
              : 'Sin club no hace falta crear playlists: abre esta URL en el navegador de la TV y el muro de patrocinadores rota solo. Ideal para organizadores independientes.'}
          </p>
        </div>
      </div>

      {hasClubSignage ? (
        <div className="rounded-lg border border-border/50 bg-background/30 p-3">
          <p className="text-xs font-medium text-foreground">Signage del club</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Playlists, zonas y programación horaria en el módulo del club.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/portal/signage/programacion">
              <MonitorPlay className="mr-1.5 size-4" />
              Ir a Signage del club
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/5 p-3">
        <p className="text-xs font-medium text-cyan-100">URL para la TV del torneo</p>
        {loading ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Generando enlace…
          </p>
        ) : screenPath ? (
          <>
            <p className="mt-2 break-all font-mono text-xs text-cyan-200/90">{fullUrl ?? screenPath}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => void copyUrl()} disabled={!fullUrl}>
                <Copy className="mr-1.5 size-4" />
                {copied ? 'Copiado' : 'Copiar URL'}
              </Button>
              <Button asChild size="sm">
                <Link href={screenPath} target="_blank">
                  <ExternalLink className="mr-1.5 size-4" />
                  Abrir en pantalla completa
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs text-amber-300">No se pudo generar el enlace. Recarga la página.</p>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          {sponsorCount > 0
            ? `${sponsorCount} patrocinador${sponsorCount === 1 ? '' : 'es'} activo${sponsorCount === 1 ? '' : 's'} en el muro.`
            : 'Añade patrocinadores con logo en la pestaña Patrocinadores para rellenar el muro.'}
        </p>
      </div>
    </div>
  );
}
