import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getUsedTeamLetters } from '@/app/actions/cantera';
import { TeamEditForm } from '@/components/portal/TeamEditForm';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
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
  } | null = null;

  if (demoTeam) {
    team = demoTeam;
  } else {
    const { data } = await supabase
      .from('synq_teams')
      .select('id, name, category, category_slug, team_letter, sport, active')
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
          Equipo de demostración. En tu club real podrás cambiar la letra y el deporte desde aquí.
        </p>
      ) : null}
      <TeamEditForm
        teamId={team.id}
        teamLetter={team.team_letter ?? 'A'}
        sport={team.sport}
        category={category ?? null}
        usedLetters={usedLetters}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Usa «Pausar» en el listado para archivar sin borrar histórico. Más adelante registraremos
        el cambio de letra de cada jugador temporada a temporada.
      </p>
    </PageContainer>
  );
}
