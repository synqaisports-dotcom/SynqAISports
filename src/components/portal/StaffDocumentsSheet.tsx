'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  savePersonDocuments,
  uploadPersonPdfDocument,
} from '@/app/actions/person-documents';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  loadDemoPersonDocuments,
  newCustomDocumentId,
  PERSON_DOCUMENT_SLOTS,
  parsePersonDocumentsJson,
  saveDemoPersonDocuments,
  type PersonCustomDocument,
  type PersonDocumentFile,
  type PersonDocumentSlotKey,
  type PersonDocumentsData,
} from '@/lib/person-documents';
import { cn } from '@/lib/utils';

const UPLOAD_ERRORS: Record<string, string> = {
  too_large: 'El PDF supera 10 MB.',
  invalid_type: 'Solo se permiten archivos PDF.',
  upload_error: 'No se pudo subir. Comprueba el almacenamiento del club.',
  unauthorized: 'Sin permiso para subir.',
  no_file: 'Selecciona un archivo PDF.',
  save_error: 'No se pudo guardar la documentación.',
};

const rowSectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  personId: string;
  personName: string;
  initialDocuments?: unknown;
  demoMode?: boolean;
};

function PdfUploadRow({
  label,
  file,
  disabled,
  onUpload,
  onRemove,
}: {
  label: string;
  file?: PersonDocumentFile;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const uploaded = Boolean(file);

  const pick = (picked: File) => {
    startUpload(async () => {
      setError(null);
      try {
        await onUpload(picked);
      } catch {
        setError('Error al subir el documento.');
      }
    });
  };

  return (
    <div className={rowSectionClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-lg border',
              uploaded
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-primary/25 bg-background/60 text-muted-foreground'
            )}
          >
            {pending ? (
              <Loader2 className="size-5 animate-spin text-primary" />
            ) : (
              <FileText className="size-5" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold leading-snug text-foreground">{label}</p>
              <Badge
                variant={uploaded ? 'default' : 'outline'}
                className={cn('text-[10px]', !uploaded && 'border-primary/30 text-muted-foreground')}
              >
                {uploaded ? (
                  <>
                    <CheckCircle2 className="mr-1 size-3" />
                    Subido
                  </>
                ) : (
                  <>
                    <CircleDashed className="mr-1 size-3" />
                    Pendiente
                  </>
                )}
              </Badge>
            </div>
            {file ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="truncate text-xs text-muted-foreground">{file.fileName}</p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Ver PDF
                  <ExternalLink className="size-3" />
                </a>
                {onRemove ? (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    onClick={onRemove}
                    disabled={disabled || pending}
                  >
                    Quitar
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Formato PDF · máximo 10 MB</p>
            )}
          </div>
        </div>

        <div className="shrink-0 sm:pt-1">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              if (picked) pick(picked);
              event.target.value = '';
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5 border-primary/30 bg-background/40 sm:w-auto"
            disabled={disabled || pending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {file ? 'Reemplazar' : 'Subir PDF'}
          </Button>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function StaffDocumentsSheet({
  open,
  onOpenChange,
  clubId,
  personId,
  personName,
  initialDocuments,
  demoMode = false,
}: Props) {
  const [documents, setDocuments] = useState<PersonDocumentsData>(() =>
    parsePersonDocumentsJson(initialDocuments)
  );
  const [customTitle, setCustomTitle] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();

  const uploadedMandatory = PERSON_DOCUMENT_SLOTS.filter((slot) => documents.fixed[slot.key]).length;

  const persist = useCallback(
    async (next: PersonDocumentsData) => {
      setDocuments(next);
      if (demoMode) {
        saveDemoPersonDocuments(personId, next);
        return;
      }
      const result = await savePersonDocuments(clubId, personId, next);
      if (!result.ok) {
        throw new Error(UPLOAD_ERRORS[result.message ?? ''] ?? 'No se pudo guardar.');
      }
    },
    [clubId, demoMode, personId]
  );

  useEffect(() => {
    if (!open) return;
    if (demoMode) {
      setDocuments(loadDemoPersonDocuments(personId));
    } else {
      setDocuments(parsePersonDocumentsJson(initialDocuments));
    }
    setGlobalError(null);
    setCustomTitle('');
  }, [open, personId, initialDocuments, demoMode]);

  const uploadPdf = async (file: File): Promise<PersonDocumentFile> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('personId', personId);
    const result = await uploadPersonPdfDocument(clubId, fd);
    if (!result.ok || !result.url) {
      throw new Error(UPLOAD_ERRORS[result.message ?? ''] ?? 'Error al subir.');
    }
    return {
      url: result.url,
      fileName: result.fileName ?? file.name,
      uploadedAt: new Date().toISOString(),
    };
  };

  const handleFixedUpload = (key: PersonDocumentSlotKey) => async (file: File) => {
    setGlobalError(null);
    try {
      const uploaded = await uploadPdf(file);
      const next: PersonDocumentsData = {
        ...documents,
        fixed: { ...documents.fixed, [key]: uploaded },
      };
      await persist(next);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Error al subir.');
      throw error;
    }
  };

  const handleFixedRemove = (key: PersonDocumentSlotKey) => {
    startSave(async () => {
      setGlobalError(null);
      const nextFixed = { ...documents.fixed };
      delete nextFixed[key];
      try {
        await persist({ ...documents, fixed: nextFixed });
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : 'Error al guardar.');
      }
    });
  };

  const handleCustomUpload = (file: File) => {
    const title = customTitle.trim();
    if (!title) {
      setGlobalError('Escribe un título para el documento adicional.');
      return;
    }
    startSave(async () => {
      setGlobalError(null);
      try {
        const uploaded = await uploadPdf(file);
        const entry: PersonCustomDocument = {
          id: newCustomDocumentId(),
          title,
          ...uploaded,
        };
        await persist({ ...documents, custom: [...documents.custom, entry] });
        setCustomTitle('');
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : 'Error al subir.');
      }
    });
  };

  const handleCustomRemove = (id: string) => {
    startSave(async () => {
      setGlobalError(null);
      try {
        await persist({
          ...documents,
          custom: documents.custom.filter((item) => item.id !== id),
        });
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : 'Error al guardar.');
      }
    });
  };

  const customInputRef = useRef<HTMLInputElement>(null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="2xl">
        <PortalSheetHeader>
          <SheetHeader className="space-y-2 text-left">
            <SheetTitle className="text-xl tracking-tight">Documentación</SheetTitle>
          </SheetHeader>
        </PortalSheetHeader>

        <PortalSheetBody>
          <div>
            <p className="text-sm text-muted-foreground">{personName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {uploadedMandatory}/{PERSON_DOCUMENT_SLOTS.length} obligatorios
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-[10px] text-muted-foreground">
                Solo PDF · 10 MB máx.
              </Badge>
            </div>
          </div>

          <Card className="border border-primary/25 bg-card/40 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documentación obligatoria</CardTitle>
              <CardDescription>
                Certificados y fichas exigidas para el cuerpo técnico del club.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PERSON_DOCUMENT_SLOTS.map((slot) => (
                <PdfUploadRow
                  key={slot.key}
                  label={slot.label}
                  file={documents.fixed[slot.key]}
                  disabled={saving}
                  onUpload={handleFixedUpload(slot.key)}
                  onRemove={() => handleFixedRemove(slot.key)}
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border border-primary/25 bg-card/40 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Otros documentos</CardTitle>
              <CardDescription>
                Certificados adicionales con título personalizado (delegado, títulos, etc.).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.custom.length > 0 ? (
                <ul className="space-y-2">
                  {documents.custom.map((item) => (
                    <li
                      key={item.id}
                      className={cn(rowSectionClass, 'flex items-center justify-between gap-3 py-3')}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {item.fileName}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <button
                        type="button"
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Eliminar ${item.title}`}
                        onClick={() => handleCustomRemove(item.id)}
                        disabled={saving}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-primary/20 bg-muted/5 px-4 py-6 text-center text-sm text-muted-foreground">
                  Aún no hay documentos adicionales.
                </p>
              )}

              <div className={cn(rowSectionClass, 'border-dashed border-primary/25')}>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nuevo documento
                </label>
                <Input
                  placeholder="Título del documento"
                  value={customTitle}
                  onChange={(event) => setCustomTitle(event.target.value)}
                  className="border-primary/30 bg-background/80"
                  disabled={saving}
                />
                <input
                  ref={customInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleCustomUpload(file);
                    event.target.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5 border-primary/30 bg-background/40"
                  disabled={saving || !customTitle.trim()}
                  onClick={() => customInputRef.current?.click()}
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  Añadir otro documento
                </Button>
              </div>
            </CardContent>
          </Card>

          {globalError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {globalError}
            </p>
          ) : null}
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
