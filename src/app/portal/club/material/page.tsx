import { loadClubTeams } from '@/app/actions/club-people';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { loadClubMaterialStock, loadClubMaterials } from '@/app/actions/club-material';
import { MaterialActionBar } from '@/components/portal/MaterialActionBar';
import { MaterialFinancialPanel } from '@/components/portal/MaterialFinancialPanel';
import { MaterialHero } from '@/components/portal/MaterialHero';
import {
  MaterialMasterDetail,
  type MaterialViewMode,
} from '@/components/portal/MaterialMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { immobilizedValueByZones } from '@/lib/club-material';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

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

  const [materials, stock, teams, facilities] = await Promise.all([
    loadClubMaterials(ctx.club.id, { includeInactive: true }),
    loadClubMaterialStock(ctx.club.id),
    loadClubTeams(ctx.club.id),
    loadClubFacilities(ctx.club.id, { includeInactive: true }),
  ]);

  const zoneValues = immobilizedValueByZones({ materials, stock, teams, facilities });

  return (
    <PageContainer>
      <MaterialHero
        materials={materials}
        stock={stock}
        zoneValues={zoneValues}
        actions={
          <MaterialActionBar
            materials={materials}
            stock={stock}
            teams={teams}
            facilities={facilities}
          />
        }
        className="mb-4"
      />

      <MaterialFinancialPanel zones={zoneValues} className="mb-4" />

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
