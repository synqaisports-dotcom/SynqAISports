import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TeamEditForm } from '@/components/portal/TeamEditForm';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{ teamId: string }>;
};

export default async function PortalCanteraEquipoEditarPage({ params }: Props) {
  const { teamId } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: team } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug, sport, active')
    .eq('club_id', ctx.club.id)
    .eq('id', teamId)
    .maybeSingle();

  if (!team) notFound();

  const slug =
    team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  const category = slug ? getCanteraCategory(slug) : null;

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Editar — {team.name}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/cantera/equipos/equipo/${team.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <TeamEditForm
        teamId={team.id}
        name={team.name}
        sport={team.sport}
        category={category ?? null}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Para archivar un equipo sin perder histórico, usa «Pausar» en el listado. No mostramos
        eliminar definitivo de momento.
      </p>
    </PageContainer>
  );
}
