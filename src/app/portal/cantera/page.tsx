import Link from 'next/link';
import { ArrowRight, CalendarClock, Users, UsersRound } from 'lucide-react';
import { CanteraRecentMovements } from '@/components/portal/CanteraRecentMovements';
import { PageContainer } from '@/components/portal/PageContainer';
import { demoCanteraMovements, loadCanteraRecentMovements } from '@/lib/cantera-movements';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function CanteraStatsSummary({
  playerCount,
  teamCount,
}: {
  playerCount: number;
  teamCount: number;
}) {
  const total = playerCount + teamCount;
  const playerShare = total > 0 ? Math.round((playerCount / total) * 100) : 0;
  const teamShare = total > 0 ? Math.round((teamCount / total) * 100) : 0;
  const avgPerTeam = teamCount > 0 ? playerCount / teamCount : 0;

  return (
    <section className="portal-section-surface mb-6 rounded-xl px-4 py-4 md:px-5 md:py-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Jugadores activos
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{playerCount}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Equipos activos
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{teamCount}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Jugadores vs equipos
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {teamCount > 0 ? avgPerTeam.toFixed(1) : '—'}
            {teamCount > 0 ? (
              <span className="ml-1 text-base font-normal text-muted-foreground">/ equipo</span>
            ) : null}
          </p>
          {total > 0 ? (
            <div className="mt-2">
              <div className="flex h-2 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="bg-primary transition-all"
                  style={{ width: `${playerShare}%` }}
                  title={`${playerShare}% jugadores`}
                />
                <div
                  className="bg-primary/35 transition-all"
                  style={{ width: `${teamShare}%` }}
                  title={`${teamShare}% equipos`}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
                <span>{playerShare}% jugadores</span>
                <span>{teamShare}% equipos</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function PortalCanteraLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { count: teamCount } = await supabase
    .from('synq_teams')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', ctx.club.id)
    .eq('active', true);

  const { count: playerCount } = await supabase
    .from('synq_players')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', ctx.club.id)
    .eq('active', true);

  const teams = teamCount ?? 0;
  const players = playerCount ?? 0;
  const demo = await isDemoActive();
  const movements = demo
    ? demoCanteraMovements()
    : await loadCanteraRecentMovements(supabase, ctx.club.id);

  const modules = [
    {
      title: 'Equipos',
      description: 'Categorías, letras y plantillas por equipo.',
      href: '/portal/cantera/equipos',
      icon: Users,
      stat: `${teams} equipos`,
    },
    {
      title: 'Horarios',
      description: 'Entrenamientos de competición y formación.',
      href: '/portal/cantera/horarios',
      icon: CalendarClock,
      stat: 'Planificación',
    },
    {
      title: 'Jugadores',
      description: 'Listado global y asignación por equipo.',
      href: '/portal/cantera/jugadores',
      icon: UsersRound,
      stat: `${players} jugadores`,
    },
  ];

  return (
    <PageContainer>
      <CanteraStatsSummary playerCount={players} teamCount={teams} />

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map(({ title, description, href, icon: Icon, stat }) => (
          <Card key={title} className="flex flex-col">
            <CardHeader>
              <Icon className="mb-2 h-6 w-6 text-primary" />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <p className="text-sm font-medium text-muted-foreground">{stat}</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={href}>
                  Abrir
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <CanteraRecentMovements movements={movements} />
    </PageContainer>
  );
}
