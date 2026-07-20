'use client';

import { CalendarClock, Clock, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  buildAvailabilityNote,
  FACILITY_KIND_LABELS,
  type ClubFacility,
} from '@/lib/club-facilities';
import { cn } from '@/lib/utils';

type Props = {
  facility: ClubFacility;
  className?: string;
};

const DEMO_SLOTS = [
  { time: '09:00 – 10:00', label: 'Sesión individual', status: 'ocupada' as const },
  { time: '10:00 – 11:00', label: 'Disponible', status: 'libre' as const },
  { time: '11:00 – 12:00', label: 'Grupo reducido', status: 'ocupada' as const },
];

export function FacilityReservationsPanel({ facility, className }: Props) {
  const availability =
    buildAvailabilityNote(
      facility.availability_days,
      facility.availability_start,
      facility.availability_end
    ) ?? 'Sin horario configurado';

  return (
    <section className={cn('portal-section-surface rounded-xl p-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Gestión de reservas
          </p>
          <p className="mt-1 text-sm text-foreground">
            {FACILITY_KIND_LABELS[facility.facility_kind]}
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Reservas activas
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-primary/15 bg-muted/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <CalendarClock className="size-3.5" />
            Horario de reservas
          </div>
          <p className="mt-2 text-sm text-foreground">{availability}</p>
        </div>
        <div className="rounded-lg border border-primary/15 bg-muted/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3.5" />
            Duración de franja
          </div>
          <p className="mt-2 text-sm text-foreground">
            {facility.facility_kind === 'physiotherapy_room' ? '45 minutos' : '60 minutos'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Hoy — vista previa
        </p>
        <ul className="mt-2 space-y-1.5">
          {DEMO_SLOTS.map((slot) => (
            <li
              key={slot.time}
              className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground">{slot.time}</span>
              <span className="truncate text-muted-foreground">{slot.label}</span>
              <Badge
                variant={slot.status === 'libre' ? 'outline' : 'secondary'}
                className="shrink-0 text-[9px]"
              >
                {slot.status === 'libre' ? 'Libre' : 'Ocupada'}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" disabled className="gap-1.5">
          <Plus className="size-3.5" />
          Nueva reserva
        </Button>
        <p className="text-xs text-muted-foreground">
          El calendario completo de reservas estará disponible próximamente.
        </p>
      </div>
    </section>
  );
}
