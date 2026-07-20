'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Check, Loader2, X } from 'lucide-react';
import {
  cancelReservation,
  reviewReservation,
} from '@/app/actions/facility-reservations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BOOKING_MODE_LABELS,
  RESERVATION_ERROR_MESSAGES,
  RESERVATION_STATUS_LABELS,
  formatReservationRange,
  generateBookableSlots,
  getUpcomingDates,
  type FacilityReservation,
} from '@/lib/facility-reservations';
import {
  type ClubFacility,
  FACILITY_KIND_LABELS,
} from '@/lib/club-facilities';
import { cn } from '@/lib/utils';

type Props = {
  facility: ClubFacility;
  reservations: FacilityReservation[];
  className?: string;
};

export function FacilityReservationsPanel({ facility, reservations, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const today = useMemo(() => new Date(), []);
  const todaySlots = useMemo(
    () => generateBookableSlots(facility, today, reservations),
    [facility, today, reservations]
  );

  const facilityReservations = useMemo(
    () =>
      reservations
        .filter((reservation) => reservation.facility_id === facility.id)
        .sort((a, b) => a.start_at.localeCompare(b.start_at)),
    [reservations, facility.id]
  );

  const pendingReservations = facilityReservations.filter(
    (reservation) => reservation.status === 'pending'
  );
  const upcomingReservations = facilityReservations.filter((reservation) =>
    ['pending', 'confirmed'].includes(reservation.status)
  );

  const handleReview = (reservationId: string, decision: 'confirm' | 'reject') => {
    setActionId(reservationId);
    startTransition(async () => {
      await reviewReservation(reservationId, decision);
      setActionId(null);
      router.refresh();
    });
  };

  const handleCancel = (reservationId: string) => {
    setActionId(reservationId);
    startTransition(async () => {
      await cancelReservation(reservationId);
      setActionId(null);
      router.refresh();
    });
  };

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
          {BOOKING_MODE_LABELS[facility.booking_mode]}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Aforo por franja"
          value={`${facility.reservation_capacity} plazas`}
        />
        <Metric
          label="Duración"
          value={`${facility.slot_duration_minutes} min`}
        />
        <Metric
          label="Antelación máx."
          value={`${facility.advance_booking_days} días`}
        />
      </div>

      {pendingReservations.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Pendientes de aprobación
          </p>
          <ul className="mt-2 space-y-2">
            {pendingReservations.map((reservation) => (
              <li
                key={reservation.id}
                className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {reservation.player_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatReservationRange(reservation.start_at, reservation.end_at)}
                    </p>
                    {reservation.booked_by_family_name ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Solicitada por {reservation.booked_by_family_name}
                      </p>
                    ) : null}
                    {reservation.notes ? (
                      <p className="mt-1 text-xs text-foreground">{reservation.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() => handleReview(reservation.id, 'confirm')}
                    >
                      {pending && actionId === reservation.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => handleReview(reservation.id, 'reject')}
                    >
                      <X className="size-3.5" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Hoy — disponibilidad
        </div>
        <ul className="mt-2 space-y-1.5">
          {todaySlots.length === 0 ? (
            <li className="rounded-lg border border-dashed border-primary/20 px-3 py-4 text-center text-xs text-muted-foreground">
              Sin franjas hoy según el horario configurado.
            </li>
          ) : (
            todaySlots.map((slot) => (
              <li
                key={slot.start_at}
                className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {new Date(slot.start_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' – '}
                  {new Date(slot.end_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-muted-foreground">
                  {slot.booked_count}/{slot.capacity} ocupadas
                </span>
                <Badge
                  variant={slot.available_spots > 0 ? 'outline' : 'secondary'}
                  className="shrink-0 text-[9px]"
                >
                  {slot.available_spots > 0 ? `${slot.available_spots} libres` : 'Completo'}
                </Badge>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Próximas reservas
        </p>
        <ul className="mt-2 space-y-1.5">
          {upcomingReservations.length === 0 ? (
            <li className="rounded-lg border border-dashed border-primary/20 px-3 py-4 text-center text-xs text-muted-foreground">
              No hay reservas activas todavía.
            </li>
          ) : (
            upcomingReservations.slice(0, 8).map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/10 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{reservation.player_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatReservationRange(reservation.start_at, reservation.end_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">
                    {RESERVATION_STATUS_LABELS[reservation.status]}
                  </Badge>
                  {reservation.status !== 'cancelled' ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => handleCancel(reservation.id)}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Las familias reservan desde el portal web{' '}
        <span className="text-primary">/familias</span>. El fisio aprueba las citas de
        fisioterapia; el gimnasio confirma al instante si hay aforo.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-primary/15 bg-muted/5 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}

export { RESERVATION_ERROR_MESSAGES, getUpcomingDates };
