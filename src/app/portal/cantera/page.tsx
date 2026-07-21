import Link from 'next/link';
import { ArrowRight, CalendarClock, Users, UsersRound } from 'lucide-react';
import { CanteraRecentMovements } from '@/components/portal/CanteraRecentMovements';
import { CanteraStatsCards } from '@/components/portal/CanteraStatsCards';
import { PageContainer } from '@/components/portal/PageContainer';
import { demoCanteraMovements, loadCanteraRecentMovements } from '@/lib/cantera-movements';
import { loadCanteraStats } from '@/lib/cantera-stats';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalCanteraLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [stats, movements] = await Promise.all([
    loadCanteraStats(supabase, ctx.club.id),
    demo ? Promise.resolve(demoCanteraMovements()) : loadCanteraRecentMovements(supabase, ctx.club.id),
  ]);

  const modules = [
    {
      title: 'Equipos',
      description: 'Categorías, letras y plantillas por equipo.',
      href: '/portal/cantera/equipos',
      icon: Users,
      stat: `${stats.totalTeams} equipos`,
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
      stat: `${stats.totalPlayers} jugadores`,
    },
  ];

  return (
    <PageContainer>
      <CanteraStatsCards stats={stats} className="mb-6" />

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
