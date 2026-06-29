import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { loadFacilityById } from '@/app/actions/club-facilities';
import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { FacilityDivisionOccupancy } from '@/components/portal/FacilityDivisionOccupancy';
import { FacilityPauseButton } from '@/components/portal/FacilityPauseButton';
import { PageContainer } from '@/components/portal/PageContainer';
import {
  DIVISION_MODE_LABELS,
  FACILITY_KIND_LABELS,
  SPORT_LABELS,
  buildAvailabilityNote,
  facilityHasSharedDivisions,
  formatDivisionSchedule,
  formatFacilityAvailability,
  facilitySupportsDivisions,
} from '@/lib/club-facilities';
import { buildFacilityDivisionSchedule } from '@/lib/team-setup';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubInstalacionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const facility = await loadFacilityById(ctx.club.id, id);
  if (!facility) notFound();

  const demo = await isDemoActive();
  const trainingSlots = await getTeamTrainingSlots(ctx.club.id);
  const divisionSchedule = facilityHasSharedDivisions(facility)
    ? buildFacilityDivisionSchedule(facility, trainingSlots)
    : [];

  return (
    <PageContainer>
      <Card className={cn('mb-6 border', !facility.active && 'opacity-80')}>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{facility.name}</CardTitle>
              {!facility.active ? (
                <Badge variant="outline" className="text-[10px]">
                  Pausada
                </Badge>
              ) : null}
              {facility.is_match_venue ? (
                <Badge variant="secondary" className="text-[10px]">
                  Sede de partidos
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {SPORT_LABELS[facility.sport]} · {FACILITY_KIND_LABELS[facility.facility_kind]}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FacilityPauseButton facilityId={facility.id} active={facility.active} />
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club/instalaciones">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/portal/club/instalaciones/${facility.id}/editar`}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Instalación de demostración. En tu club real podrás crear y modificar sedes desde aquí.
        </p>
      ) : null}

      <Card className="border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">Datos de la instalación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <DataRow label="Deporte" value={SPORT_LABELS[facility.sport]} />
          <DataRow label="Tipo" value={FACILITY_KIND_LABELS[facility.facility_kind]} />
          <DataRow label="Superficie" value={facility.surface_type ?? '—'} />
          {facilitySupportsDivisions(facility.facility_kind) ? (
            <DataRow label="Modo división" value={DIVISION_MODE_LABELS[facility.division_mode]} />
          ) : null}
          <DataRow label="Dirección" value={facility.address ?? '—'} />
          <DataRow
            label="Sede de partidos"
            value={facility.is_match_venue ? 'Sí' : 'No'}
          />
          <DataRow
            label="Horario habitual"
            value={
              buildAvailabilityNote(
                facility.availability_days,
                facility.availability_start,
                facility.availability_end
              ) ?? '—'
            }
          />
          {facilityHasSharedDivisions(facility) ? (
            <DataRow
              label="Horario de división"
              value={formatDivisionSchedule(facility)}
            />
          ) : null}
          <DataRow label="Resumen" value={formatFacilityAvailability(facility)} />
          {facility.notes ? (
            <div className="rounded-lg border border-primary/15 bg-muted/10 p-3 text-xs leading-relaxed text-muted-foreground">
              {facility.notes}
            </div>
          ) : null}
          <p className="rounded-lg border border-dashed border-primary/20 p-3 text-xs text-muted-foreground">
            Los equipos de Cantera eligen esta instalación al configurar entrenamiento y sede de
            partidos.
          </p>
        </CardContent>
      </Card>

      {divisionSchedule.length > 0 ? (
        <FacilityDivisionOccupancy
          rows={divisionSchedule}
          title="Equipos por zona — días y horarios"
          className="mt-6"
        />
      ) : null}
    </PageContainer>
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
