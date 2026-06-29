import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { FacilityRowCard } from '@/components/portal/FacilityRowCard';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalClubInstalacionesLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const facilities = await loadClubFacilities(ctx.club.id, { includeInactive: true });

  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Instalaciones</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Campos, pistas y sedes del club. Multideporte preparado; de momento optimizado para
              fútbol.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/portal/club/instalaciones/nuevo">
                <Plus className="h-4 w-4" />
                Crear
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {facilities.length > 0 ? (
        <ul className="space-y-3">
          {facilities.map((facility) => (
            <li key={facility.id}>
              <FacilityRowCard facility={facility} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-primary/25 px-4 py-10 text-center text-sm text-muted-foreground">
          Aún no hay instalaciones registradas. Crea la primera para asignarla a los equipos en
          Cantera.
        </p>
      )}
    </PageContainer>
  );
}
