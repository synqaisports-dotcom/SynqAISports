import { ArrowLeft } from 'lucide-react';
import { InstitutionalPersonForm } from '@/components/portal/InstitutionalPersonForm';
import {
  EstructuraHero,
  EstructuraHeroLinkAction,
} from '@/components/portal/EstructuraHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function PortalClubEstructuraNuevoPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-0">
        <EstructuraHero
          people={[]}
          actions={
            <EstructuraHeroLinkAction href="/portal/club/estructura" variant="outline">
              <ArrowLeft className="size-3.5" />
              Cancelar
            </EstructuraHeroLinkAction>
          }
        />
      </Card>
      <InstitutionalPersonForm clubId={ctx.club.id} />
    </PageContainer>
  );
}
