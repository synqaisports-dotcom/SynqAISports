'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { MaterialImportActionButton, MaterialImportSheet } from '@/components/portal/MaterialImportSheet';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ClubFacility } from '@/lib/club-facilities';
import type { ClubMaterialItem, ClubMaterialStock } from '@/lib/club-material';
import {
  buildFacilitiesExportSections,
  buildMaterialExportRows,
  downloadMaterialCsv,
  materialExportSectionsToCsv,
  materialExportToCsv,
  type MaterialExportScope,
} from '@/lib/material-export';
import type { TeamOption } from '@/lib/person-assignments';
import { cn } from '@/lib/utils';

const actionIconClass =
  'inline-flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 hover:text-primary';

type Props = {
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  teams: TeamOption[];
  facilities: ClubFacility[];
};

export function MaterialActionBar({ materials, stock, teams, facilities }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [scope, setScope] = useState<MaterialExportScope>('total');
  const [valued, setValued] = useState(true);
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>(() =>
    facilities.map((facility) => facility.id)
  );

  const allFacilitiesSelected = useMemo(
    () => facilities.length > 0 && selectedFacilityIds.length === facilities.length,
    [facilities.length, selectedFacilityIds.length]
  );

  useEffect(() => {
    setSelectedFacilityIds(facilities.map((facility) => facility.id));
  }, [facilities]);

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilityIds((current) =>
      current.includes(facilityId)
        ? current.filter((id) => id !== facilityId)
        : [...current, facilityId]
    );
  };

  const toggleAllFacilities = () => {
    setSelectedFacilityIds(
      allFacilitiesSelected ? [] : facilities.map((facility) => facility.id)
    );
  };

  const handleExport = () => {
    const team = teams.find((item) => item.id === teamId);
    const valuedSuffix = valued ? '-valorado' : '';

    if (scope === 'facility') {
      if (selectedFacilityIds.length === 0) return;
      const sections = buildFacilitiesExportSections({
        valued,
        materials,
        stock,
        facilities,
        facilityIds: selectedFacilityIds,
      });
      const csv = materialExportSectionsToCsv(sections, valued);
      const suffix =
        selectedFacilityIds.length === facilities.length
          ? 'instalaciones-todas'
          : `instalaciones-${selectedFacilityIds.length}`;
      downloadMaterialCsv(`material-${suffix}${valuedSuffix}.csv`, csv);
      setExportOpen(false);
      return;
    }

    const rows = buildMaterialExportRows({
      scope,
      valued,
      materials,
      stock,
      teamId: scope === 'team' ? teamId : null,
      teamName: team?.name,
    });
    const csv = materialExportToCsv(rows, valued);
    const suffix = scope === 'total' ? 'total' : `equipo-${team?.name ?? 'zona'}`;
    downloadMaterialCsv(`material-${suffix}${valuedSuffix}.csv`, csv);
    setExportOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href="/portal/club/material/recibis"
          className={actionIconClass}
          aria-label="Ver recibís de entrega"
          title="Recibís de entrega"
        >
          <FileText className="size-4" />
        </Link>
        <button
          type="button"
          className={actionIconClass}
          aria-label="Exportar material a Excel"
          title="Exportar a Excel"
          onClick={() => setExportOpen(true)}
        >
          <FileSpreadsheet className="size-4" />
        </button>
        <MaterialImportActionButton onClick={() => setImportOpen(true)} />
      </div>

      <Sheet open={exportOpen} onOpenChange={setExportOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Exportar inventario</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <div className="portal-section-surface rounded-xl p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Ámbito del informe
              </p>
              <div className="mt-3 grid gap-2">
                {(
                  [
                    ['total', 'Total de material del club'],
                    ['facility', 'Por instalación'],
                    ['team', 'Por equipo asignado'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScope(value)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                      scope === value
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-primary/20 text-muted-foreground hover:border-primary/35 hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {scope === 'facility' ? (
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Instalaciones
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllFacilities}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      {allFacilitiesSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
                    </button>
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-primary/15 p-2">
                    {facilities.map((facility) => {
                      const checked = selectedFacilityIds.includes(facility.id);
                      return (
                        <label
                          key={facility.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                            checked ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/40'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFacility(facility.id)}
                            className="size-3.5 accent-primary"
                          />
                          <span>{facility.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    El informe agrupa cada instalación con su cabecera y el material asignado debajo.
                  </p>
                </div>
              ) : null}

              {scope === 'team' ? (
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Equipo
                  </label>
                  <SynqSelect
                    value={teamId}
                    onChange={setTeamId}
                    options={teams.map((team) => ({
                      value: team.id,
                      label: `${team.name} · ${team.category}`,
                    }))}
                  />
                </div>
              ) : null}
            </div>

            <div className="portal-section-surface rounded-xl p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Valoración
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValued(true)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition-colors',
                    valued
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-primary/20 text-muted-foreground'
                  )}
                >
                  Valorado
                </button>
                <button
                  type="button"
                  onClick={() => setValued(false)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition-colors',
                    !valued
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-primary/20 text-muted-foreground'
                  )}
                >
                  Sin valorar
                </button>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleExport}
              disabled={scope === 'facility' && selectedFacilityIds.length === 0}
              className="w-full sm:w-auto"
            >
              Descargar Excel (.csv)
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <MaterialImportSheet open={importOpen} onOpenChange={setImportOpen} />
    </>
  );
}
