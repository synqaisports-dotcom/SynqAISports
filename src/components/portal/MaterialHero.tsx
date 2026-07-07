'use client';

import { Package } from 'lucide-react';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';
import { totalQuantityForMaterial, type ClubMaterialItem, type ClubMaterialStock } from '@/lib/club-material';
import { Badge } from '@/components/ui/badge';

type Props = {
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  className?: string;
};

export function MaterialHero({ materials, stock, className }: Props) {
  const active = materials.filter((item) => item.active);
  const totalUnits = stock.reduce((sum, row) => sum + row.quantity, 0);
  const teamLines = stock.filter((row) => row.location_type === 'team').length;
  const facilityLines = stock.filter((row) => row.location_type === 'facility').length;

  return (
    <PortalSectionShell className={className}>
      <PortalSectionBadge icon={<Package className="size-3.5" />}>Inventario del club</PortalSectionBadge>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Material deportivo</h1>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        Catálogo de material y stock repartido entre almacén central, equipos de cantera e
        instalaciones.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{active.length} referencias</Badge>
        <Badge variant="outline">{totalUnits} unidades totales</Badge>
        {teamLines > 0 ? <Badge variant="outline">{teamLines} líneas en equipos</Badge> : null}
        {facilityLines > 0 ? (
          <Badge variant="outline">{facilityLines} líneas en instalaciones</Badge>
        ) : null}
      </div>
    </PortalSectionShell>
  );
}

export function materialListSubtitle(item: ClubMaterialItem, stock: ClubMaterialStock[]) {
  return `${totalQuantityForMaterial(item.id, stock)} en inventario`;
}
