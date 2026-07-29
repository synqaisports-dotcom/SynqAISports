import { ensureTournamentDefaults, listTournaments } from '@/app/actions/tournaments';
import {
  aggregateTournamentStats,
  TournamentCard,
  TournamentHero,
} from '@/components/portal/torneos/TournamentHero';
import { getDemoTournamentsStore } from '@/lib/demo-tournaments-store';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { isDemoActive } from '@/lib/demo';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function PortalTorneosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureTournamentDefaults(ctx.club.id);
  const tournaments = await listTournaments(ctx.club.id);

  let categories: { tournament_id: string }[] = [];
  let teams: { tournament_id: string }[] = [];
  let matches: { tournament_id: string; status: string }[] = [];

  if (await isDemoActive()) {
    const store = getDemoTournamentsStore();
    categories = store.categories;
    teams = store.teams;
    matches = store.matches;
  }

  const stats = aggregateTournamentStats(
    tournaments,
    categories as Parameters<typeof aggregateTournamentStats>[1],
    teams as Parameters<typeof aggregateTournamentStats>[2],
    matches as Parameters<typeof aggregateTournamentStats>[3]
  );

  const teamCounts = new Map<string, number>();
  for (const t of teams) {
    teamCounts.set(t.tournament_id, (teamCounts.get(t.tournament_id) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <TournamentHero
        tournaments={tournaments}
        categoriesCount={stats.categoriesCount}
        teamsCount={stats.teamsCount}
        liveMatches={stats.liveMatches}
        actions={
          <Button asChild size="sm">
            <Link href="/portal/torneos/crear">
              <Plus className="mr-1.5 size-4" />
              Crear torneo
            </Link>
          </Button>
        }
      />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Tus torneos</h2>
        {tournaments.length === 0 ? (
          <div className="portal-section-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
            Aún no hay torneos. Crea el primero para un fin de semana con varias categorías.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} teamCount={teamCounts.get(t.id) ?? 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
