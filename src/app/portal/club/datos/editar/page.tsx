import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ClubProfileForm } from '@/components/portal/ClubProfileForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function PortalClubDatosEditarPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer
      pageTitle="Modificar datos del club"
      pageDescription="Edición de la ficha oficial del club."
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/club/datos">
            <ArrowLeft className="h-4 w-4" />
            Cancelar
          </Link>
        </Button>
      }
    >
      <ClubProfileForm club={ctx.club} />
    </PageContainer>
  );
}
