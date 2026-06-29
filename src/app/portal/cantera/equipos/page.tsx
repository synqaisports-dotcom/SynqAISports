import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import { CanteraCategoryCard } from '@/components/portal/CanteraCategoryCard';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  CANTERA_CATEGORIES,
  groupTeamsByCategory,
  type CanteraTeamRow,
} from '@/lib/cantera-categories';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalCanteraEquiposPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug, team_letter, sport, active')
    .eq('club_id', ctx.club.id)
    .order('team_letter')
    .order('name');

  const { data: playerCounts } = await supabase
    .from('synq_players')
    .select('team_id')
    .eq('club_id', ctx.club.id)
    .eq('active', true);

  const countByTeam = new Map<string, number>();
  for (const row of playerCounts ?? []) {
    if (!row.team_id) continue;
    countByTeam.set(row.team_id, (countByTeam.get(row.team_id) ?? 0) + 1);
  }

  let teamRows: CanteraTeamRow[] = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category: team.category,
    category_slug: team.category_slug,
    team_letter: team.team_letter,
    sport: team.sport,
    active: team.active,
    player_count: countByTeam.get(team.id) ?? 0,
  }));

  if (await isDemoActive()) {
    const existingKeys = new Set(
      teamRows.map((team) => `${team.category_slug}:${team.team_letter}`)
    );
    for (const demo of DEMO_CANTERA_TEAMS) {
      const key = `${demo.category_slug}:${demo.team_letter}`;
      if (!existingKeys.has(key)) {
        teamRows.push({
          ...demo,
          player_count: demo.player_count ?? 0,
        });
      }
    }
  }

  const grouped = groupTeamsByCategory(teamRows);

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden border-primary/25">
        <CardHeader className="space-y-3">
          <div className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4 text-primary" />
              Equipos por categoría
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/cantera">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            La cantera se organiza por etapas formativas. Cada categoría agrupa sus equipos (A, B…)
            y más adelante verás en la ficha de equipo: staff, jugadores, horarios y campos.
          </p>
          <p className="text-xs text-muted-foreground">
            {CANTERA_CATEGORIES.length} categorías · {teamRows.filter((t) => t.active).length}{' '}
            equipos activos
            {teamRows.some((t) => !t.active)
              ? ` · ${teamRows.filter((t) => !t.active).length} pausados`
              : ''}
          </p>
        </CardHeader>
      </Card>

      <div className="flex w-full flex-col gap-6">
        {grouped.map(({ category, teams: categoryTeams }) => (
          <CanteraCategoryCard key={category.slug} category={category} teams={categoryTeams} />
        ))}
      </div>
    </PageContainer>
  );
}
