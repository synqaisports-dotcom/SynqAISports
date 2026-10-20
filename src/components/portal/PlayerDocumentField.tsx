'use client';

import { useRef, useState, useTransition } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { uploadPlayerDocument } from '@/app/actions/cantera';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Props = {
  clubId: string;
  playerId: string;
  hiddenInputName: string;
  title: string;
  description: string;
  initialDocumentUrl?: string | null;
  className?: string;
};

export function PlayerDocumentField({
  clubId,
  playerId,
  hiddenInputName,
  title,
  description,
  initialDocumentUrl,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentUrl, setDocumentUrl] = useState(initialDocumentUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, startUpload] = useTransition();

  const onPick = (file: File) => {
    startUpload(async () => {
      setError(null);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('playerId', playerId);
      const result = await uploadPlayerDocument(clubId, fd);
      if (result.ok && result.url) {
        setDocumentUrl(result.url);
      } else {
        const messages: Record<string, string> = {
          too_large: 'El archivo supera 10 MB.',
          invalid_type: 'Formato no válido. Usa PDF, JPG o PNG.',
          upload_error: 'No se pudo subir. Comprueba Supabase Storage (bucket club-media).',
          unauthorized: 'Sin permiso para subir.',
        };
        setError(messages[result.message ?? ''] ?? 'Error al subir el documento.');
      }
    });
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input type="hidden" name={hiddenInputName} value={documentUrl} readOnly />
      <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-muted/5 p-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-primary/25 portal-field-surface">
          {pending ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <FileText className="size-5 text-primary/80" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              placeholder="https://…"
              value={documentUrl}
              onChange={(event) => setDocumentUrl(event.target.value)}
              className="min-w-0 flex-1 portal-field-surface"
            />
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onPick(file);
                event.target.value = '';
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
          {documentUrl ? (
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs font-medium text-primary hover:underline"
            >
              Ver documento actual
            </a>
          ) : null}
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
