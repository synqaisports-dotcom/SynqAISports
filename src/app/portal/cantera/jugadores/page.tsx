import Link from 'next/link';
import { ArrowLeft, Plus, UsersRound } from 'lucide-react';
import { PlayersMasterDetail } from '@/components/portal/PlayersMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS, DEMO_TEAM_PLAYERS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import type { PlayerProfile } from '@/lib/player-profile';
import type { PlayerTeamOption } from '@/lib/player-teams';
import { parseGuardiansJson } from '@/lib/player-guardians';
import { parsePlayerHistoryJson } from '@/lib/player-club-history';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  searchParams: Promise<{ player?: string }>;
};

function teamMetaForId(teamId: string | null) {
  if (!teamId) {
    return { team_name: 'Sin equipo', team_category: '' };
  }
  const demoTeam = DEMO_CANTERA_TEAMS.find((team) => team.id === teamId);
  if (demoTeam) {
    return { team_name: demoTeam.name, team_category: demoTeam.category };
  }
  return { team_name: 'Sin equipo', team_category: '' };
}

export default async function PortalCanteraJugadoresPage({ searchParams }: Props) {
  const { player: initialPlayerId } = await searchParams;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();

  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase
      .from('synq_players')
      .select(
        'id, display_name, first_name, last_name, jersey_number, position, active, photo_url, birth_year, is_minor, guardians_json, medical_until, medical_document_url, player_history_json, created_at, team_id, synq_teams(name, category)'
      )
      .eq('club_id', ctx.club.id)
      .eq('active', true)
      .order('last_name')
      .order('first_name'),
    supabase
      .from('synq_teams')
      .select('id, name, category')
      .eq('club_id', ctx.club.id)
      .eq('active', true)
      .order('name'),
  ]);

  let teamOptions: PlayerTeamOption[] = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category: team.category,
  }));

  if (demo) {
    const existingTeamIds = new Set(teamOptions.map((team) => team.id));
    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      if (existingTeamIds.has(demoTeam.id)) continue;
      teamOptions.push({
        id: demoTeam.id,
        name: demoTeam.name,
        category: demoTeam.category,
      });
    }
    teamOptions.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  let profiles: PlayerProfile[] = (players ?? []).map((row) => {
    const team = Array.isArray(row.synq_teams) ? row.synq_teams[0] : row.synq_teams;
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      jersey_number: row.jersey_number,
      position: row.position,
      photo_url: row.photo_url ?? null,
      birth_year: row.birth_year,
      team_id: row.team_id,
      team_name: team?.name ?? 'Sin equipo',
      team_category: team?.category ?? '',
      active: row.active,
      is_minor: row.is_minor ?? false,
      guardians: parseGuardiansJson(row.guardians_json),
      medical_until: row.medical_until ?? null,
      medical_document_url: row.medical_document_url ?? null,
      created_at: row.created_at ?? null,
      history: parsePlayerHistoryJson(row.player_history_json),
    };
  });

  if (demo) {
    const existingIds = new Set(profiles.map((player) => player.id));
    for (const demoPlayer of DEMO_TEAM_PLAYERS) {
      if (existingIds.has(demoPlayer.id)) continue;
      const team = teamMetaForId(demoPlayer.team_id);
      profiles.push({
        id: demoPlayer.id,
        first_name: demoPlayer.first_name,
        last_name: demoPlayer.last_name,
        display_name: `${demoPlayer.first_name} ${demoPlayer.last_name}`,
        jersey_number: demoPlayer.jersey_number,
        position: demoPlayer.position,
        photo_url: demoPlayer.photo_url,
        birth_year: demoPlayer.id === 'demo-pl-ale-1' ? 2014 : null,
        team_id: demoPlayer.team_id,
        team_name: team.team_name,
        team_category: team.team_category,
        active: true,
        is_minor: demoPlayer.id === 'demo-pl-ale-1',
        guardians:
          demoPlayer.id === 'demo-pl-ale-1'
            ? [{ first_name: 'Ana', last_name: 'Castro', email: 'ana.castro@email.com', phone: '600 123 456' }]
            : [],
        medical_until: demoPlayer.id === 'demo-pl-ale-1' ? '2026-12-31' : null,
        medical_document_url: null,
        created_at:
          demoPlayer.id === 'demo-pl-ale-1'
            ? '2024-09-01T10:00:00.000Z'
            : new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        history:
          demoPlayer.id === 'demo-pl-ale-1'
            ? [
                {
                  id: 'demo-hist-1',
                  kind: 'category_change',
                  title: 'Ascenso de categoría',
                  detail: 'Benjamín A → Alevín A',
                  occurredAt: '2025-07-01T09:00:00.000Z',
                },
                {
                  id: 'demo-hist-2',
                  kind: 'joined',
                  title: 'Alta en el club',
                  detail: `Plantilla · ${team.team_name}`,
                  occurredAt: '2024-09-01T10:00:00.000Z',
                },
              ]
            : [],
      });
    }
  }

  profiles.sort((a, b) => {
    const lastA = (a.last_name ?? a.display_name).toLowerCase();
    const lastB = (b.last_name ?? b.display_name).toLowerCase();
    return lastA.localeCompare(lastB, 'es');
  });

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersRound className="size-4 text-primary" />
            Jugadores
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/cantera">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/portal/cantera/equipos">
                <Plus className="h-4 w-4" />
                Gestionar en equipos
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Vista maestro-detalle con jugadores de demo. Usa + en Plantilla para probar el alta rápida.
        </p>
      ) : null}

      <PlayersMasterDetail
        clubId={ctx.club.id}
        players={profiles}
        teams={teamOptions}
        initialPlayerId={initialPlayerId}
        demoMode={demo}
      />
    </PageContainer>
  );
}
