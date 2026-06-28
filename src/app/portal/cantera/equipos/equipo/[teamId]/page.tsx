import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  ProfileRowAction,
  ProfileRowCard,
} from '@/components/portal/ProfileRowCard';
import {
  getCanteraCategory,
  resolveTeamCategorySlug,
} from '@/lib/cantera-categories';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ teamId: string }>;
};

export default async function PortalCanteraEquipoPage({ params }: Props) {
  const { teamId } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: team } = await supabase
    .from('synq_teams')
    .select('id, name, category, category_slug, sport, active')
    .eq('club_id', ctx.club.id)
    .eq('id', teamId)
    .maybeSingle();

  if (!team) notFound();

  const slug =
    team.category_slug ?? resolveTeamCategorySlug(team.category, team.category_slug);
  const category = slug ? getCanteraCategory(slug) : null;

  const { count: playerCount } = await supabase
    .from('synq_players')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', ctx.club.id)
    .eq('team_id', teamId)
    .eq('active', true);

  const sportLabel = team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';

  return (
    <PageContainer>
      <Card className={cn('mb-6 border', category?.borderClass ?? 'border-primary/25')}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">{team.name}</CardTitle>
            {category ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {category.name} · {category.international}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/cantera/equipos">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/portal/cantera/equipos/equipo/${team.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <ProfileRowCard
        title={team.name}
        subtitle={category?.name ?? team.category}
        badges={
          <>
            {!team.active ? (
              <Badge variant="outline" className="text-[10px]">
                Pausado
              </Badge>
            ) : null}
            {category ? (
              <Badge variant="outline" className={cn('text-[10px]', category.badgeClass)}>
                {category.ages}
              </Badge>
            ) : null}
          </>
        }
        fields={[
          { label: 'Categoría', value: category?.name ?? team.category },
          { label: 'Equivalencia', value: category?.international ?? '—' },
          { label: 'Jugadores activos', value: String(playerCount ?? 0) },
          { label: 'Deporte', value: sportLabel },
        ]}
        actions={
          <ProfileRowAction
            href={`/portal/cantera/equipos/equipo/${team.id}/editar`}
            label="Editar equipo"
            icon={Pencil}
          />
        }
      />

      <div className="mt-6 rounded-xl border border-dashed border-primary/25 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Próxima ficha de equipo</p>
        <p className="mt-2">
          Aquí reuniremos director deportivo, coordinador de etapa, entrenadores, delegados,
          preparador físico, jugadores, horarios y campos de juego/entrenamiento — todo
          enlazado desde las fichas de personas y las instalaciones del club.
        </p>
      </div>
    </PageContainer>
  );
}
