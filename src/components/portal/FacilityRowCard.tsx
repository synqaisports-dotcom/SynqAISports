import Link from 'next/link';
import { Eye, MapPin, Pencil } from 'lucide-react';
import {
  DIVISION_MODE_LABELS,
  FACILITY_KIND_LABELS,
  SPORT_LABELS,
  formatFacilityAvailability,
  formatTrainingDayLetters,
  type ClubFacility,
  facilitySupportsDivisions,
} from '@/lib/club-facilities';
import { FacilityPauseButton } from '@/components/portal/FacilityPauseButton';
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
          <Field label="Días" value={formatTrainingDayLetters(facility.availability_days)} />
          <Field label="Horario ref." value={formatFacilityAvailability(facility)} />
          <Field label="Ubicación" value={facility.address ?? '—'} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-center sm:gap-1">
        <FacilityPauseButton facilityId={facility.id} active={facility.active} />
        <Link
          href={`/portal/club/instalaciones/${facility.id}`}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          aria-label="Ver instalación"
          title="Ver"
        >
          <Eye className="size-4" />
        </Link>
        <Link
          href={`/portal/club/instalaciones/${facility.id}/editar`}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          aria-label="Modificar instalación"
          title="Modificar"
        >
          <Pencil className="size-4" />
        </Link>
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
