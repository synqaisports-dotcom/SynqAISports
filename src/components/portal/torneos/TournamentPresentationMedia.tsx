'use client';

import { useRef, useState, useTransition } from 'react';
import { removeTournamentGalleryImage, uploadTournamentMedia } from '@/app/actions/tournaments';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import type { TournamentBundle } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
};

export function TournamentPresentationMedia({ bundle }: Props) {
  const { tournament } = bundle;
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function upload(file: File, kind: 'cover' | 'gallery') {
    const fd = new FormData();
    fd.set('file', file);
    fd.set('kind', kind);
    startTransition(async () => {
      const res = await uploadTournamentMedia(tournament.id, fd);
      setMessage(res.message ?? (res.ok ? 'Imagen subida' : 'Error'));
    });
  }

  return (
    <section className="portal-section-surface rounded-xl p-4 md:p-5">
      <h3 className="font-medium">Imágenes para dossier y presentación</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Portada y galería para el documento de invitación a clubs y familias (web pública y PDF futuro).
      </p>

      {message ? <p className="mt-2 text-sm text-cyan-200">{message}</p> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className={PORTAL_FIELD_LABEL_CLASS}>Portada</p>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-background/30">
            {tournament.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tournament.cover_image_url} alt="Portada" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                Sin portada
              </div>
            )}
          </div>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f, 'cover');
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={pending}
            onClick={() => coverRef.current?.click()}
          >
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <ImagePlus className="mr-1.5 size-4" />}
            Subir portada
          </Button>
        </div>

        <div>
          <p className={PORTAL_FIELD_LABEL_CLASS}>Galería ({tournament.venue_images_json.length})</p>
          <div className="grid grid-cols-3 gap-2">
            {tournament.venue_images_json.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => {
                    startTransition(async () => {
                      await removeTournamentGalleryImage(tournament.id, url);
                    });
                  }}
                >
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f, 'gallery');
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={pending}
            onClick={() => galleryRef.current?.click()}
          >
            <ImagePlus className="mr-1.5 size-4" />
            Añadir imagen
          </Button>
        </div>
      </div>
    </section>
  );
}
