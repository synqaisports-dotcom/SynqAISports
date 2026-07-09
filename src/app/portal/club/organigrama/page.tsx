import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { loadClubPeople } from '@/app/actions/club-people';
import { loadOrganigramaFromClub } from '@/app/actions/organigrama';
import {
  OrganigramaHero,
  OrganigramaHeroLinkAction,
} from '@/components/portal/OrganigramaHero';
import { OrganigramaMasterDetail } from '@/components/portal/OrganigramaMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { enrichOrganigramaNodes } from '@/lib/organigrama';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  searchParams: Promise<{
    node?: string;
    edit?: string;
  }>;
};

export default async function PortalClubOrganigramaPage({ searchParams }: Props) {
  const { node: initialNodeId, edit: initialEdit } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [nodes, people] = await Promise.all([
    loadOrganigramaFromClub(ctx.club.organigrama_json),
    loadClubPeople(ctx.club.id),
  ]);
  const viewNodes = enrichOrganigramaNodes(nodes, people);

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Organigrama</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/portal/club/organigrama?edit=1">
                <Pencil className="h-4 w-4" />
                Modificar
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <OrganigramaHero
        nodes={viewNodes}
        className="mb-4"
        actions={
          <OrganigramaHeroLinkAction href="/portal/club/estructura">
            Ver estructura
          </OrganigramaHeroLinkAction>
        }
      />

      <OrganigramaMasterDetail
        clubId={ctx.club.id}
        nodes={nodes}
        viewNodes={viewNodes}
        people={people}
        initialNodeId={initialNodeId}
        initialEditOpen={initialEdit === '1'}
        demoMode={demo}
      />
    </PageContainer>
  );
}
