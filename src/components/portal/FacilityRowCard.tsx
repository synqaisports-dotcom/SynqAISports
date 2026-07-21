import { Eye, MapPin, Pencil } from 'lucide-react';
import {
  DIVISION_MODE_LABELS,
  FACILITY_KIND_LABELS,
  SPORT_LABELS,
  buildAvailabilityNote,
  formatDivisionSchedule,
  formatFacilityAvailability,
  type ClubFacility,
  facilityHasSharedDivisions,
  facilitySupportsDivisions,
} from '@/lib/club-facilities';
import { FacilityPauseButton } from '@/components/portal/FacilityPauseButton';
import { PortalActionIconLink } from '@/components/portal/PortalActionIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Props = {
  facility: ClubFacility;
};

export function FacilityRowCard({ facility }: Props) {
  return (
    <article
      className={cn(
        'flex w-full items-stretch gap-3 rounded-xl border border-primary/25 bg-card p-3 shadow-[0_4px_24px_hsl(183_100%_50%_/_0.06)] transition-colors sm:items-center sm:gap-4 sm:p-4',
        !facility.active && 'opacity-60'
      )}
    >
      <div className="relative flex size-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/5 sm:size-16">
        <MapPin className="size-6 text-primary/80" strokeWidth={1.5} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
        <div className="min-w-0 sm:basis-44 lg:basis-52">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
              {facility.name}
            </h3>
            {!facility.active ? (
              <Badge variant="outline" className="text-[10px]">
                Pausada
              </Badge>
            ) : null}
            {facility.is_match_venue ? (
              <Badge variant="secondary" className="text-[10px]">
                Sede
              </Badge>
            ) : null}
            {facility.supports_reservations ? (
              <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                Reservas
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
            {SPORT_LABELS[facility.sport]} · {FACILITY_KIND_LABELS[facility.facility_kind]}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Superficie" value={facility.surface_type ?? '—'} />
          <Field
            label="División"
            value={
              facilitySupportsDivisions(facility.facility_kind)
                ? DIVISION_MODE_LABELS[facility.division_mode]
                : '—'
            }
          />
          <Field
            label="Horario habitual"
            value={buildAvailabilityNote(
              facility.availability_days,
              facility.availability_start,
              facility.availability_end
            ) ?? '—'}
          />
          {facilityHasSharedDivisions(facility) ? (
            <Field label="Horario división" value={formatDivisionSchedule(facility)} />
          ) : (
            <Field label="Ubicación" value={facility.address ?? '—'} />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-center sm:gap-1">
        <FacilityPauseButton facilityId={facility.id} active={facility.active} />
        <PortalActionIconLink
          href={`/portal/club/instalaciones/${facility.id}`}
          label="Ver instalación"
        >
          <Eye className="size-4" />
        </PortalActionIconLink>
        <PortalActionIconLink
          href={`/portal/club/instalaciones/${facility.id}/editar`}
          label="Modificar instalación"
        >
          <Pencil className="size-4" />
        </PortalActionIconLink>
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm text-foreground">{value}</p>
    </div>
  );
}
