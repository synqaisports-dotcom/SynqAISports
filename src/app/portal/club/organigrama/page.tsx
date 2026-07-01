import { ArrowLeft, Pencil } from 'lucide-react';
import { loadClubPeople } from '@/app/actions/club-people';
import { loadOrganigramaFromClub } from '@/app/actions/organigrama';
import { OrganigramaChart } from '@/components/portal/OrganigramaChart';
import {
  OrganigramaHero,
  OrganigramaHeroLinkAction,
} from '@/components/portal/OrganigramaHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { enrichOrganigramaNodes } from '@/lib/organigrama';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function PortalClubOrganigramaPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const [nodes, people] = await Promise.all([
    loadOrganigramaFromClub(ctx.club.organigrama_json),
    loadClubPeople(ctx.club.id),
  ]);
  const viewNodes = enrichOrganigramaNodes(nodes, people);

  return (
    <PageContainer>
      <Card className="overflow-hidden p-0">
        <OrganigramaHero
          nodes={viewNodes}
          actions={
            <>
              <OrganigramaHeroLinkAction href="/portal/club" variant="outline">
                <ArrowLeft className="size-3.5" />
                Volver
              </OrganigramaHeroLinkAction>
              <OrganigramaHeroLinkAction href="/portal/club/organigrama/editar">
                <Pencil className="size-3.5" />
                Modificar
              </OrganigramaHeroLinkAction>
            </>
          }
        />
      </Card>

      <div className="mt-6">
        <OrganigramaChart nodes={viewNodes} />
      </div>
    </PageContainer>
  );
}
