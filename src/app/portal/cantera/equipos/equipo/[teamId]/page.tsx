import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getUsedTeamLetters } from '@/app/actions/cantera';
import { TeamViewSections } from '@/components/portal/TeamViewSections';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import {
  DEMO_CANTERA_TEAMS,
  DEMO_TEAM_PLAYERS,
} from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ teamId: string }>;
};

export default async function PortalCanteraEquipoPage({ params }: Props) {
  const { teamId } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const demoTeam = demo ? DEMO_CANTERA_TEAMS.find((team) => team.id === teamId) : null;

  let team: {
    id: string;
    name: string;
    category: string;
    category_slug: string | null;
    team_letter: string | null;
    sport: string;
    active: boolean;
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

  let players: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string;
    position: string | null;
    photo_url: string | null;
    jersey_number: number | null;
  }[] = [];

  if (demoTeam) {
    players = DEMO_TEAM_PLAYERS.filter((player) => player.team_id === teamId).map((player) => ({
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      display_name: `${player.first_name} ${player.last_name}`,
      position: player.position,
      photo_url: player.photo_url,
      jersey_number: player.jersey_number,
    }));
  } else {
    const { data: rows } = await supabase
      .from('synq_players')
      .select(
        'id, display_name, first_name, last_name, position, photo_url, jersey_number'
      )
      .eq('club_id', ctx.club.id)
      .eq('team_id', teamId)
      .eq('active', true)
      .order('last_name')
      .order('first_name');

    players = (rows ?? []).map((row) => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      position: row.position,
      photo_url: row.photo_url,
      jersey_number: row.jersey_number,
    }));
  }

  return (
    <PageContainer>
      <Card className={cn('mb-6 border', category?.borderClass ?? 'border-primary/25')}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{team.name}</CardTitle>
              {!team.active ? (
                <Badge variant="outline" className="text-[10px]">
                  Pausado
                </Badge>
              ) : null}
            </div>
            {category ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {category.name} · Letra {team.team_letter ?? '—'} · {category.international}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/cantera/equipos">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/portal/cantera/equipos/equipo/${team.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <TeamViewSections
        team={{
          id: team.id,
          name: team.name,
          team_letter: team.team_letter,
          sport: team.sport,
          active: team.active,
          categoryName: team.category,
        }}
        category={category ?? null}
        players={players}
      />
    </PageContainer>
  );
}
