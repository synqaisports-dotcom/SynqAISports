import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadFacilityById } from '@/app/actions/club-facilities';
import { FacilityForm } from '@/components/portal/FacilityForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubInstalacionEditarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const facility = await loadFacilityById(ctx.club.id, id);
  if (!facility) notFound();

  const demo = await isDemoActive();

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Editar — {facility.name}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/club/instalaciones/${facility.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          En demo puedes revisar el formulario. Los cambios no se guardan hasta conectar la base de
          datos del club.
        </p>
      ) : null}

      <FacilityForm facility={facility} />
    </PageContainer>
  );
}
