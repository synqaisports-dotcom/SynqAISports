'use client';

import { useState } from 'react';
import { ImageIcon, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  coverUrl: string | null;
  logoUrl: string | null;
  clubName: string;
};

function clubInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ClubImageFields({ coverUrl, logoUrl, clubName }: Props) {
  const [coverPreview, setCoverPreview] = useState(coverUrl ?? '');
  const [logoPreview, setLogoPreview] = useState(logoUrl ?? '');
  const initials = clubInitials(clubName);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-primary/30">
        <p className="border-b border-primary/15 bg-muted/30 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Vista previa
        </p>
        <div className="relative bg-card">
          <div className="relative h-32 w-full overflow-hidden md:h-36">
            {coverPreview.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview.trim()}
                alt="Vista previa del banner"
                className="h-full w-full object-cover"
                onError={() => setCoverPreview('')}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 to-transparent text-primary/60">
                <ImageIcon className="size-7" />
                <span className="text-xs">Banner alargado del club</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-4 translate-y-1/2">
            <div
              className={cn(
                'flex size-16 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-card shadow-md',
                !logoPreview.trim() && 'bg-primary text-primary-foreground'
              )}
            >
              {logoPreview.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview.trim()}
                  alt="Vista previa del escudo"
                  className="h-full w-full object-contain p-1"
                  onError={() => setLogoPreview('')}
                />
              ) : (
                <div className="flex flex-col items-center gap-0.5">
                  <Shield className="size-4 opacity-80" />
                  <span className="text-xs font-bold">{initials}</span>
                </div>
              )}
            </div>
          </div>
          <div className="h-10" aria-hidden />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="coverUrl" className="text-sm font-medium leading-none">
            URL del banner (imagen alargada)
          </label>
          <Input
            id="coverUrl"
            name="coverUrl"
            type="url"
            placeholder="https://tu-cdn.com/banner-club.jpg"
            defaultValue={coverUrl ?? ''}
            onChange={(e) => setCoverPreview(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Recomendado: imagen horizontal amplia (mín. 1200×400 px).
          </p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="logoUrl" className="text-sm font-medium leading-none">
            URL del escudo del club
          </label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            placeholder="https://tu-cdn.com/escudo.png"
            defaultValue={logoUrl ?? ''}
            onChange={(e) => setLogoPreview(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            PNG o SVG con fondo transparente funciona mejor.
          </p>
        </div>
      </div>
    </div>
  );
}
