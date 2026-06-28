import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalCanteraJugadoresPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: players } = await supabase
    .from('synq_players')
    .select('id, display_name, jersey_number, position, active, synq_teams(name, category)')
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('display_name');

  return (
    <PageContainer
      pageTitle="Jugadores"
      pageDescription="Listado de jugadores asignados a cada equipo de cantera."
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/cantera">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(players ?? []).map((p) => {
          const team = Array.isArray(p.synq_teams) ? p.synq_teams[0] : p.synq_teams;
          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{p.display_name}</CardTitle>
                {p.jersey_number != null && (
                  <Badge variant="outline">#{p.jersey_number}</Badge>
                )}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{team?.name ?? 'Sin equipo'}</p>
                {p.position && <p className="mt-1">{p.position}</p>}
              </CardContent>
            </Card>
          );
        })}
        {(players ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            No hay jugadores activos. Créalos desde la sección Equipos.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
