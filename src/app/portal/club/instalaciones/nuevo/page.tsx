import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FacilityForm } from '@/components/portal/FacilityForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalClubInstalacionesNuevoPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Nueva instalación</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club/instalaciones">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <FacilityForm />
    </PageContainer>
  );
}
