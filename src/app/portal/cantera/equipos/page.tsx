import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CanteraPanel, type PlayerRow, type TeamRow } from '@/components/portal/CanteraPanel';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function PortalCanteraEquiposPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category, sport, active')
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('name');

  const { data: rawPlayers } = await supabase
    .from('synq_players')
    .select(
      'id, display_name, team_id, jersey_number, position, birth_year, active, synq_teams(name, category)'
    )
    .eq('club_id', ctx.club.id)
    .order('display_name');

  const players: PlayerRow[] = (rawPlayers ?? []).map((p) => {
    const team = p.synq_teams;
    const teamObj = Array.isArray(team) ? team[0] : team;
    return {
      id: p.id,
      display_name: p.display_name,
      team_id: p.team_id,
      jersey_number: p.jersey_number,
      position: p.position,
      birth_year: p.birth_year,
      active: p.active,
      synq_teams: teamObj ?? null,
    };
  });

  return (
    <PageContainer
      pageTitle="Equipos"
      pageDescription="Equipos de cantera por categoría y deporte."
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/cantera">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      }
    >
      <CanteraPanel teams={(teams ?? []) as TeamRow[]} players={players} />
    </PageContainer>
  );
}
