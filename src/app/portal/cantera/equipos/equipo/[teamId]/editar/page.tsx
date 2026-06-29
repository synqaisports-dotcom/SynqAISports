import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import {
  getTeamTrainingSlots,
  getUsedTeamLetters,
} from '@/app/actions/cantera';
import { TeamEditForm } from '@/components/portal/TeamEditForm';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { DEMO_TEAM_SETUP, teamSetupFromDb } from '@/lib/team-setup';
import { isDemoActive } from '@/lib/demo';
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

  const demo = await isDemoActive();
  const demoTeam = demo ? DEMO_CANTERA_TEAMS.find((team) => team.id === teamId) : null;

  let team: {
    id: string;
    name: string;
    category_slug: string | null;
    category: string;
    team_letter: string | null;
    sport: string;
    team_purpose?: string | null;
    training_facility_id?: string | null;
    training_division?: string | null;
    training_days?: string | null;
    training_start?: string | null;
    training_end?: string | null;
    match_venue_type?: string | null;
    match_own_single_venue?: boolean | null;
    match_home_mode?: string | null;
    match_away_mode?: string | null;
    external_venue_name?: string | null;
    external_venue_address?: string | null;
  } | null = null;

  if (demoTeam) {
    team = {
      ...demoTeam,
      ...teamSetupFromDb(DEMO_TEAM_SETUP[demoTeam.id]),
      training_facility_id: DEMO_TEAM_SETUP[demoTeam.id]?.training_facility_id ?? null,
    };
  } else {
    const { data } = await supabase
      .from('synq_teams')
      .select(
        'id, name, category, category_slug, team_letter, sport, active, team_purpose, training_facility_id, training_division, training_days, training_start, training_end, match_venue_type, match_own_single_venue, match_home_mode, match_away_mode, external_venue_name, external_venue_address'
      )
      .eq('club_id', ctx.club.id)
      .eq('id', teamId)
      .maybeSingle();
    team = data;
  }

  if (!team) notFound();

  const slug =
    team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  const category = slug ? getCanteraCategory(slug) : null;

  const usedLetters =
    slug && !demoTeam ? await getUsedTeamLetters(ctx.club.id, slug, teamId) : [];
  const facilities = await loadClubFacilities(ctx.club.id);
  const occupiedSlots = await getTeamTrainingSlots(ctx.club.id, teamId);
  const initialSetup = demoTeam
    ? DEMO_TEAM_SETUP[demoTeam.id] ?? teamSetupFromDb(team)
    : teamSetupFromDb(team);

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
      {demoTeam ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Equipo de demostración. Puedes revisar instalación, horarios y sede; en tu club real podrás
          editarlos y guardar los cambios.
        </p>
      ) : null}
      <TeamEditForm
        teamId={team.id}
        teamLetter={team.team_letter ?? 'A'}
        sport={team.sport}
        category={category ?? null}
        usedLetters={usedLetters}
        facilities={facilities}
        occupiedSlots={occupiedSlots}
        initialSetup={initialSetup}
        readOnly={Boolean(demoTeam)}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Usa «Pausar» en el listado para archivar sin borrar histórico. Más adelante registraremos
        el cambio de letra de cada jugador temporada a temporada.
      </p>
    </PageContainer>
  );
}
