import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadClubTeams } from '@/app/actions/club-people';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { loadClubMaterialStock, loadClubMaterials } from '@/app/actions/club-material';
import { MaterialHero } from '@/components/portal/MaterialHero';
import {
  MaterialMasterDetail,
  type MaterialViewMode,
} from '@/components/portal/MaterialMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  searchParams: Promise<{
    view?: string;
    material?: string;
    team?: string;
    facility?: string;
    create?: string;
    edit?: string;
  }>;
};

function parseView(value?: string): MaterialViewMode {
  if (value === 'team' || value === 'facility') return value;
  return 'catalog';
}

export default async function PortalClubMaterialPage({ searchParams }: Props) {
  const {
    view: viewParam,
    material: initialMaterialId,
    team: initialTeamId,
    facility: initialFacilityId,
    create: initialCreate,
    edit: initialEdit,
  } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [materials, stock, teams, facilities] = await Promise.all([
    loadClubMaterials(ctx.club.id, { includeInactive: true }),
    loadClubMaterialStock(ctx.club.id),
    loadClubTeams(ctx.club.id),
    loadClubFacilities(ctx.club.id, { includeInactive: true }),
  ]);

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Material</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <MaterialHero materials={materials} stock={stock} className="mb-4" />

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Inventario de demostración. Usa las pestañas Catálogo, Equipos e Instalaciones para ver el
          stock repartido. Pulsa + para probar el alta de material.
        </p>
      ) : null}

      <MaterialMasterDetail
        materials={materials}
        stock={stock}
        teams={teams}
        facilities={facilities}
        initialView={parseView(viewParam)}
        initialMaterialId={initialMaterialId}
        initialTeamId={initialTeamId}
        initialFacilityId={initialFacilityId}
        initialCreateOpen={initialCreate === '1'}
        initialEditOpen={initialEdit === '1'}
      />
    </PageContainer>
  );
}
