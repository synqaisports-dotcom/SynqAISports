import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PlayerPhotoForm } from '@/components/portal/PlayerPhotoForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalCanteraJugadorEditarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: player } = await supabase
    .from('synq_players')
    .select('id, display_name, photo_url')
    .eq('club_id', ctx.club.id)
    .eq('id', id)
    .maybeSingle();

  if (!player) notFound();

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Modificar — {player.display_name}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/cantera/jugadores/${player.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <PlayerPhotoForm
        clubId={ctx.club.id}
        playerId={player.id}
        playerName={player.display_name}
        photoUrl={player.photo_url ?? null}
      />

      <p className="mt-4 text-sm text-muted-foreground">
        El resto de datos del jugador (equipo, dorsal, posición…) se gestionan desde Cantera →
        Equipos. Aquí puedes actualizar la fotografía de la ficha.
      </p>
    </PageContainer>
  );
}
