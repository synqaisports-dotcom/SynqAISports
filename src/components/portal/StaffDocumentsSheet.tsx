'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
    <div className="rounded-xl border border-primary/15 bg-muted/5 p-3">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-background/80">
          {pending ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <FileText className="size-5 text-primary/80" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium leading-snug text-foreground">{label}</p>
          {file ? (
            <div className="flex flex-wrap items-center gap-2">
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
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={onRemove}
                  disabled={disabled || pending}
                >
                  Quitar
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sin documento</p>
          )}
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
            className="gap-1.5"
            disabled={disabled || pending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {file ? 'Reemplazar PDF' : 'Subir PDF'}
          </Button>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
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
      <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Documentación</SheetTitle>
          <p className="text-sm text-muted-foreground">{personName}</p>
        </SheetHeader>

        <p className="mt-4 text-xs text-muted-foreground">
          Solo archivos PDF (máx. 10 MB) para mantener la ficha ligera.
        </p>

        <div className="mt-4 space-y-3">
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
        </div>

        <div className="mt-6 border-t border-primary/15 pt-5">
          <p className="text-sm font-semibold text-foreground">Otros documentos</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Añade certificados o justificantes con un título personalizado.
          </p>

          {documents.custom.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {documents.custom.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-primary/15 bg-muted/5 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {item.fileName}
                    </a>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground',
                      'hover:bg-destructive/10 hover:text-destructive'
                    )}
                    aria-label={`Eliminar ${item.title}`}
                    onClick={() => handleCustomRemove(item.id)}
                    disabled={saving}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-3 space-y-2 rounded-xl border border-dashed border-primary/25 bg-muted/5 p-3">
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
              className="gap-1.5"
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
        </div>

        {globalError ? <p className="mt-4 text-sm text-destructive">{globalError}</p> : null}
      </SheetContent>
    </Sheet>
  );
}
