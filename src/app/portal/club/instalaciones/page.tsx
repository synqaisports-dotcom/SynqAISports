import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { loadFacilityReservations } from '@/app/actions/facility-reservations';
import { FacilitiesMasterDetail } from '@/components/portal/FacilitiesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    facility?: string;
    create?: string;
    edit?: string;
  }>;
};

export default async function PortalClubInstalacionesLandingPage({ searchParams }: Props) {
  const {
    facility: initialFacilityId,
    create: initialCreate,
    edit: initialEdit,
  } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const [facilities, trainingSlots, reservations] = await Promise.all([
    loadClubFacilities(ctx.club.id, { includeInactive: true }),
    getTeamTrainingSlots(ctx.club.id),
    loadFacilityReservations(ctx.club.id),
  ]);

  return (
    <PageContainer>
      <FacilitiesMasterDetail
        facilities={facilities}
        trainingSlots={trainingSlots}
        reservations={reservations}
        initialFacilityId={initialFacilityId}
        initialCreateOpen={initialCreate === '1'}
        initialEditOpen={initialEdit === '1'}
      />
    </PageContainer>
  );
}
