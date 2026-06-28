import { ArrowLeft } from 'lucide-react';
import { SportPersonForm } from '@/components/portal/SportPersonForm';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function PortalClubStaffNuevoPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-0">
        <StaffHero
          people={[]}
          actions={
            <StaffHeroLinkAction href="/portal/club/staff" variant="outline">
              <ArrowLeft className="size-3.5" />
              Cancelar
            </StaffHeroLinkAction>
          }
        />
      </Card>
      <SportPersonForm clubId={ctx.club.id} />
    </PageContainer>
  );
}
