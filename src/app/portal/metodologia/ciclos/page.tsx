import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { CategoryCyclesHub } from '@/components/portal/CategoryCyclesHub';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function PortalMetodologiaCiclosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category_slug')
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('name');

  let teamOptions = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category_slug: team.category_slug,
  }));

  if (await isDemoActive()) {
    const existingIds = new Set(teamOptions.map((team) => team.id));
    for (const demo of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demo.id)) {
        teamOptions.push({
          id: demo.id,
          name: demo.name,
          category_slug: demo.category_slug,
        });
      }
    }
  }

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" />
            Ciclos y planograma
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/metodologia">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <MethodologySubnav />

      <CategoryCyclesHub teams={teamOptions} />
    </PageContainer>
  );
}
