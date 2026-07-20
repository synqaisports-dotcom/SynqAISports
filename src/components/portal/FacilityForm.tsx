'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  createFacility,
  updateFacility,
  type FacilityActionState,
} from '@/app/actions/club-facilities';
import {
  DIVISION_MODE_LABELS,
  type ClubFacility,
  type ClubSport,
  type FacilityDivisionMode,
  type FacilityKind,
  defaultBookingConfigForKind,
  defaultDivisionModeForKind,
  facilityAllowsMatchVenue,
  facilityHasSharedDivisions,
  facilityKindOptions,
  facilityKindSupportsReservations,
  facilityScheduleHint,
  facilityScheduleTitle,
  facilitySupportsDivisions,
  sportOptions,
  surfaceOptionsForKind,
} from '@/lib/club-facilities';
import { ScheduleBlockFields } from '@/components/portal/ScheduleBlockFields';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const initial: FacilityActionState = { ok: false };

function parseDays(value: string | undefined) {
  return value ? value.split(',').map((day) => day.trim()).filter(Boolean) : [];
}

type Props = {
  facility?: ClubFacility | null;
  onSaved?: (facilityId: string) => void;
};

export function FacilityForm({ facility, onSaved }: Props) {
  const router = useRouter();
  const bound = facility
    ? updateFacility.bind(null, facility.id)
    : createFacility;
  const [state, action, pending] = useFormState(bound, initial);

  const [sport, setSport] = useState<ClubSport>(facility?.sport ?? 'football');
  const [facilityKind, setFacilityKind] = useState<FacilityKind>(
    facility?.facility_kind ?? 'football_11'
  );
  const [divisionMode, setDivisionMode] = useState<FacilityDivisionMode>(
    facility?.division_mode ?? 'quarters_4'
  );
  const [surfaceType, setSurfaceType] = useState(facility?.surface_type ?? '');
  const [availabilityDays, setAvailabilityDays] = useState(
    parseDays(facility?.availability_days)
  );
  const [availabilityStart, setAvailabilityStart] = useState(facility?.availability_start ?? '');
  const [availabilityEnd, setAvailabilityEnd] = useState(facility?.availability_end ?? '');
  const [divisionScheduleDays, setDivisionScheduleDays] = useState(
    parseDays(facility?.division_schedule_days)
  );
  const [divisionScheduleStart, setDivisionScheduleStart] = useState(
    facility?.division_schedule_start ?? ''
  );
  const [divisionScheduleEnd, setDivisionScheduleEnd] = useState(
    facility?.division_schedule_end ?? ''
  );
  const [isMatchVenue, setIsMatchVenue] = useState(facility?.is_match_venue ?? false);
  const bookingDefaults = defaultBookingConfigForKind(facility?.facility_kind ?? 'football_11');
  const [reservationCapacity, setReservationCapacity] = useState(
    String(facility?.reservation_capacity ?? bookingDefaults.reservation_capacity)
  );
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(
    String(facility?.slot_duration_minutes ?? bookingDefaults.slot_duration_minutes)
  );
  const [maxActiveReservationsPerPlayer, setMaxActiveReservationsPerPlayer] = useState(
    String(
      facility?.max_active_reservations_per_player ??
        bookingDefaults.max_active_reservations_per_player
    )
  );
  const [advanceBookingDays, setAdvanceBookingDays] = useState(
    String(facility?.advance_booking_days ?? bookingDefaults.advance_booking_days)
  );

  const kindOptions = useMemo(() => facilityKindOptions(sport), [sport]);
  const surfaceOptions = useMemo(() => surfaceOptionsForKind(facilityKind), [facilityKind]);
  const showDivisionType = facilitySupportsDivisions(facilityKind);
  const showMatchVenue = facilityAllowsMatchVenue(facilityKind);
  const showReservations = facilityKindSupportsReservations(facilityKind);

  const draftFacility = useMemo(
    (): ClubFacility => ({
      id: facility?.id ?? 'draft',
      name: facility?.name ?? '',
      sport,
      facility_kind: facilityKind,
      surface_type: surfaceType || null,
      division_mode: showDivisionType ? divisionMode : 'full',
      address: facility?.address ?? null,
      availability_days: availabilityDays.join(','),
      availability_start: availabilityStart,
      availability_end: availabilityEnd,
      division_schedule_days: divisionScheduleDays.join(','),
      division_schedule_start: divisionScheduleStart,
      division_schedule_end: divisionScheduleEnd,
      is_match_venue: showMatchVenue ? isMatchVenue : false,
      supports_reservations: showReservations,
      reservation_capacity: Number(reservationCapacity) || 1,
      slot_duration_minutes: Number(slotDurationMinutes) || 60,
      booking_mode: defaultBookingConfigForKind(facilityKind).booking_mode,
      max_active_reservations_per_player: Number(maxActiveReservationsPerPlayer) || 1,
      advance_booking_days: Number(advanceBookingDays) || 7,
      availability_note: null,
      notes: facility?.notes ?? null,
      active: true,
    }),
    [
      facility,
      sport,
      facilityKind,
      surfaceType,
      divisionMode,
      showDivisionType,
      availabilityDays,
      availabilityStart,
      availabilityEnd,
      divisionScheduleDays,
      divisionScheduleStart,
      divisionScheduleEnd,
      isMatchVenue,
      showMatchVenue,
      showReservations,
      reservationCapacity,
      slotDurationMinutes,
      maxActiveReservationsPerPlayer,
      advanceBookingDays,
    ]
  );

  const showDivisionSchedule = facilityHasSharedDivisions(draftFacility);

  useEffect(() => {
    if (!state.ok) return;
    const target = state.facilityId ?? facility?.id;
    if (target && onSaved) {
      onSaved(target);
      return;
    }
    router.push(target ? `/portal/club/instalaciones?facility=${target}` : '/portal/club/instalaciones');
    router.refresh();
  }, [state.ok, state.facilityId, facility?.id, onSaved, router]);

  const handleSportChange = (value: string) => {
    const nextSport = value as ClubSport;
    setSport(nextSport);
    const kinds = facilityKindOptions(nextSport);
    if (!kinds.find((option) => option.value === facilityKind)) {
      const nextKind = kinds[0]?.value ?? 'other';
      setFacilityKind(nextKind);
      setDivisionMode(defaultDivisionModeForKind(nextKind));
    }
  };

  const handleKindChange = (value: string) => {
    const nextKind = value as FacilityKind;
    setFacilityKind(nextKind);
    if (!facilitySupportsDivisions(nextKind)) {
      setDivisionMode('full');
      setDivisionScheduleDays([]);
      setDivisionScheduleStart('');
      setDivisionScheduleEnd('');
    } else if (!facilitySupportsDivisions(facilityKind)) {
      setDivisionMode(defaultDivisionModeForKind(nextKind));
    }
    const surfaces = surfaceOptionsForKind(nextKind);
    if (!surfaces.find((option) => option.value === surfaceType)) {
      setSurfaceType(surfaces[0]?.value ?? '');
    }
    if (!facilityAllowsMatchVenue(nextKind)) {
      setIsMatchVenue(false);
    }
    const nextBooking = defaultBookingConfigForKind(nextKind);
    setReservationCapacity(String(nextBooking.reservation_capacity));
    setSlotDurationMinutes(String(nextBooking.slot_duration_minutes));
    setMaxActiveReservationsPerPlayer(String(nextBooking.max_active_reservations_per_player));
    setAdvanceBookingDays(String(nextBooking.advance_booking_days));
  };

  const handleDivisionModeChange = (value: string) => {
    const nextMode = value as FacilityDivisionMode;
    setDivisionMode(nextMode);
    if (nextMode === 'full') {
      setDivisionScheduleDays([]);
      setDivisionScheduleStart('');
      setDivisionScheduleEnd('');
    }
  };

  return (
    <form action={action} className="w-full space-y-6">
      <input type="hidden" name="sport" value={sport} readOnly />
      <input type="hidden" name="facilityKind" value={facilityKind} readOnly />
      <input type="hidden" name="divisionMode" value={divisionMode} readOnly />
      <input type="hidden" name="surfaceType" value={surfaceType} readOnly />

      <Card className="w-full border border-primary/25">
        <CardHeader>
          <CardTitle className="text-base">
            {facility ? 'Modificar instalación' : 'Nueva instalación'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <Input
              name="name"
              defaultValue={facility?.name ?? ''}
              required
              placeholder="Ej. Campo principal F-11"
              className="border-primary/30 bg-background/80"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Deporte / ámbito
            </label>
            <SynqSelect
              value={sport}
              onChange={handleSportChange}
              options={sportOptions()}
              placeholder="Seleccionar deporte"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tipo de instalación
            </label>
            <SynqSelect
              value={facilityKind}
              onChange={handleKindChange}
              options={kindOptions}
              placeholder="Seleccionar tipo"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Superficie / pavimento
            </label>
            <SynqSelect
              value={surfaceType}
              onChange={setSurfaceType}
              options={surfaceOptions}
              placeholder="Seleccionar superficie"
            />
          </div>

          {showDivisionType ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Modo de división del campo
              </label>
              <SynqSelect
                value={divisionMode}
                onChange={handleDivisionModeChange}
                options={[
                  { value: 'full', label: DIVISION_MODE_LABELS.full },
                  { value: 'halves_2', label: DIVISION_MODE_LABELS.halves_2 },
                  { value: 'quarters_4', label: DIVISION_MODE_LABELS.quarters_4 },
                ]}
              />
            </div>
          ) : null}

          <div className={showDivisionType ? '' : 'md:col-span-2'}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dirección o ubicación
            </label>
            <Input
              name="address"
              defaultValue={facility?.address ?? ''}
              placeholder="Polideportivo municipal, acceso norte…"
              className="border-primary/30 bg-background/80"
            />
          </div>

          {showMatchVenue ? (
            <div className="md:col-span-2">
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-primary/20 p-3 transition-colors',
                  isMatchVenue && 'border-primary/40 bg-primary/5'
                )}
              >
                <input
                  type="checkbox"
                  name="isMatchVenue"
                  checked={isMatchVenue}
                  onChange={(event) => setIsMatchVenue(event.target.checked)}
                  className="mt-0.5 size-4 rounded border-primary/40 accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Sede de partidos del club
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Marca si esta instalación puede usarse como sede oficial para jugar partidos.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          {showReservations ? (
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">Gestión de reservas</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Las familias reservan desde <span className="text-primary">/familias</span>.
                  {facilityKind === 'gym'
                    ? ' El gimnasio confirma al instante si hay aforo libre.'
                    : ' La fisioterapia requiere aprobación del fisio.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Aforo por franja
                  </label>
                  <Input
                    name="reservationCapacity"
                    type="number"
                    min={1}
                    value={reservationCapacity}
                    onChange={(event) => setReservationCapacity(event.target.value)}
                    className="border-primary/30 bg-background/80"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Duración franja (min)
                  </label>
                  <Input
                    name="slotDurationMinutes"
                    type="number"
                    min={15}
                    step={15}
                    value={slotDurationMinutes}
                    onChange={(event) => setSlotDurationMinutes(event.target.value)}
                    className="border-primary/30 bg-background/80"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Máx. reservas activas / jugador
                  </label>
                  <Input
                    name="maxActiveReservationsPerPlayer"
                    type="number"
                    min={1}
                    value={maxActiveReservationsPerPlayer}
                    onChange={(event) => setMaxActiveReservationsPerPlayer(event.target.value)}
                    className="border-primary/30 bg-background/80"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Antelación máxima (días)
                  </label>
                  <Input
                    name="advanceBookingDays"
                    type="number"
                    min={1}
                    value={advanceBookingDays}
                    onChange={(event) => setAdvanceBookingDays(event.target.value)}
                    className="border-primary/30 bg-background/80"
                  />
                </div>
              </div>
              <input
                type="hidden"
                name="bookingMode"
                value={defaultBookingConfigForKind(facilityKind).booking_mode}
                readOnly
              />
            </div>
          ) : null}

          <div
            className={cn(
              'md:col-span-2 grid gap-4',
              showDivisionSchedule ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}
          >
            <ScheduleBlockFields
              title={facilityScheduleTitle(facilityKind)}
              hint={facilityScheduleHint(facilityKind)}
              days={availabilityDays}
              onDaysChange={setAvailabilityDays}
              start={availabilityStart}
              end={availabilityEnd}
              onStartChange={setAvailabilityStart}
              onEndChange={setAvailabilityEnd}
              daysFieldName="availabilityDays"
              startFieldName="availabilityStart"
              endFieldName="availabilityEnd"
              className="h-full"
            />

            {showDivisionSchedule ? (
              <ScheduleBlockFields
                title={`Horario de división — ${DIVISION_MODE_LABELS[divisionMode]}`}
                hint="Días y franja en los que el campo se comparte en zonas (mitades o cuartos). Suele ser un subconjunto del horario habitual."
                days={divisionScheduleDays}
                onDaysChange={setDivisionScheduleDays}
                start={divisionScheduleStart}
                end={divisionScheduleEnd}
                onStartChange={setDivisionScheduleStart}
                onEndChange={setDivisionScheduleEnd}
                daysFieldName="divisionScheduleDays"
                startFieldName="divisionScheduleStart"
                endFieldName="divisionScheduleEnd"
                className="h-full border-primary/35 bg-primary/5"
              />
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notas internas
            </label>
            <textarea
              name="notes"
              defaultValue={facility?.notes ?? ''}
              rows={3}
              placeholder="Compartido con escuela, acceso por puerta lateral…"
              className={cn(
                'flex w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary'
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : facility ? 'Guardar cambios' : 'Crear instalación'}
        </Button>
        {state.ok ? (
          <p className="text-sm font-medium text-primary">Instalación guardada.</p>
        ) : null}
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Revisa el nombre de la instalación.</p>
        ) : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
