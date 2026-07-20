import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { FacilitiesMasterDetail } from '@/components/portal/FacilitiesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

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

  const [facilities, trainingSlots] = await Promise.all([
    loadClubFacilities(ctx.club.id, { includeInactive: true }),
    getTeamTrainingSlots(ctx.club.id),
  ]);

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Instalaciones</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Campos, pistas y sedes del club. Multideporte preparado; de momento optimizado para
              fútbol.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <FacilitiesMasterDetail
        facilities={facilities}
        trainingSlots={trainingSlots}
        initialFacilityId={initialFacilityId}
        initialCreateOpen={initialCreate === '1'}
        initialEditOpen={initialEdit === '1'}
      />
    </PageContainer>
  );
}
