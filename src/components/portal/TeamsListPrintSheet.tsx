'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { PortalActionIcon } from '@/components/portal/PortalActionIcon';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TeamsListStatusFilter } from '@/lib/teams-list-print';

export function TeamsListPrintSheet() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TeamsListStatusFilter>('all');

  const statusOptions = [
    { value: 'all', label: 'Activos y pausados' },
    { value: 'active', label: 'Solo activos' },
    { value: 'paused', label: 'Solo pausados' },
  ];

  function handleOpenPrint() {
    const params = new URLSearchParams({ status: statusFilter });
    window.open(`/print/cantera/equipos?${params.toString()}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  return (
    <>
      <PortalActionIcon label="Exportar equipos a PDF" onClick={() => setOpen(true)}>
        <FileDown className="size-4" />
      </PortalActionIcon>

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Exportar equipos (PDF)</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un documento imprimible con las categorías de cantera y sus equipos, incluyendo
              deporte, número de jugadores, estado y fecha de creación.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Equipos a incluir
              </label>
              <SynqSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as TeamsListStatusFilter)}
                options={statusOptions}
                placeholder="Seleccionar estado"
              />
            </div>
            <Button type="button" className="w-full" onClick={handleOpenPrint}>
              Abrir vista de impresión
            </Button>
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </>
  );
}
