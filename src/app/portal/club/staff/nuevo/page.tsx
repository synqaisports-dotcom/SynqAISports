import { ArrowLeft } from 'lucide-react';
import { loadClubTeams } from '@/app/actions/club-people';
import { SportPersonForm } from '@/components/portal/SportPersonForm';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalClubStaffNuevoPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const teams = await loadClubTeams(ctx.club.id);

  return (
    <PageContainer>
      <StaffHero
        className="mb-6"
        people={[]}
        actions={
          <StaffHeroLinkAction href="/portal/club/staff" variant="outline">
            <ArrowLeft className="size-3.5" />
            Cancelar
          </StaffHeroLinkAction>
        }
      />
      <SportPersonForm clubId={ctx.club.id} teams={teams} />
    </PageContainer>
  );
}
