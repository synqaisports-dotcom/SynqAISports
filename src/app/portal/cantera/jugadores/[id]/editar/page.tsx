import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    .select('id, display_name')
    .eq('club_id', ctx.club.id)
    .eq('id', id)
    .maybeSingle();

  if (!player) notFound();

  return (
    <PageContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Modificar — {player.display_name}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/portal/cantera/jugadores/${player.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El formulario de edición de jugadores se conectará aquí. Por ahora puedes gestionar
            altas desde Equipos.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
