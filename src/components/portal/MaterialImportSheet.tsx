'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Download, Upload } from 'lucide-react';
import { importClubMaterials } from '@/app/actions/club-material';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { PortalSectionBadge } from '@/components/portal/PortalSectionShell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  downloadMaterialImportTemplate,
  parseMaterialImportCsv,
  type MaterialImportRow,
} from '@/lib/material-import';
import { cn } from '@/lib/utils';

const actionIconClass =
  'inline-flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 hover:text-primary';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MaterialImportSheet({ open, onOpenChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<MaterialImportRow[]>([]);
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [pending, startImport] = useTransition();

  useEffect(() => {
    if (!open) {
      setRows([]);
      setErrors([]);
      setFileName(null);
      setResultMessage(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [open]);

  const handleFile = async (file: File) => {
    const content = await file.text();
    const parsed = parseMaterialImportCsv(content);
    setRows(parsed.rows);
    setErrors(parsed.errors);
    setFileName(file.name);
    setResultMessage(null);
  };

  const handleImport = () => {
    if (rows.length === 0) return;
    startImport(async () => {
      const result = await importClubMaterials(JSON.stringify(rows));
      if (result.ok) {
        setResultMessage(
          `Se importaron ${result.importedCount ?? rows.length} referencias correctamente.`
        );
        setRows([]);
        setErrors([]);
        setFileName(null);
        if (inputRef.current) inputRef.current.value = '';
      } else {
        setResultMessage('No se pudo completar la importación. Revisa el archivo e inténtalo de nuevo.');
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="md">
        <PortalSheetHeader>
          <SheetHeader className="space-y-3 text-left">
            <PortalSectionBadge icon={<Upload className="size-3.5" />}>
              Inventario del club
            </PortalSectionBadge>
            <SheetTitle className="text-xl tracking-tight">Importar material</SheetTitle>
            <p className="text-sm text-muted-foreground">
              Sube un CSV con las referencias del catálogo o descarga la plantilla de ejemplo.
            </p>
          </SheetHeader>
        </PortalSheetHeader>

        <PortalSheetBody>
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              El archivo debe incluir nombre, categoría, unidad y, opcionalmente, SKU, moneda y coste.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadMaterialImportTemplate}
              >
                <Download className="mr-1.5 size-3.5" />
                Descargar plantilla
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="mr-1.5 size-3.5" />
                Seleccionar archivo
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {fileName ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Archivo: <span className="text-foreground">{fileName}</span>
              </p>
            ) : null}
          </div>

          {rows.length > 0 ? (
            <div className="portal-section-surface rounded-xl p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Vista previa
              </p>
              <p className="mt-1 text-sm font-medium text-primary">
                {rows.length} referencias listas para importar
              </p>
              <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm">
                {rows.slice(0, 8).map((row) => (
                  <li key={`${row.name}-${row.sku ?? 'no-sku'}`} className="text-muted-foreground">
                    {row.name}
                  </li>
                ))}
                {rows.length > 8 ? (
                  <li className="text-xs text-muted-foreground">… y {rows.length - 8} más</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {errors.length > 0 ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-destructive">
                Errores en el archivo
              </p>
              <ul className="mt-2 space-y-1 text-sm text-destructive/90">
                {errors.slice(0, 5).map((error) => (
                  <li key={`${error.line}-${error.message}`}>
                    Línea {error.line}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {resultMessage ? (
            <p
              className={cn(
                'text-sm',
                resultMessage.includes('correctamente') ? 'text-primary' : 'text-destructive'
              )}
            >
              {resultMessage}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={handleImport}
            disabled={pending || rows.length === 0}
            className="w-full sm:w-auto"
          >
            {pending ? 'Importando…' : 'Importar referencias'}
          </Button>
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}

export function MaterialImportActionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={actionIconClass}
      aria-label="Importar material"
      title="Importar material"
      onClick={onClick}
    >
      <Upload className="size-4" />
    </button>
  );
}

export { actionIconClass as materialActionIconClass };
