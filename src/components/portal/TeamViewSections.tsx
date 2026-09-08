import type { CanteraCategory } from '@/lib/cantera-categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TeamData = {
  id: string;
  name: string;
  team_letter: string | null;
  sport: string;
  active: boolean;
  categoryName: string;
  teamPurpose?: string;
  trainingSummary?: string;
  matchVenueSummary?: string;
  externalVenueAddress?: string | null;
};

export type TeamViewPlayer = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
  position: string | null;
  photo_url: string | null;
  jersey_number: number | null;
  birth_year?: number | null;
};

type Props = {
  team: TeamData;
  category: CanteraCategory | null;
};

export function TeamViewSections({ team, category }: Props) {
  const sportLabel = team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol';

  return (
    <Card className="h-fit border border-primary/25">
      <CardHeader>
        <CardTitle className="text-base">Datos del equipo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <DataRow label="Nombre" value={team.name} />
        <DataRow label="Categoría" value={category?.name ?? team.categoryName} />
        <DataRow label="Letra" value={team.team_letter ?? '—'} />
        <DataRow label="Edades" value={category?.ages ?? '—'} />
        <DataRow label="Equivalencia" value={category?.international ?? '—'} />
        <DataRow label="Deporte" value={sportLabel} />
        <DataRow label="Tipo" value={team.teamPurpose ?? '—'} />
        <DataRow label="Entrenamiento" value={team.trainingSummary ?? 'Sin asignar'} />
        <DataRow label="Sede partidos" value={team.matchVenueSummary ?? '—'} />
        {team.externalVenueAddress ? (
          <DataRow label="Dirección sede" value={team.externalVenueAddress} />
        ) : null}
        <DataRow label="Estado" value={team.active ? 'Activo' : 'Pausado'} />
      </CardContent>
    </Card>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-primary/10 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm text-foreground">{value}</span>
    </div>
  );
}
