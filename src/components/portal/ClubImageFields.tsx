'use client';

import { useRef, useState, useTransition } from 'react';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { uploadClubMedia } from '@/app/actions/club';
import { ClubIdentityPreview } from '@/components/portal/ClubIdentityHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  clubId: string;
  coverUrl: string | null;
  logoUrl: string | null;
  clubName: string;
  countryCode?: string;
};

function UploadButton({
  label,
  uploading,
  onPick,
}: {
  label: string;
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
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
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Upload className="size-3.5" />
        )}
        {label}
      </Button>
    </>
  );
}

function UrlField({
  id,
  name,
  label,
  hint,
  value,
  onChange,
  uploadLabel,
  uploading,
  onUpload,
  error,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  uploadLabel: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  error?: string | null;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          name={name}
          type="url"
          placeholder="https://…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1"
        />
        <UploadButton label={uploadLabel} uploading={uploading} onPick={onUpload} />
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ClubImageFields({
  clubId,
  coverUrl,
  logoUrl,
  clubName,
  countryCode = 'ES',
}: Props) {
  const [coverPreview, setCoverPreview] = useState(coverUrl ?? '');
  const [logoPreview, setLogoPreview] = useState(logoUrl ?? '');
  const [coverError, setCoverError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [coverPending, startCoverUpload] = useTransition();
  const [logoPending, startLogoUpload] = useTransition();

  const uploadFile = (type: 'cover' | 'logo', file: File) => {
    const start = type === 'cover' ? startCoverUpload : startLogoUpload;
    const setUrl = type === 'cover' ? setCoverPreview : setLogoPreview;
    const setError = type === 'cover' ? setCoverError : setLogoError;

    start(async () => {
      setError(null);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      const result = await uploadClubMedia(clubId, fd);
      if (result.ok && result.url) {
        setUrl(result.url);
      } else {
        const messages: Record<string, string> = {
          too_large: 'La imagen supera 5 MB.',
          invalid_type: 'Formato no válido. Usa JPG, PNG, WebP, GIF o SVG.',
          upload_error: 'No se pudo subir. Comprueba Supabase Storage (bucket club-media).',
          unauthorized: 'Sin permiso para subir.',
        };
        setError(messages[result.message ?? ''] ?? 'Error al subir la imagen.');
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <ImageIcon className="size-3.5" />
          Vista previa
        </p>
        <ClubIdentityPreview
          name={clubName}
          coverUrl={coverPreview}
          logoUrl={logoPreview}
          countryCode={countryCode}
        />
      </div>

      <div className="grid w-full gap-5 lg:grid-cols-2">
        <UrlField
          id="coverUrl"
          name="coverUrl"
          label="Banner del club"
          hint="URL directa o sube una imagen horizontal desde tu PC (máx. 5 MB)."
          value={coverPreview}
          onChange={setCoverPreview}
          uploadLabel="Desde PC"
          uploading={coverPending}
          onUpload={(file) => uploadFile('cover', file)}
          error={coverError}
        />

        <UrlField
          id="logoUrl"
          name="logoUrl"
          label="Escudo del club"
          hint="URL o archivo local. PNG/SVG con fondo transparente recomendado."
          value={logoPreview}
          onChange={setLogoPreview}
          uploadLabel="Desde PC"
          uploading={logoPending}
          onUpload={(file) => uploadFile('logo', file)}
          error={logoError}
        />
      </div>
    </div>
  );
}
