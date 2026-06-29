import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  ProfileRowAction,
  ProfileRowCard,
} from '@/components/portal/ProfileRowCard';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { playerListFields, type PlayerListRow } from '@/lib/profile-row';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalCanteraJugadorPerfilPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: player } = await supabase
    .from('synq_players')
    .select(
      'id, display_name, jersey_number, position, active, photo_url, synq_teams(name, category)'
    )
    .eq('club_id', ctx.club.id)
    .eq('id', id)
    .maybeSingle();

  if (!player) notFound();

  const team = Array.isArray(player.synq_teams) ? player.synq_teams[0] : player.synq_teams;
  const row: PlayerListRow = {
    id: player.id,
    display_name: player.display_name,
    jersey_number: player.jersey_number,
    position: player.position,
    photo_url: player.photo_url ?? null,
    team_name: team?.name ?? 'Sin equipo',
    team_category: team?.category ?? '',
  };

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Ficha de jugador</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/cantera/jugadores">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/portal/cantera/jugadores/${player.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Modificar
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <ProfileRowCard
        photoUrl={row.photo_url}
        title={row.display_name}
        subtitle={row.team_name}
        fields={playerListFields(row)}
        actions={
          <ProfileRowAction
            href={`/portal/cantera/jugadores/${player.id}/editar`}
            label="Modificar ficha"
            icon={Pencil}
          />
        }
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Más adelante definiremos aquí la vista completa del jugador según lo que necesites mostrar.
      </p>
    </PageContainer>
  );
}
