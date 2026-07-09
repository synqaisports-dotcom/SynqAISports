'use client';

import Link from 'next/link';
import { Eye, Pencil, Plus } from 'lucide-react';
import type { CanteraCategory, CanteraTeamRow } from '@/lib/cantera-categories';
import { TeamPauseButton } from '@/components/portal/TeamPauseButton';
import {
  ProfileRowAction,
  ProfileRowCard,
  ProfileRowList,
} from '@/components/portal/ProfileRowCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  category: CanteraCategory;
  teams: CanteraTeamRow[];
  onToggleActive?: (teamId: string, active: boolean) => void;
};

export function CanteraCategoryCard({ category, teams }: Props) {
  const activeCount = teams.filter((team) => team.active).length;
  const pausedCount = teams.length - activeCount;

  return (
    <section
      className={cn(
        'portal-section-surface w-full overflow-hidden rounded-xl border',
        category.borderClass,
        category.ringClass
      )}
    >
      <header className="border-b border-white/5 px-4 py-3 md:px-5 md:py-3.5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{category.name}</h2>
              <Badge variant="outline" className={cn('text-[10px]', category.badgeClass)}>
                {category.ages}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {category.international}
              </Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{category.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{activeCount} equipos activos</span>
              {pausedCount > 0 ? <span>· {pausedCount} pausados</span> : null}
            </div>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href={`/portal/cantera/equipos/${category.slug}/nuevo`}>
              <Plus className="size-4" />
              Añadir equipo
            </Link>
          </Button>
        </div>
      </header>

      <div className="space-y-3 p-4 md:p-5">
        {teams.length === 0 ? (
          <p className="rounded-lg border border-dashed border-primary/20 px-4 py-6 text-center text-sm text-muted-foreground">
            Aún no hay equipos en {category.name}. Usa «Añadir equipo» para crear el primero.
          </p>
        ) : (
          <ProfileRowList>
            {teams.map((team) => (
              <CanteraTeamRowCard key={team.id} team={team} category={category} />
            ))}
          </ProfileRowList>
        )}
      </div>
    </section>
  );
}

function CanteraTeamRowCard({
  team,
  category,
}: {
  team: CanteraTeamRow;
  category: CanteraCategory;
}) {
  const sportLabel = team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';

  return (
    <ProfileRowCard
      inactive={!team.active}
      title={team.name}
      subtitle={`${category.name} · ${sportLabel}`}
      badges={
        !team.active ? (
          <Badge variant="outline" className="text-[10px]">
            Pausado
          </Badge>
        ) : null
      }
      fields={[
        { label: 'Letra', value: team.team_letter ?? '—' },
        { label: 'Categoría', value: category.name },
        { label: 'Equivalencia', value: category.international },
        { label: 'Jugadores', value: team.player_count != null ? String(team.player_count) : '—' },
      ]}
      actions={
        <>
          <ProfileRowAction
            href={`/portal/cantera/equipos/equipo/${team.id}`}
            label="Ver equipo"
            icon={Eye}
          />
          <ProfileRowAction
            href={`/portal/cantera/equipos/equipo/${team.id}/editar`}
            label="Editar equipo"
            icon={Pencil}
          />
          <TeamPauseButton teamId={team.id} teamName={team.name} active={team.active} />
        </>
      }
    />
  );
}
