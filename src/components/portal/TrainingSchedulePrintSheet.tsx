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
import type { TrainingCalendarFacility } from '@/lib/training-calendar';

type Props = {
  facilities: TrainingCalendarFacility[];
};

export function TrainingSchedulePrintSheet({ facilities }: Props) {
  const [open, setOpen] = useState(false);
  const [facilityScope, setFacilityScope] = useState('all');

  const facilityOptions = [
    { value: 'all', label: 'Todas las sedes' },
    ...facilities.map((facility) => ({ value: facility.id, label: facility.name })),
  ];

  function handleOpenPrint() {
    const params = new URLSearchParams({ facility: facilityScope });
    window.open(`/print/cantera/horarios?${params.toString()}`, '_blank', 'noopener,noreferrer');
    setOpen(false);
  }

  return (
    <>
      <PortalActionIcon label="Exportar horarios a PDF" onClick={() => setOpen(true)}>
        <FileDown className="size-4" />
      </PortalActionIcon>

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="md">
          <PortalSheetHeader>
            <SheetHeader className="space-y-2 text-left">
              <SheetTitle className="text-xl tracking-tight">Exportar horarios (PDF)</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Genera un documento imprimible con el calendario semanal. Si eliges todas las sedes,
              se incluirá un calendario por instalación con sus equipos y franjas horarias.
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ámbito
              </label>
              <SynqSelect
                value={facilityScope}
                onChange={setFacilityScope}
                options={facilityOptions}
                placeholder="Seleccionar sede"
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
