'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Camera, Loader2, Upload } from 'lucide-react';
import { uploadPlayerPhoto } from '@/app/actions/cantera';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  clubId: string;
  playerId: string;
  initialPhotoUrl?: string | null;
  playerName?: string;
  className?: string;
};

export function PlayerPhotoField({
  clubId,
  playerId,
  initialPhotoUrl,
  playerName = 'Jugador',
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startUpload] = useTransition();

  const onPick = (file: File) => {
    startUpload(async () => {
      setError(null);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('playerId', playerId);
      const result = await uploadPlayerPhoto(clubId, fd);
      if (result.ok && result.url) {
        setPhotoUrl(result.url);
      } else {
        const messages: Record<string, string> = {
          too_large: 'La imagen supera 5 MB.',
          invalid_type: 'Formato no válido. Usa JPG, PNG o WebP.',
          upload_error: 'No se pudo subir. Comprueba Supabase Storage (bucket club-media).',
          unauthorized: 'Sin permiso para subir.',
        };
        setError(messages[result.message ?? ''] ?? 'Error al subir la imagen.');
      }
    });
  };

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <input type="hidden" name="photoUrl" value={photoUrl} readOnly />
      <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-muted/20">
        {photoUrl ? (
          <Image src={photoUrl} alt={playerName} fill className="object-cover" sizes="96px" />
        ) : (
          <Camera className="size-8 text-primary/70" strokeWidth={1.5} />
        )}
        {pending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium">Fotografía del jugador</p>
        <p className="text-xs text-muted-foreground">
          Sube una foto desde tu PC o pega una URL. Aparecerá en la ficha y listados de cantera.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            placeholder="https://…"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="min-w-0 flex-1 border-primary/30 bg-background/80"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPick(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            Desde PC
          </Button>
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
