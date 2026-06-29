import { ArrowLeft } from 'lucide-react';
import { ClubProfileForm } from '@/components/portal/ClubProfileForm';
import {
  ClubIdentityHero,
  ClubIdentityHeroLinkAction,
} from '@/components/portal/ClubIdentityHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function PortalClubDatosEditarPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-0">
        <ClubIdentityHero
          club={ctx.club}
          actions={
            <ClubIdentityHeroLinkAction href="/portal/club" variant="outline">
              <ArrowLeft className="size-3.5" />
              Volver
            </ClubIdentityHeroLinkAction>
          }
        />
      </Card>
      <ClubProfileForm club={ctx.club} />
    </PageContainer>
  );
}
