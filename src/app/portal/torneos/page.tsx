import { ensureTournamentDefaults, listTournaments, loadTournamentPortalStats } from '@/app/actions/tournaments';
import { TournamentHero } from '@/components/portal/torneos/TournamentHero';
import { TournamentListCard } from '@/components/portal/torneos/TournamentListCard';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
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
  const stats = await loadTournamentPortalStats(ctx.club.id, tournaments);

  const teamCounts = new Map(stats.teamCountsByTournament);

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
              <TournamentListCard key={t.id} tournament={t} teamCount={teamCounts.get(t.id) ?? 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
