'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createFamilyReservation, cancelFamilyReservation } from '@/app/actions/facility-reservations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SynqSelect } from '@/components/portal/SynqSelect';
import {
  RESERVATION_ERROR_MESSAGES,
  RESERVATION_STATUS_LABELS,
  formatDateHeading,
  formatReservationRange,
  formatSlotTime,
  generateBookableSlots,
  getUpcomingDates,
  type FacilityReservation,
} from '@/lib/facility-reservations';
import {
  canFamilyBookForPlayer,
  type FamilyContext,
  type LinkedPlayer,
} from '@/lib/family-accounts';
import {
  FACILITY_KIND_LABELS,
  SPORT_LABELS,
  type ClubFacility,
} from '@/lib/club-facilities';
import { cn } from '@/lib/utils';

type Props = {
  family: FamilyContext;
  facilities: ClubFacility[];
  reservations: FacilityReservation[];
};

export function FamilyReservationsPanel({ family, facilities, reservations }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilities[0]?.id ?? '');
  const [selectedPlayerId, setSelectedPlayerId] = useState(family.players[0]?.id ?? '');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const bookableFacilities = facilities.filter((facility) => facility.supports_reservations);
  const selectedFacility = bookableFacilities.find((facility) => facility.id === selectedFacilityId);
  const selectedPlayer = family.players.find((player) => player.id === selectedPlayerId);
  const dates = useMemo(() => getUpcomingDates(7), []);
  const selectedDate = dates[selectedDateIndex] ?? dates[0];

  const playerOptions = family.players
    .filter((player) =>
      canFamilyBookForPlayer(family.account, player as LinkedPlayer)
    )
    .map((player) => ({
      value: player.id,
      label: `${player.display_name} · ${player.team_name}`,
    }));

  const slots = useMemo(() => {
    if (!selectedFacility || !selectedDate) return [];
    return generateBookableSlots(selectedFacility, selectedDate, reservations);
  }, [selectedFacility, selectedDate, reservations]);

  const myReservations = reservations
    .filter((reservation) => family.players.some((player) => player.id === reservation.player_id))
    .sort((a, b) => a.start_at.localeCompare(b.start_at));

  const handleBook = (startAt: string, endAt: string) => {
    if (!selectedFacility || !selectedPlayer) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createFamilyReservation({
        clubId: family.club.id,
        facilityId: selectedFacility.id,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.display_name,
        startAt,
        endAt,
        notes: notes.trim() || null,
        familyAccountId: family.account.id,
        familyAccountName: family.account.display_name ?? family.account.email,
      });
      if (!result.ok) {
        setError(RESERVATION_ERROR_MESSAGES[result.message ?? 'error'] ?? 'No se pudo reservar.');
        return;
      }
      setSuccess(
        selectedFacility.booking_mode === 'instant'
          ? 'Reserva confirmada.'
          : 'Solicitud enviada. El fisio la revisará pronto.'
      );
      setNotes('');
      router.refresh();
    });
  };

  const handleCancel = (reservationId: string) => {
    startTransition(async () => {
      await cancelFamilyReservation(reservationId, family.club.id);
      router.refresh();
    });
  };

  if (bookableFacilities.length === 0) {
    return (
      <Card className="border border-primary/25">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          El club no tiene instalaciones con reservas activas todavía.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <Card className="border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">Nueva reserva</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Instalación">
              <SynqSelect
                value={selectedFacilityId}
                onChange={setSelectedFacilityId}
                options={bookableFacilities.map((facility) => ({
                  value: facility.id,
                  label: `${facility.name} · ${SPORT_LABELS[facility.sport]}`,
                }))}
              />
            </Field>
            <Field label="Jugador">
              <SynqSelect
                value={selectedPlayerId}
                onChange={setSelectedPlayerId}
                options={playerOptions}
                placeholder="Seleccionar jugador"
              />
            </Field>
          </div>

          {selectedFacility ? (
            <div className="rounded-lg border border-primary/15 bg-muted/5 p-3 text-xs text-muted-foreground">
              {FACILITY_KIND_LABELS[selectedFacility.facility_kind]} ·{' '}
              {selectedFacility.booking_mode === 'instant'
                ? 'Confirmación inmediata si hay aforo'
                : 'Requiere aprobación del fisio'}
              {' · '}
              Aforo {selectedFacility.reservation_capacity} ·{' '}
              {selectedFacility.slot_duration_minutes} min
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Día
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dates.map((date, index) => (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDateIndex(index)}
                  className={cn(
                    'shrink-0 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                    selectedDateIndex === index
                      ? 'border-primary/50 bg-primary/10 text-foreground'
                      : 'border-primary/15 text-muted-foreground hover:border-primary/30'
                  )}
                >
                  <span className="block font-medium capitalize">
                    {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </span>
                  <span className="block">{date.getDate()}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm capitalize text-foreground">
              {selectedDate ? formatDateHeading(selectedDate) : ''}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Franjas disponibles
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {slots.length === 0 ? (
                <p className="rounded-lg border border-dashed border-primary/20 px-3 py-6 text-center text-sm text-muted-foreground sm:col-span-2">
                  No hay franjas disponibles este día.
                </p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.start_at}
                    type="button"
                    disabled={pending || slot.available_spots <= 0}
                    onClick={() => handleBook(slot.start_at, slot.end_at)}
                    className={cn(
                      'rounded-lg border px-3 py-3 text-left transition-colors',
                      slot.available_spots > 0
                        ? 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                        : 'cursor-not-allowed border-primary/10 opacity-60'
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      {formatSlotTime(slot.start_at, slot.end_at)}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {slot.available_spots > 0
                        ? `${slot.available_spots} de ${slot.capacity} plazas libres`
                        : 'Completo'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedFacility?.booking_mode === 'approval' ? (
            <Field label="Motivo / notas para el fisio">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Describe el motivo de la cita…"
                className="flex w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm"
              />
            </Field>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {success ? <p className="text-sm text-primary">{success}</p> : null}
          {pending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Procesando reserva…
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">Mis reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {myReservations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-3 py-8 text-center text-sm text-muted-foreground">
              Todavía no tienes reservas.
            </p>
          ) : (
            <ul className="space-y-2">
              {myReservations.map((reservation) => (
                <li
                  key={reservation.id}
                  className="rounded-lg border border-primary/15 px-3 py-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{reservation.player_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatReservationRange(reservation.start_at, reservation.end_at)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px]">
                      {RESERVATION_STATUS_LABELS[reservation.status]}
                    </Badge>
                  </div>
                  {['pending', 'confirmed'].includes(reservation.status) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-8 px-2"
                      disabled={pending}
                      onClick={() => handleCancel(reservation.id)}
                    >
                      Cancelar
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
