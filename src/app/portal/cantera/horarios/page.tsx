import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { TrainingCalendarView } from '@/components/portal/TrainingCalendarView';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { buildTrainingCalendarEvents } from '@/lib/training-calendar';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalCanteraHorariosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [slots, facilities] = await Promise.all([
    getTeamTrainingSlots(ctx.club.id),
    loadClubFacilities(ctx.club.id),
  ]);

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category_slug')
    .eq('club_id', ctx.club.id);

  let teamMeta = (teams ?? []).map((team) => ({
    teamId: team.id,
    teamName: team.name,
    categorySlug: team.category_slug,
  }));

  if (demo) {
    const existingIds = new Set(teamMeta.map((team) => team.teamId));
    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demoTeam.id)) {
        teamMeta.push({
          teamId: demoTeam.id,
          teamName: demoTeam.name,
          categorySlug: demoTeam.category_slug,
        });
      }
    }
  }

  const events = buildTrainingCalendarEvents(
    slots,
    teamMeta,
    facilities.map((facility) => ({ id: facility.id, name: facility.name }))
  );

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Horarios de entrenamiento</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/cantera">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Calendario con datos de demo: equipos, franjas y campos configurados en cada ficha de
          equipo. Los cambios se reflejan aquí al editar el entrenamiento.
        </p>
      ) : null}

      <TrainingCalendarView
        events={events}
        facilities={facilities.map((facility) => ({ id: facility.id, name: facility.name }))}
      />
    </PageContainer>
  );
}
