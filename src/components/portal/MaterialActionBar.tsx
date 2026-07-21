'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, FileText } from 'lucide-react';
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
  buildMaterialExportRows,
  downloadMaterialCsv,
  materialExportToCsv,
  type MaterialExportScope,
} from '@/lib/material-export';
import type { TeamOption } from '@/lib/person-assignments';
import { cn } from '@/lib/utils';

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-primary/25 bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary';

type Props = {
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  teams: TeamOption[];
  facilities: ClubFacility[];
};

export function MaterialActionBar({ materials, stock, teams, facilities }: Props) {
  const [exportOpen, setExportOpen] = useState(false);
  const [scope, setScope] = useState<MaterialExportScope>('total');
  const [valued, setValued] = useState(true);
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? '');
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');

  const handleExport = () => {
    const facility = facilities.find((item) => item.id === facilityId);
    const team = teams.find((item) => item.id === teamId);
    const rows = buildMaterialExportRows({
      scope,
      valued,
      materials,
      stock,
      facilityId: scope === 'facility' ? facilityId : null,
      teamId: scope === 'team' ? teamId : null,
      facilityName: facility?.name,
      teamName: team?.name,
    });
    const csv = materialExportToCsv(rows, valued);
    const suffix =
      scope === 'total'
        ? 'total'
        : scope === 'facility'
          ? `instalacion-${facility?.name ?? 'zona'}`
          : `equipo-${team?.name ?? 'zona'}`;
    const valuedSuffix = valued ? '-valorado' : '';
    downloadMaterialCsv(`material-${suffix}${valuedSuffix}.csv`, csv);
    setExportOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href="/portal/club/material/recibis"
          className={actionButtonClass}
          aria-label="Ver recibís de entrega"
          title="Recibís de entrega"
        >
          <FileText className="size-4" />
        </Link>
        <button
          type="button"
          className={actionButtonClass}
          aria-label="Exportar material a Excel"
          title="Exportar a Excel"
          onClick={() => setExportOpen(true)}
        >
          <FileSpreadsheet className="size-4" />
        </button>
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
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Instalación
                  </label>
                  <SynqSelect
                    value={facilityId}
                    onChange={setFacilityId}
                    options={facilities.map((facility) => ({
                      value: facility.id,
                      label: facility.name,
                    }))}
                  />
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

            <Button type="button" onClick={handleExport} className="w-full sm:w-auto">
              Descargar Excel (.csv)
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
