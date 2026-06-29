import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, User } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  ProfileRowAction,
  ProfileRowCard,
  ProfileRowList,
} from '@/components/portal/ProfileRowCard';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { playerListFields, type PlayerListRow } from '@/lib/profile-row';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalCanteraJugadoresPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: players } = await supabase
    .from('synq_players')
    .select(
      'id, display_name, jersey_number, position, active, photo_url, synq_teams(name, category)'
    )
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('display_name');

  const rows: PlayerListRow[] = (players ?? []).map((p) => {
    const team = Array.isArray(p.synq_teams) ? p.synq_teams[0] : p.synq_teams;
    return {
      id: p.id,
      display_name: p.display_name,
      jersey_number: p.jersey_number,
      position: p.position,
      photo_url: p.photo_url ?? null,
      team_name: team?.name ?? 'Sin equipo',
      team_category: team?.category ?? '',
    };
  });

  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Jugadores</CardTitle>
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

      <ProfileRowList>
        {rows.map((player) => (
          <ProfileRowCard
            key={player.id}
            photoUrl={player.photo_url}
            title={player.display_name}
            subtitle={player.team_name}
            fields={playerListFields(player)}
            actions={
              <>
                <ProfileRowAction
                  href={`/portal/cantera/jugadores/${player.id}`}
                  label="Ver ficha"
                  icon={User}
                />
                <ProfileRowAction
                  href={`/portal/cantera/jugadores/${player.id}/editar`}
                  label="Modificar ficha"
                  icon={Pencil}
                />
              </>
            }
          />
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay jugadores activos. Créalos desde la sección Equipos.
          </p>
        ) : null}
      </ProfileRowList>
    </PageContainer>
  );
}
