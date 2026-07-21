import { loadClubTeams } from '@/app/actions/club-people';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import {
  loadClubMaterialHandovers,
  loadClubMaterialStock,
  loadClubMaterials,
} from '@/app/actions/club-material';
import { MaterialFinancialPanel } from '@/components/portal/MaterialFinancialPanel';
import { MaterialHero } from '@/components/portal/MaterialHero';
import {
  MaterialMasterDetail,
  type MaterialViewMode,
} from '@/components/portal/MaterialMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { immobilizedValueByZones, MATERIAL_HANDOVER_ROLE_LABELS } from '@/lib/club-material';
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

  const [materials, stock, teams, facilities, handovers] = await Promise.all([
    loadClubMaterials(ctx.club.id, { includeInactive: true }),
    loadClubMaterialStock(ctx.club.id),
    loadClubTeams(ctx.club.id),
    loadClubFacilities(ctx.club.id, { includeInactive: true }),
    loadClubMaterialHandovers(ctx.club.id),
  ]);

  const zoneValues = immobilizedValueByZones({ materials, stock, teams, facilities });

  return (
    <PageContainer>
      <MaterialHero materials={materials} stock={stock} zoneValues={zoneValues} className="mb-4" />

      <MaterialFinancialPanel zones={zoneValues} className="mb-4" />

      {handovers.length > 0 ? (
        <div className="mb-4 rounded-xl border border-primary/15 bg-muted/5 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Últimos recibís de entrega
          </p>
          <ul className="mt-2 space-y-1.5">
            {handovers.slice(0, 5).map((handover) => (
              <li key={handover.id} className="text-sm">
                <a
                  href={`/print/material/entrega/${handover.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {handover.season} · {handover.location_label} · {handover.recipient_name} (
                  {MATERIAL_HANDOVER_ROLE_LABELS[handover.recipient_role]})
                </a>
              </li>
            ))}
          </ul>
        </div>
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
